import "server-only";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import type { ReactElement } from "react";
import { SITE_NAME, type Locale } from "./config";
import { one } from "./db";
import { getDict, pick } from "./i18n";
import { formatGBP } from "./money";
import { slugify, origin } from "./actions/util";

// Ready-to-post images for Instagram and WhatsApp, drawn with ImageResponse
// from the item's own photo (read from our database, never from another site).

export const FORMATS = {
  post: { width: 1080, height: 1350 },
  story: { width: 1080, height: 1920 },
  square: { width: 1080, height: 1080 },
} as const;
export type Format = keyof typeof FORMATS;
export const BRAND_KEYS = ["welcome", "protected", "sell"] as const;
export type BrandKey = (typeof BRAND_KEYS)[number];

export const isBrandKey = (v: string): v is BrandKey => (BRAND_KEYS as readonly string[]).includes(v);
// Strict on purpose: a made-up id must be a 404, not a database error.
export const isItemId = (v: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);

const SAND = "#f6f0e6";
const SKY = "#edf1fa";
const INK = "#1d2128";
const SOFT = "#646973";
const COBALT = "#1b3b8b";
const DEEP = "#14285f";
const BRASS = "#96763f";
const PANEL = "#e8dfcc"; // sand, one step darker: stands in for a missing photo

// ImageResponse cannot read variable or WOFF2 fonts, so these are static WOFF
// files kept in the repo. Turkish letters (ğ ş İ) live in the Latin Extended
// file, so each font is registered twice and the style names both families:
// satori only falls through between families, not between files of one family.
// next.config.ts lists the folder under outputFileTracingIncludes, which makes
// the files part of the Vercel deployment.
const FONT_DIR = join(process.cwd(), "assets/fonts");
const font = (file: string) => readFile(join(FONT_DIR, file));
const SERIF = "Bodoni Moda, Bodoni Moda Ext";
const SANS = "Outfit, Outfit Ext";
const fonts = [
  { name: "Bodoni Moda", data: await font("bodoni-moda-latin-500-normal.woff"), weight: 500 as const, style: "normal" as const },
  { name: "Bodoni Moda Ext", data: await font("bodoni-moda-latin-ext-500-normal.woff"), weight: 500 as const, style: "normal" as const },
  { name: "Outfit", data: await font("outfit-latin-400-normal.woff"), weight: 400 as const, style: "normal" as const },
  { name: "Outfit Ext", data: await font("outfit-latin-ext-400-normal.woff"), weight: 400 as const, style: "normal" as const },
  { name: "Outfit", data: await font("outfit-latin-500-normal.woff"), weight: 500 as const, style: "normal" as const },
  { name: "Outfit Ext", data: await font("outfit-latin-ext-500-normal.woff"), weight: 500 as const, style: "normal" as const },
];

// ---------------------------------------------------------------- options

export function socialOptions(url: URL) {
  const lang: Locale = url.searchParams.get("lang") === "en" ? "en" : "tr";
  const f = url.searchParams.get("format") ?? "";
  const format: Format = f in FORMATS ? (f as Format) : "post";
  return { lang, format, download: url.searchParams.get("download") === "1" };
}
type Opts = ReturnType<typeof socialOptions>;

// ------------------------------------------------------------------- data

const MAX_PHOTO = 4 * 1024 * 1024;
// Only a real JPEG/PNG of a sensible size is drawn; anything else is skipped.
const USABLE = (type: string, data: string) =>
  `case when ${type} in ('image/jpeg', 'image/png') and octet_length(${data}) between 1 and ${MAX_PHOTO - 1} then ${data} end`;

type Photo = { type: string; data: Buffer } | null;
const asPhoto = (type: string | null, data: Buffer | null): Photo => (type && data ? { type, data } : null);
const dataUri = (p: Photo) => (p ? `data:${p.type};base64,${p.data.toString("base64")}` : null);

type SocialItem = {
  id: string;
  title_tr: string;
  title_en: string;
  price_pence: number;
  postage_pence: number;
  shop_name: string;
  shop_slug: string;
  photo_type: string | null;
  photo: Buffer | null;
};

