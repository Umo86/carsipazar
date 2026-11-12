import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import type { Locale } from "@/lib/config";
import { cleanSearch, listShops, pageOf, pick1, SHOP_STATUSES } from "@/lib/admin-queries";
import { formatDate, getDict } from "@/lib/i18n";
import { setFounding, setShopStatus } from "@/lib/actions/admin";
import { PAGE_SIZE } from "@/lib/admin-queries";
import { clampPage } from "@/lib/paging";
import AdminPager from "@/components/AdminPager";

export default async function AdminSellers({ params, searchParams }: PageProps<"/[lang]/admin/sellers">) {
  const lang = (await params).lang as Locale;
  const t = getDict(lang);
  await requireAdmin(lang);
  const sp = await searchParams;
  const find = cleanSearch(sp.q);
  const status = pick1(sp.status, SHOP_STATUSES);
  const page = pageOf(sp.page);
  const { rows: shops, total } = await listShops({ text: find, status, page });
  clampPage(`/${lang}/admin/sellers`, { q: find, status }, page, total, PAGE_SIZE);
  const x = t.adminx;
  const path = `/${lang}/admin/sellers`;
  const here = `${path}${new URLSearchParams(
    Object.entries({ q: find, status, page: page > 1 ? String(page) : "" }).filter(([, v]) => v),
  ).toString().replace(/^(?=.)/, "?")}`;
  const statusLabel: Record<(typeof SHOP_STATUSES)[number], string> = {
    pending: x.se.awaiting,
    approved: x.se.live,
    suspended: x.se.suspended,
  };

  const Action = ({ id, to, label, danger }: { id: string; to: string; label: string; danger?: boolean }) => (
    <form action={setShopStatus}>
      <input type="hidden" name="lang" value={lang} />
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="to" value={to} />
      <input type="hidden" name="back" value={here} />
      <button className={`btn btn-sm ${danger ? "btn-danger" : ""}`}>{label}</button>
    </form>
  );

  return (
    <div>
      {sp.error === "blocked" && <p className="notice notice-error mb-6" role="alert">{x.se.blockedOwner}</p>}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <form className="flex flex-wrap items-end gap-3" role="search">
          <label className="field w-full sm:w-72">
            <span>{x.search}</span>
            <input className="input" type="search" name="q" defaultValue={find} placeholder={x.se.placeholder} maxLength={80} />
          </label>
          <label className="field">
            <span>{t.promo.status}</span>
            <select className="input" name="status" defaultValue={status}>
              <option value="" label={x.all} />
              {SHOP_STATUSES.map((s) => (
                <option key={s} value={s} label={statusLabel[s]} />
              ))}
            </select>
          </label>
          <button className="btn btn-ghost">{x.filter}</button>
          {(find || status) && <Link href={path} className="py-3 text-sm underline underline-offset-4">{x.clear}</Link>}
        </form>
        <a href={`/${lang}/admin/export/shops`} className="btn btn-ghost btn-sm" download>{x.csv}</a>
      </div>

      {shops.length === 0 ? (
        <p className="mt-8 text-soft">{t.admin.none}</p>
      ) : (
        <ul className="mt-6">
          {shops.map((s) => (
            <li key={s.id} className="grid gap-4 border-t border-line py-6 xl:grid-cols-[2fr_2fr_auto]">
              <div>
                <Link href={`${path}/${s.id}`} className="font-display text-2xl hover:text-cobalt">{s.name}</Link>
                <p className="mt-1 text-sm">
                  <span className={s.status === "approved" ? "text-turq" : s.status === "suspended" ? "text-tulip" : "font-medium"}>
                    {t.status[s.status]}
                  </span>
                  <span className="text-soft">, {t.shop[s.seller_type]}</span>
                  {s.founding && <span className="tag ml-2">{t.shop.founding}</span>}
                </p>
                <p className="mt-1 text-sm text-soft">
                  {formatDate(new Date(s.created_at), lang)}, {t.dash.live.toLocaleLowerCase(lang)}: {s.listings}
                </p>
              </div>
              {/* The details to check before approving a trader. */}
              <div className="min-w-0 text-sm text-soft break-words">
                <p className="text-ink">{s.legal_name}{s.company_number ? ` (${s.company_number})` : ""}</p>
                <p>{s.address}, {s.city} {s.postcode}</p>
                <p>{s.phone}, {s.email}</p>
                {s.instagram && <p>@{s.instagram}</p>}
              </div>
              <div className="flex flex-wrap items-start gap-2">
                {s.status !== "approved" && <Action id={s.id} to="approved" label={t.admin.approve} />}
                {s.status !== "suspended" && <Action id={s.id} to="suspended" label={t.admin.suspend} danger />}
                <form action={setFounding}>
                  <input type="hidden" name="lang" value={lang} />
                  <input type="hidden" name="id" value={s.id} />
                  <input type="hidden" name="to" value={s.founding ? "0" : "1"} />
                  <input type="hidden" name="back" value={here} />
                  <button className="btn btn-ghost btn-sm">{s.founding ? t.admin.removeFounding : t.admin.makeFounding}</button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}
      <AdminPager t={t} path={path} params={{ q: find, status }} page={page} total={total} />
    </div>
  );
}
