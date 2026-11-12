import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import type { Locale } from "@/lib/config";
import { getOrderDetail, isUuidStrict } from "@/lib/admin-queries";
import { formatDateTime } from "@/lib/admin-format";
import { fmt, getDict, orderStatus } from "@/lib/i18n";
import { formatGBP } from "@/lib/money";
import { adminOrder } from "@/lib/actions/admin";

export default async function AdminOrder({ params }: PageProps<"/[lang]/admin/orders/[id]">) {
  const { lang: l, id } = await params;
  const lang = l as Locale;
  const t = getDict(lang);
  await requireAdmin(lang);
  if (!isUuidStrict(id)) notFound();
  const o = await getOrderDetail(id);
  if (!o) notFound();
  const x = t.adminx;
  const coll = o.fulfilment === "collection";
  const here = `/${lang}/admin/orders/${id}`;

  const steps: { label: string; at: Date | null }[] = [
    { label: x.or.step.created, at: o.created_at },
    { label: x.or.step.paid, at: o.paid_at },
    { label: coll ? x.or.step.dispatchedCollection : x.or.step.dispatched, at: o.dispatched_at },
    { label: coll ? x.or.step.deliveredCollection : x.or.step.delivered, at: o.delivered_at },
    { label: x.or.step.released, at: o.released_at },
    { label: x.or.step.refunded, at: o.refunded_at },
  ].filter((s) => s.at);

  const net = o.commission_pence - o.payment_cost_pence;
  // A refunded order earned nothing: commission, net and payout show as £0.00 with the original
  // amount kept beside them as "would have been".
  const refunded = o.status === "refunded";
  const money: [string, number, boolean?, boolean?][] = [
    [x.or.itemTotal, o.item_pence],
    [x.or.postage, o.postage_pence],
    [x.or.total, o.total_pence, true],
    [x.or.deliveryCost, o.delivery_cost_pence],
    [x.or.commission, o.commission_pence, false, true],
    [x.or.paymentCost, o.payment_cost_pence],
    [x.or.net, net, false, true],
    [x.or.payout, o.seller_payout_pence, true, true],
  ];

  const act = (name: string, label: string, danger?: boolean) => (
    <form action={adminOrder}>
      <input type="hidden" name="lang" value={lang} />
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="act" value={name} />
      <input type="hidden" name="back" value={here} />
      <button className={`btn btn-sm ${danger ? "btn-danger" : "btn-ghost"}`}>{label}</button>
    </form>
  );

  return (
    <div className="grid max-w-4xl grid-cols-[minmax(0,1fr)] gap-12">
      <div>
        <Link href={`/${lang}/admin/orders`} className="text-sm underline underline-offset-4 hover:text-cobalt">
          ← {x.or.allOrders}
        </Link>
        <h2 className="mt-6 text-4xl">{fmt(t.orders.order, { n: o.number })}</h2>
        <p className="mt-2 text-lg break-words">
          {o.title} × {o.quantity}
        </p>
        <p className="mt-1 text-turq">{orderStatus(t, o)}</p>
        <div className="mt-5 flex flex-wrap gap-2">
          {o.status === "dispatched" && act("deliver", t.admin.markDelivered)}
          {o.status === "delivered" && act("release", t.admin.release)}
          {["paid", "dispatched", "delivered"].includes(o.status) && act("refund", t.admin.refund, true)}
        </div>
      </div>

      <section aria-labelledby="o-time">
        <h2 id="o-time" className="text-3xl">{x.or.timeline}</h2>
        <ol className="mt-4 grid gap-0">
          {steps.map((s) => (
            <li key={s.label} className="flex gap-4 border-t border-line py-3">
              <time className="w-44 shrink-0 text-soft tabular-nums" dateTime={new Date(s.at!).toISOString()}>
                {formatDateTime(s.at!, lang)}
              </time>
              <span>{s.label}</span>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="o-money">
        <h2 id="o-money" className="text-3xl">{x.or.money}</h2>
        <dl className="mt-4 max-w-xl rounded-3xl bg-mist p-6">
          {money.map(([label, pence, strong, earned]) => (
            <div key={label} className="flex justify-between gap-6 border-t border-line py-2.5 first:border-t-0">
              <dt className={strong ? "font-medium" : "text-soft"}>{label}</dt>
              {refunded && earned ? (
                <dd className={`text-right tabular-nums ${strong ? "font-medium" : ""}`} data-not-earned>
                  {formatGBP(0)}
                  <span className="block text-sm font-normal text-soft">
                    {x.or.wouldHaveBeen} <s>{formatGBP(pence)}</s>
                  </span>
                </dd>
              ) : (
                <dd className={`tabular-nums ${strong ? "font-medium" : ""}`}>{formatGBP(pence)}</dd>
              )}
            </div>
          ))}
          <div className="flex justify-between gap-6 border-t border-line py-2.5">
            <dt className="text-soft">{x.or.method}</dt>
            <dd>{t.orders.paidWith[o.payment_method as "card" | "klarna"]}</dd>
          </div>
        </dl>
        {refunded && <p className="notice mt-4 max-w-xl">{x.or.refundedNote}</p>}
        <p className="hint mt-3">{x.or.noCodeNote}</p>
      </section>

      <section aria-labelledby="o-people">
        <h2 id="o-people" className="text-3xl">{x.or.people}</h2>
        <dl className="mt-4 grid gap-x-8 gap-y-3 rounded-3xl bg-mist p-6 sm:grid-cols-[10rem_1fr]">
          <dt className="text-sm text-soft">{x.or.buyer}</dt>
          <dd className="break-words">
            <Link href={`/${lang}/admin/customers/${o.buyer_id}`} className="underline underline-offset-4 hover:text-cobalt">
              {o.buyer_name}, {o.buyer_email}
            </Link>
          </dd>
          <dt className="text-sm text-soft">{x.or.seller}</dt>
          <dd className="break-words">
            <Link href={`/${lang}/admin/sellers/${o.shop_id}`} className="underline underline-offset-4 hover:text-cobalt">
              {o.shop_name}, {o.seller_email}
            </Link>
          </dd>
          <dt className="text-sm text-soft">{x.or.fulfilment}</dt>
          <dd>
            {coll ? t.dash.o.collection : t.delivery.by[o.delivery_method as "seller" | "platform"]}
            {o.parcel_size && ` (${t.delivery.size[o.parcel_size as "small" | "medium" | "large"]})`}
          </dd>
          {(o.tracking_number || o.label_ref) && (
            <>
              <dt className="text-sm text-soft">{x.or.tracking}</dt>
              <dd>
                {[o.tracking_carrier, o.tracking_number].filter(Boolean).join(" ")}
                {o.label_ref && ` · ${fmt(t.dash.o.labelRef, { ref: o.label_ref })}`}
              </dd>
            </>
          )}
        </dl>
      </section>
    </div>
  );
}
