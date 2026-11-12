import { one } from "@/lib/db";
import { isUuid } from "@/lib/queries";

// Item photos, shop logos and shop covers are stored in the database for this
// first version and served from here. An image never changes once saved, so
// it caches forever. Rows from before sample photos were downloaded still
// hold a remote address; this route forwards the browser to it until
// /api/setup has replaced them.
export async function GET(request: Request, ctx: RouteContext<"/img/[id]">) {
  const { id } = await ctx.params;
  if (!isUuid(id)) return new Response("Not found", { status: 404 });
  const img = await one<{ content_type: string; data: Buffer; url: string | null }>(
    `select content_type, data, url from listing_images where id = $1
     union all
     select content_type, data, url from shop_images where id = $1
     limit 1`,
    [id],
  );
  if (!img) return new Response("Not found", { status: 404 });

  if (img.url) {
    // ?w=1600 asks for a larger version (covers, hero); cards use the default.
    const wide = new URL(request.url).searchParams.get("w") === "1600";
    const target = `${img.url}?auto=format&fit=crop&q=75&${wide ? "w=1600&h=900" : "w=900&h=1125"}`;
    return new Response(null, {
      status: 302,
      headers: { Location: target, "Cache-Control": "public, max-age=86400" },
    });
  }

  return new Response(new Uint8Array(img.data), {
    headers: {
      "Content-Type": img.content_type,
      "Cache-Control": "public, max-age=31536000, immutable",
      // Uploaded files are images only; never let one run as a page.
      "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
