import "server-only";
import type { PoolClient } from "pg";
import { one, q, tx } from "./db";
import { SHOPS } from "./seed";
import { COVER_MEDIA, HERO_POSTER, HERO_VIDEO, LISTING_MEDIA, type MediaRef } from "./sample-media-data";

// Pixabay does not allow hot-linking, so each sample photo and the hero video
// are downloaded once and stored in our own database. See README, "Sample
// photos and video".

const HOST = "cdn.pixabay.com";
const MAX_BYTES = { image: 4 * 1024 * 1024, video: 14 * 1024 * 1024 };
const PARALLEL = 4;
const GIVE_UP_AFTER = 3;

// A row we put there ourselves (drawn pattern, old remote placeholder or an
// earlier download). Anything else is a seller's upload and is never touched.
const REPLACEABLE = "(content_type = 'image/svg+xml' or url is not null or source is not null)";

export type Fetched = { type: string; data: Buffer };

function sniff(bytes: Buffer, kind: "image" | "video"): string | null {
  if (kind === "video") {
    return bytes.length > 12 && bytes.toString("latin1", 4, 8) === "ftyp" ? "video/mp4" : null;
  }
  if (bytes.length > 12 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "image/jpeg";
  if (bytes.length > 12 && bytes.toString("latin1", 1, 4) === "PNG" && bytes[0] === 0x89) return "image/png";
  if (bytes.length > 12 && bytes.toString("latin1", 0, 4) === "RIFF" && bytes.toString("latin1", 8, 12) === "WEBP") {
    return "image/webp";
  }
  return null;
}

// Downloads one file from Pixabay's CDN. Never throws; null means "did not work".
export async function fetchRemote(rawUrl: string, kind: "image" | "video"): Promise<Fetched | null> {
  try {
    const wanted = new URL(rawUrl);
    if (wanted.protocol !== "https:" || wanted.host !== HOST || wanted.username || wanted.password) return null;
    // Tests point this at a local stand-in; the host check above still applies to the real address.
    const origin = process.env.MEDIA_TEST_ORIGIN?.replace(/\/+$/, "");
    const target = origin ? `${origin}${wanted.pathname}${wanted.search}` : wanted.toString();
    const max = MAX_BYTES[kind];

    const res = await fetch(target, {
      redirect: "error",
      signal: AbortSignal.timeout(15000),
      headers: {
        "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
        Accept: kind === "image" ? "image/avif,image/webp,image/jpeg,image/png,*/*;q=0.8" : "video/mp4,video/*;q=0.9,*/*;q=0.5",
      },
    });
    if (res.status !== 200 || !res.body) {
      await res.body?.cancel();
      return null;
    }
    const declared = Number(res.headers.get("content-length"));
    if (Number.isFinite(declared) && declared > max) {
      await res.body.cancel();
      return null;
    }

    // Read in pieces so a file with no length header cannot fill memory.
    const chunks: Buffer[] = [];
    let size = 0;
    const reader = res.body.getReader();
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.length;
      if (size > max) {
        await reader.cancel();
        return null;
      }
      chunks.push(Buffer.from(value));
    }
    const data = Buffer.concat(chunks);
    const type = sniff(data, kind);
    return type ? { type, data } : null;
  } catch {
    return null;
  }
}

// A job throws with a short reason when it fails.
type Job = { label: string; run: () => Promise<void> };

// Runs the downloads four at a time. If the first few all fail the network is
// probably unreachable, so the rest are skipped instead of waiting on timeouts.
async function runJobs(jobs: Job[], failures: string[]) {
  let next = 0;
  let ok = 0;
  let failed = 0;
  let gaveUp = false;
  async function worker() {
    while (!gaveUp && next < jobs.length) {
      const job = jobs[next++];
      try {
        await job.run();
        ok += 1;
      } catch (e) {
        failed += 1;
        failures.push(`failed: ${job.label} (${e instanceof Error ? e.message : "error"})`);
      }
      if (ok === 0 && failed >= GIVE_UP_AFTER) gaveUp = true;
    }
  }
  await Promise.all(Array.from({ length: PARALLEL }, worker));
  return { ok, failed, skipped: jobs.length - next, gaveUp };
}

async function replaceImage(
  c: PoolClient,
  table: "listing_images" | "shop_images",
  oldId: string | null,
): Promise<boolean> {
  if (!oldId) return true;
  // Checked again here in case a seller uploaded something while we downloaded.
  const res = await c.query(`delete from ${table} where id = $1 and ${REPLACEABLE}`, [oldId]);
  return (res.rowCount ?? 0) === 1;
}

