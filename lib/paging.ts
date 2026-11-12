import { redirect } from "next/navigation";

// A list page asked for beyond its last page (a stale link, or rows deleted meanwhile) goes to the
// last page instead of showing an empty list next to "Page 3 of 2". `params` are the current filters.
export function clampPage(path: string, params: Record<string, string>, page: number, total: number, pageSize: number) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  if (page <= pages) return;
  const sp = new URLSearchParams(Object.entries(params).filter(([, v]) => v));
  if (pages > 1) sp.set("page", String(pages));
  const qs = sp.toString();
  redirect(qs ? `${path}?${qs}` : path);
}
