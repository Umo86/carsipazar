import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import type { Locale } from "@/lib/config";
import { q } from "@/lib/db";
import { fmt, formatDate, getDict, orderStatus } from "@/lib/i18n";
import { formatGBP } from "@/lib/money";
import { ORDER_NO_CODE, releaseDueOrders, type Order } from "@/lib/orders";
import { adminOrder } from "@/lib/actions/admin";

export default async function AdminOrders({ params }: PageProps<"/[lang]/admin/orders">) {
  const lang = (await params).lang as Locale;
  const t = getDict(lang);
  await requireAdmin(lang);
  await releaseDueOrders();
  const orders = await q<Order & { shop_name: string; buyer_email: string }>(
    `select o.*, ${ORDER_NO_CODE}, s.name as shop_name, u.email as buyer_email
       from orders o join shops s on s.id = o.shop_id join users u on u.id = o.buyer_id
      where o.status <> 'pending' order by o.created_at desc limit 300`,
  );
  if (orders.length === 0) return <p className="text-soft">{t.admin.none}</p>;

  const Act = ({ id, act, label, danger }: { id: string; act: string; label: string; danger?: boolean }) => (
    <form action={adminOrder}>
      <input type="hidden" name="lang" value={lang} />
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="act" value={act} />
      <button className={`btn btn-sm ${danger ? "btn-danger" : "btn-ghost"}`}>{label}</button>
    </form>
  );

  return (
    <div className="overflow-x-auto">
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
                <Link href={`/${lang}/orders/${o.id}`} className="font-medium underline underline-offset-4">#{o.number}</Link>
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
              <td>
                {formatGBP(o.total_pence)}
                <div className="text-soft">{o.payment_method}</div>
              </td>
              <td>{formatGBP(o.commission_pence)}</td>
              <td>{formatGBP(o.commission_pence - o.payment_cost_pence)}</td>
              <td>{formatGBP(o.seller_payout_pence)}</td>
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
  );
}