export async function importSampleMedia(): Promise<string[]> {
  if (process.env.DEMO_IMAGES === "art") return ["sample media skipped"];

  const jobs: Job[] = [];
  const failures: string[] = [];
  const tally = { photos: 0, covers: 0, video: false };
  const log: string[] = [];

  // Sample shop covers.
  for (const s of SHOPS) {
    const media: MediaRef | undefined = COVER_MEDIA[s.slug];
    const shop = await one<{ id: string; cover_id: string | null }>("select id, cover_id from shops where slug = $1", [s.slug]);
    if (!shop) continue;

    if (media?.url) {
      const cover = shop.cover_id
        ? await one<{ id: string; source: string | null; replaceable: boolean }>(
            `select id, source, ${REPLACEABLE} as replaceable from shop_images where id = $1`,
            [shop.cover_id],
          )
        : null;
      const needed = !cover || (cover.replaceable && cover.source !== media.source);
      if (needed) {
        jobs.push({
          label: `cover of ${s.name}`,
          run: async () => {
            const file = await fetchRemote(media.url, "image");
            if (!file) throw new Error("download failed");
            await tx(async (c) => {
              const img = await c.query<{ id: string }>(
                "insert into shop_images (shop_id, content_type, data, source) values ($1, $2, $3, $4) returning id",
                [shop.id, file.type, file.data, media.source],
              );
              const moved = await c.query("update shops set cover_id = $2 where id = $1 and cover_id is not distinct from $3::uuid", [
                shop.id, img.rows[0].id, shop.cover_id,
              ]);
              if (moved.rowCount !== 1 || !(await replaceImage(c, "shop_images", cover?.id ?? null))) {
                throw new Error("cover changed while downloading");
              }
            });
            tally.covers += 1;
          },
        });
      }
    }

    // Sample listings.
    for (const l of s.listings) {
      const found = await one<{ id: string; title_en: string }>(
        `select id, title_en from listings
         where shop_id = $1 and (title_en = $2 or ($3::text is not null and title_en = $3))
         order by (title_en = $2) desc limit 1`,
        [shop.id, l.en, l.was ?? null],
      );
      if (!found) continue;
      if (found.title_en !== l.en) {
        await q(
          "update listings set title_tr = $2, title_en = $3, description_tr = $4, description_en = $5 where id = $1",
          [found.id, l.tr, l.en, l.dtr, l.den],
        );
        log.push(`listing renamed: ${l.en}`);
      }

      const ref: MediaRef | undefined = LISTING_MEDIA[l.en];
      if (!ref?.url) continue;
      const first = await one<{ id: string; source: string | null; replaceable: boolean }>(
        `select id, source, ${REPLACEABLE} as replaceable from listing_images
         where listing_id = $1 order by position, created_at limit 1`,
        [found.id],
      );
      if (first && !(first.replaceable && first.source !== ref.source)) continue;

      jobs.push({
        label: `photo of "${l.en}"`,
        run: async () => {
          const file = await fetchRemote(ref.url, "image");
          if (!file) throw new Error("download failed");
          await tx(async (c) => {
            if (!(await replaceImage(c, "listing_images", first?.id ?? null))) throw new Error("photo changed while downloading");
            await c.query(
              "insert into listing_images (listing_id, position, content_type, data, source) values ($1, 0, $2, $3, $4)",
              [found.id, file.type, file.data, ref.source],
            );
          });
          tally.photos += 1;
        },
      });
    }
  }

  // Home page video and its poster.
  for (const [key, kind, ref] of [
    ["hero-video", "video", HERO_VIDEO],
    ["hero-poster", "image", HERO_POSTER],
  ] as const) {
    if (!ref.url) continue;
    const stored = await one<{ source: string | null }>("select source from site_media where key = $1", [key]);
    if (stored && stored.source === ref.source) continue;
    jobs.push({
      label: key === "hero-video" ? "hero video" : "hero poster",
      run: async () => {
        const file = await fetchRemote(ref.url, kind);
        if (!file) throw new Error("download failed");
        await q(
          `insert into site_media (key, content_type, data, source) values ($1, $2, $3, $4)
           on conflict (key) do update
           set content_type = excluded.content_type, data = excluded.data, source = excluded.source, updated_at = now()`,
          [key, file.type, file.data, ref.source],
        );
        if (key === "hero-video") tally.video = true;
      },
    });
  }

  const result = await runJobs(jobs, failures);
  const video = tally.video ? "video stored" : "video unchanged";
  log.push(`sample media: ${tally.photos} photos, ${tally.covers} covers, ${video}; ${result.failed} failed`);
  log.push(...failures);
  if (result.gaveUp) {
    log.push(`the first ${GIVE_UP_AFTER} downloads all failed, so ${result.skipped} more were not tried (is the network reachable?)`);
  }
  return log;
}
