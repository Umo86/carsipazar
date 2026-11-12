import { getUser } from "@/lib/auth";
import { EXPORT_KINDS, exportRows, toCsv, type ExportKind } from "@/lib/admin-queries";
import { isLocale } from "@/lib/config";

// Admin only. Anyone else, logged in or not, gets a plain 404 so the route does not announce itself.
export async function GET(_req: Request, ctx: RouteContext<"/[lang]/admin/export/[kind]">) {
  const { lang, kind } = await ctx.params;
  const user = await getUser();
  if (!user || user.role !== "admin" || !isLocale(lang) || !(EXPORT_KINDS as readonly string[]).includes(kind)) {
    return new Response("Not found", { status: 404, headers: { "Cache-Control": "private, no-store" } });
  }
  const body = "\uFEFF" + toCsv(await exportRows(kind as ExportKind));
  const stamp = new Date().toISOString().slice(0, 10);
  return new Response(body, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="carsipazar-${kind}-${stamp}.csv"`,
      "Cache-Control": "private, no-store",
    },
  });
}
