import Link from "next/link";
import { PAGE_SIZE } from "@/lib/admin-queries";
import { fmt, type Dict } from "@/lib/i18n";

// Previous / next links under a list. `params` are the current filters, kept on every link.
export default function AdminPager({
  t,
  path,
  params,
  page,
  total,
}: {
  t: Dict;
  path: string;
  params: Record<string, string>;
  page: number;
  total: number;
}) {
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const href = (p: number) => {
    const sp = new URLSearchParams(Object.entries(params).filter(([, v]) => v));
    if (p > 1) sp.set("page", String(p));
    const qs = sp.toString();
    return qs ? `${path}?${qs}` : path;
  };
  const count = total === 1 ? t.adminx.resultOne : fmt(t.adminx.results, { n: total });
  return (
    <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-sm text-soft">
      <p>{count}</p>
      {pages > 1 && (
        <nav aria-label={t.adminx.pagination} className="flex items-center gap-3">
          {page > 1 ? (
            <Link href={href(page - 1)} className="btn btn-ghost btn-sm" rel="prev">{t.adminx.prev}</Link>
          ) : null}
          <span className="tabular-nums">{fmt(t.adminx.pageOf, { page: Math.min(page, pages), pages })}</span>
          {page < pages ? (
            <Link href={href(page + 1)} className="btn btn-ghost btn-sm" rel="next">{t.adminx.next}</Link>
          ) : null}
        </nav>
      )}
    </div>
  );
}
