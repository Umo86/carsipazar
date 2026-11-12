import { brandImage, socialOptions } from "@/lib/social";

// CarsiPazar's own posts: welcome, instalments, sell. See lib/social.tsx.
export async function GET(request: Request, ctx: RouteContext<"/social/brand/[key]">) {
  const { key } = await ctx.params;
  const res = await brandImage(key, socialOptions(new URL(request.url)));
  return res ?? new Response("Not found", { status: 404 });
}