// Public items only: live listing, approved shop.
const socialItem = (id: string) =>
  one<SocialItem>(
    `select l.id, l.title_tr, l.title_en, l.price_pence, l.postage_pence,
            s.name as shop_name, s.slug as shop_slug, i.content_type as photo_type,
            ${USABLE("i.content_type", "i.data")} as photo
       from listings l
       join shops s on s.id = l.shop_id
       left join lateral (
         select content_type, data from listing_images
          where listing_id = l.id order by position, created_at limit 1
       ) i on true
      where l.id = $1 and l.status = 'active' and s.status = 'approved'`,
    [id],
  );

// The oldest approved shop that has a usable cover, so the choice never changes by chance.
async function brandCover(): Promise<Photo> {
  const row = await one<{ content_type: string; photo: Buffer }>(
    `select i.content_type, ${USABLE("i.content_type", "i.data")} as photo
       from shops s join shop_images i on i.id = s.cover_id
      where s.status = 'approved' and ${USABLE("i.content_type", "i.data")} is not null
      order by s.created_at, s.id limit 1`,
  );
  return row ? asPhoto(row.content_type, row.photo) : null;
}

// ----------------------------------------------------------------- pieces

type Style = Record<string, string | number>;

function Wordmark({ size, color, align = "center" }: { size: number; color: string; align?: "center" | "flex-start" }) {
  const spacing = Math.round(size * 0.3);
  return (
    <div
      style={{
        display: "flex",
        justifyContent: align,
        fontFamily: SERIF,
        fontSize: size,
        letterSpacing: spacing,
        // letter-spacing also trails the last letter; this puts it back in the middle
        paddingLeft: align === "center" ? spacing : 0,
        color,
      }}
    >
      {SITE_NAME.toUpperCase()}
    </div>
  );
}

// The bazaar arch: a tall frame with fully rounded top corners and a thin
// brass line a few pixels outside it. `width` and `height` are the photo's.
function Arch({ width, height, src, tint = PANEL, line = BRASS }: { width: number; height: number; src: string | null; tint?: string; line?: string }) {
  const gap = 10;
  const ring = 2;
  const outer = width + 2 * (gap + ring);
  return (
    <div
      style={{
        display: "flex",
        width: outer,
        height: height + 2 * (gap + ring),
        border: `${ring}px solid ${line}`,
        borderTopLeftRadius: outer / 2,
        borderTopRightRadius: outer / 2,
        padding: gap,
      }}
    >
      <div
        style={{
          display: "flex",
          width,
          height,
          background: tint,
          borderTopLeftRadius: width / 2,
          borderTopRightRadius: width / 2,
          overflow: "hidden",
        }}
      >
        {src && (
          // eslint-disable-next-line @next/next/no-img-element -- satori draws plain <img>
          <img src={src} width={width} height={height} alt="" style={{ width, height, objectFit: "cover" }} />
        )}
      </div>
    </div>
  );
}

// At most `lines` lines, then an ellipsis.
const clamp = (lines: number): Style => ({
  display: "-webkit-box",
  WebkitBoxOrient: "vertical",
  WebkitLineClamp: lines,
  textOverflow: "ellipsis",
  overflow: "hidden",
  wordBreak: "break-word",
});

// ------------------------------------------------------------ item layouts

type ItemView = {
  name: string;
  price: string;
  shop: string;
  address: string;
  photo: string | null;
};

