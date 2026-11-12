import Link from "next/link";
import { fmt, type Dict } from "@/lib/i18n";

// Previous / next links under a list, for the seller and buyer panels.
export default function PanelPager({
  t,
  path,
  page,
  total,
  pageSize,
}: {
  t: Dict;
  path: string;
  page: number;
  total: number;
  pageSize: number;
}) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const href = (p: number) => (p > 1 ? `${path}?page=${p}` : path);
  const count = total === 1 ? t.adminx.resultOne : fmt(t.adminx.results, { n: total });
  return (
    <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-sm text-soft">
      <p>{count}</p>
      {pages > 1 && (
        <nav aria-label={t.adminx.pagination} className="flex items-center gap-3">
          {page > 1 && <Link href={href(page - 1)} className="btn btn-ghost btn-sm" rel="prev">{t.adminx.prev}</Link>}
          <span className="tabular-nums">{fmt(t.adminx.pageOf, { page: Math.min(page, pages), pages })}</span>
          {page < pages && <Link href={href(page + 1)} className="btn btn-ghost btn-sm" rel="next">{t.adminx.next}</Link>}
        </nav>
      )}
    </div>
  );
}
