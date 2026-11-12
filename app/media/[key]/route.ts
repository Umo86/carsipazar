import { one } from "@/lib/db";

// Site-wide media (the home page video and poster) stored in site_media.
// Browsers, Safari above all, ask video for byte ranges, so this route
// answers them straight from the database without loading the whole file.
const MAX_RANGE = 2 * 1024 * 1024;

// Content-Length is set on every body below. `next start` drops it and sends
// the body chunked; hosts that keep it (Vercel) pass it on to the browser.

// Single range only. Returns "none" when the header should be ignored (absent,
// malformed or several ranges; the whole file is sent instead), "bad" when it
// cannot be met, otherwise the first and last byte wanted.
function parseRange(header: string | null, total: number): "none" | "bad" | { start: number; end: number } {
  if (!header) return "none";
  const m = /^bytes=(\d*)-(\d*)$/.exec(header.trim());
  if (!m || (m[1] === "" && m[2] === "")) return "none";
  if (m[1] === "") {
    const n = Number(m[2]);
    if (n === 0 || total === 0) return "bad";
    return { start: Math.max(total - n, 0), end: total - 1 };
  }
  const start = Number(m[1]);
  const end = m[2] === "" ? total - 1 : Math.min(Number(m[2]), total - 1);
  if (m[2] !== "" && Number(m[2]) < start) return "none";
  if (start >= total) return "bad";
  return { start, end };
}

export async function GET(request: Request, ctx: RouteContext<"/media/[key]">) {
  const { key } = await ctx.params;
  if (!/^[a-z0-9-]{1,40}$/.test(key)) return new Response("Not found", { status: 404 });

  const meta = await one<{ content_type: string; total: number; v: string }>(
    `select content_type, octet_length(data) as total,
            (extract(epoch from updated_at) * 1000)::bigint::text as v
     from site_media where key = $1`,
    [key],
  );
  if (!meta) return new Response("Not found", { status: 404 });

  const headers: Record<string, string> = {
    "Content-Type": meta.content_type,
    "Accept-Ranges": "bytes",
    "Cache-Control": "public, max-age=86400",
    ETag: `"${meta.v}"`,
    "X-Content-Type-Options": "nosniff",
  };
  const total = Number(meta.total);
  const range = parseRange(request.headers.get("range"), total);

  if (range === "bad") {
    return new Response(null, { status: 416, headers: { ...headers, "Content-Range": `bytes */${total}` } });
  }

  if (range === "none") {
    if (request.headers.get("if-none-match") === headers.ETag) return new Response(null, { status: 304, headers });
    const full = await one<{ data: Buffer }>("select data from site_media where key = $1", [key]);
    if (!full) return new Response("Not found", { status: 404 });
    return new Response(new Uint8Array(full.data), {
      headers: { ...headers, "Content-Length": String(full.data.length) },
    });
  }

  const end = Math.min(range.end, range.start + MAX_RANGE - 1);
  const length = end - range.start + 1;
  // substring() on bytea counts from 1.
  const part = await one<{ chunk: Buffer }>(
    "select substring(data from $2::int for $3::int) as chunk from site_media where key = $1",
    [key, range.start + 1, length],
  );
  if (!part) return new Response("Not found", { status: 404 });
  return new Response(new Uint8Array(part.chunk), {
    status: 206,
    headers: {
      ...headers,
      "Content-Range": `bytes ${range.start}-${end}/${total}`,
      "Content-Length": String(part.chunk.length),
    },
  });
}