function ItemPost({ v, format }: { v: ItemView; format: "post" | "story" }) {
  const { width, height } = FORMATS[format];
  const story = format === "story";
  // Instagram's own buttons cover the top 250px and bottom 300px of a story.
  const frame = story ? { w: 760, h: 940 } : { w: 720, h: 780 };
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "space-between",
        width,
        height,
        background: SAND,
        paddingTop: story ? 250 : 64,
        paddingBottom: story ? 300 : 52,
      }}
    >
      <Wordmark size={44} color={INK} />
      <Arch width={frame.w} height={frame.h} src={v.photo} />
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 900 }}>
        <div
          style={{
            ...clamp(2),
            fontFamily: SERIF,
            fontSize: 56,
            lineHeight: 1.12,
            color: INK,
            textAlign: "center",
            justifyContent: "center",
          }}
        >
          {v.name}
        </div>
        <div style={{ display: "flex", alignItems: "center", marginTop: 16, fontFamily: SANS, fontSize: 34 }}>
          <div style={{ display: "flex", fontWeight: 500, color: INK }}>{v.price}</div>
          <div style={{ display: "flex", width: 8, height: 8, borderRadius: 4, background: BRASS, margin: "0 24px" }} />
          <div
            style={{
              display: "block",
              maxWidth: 520,
              fontWeight: 400,
              color: SOFT,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {v.shop}
          </div>
        </div>
      </div>
      <div style={{ display: "flex", fontFamily: SANS, fontSize: 26, color: SOFT }}>{v.address}</div>
    </div>
  );
}

function ItemSquare({ v }: { v: ItemView }) {
  const { width, height } = FORMATS.square;
  return (
    <div style={{ display: "flex", width, height, background: SAND }}>
      <div style={{ display: "flex", width: 540, height, alignItems: "center", justifyContent: "center" }}>
        <Arch width={410} height={850} src={v.photo} />
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "flex-start",
          width: 540,
          height,
          paddingRight: 64,
        }}
      >
        <Wordmark size={28} color={INK} align="flex-start" />
        <div style={{ display: "flex", width: 56, height: 2, background: BRASS, margin: "34px 0" }} />
        <div style={{ ...clamp(4), fontFamily: SERIF, fontSize: 52, lineHeight: 1.12, color: INK, width: 440 }}>{v.name}</div>
        <div style={{ display: "flex", marginTop: 26, fontFamily: SANS, fontWeight: 500, fontSize: 36, color: INK }}>{v.price}</div>
        <div
          style={{
            display: "block",
            marginTop: 6,
            width: 440,
            fontFamily: SANS,
            fontSize: 28,
            color: SOFT,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {v.shop}
        </div>
        <div style={{ display: "flex", marginTop: 40, width: 440, fontFamily: SANS, fontSize: 21, color: SOFT, wordBreak: "break-all" }}>
          {v.address}
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------- brand layouts

const BRAND_LOOK: Record<BrandKey, { bg: string; ink: string; soft: string; mark: string; line: string; tint: string }> = {
  welcome: { bg: SAND, ink: INK, soft: SOFT, mark: INK, line: BRASS, tint: PANEL },
  protected: { bg: SKY, ink: INK, soft: SOFT, mark: COBALT, line: BRASS, tint: "#dbe3f4" },
  sell: { bg: DEEP, ink: "#ffffff", soft: "rgba(255,255,255,0.78)", mark: "#ffffff", line: "#c9a96a", tint: "rgba(255,255,255,0.08)" },
};

type BrandView = { head: string; sub: string; address: string; photo: string | null };

function BrandPost({ k, v, format }: { k: BrandKey; v: BrandView; format: Format }) {
  const { width, height } = FORMATS[format];
  const look = BRAND_LOOK[k];

  if (format === "square") {
    return (
      <div style={{ display: "flex", width, height, background: look.bg }}>
        <div style={{ display: "flex", width: 500, height, alignItems: "center", justifyContent: "center" }}>
          <Arch width={370} height={850} src={v.photo} tint={look.tint} line={look.line} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", width: 580, height, padding: "110px 64px 90px 30px" }}>
          <Wordmark size={28} color={look.mark} align="flex-start" />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ ...clamp(4), fontFamily: SERIF, fontSize: 64, lineHeight: 1.1, color: look.ink }}>{v.head}</div>
            <div style={{ display: "flex", width: 56, height: 2, background: look.line, margin: "30px 0" }} />
            <div style={{ display: "flex", fontFamily: SANS, fontSize: 30, lineHeight: 1.4, color: look.soft }}>{v.sub}</div>
          </div>
          <div style={{ display: "flex", fontFamily: SANS, fontSize: 22, color: look.soft }}>{v.address}</div>
        </div>
      </div>
    );
  }

  const story = format === "story";
  const withPhoto = k === "welcome" && v.photo !== null;
  // Welcome shows the cover in an arch; the others get a small empty arch as an ornament.
  const arch = withPhoto ? (
    <Arch width={story ? 600 : 460} height={story ? 560 : 400} src={v.photo} tint={look.tint} line={look.line} />
  ) : (
    <Arch width={70} height={96} src={null} tint="transparent" line={look.line} />
  );
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "space-between",
        width,
        height,
        background: look.bg,
        paddingTop: story ? 250 : 90,
        paddingBottom: story ? 300 : 80,
      }}
    >
      <Wordmark size={44} color={look.mark} />
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 900 }}>
        {arch}
        <div
          style={{
            ...clamp(3),
            marginTop: 52,
            fontFamily: SERIF,
            fontSize: 84,
            lineHeight: 1.08,
            color: look.ink,
            textAlign: "center",
            justifyContent: "center",
          }}
        >
          {v.head}
        </div>
        <div style={{ display: "flex", marginTop: 34, maxWidth: 780, fontFamily: SANS, fontSize: 36, lineHeight: 1.35, color: look.soft, textAlign: "center", justifyContent: "center" }}>
          {v.sub}
        </div>
      </div>
      <div style={{ display: "flex", fontFamily: SANS, fontSize: 26, color: look.soft }}>{v.address}</div>
    </div>
  );
}

