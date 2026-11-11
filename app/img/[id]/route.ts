import { one } from "@/lib/db";
import { isUuid } from "@/lib/queries";

// Item photos, shop logos and shop covers are stored in the database for this first version and
// served from here. An image never changes once saved, so it caches forever.
export async function GET(_req: Request, ctx: RouteContext<"/img/[id]">) {
  const { id } = await ctx.params;
  if (!isUuid(id)) return new Response("Not found", { status: 404 });
  const img = await one<{ content_type: string; data: Buffer }>(
    `select content_type, data from listing_images where id = $1
     union all
     select content_type, data from shop_images where id = $1
     limit 1`,
    [id],
  );
  if (!img) return new Response("Not found", { status: 404 });
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
