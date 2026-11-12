import { itemImage, socialOptions } from "@/lib/social";

// A branded, ready-to-post PNG of one public item. See lib/social.tsx.
export async function GET(request: Request, ctx: RouteContext<"/social/item/[id]">) {
  const { id } = await ctx.params;
  const res = await itemImage(id, socialOptions(new URL(request.url)));
  return res ?? new Response("Not found", { status: 404 });
}