// ---------------------------------------------------------------- responses

// Rendered to bytes here (not streamed) so a photo that will not decode can be
// dropped and the image still produced.
async function png(make: (withPhoto: boolean) => ReactElement, size: { width: number; height: number }, hasPhoto: boolean) {
  for (const withPhoto of hasPhoto ? [true, false] : [false]) {
    try {
      const res = new ImageResponse(make(withPhoto), { ...size, fonts });
      return await res.arrayBuffer();
    } catch (e) {
      if (!withPhoto) throw e;
    }
  }
  throw new Error("unreachable");
}

function reply(bytes: ArrayBuffer, name: string, o: Opts) {
  const headers: Record<string, string> = {
    "Content-Type": "image/png",
    "Cache-Control": "public, max-age=3600",
  };
  if (o.download) headers["Content-Disposition"] = `attachment; filename="carsipazar-${name}-${o.format}-${o.lang}.png"`;
  return new Response(bytes, { headers });
}

const bare = (url: string) => url.replace(/^https?:\/\//, "");

export async function itemImage(id: string, o: Opts): Promise<Response | null> {
  if (!isItemId(id)) return null;
  const item = await socialItem(id);
  if (!item) return null;
  const base = await origin();
  const view: Omit<ItemView, "photo"> = {
    name: pick(o.lang, item.title_tr, item.title_en).text,
    price: formatGBP(item.price_pence),
    shop: item.shop_name,
    address: bare(`${base}/${o.lang}/s/${item.shop_slug}`),
  };
  const uri = dataUri(asPhoto(item.photo_type, item.photo));
  const make = (withPhoto: boolean) => {
    const v = { ...view, photo: withPhoto ? uri : null };
    return o.format === "square" ? <ItemSquare v={v} /> : <ItemPost v={v} format={o.format} />;
  };
  const bytes = await png(make, FORMATS[o.format], uri !== null);
  return reply(bytes, slugify(item.title_en) || item.id.slice(0, 8), o);
}

export async function brandImage(key: string, o: Opts): Promise<Response | null> {
  if (!isBrandKey(key)) return null;
  const base = await origin();
  const t = getDict(o.lang);
  const text = t.social.brand[key];
  const cover = key === "welcome" ? await brandCover() : null;
  const uri = dataUri(cover);
  const address = bare(`${base}/${o.lang}${key === "sell" ? "/sell" : ""}`);
  const make = (withPhoto: boolean) => (
    <BrandPost k={key} v={{ ...text, address, photo: withPhoto ? uri : null }} format={o.format} />
  );
  const bytes = await png(make, FORMATS[o.format], uri !== null);
  return reply(bytes, key, o);
}
