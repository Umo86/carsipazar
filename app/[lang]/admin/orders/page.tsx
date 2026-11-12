import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import type { Locale } from "@/lib/config";
import { cleanSearch, listOrders, ORDER_STATUSES, PAGE_SIZE, pageOf, pick1 } from "@/lib/admin-queries";
import { fmt, formatDate, getDict, orderStatus } from "@/lib/i18n";
import { formatGBP } from "@/lib/money";
import { releaseDueOrders, type Order } from "@/lib/orders";
import { adminOrder } from "@/lib/actions/admin";
import { clampPage } from "@/lib/paging";
import AdminPager from "@/components/AdminPager";

export default async function AdminOrders({ params, searchParams }: PageProps<"/[lang]/admin/orders">) {
  const lang = (await params).lang as Locale;
  const t = getDict(lang);
  await requireAdmin(lang);
  await releaseDueOrders();
  const sp = await searchParams;
  const find = cleanSearch(sp.q);
  const status = pick1(sp.status, ORDER_STATUSES);
  const fulfilment = pick1(sp.fulfilment, ["delivery", "collection"] as const);
  const stuck = sp.stuck === "1";
  const page = pageOf(sp.page);
  const { rows, total } = await listOrders({ text: find, status, fulfilment, stuck, page });
  const orders = rows as (Order & { shop_name: string; buyer_email: string })[];
  const x = t.adminx;
  const path = `/${lang}/admin/orders`;
  clampPage(path, { q: find, status, fulfilment, stuck: stuck ? "1" : "" }, page, total, PAGE_SIZE);
  const here = `${path}${new URLSearchParams(
    Object.entries({ q: find, status, fulfilment, stuck: stuck ? "1" : "", page: page > 1 ? String(page) : "" }).filter(([, v]) => v),
  ).toString().replace(/^(?=.)/, "?")}`;

  const Act = ({ id, act, label, danger }: { id: string; act: string; label: string; danger?: boolean }) => (
    <form action={adminOrder}>
      <input type="hidden" name="lang" value={lang} />
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="act" value={act} />
      <input type="hidden" name="back" value={here} />
      <button className={`btn btn-sm ${danger ? "btn-danger" : "btn-ghost"}`}>{label}</button>
    </form>
  );

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <form className="flex flex-wrap items-end gap-3" role="search">
          <label className="field w-full sm:w-72">
            <span>{x.search}</span>
            <input className="input" type="search" name="q" defaultValue={find} placeholder={x.or.placeholder} maxLength={80} />
          </label>
          <label className="field">
            <span>{x.or.status}</span>
            {/* The words are in the label attribute so they are not part of the page text. */}
            <select className="input" name="status" defaultValue={status}>
              <option value="" label={x.or.allStatuses} />
              {ORDER_STATUSES.map((s) => (
                <option key={s} value={s} label={t.orders.status[s]} />
              ))}
            </select>
          </label>
          <label className="field">
            <span>{x.or.fulfilment}</span>
            <select className="input" name="fulfilment" defaultValue={fulfilment}>
              <option value="" label={x.or.allFulfilment} />
              <option value="delivery" label={x.or.delivery} />
              <option value="collection" label={x.or.collection} />
            </select>
          </label>
          {stuck && <input type="hidden" name="stuck" value="1" />}
          <button className="btn btn-ghost">{x.filter}</button>
          {(find || status || fulfilment || stuck) && (
            <Link href={path} className="py-3 text-sm underline underline-offset-4">{x.clear}</Link>
          )}
        </form>
        <a href={`/${lang}/admin/export/orders`} className="btn btn-ghost btn-sm" download>{x.csv}</a>
      </div>
      {stuck && <p className="notice mt-6">{t.adminx.ov.stuckOrders}</p>}

      {orders.length === 0 ? (
        <p className="mt-8 text-soft">{t.admin.none}</p>
      ) : (
        <div className="mt-6 overflow-x-auto">
          <table className="table min-w-[56rem]">
            <thead>
              <tr>
                <th>{fmt(t.orders.order, { n: "" }).replace("#", "").trim()}</th>
                <th>{t.checkout.item}</th>
                <th>{t.checkout.total}</th>
                <th>{t.dash.o.commission}</th>
                <th>{t.admin.net}</th>
                <th>{t.dash.o.youGet}</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id}>
                  <td>
                    <Link href={`${path}/${o.id}`} className="font-medium underline underline-offset-4">#{o.number}</Link>
                    <div className="text-soft">{formatDate(new Date(o.created_at), lang)}</div>
                    <div className="text-turq">{orderStatus(t, o)}</div>
                  </td>
                  <td>
                    {o.title} × {o.quantity}
                    <div className="text-soft">{o.shop_name}</div>
                    <div className="text-soft">{o.buyer_email}</div>
                    <div className="text-soft" data-delivery={o.delivery_method}>
                      {o.fulfilment === "collection" ? t.dash.o.collection : t.delivery.by[o.delivery_method]}
                      {o.parcel_size && ` (${t.delivery.size[o.parcel_size]})`}
                      {o.label_ref && ` · ${fmt(t.dash.o.labelRef, { ref: o.label_ref })}`}
                    </div>
                  </td>
                  <td className="tabular-nums">
                    {formatGBP(o.total_pence)}
                    <div className="text-soft">{o.payment_method}</div>
                  </td>
                  <td className="tabular-nums">{formatGBP(o.commission_pence)}</td>
                  <td className="tabular-nums">{formatGBP(o.commission_pence - o.payment_cost_pence)}</td>
                  <td className="tabular-nums">{formatGBP(o.seller_payout_pence)}</td>
                  <td>
                    <div className="flex flex-wrap gap-2">
                      {o.status === "dispatched" && <Act id={o.id} act="deliver" label={t.admin.markDelivered} />}
                      {o.status === "delivered" && <Act id={o.id} act="release" label={t.admin.release} />}
                      {["paid", "dispatched", "delivered"].includes(o.status) && (
                        <Act id={o.id} act="refund" label={t.admin.refund} danger />
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <AdminPager
        t={t}
        path={path}
        params={{ q: find, status, fulfilment, stuck: stuck ? "1" : "" }}
        page={page}
        total={total}
      />
    </div>
  );
}
