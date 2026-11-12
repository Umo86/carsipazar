import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import type { Locale } from "@/lib/config";
import { one } from "@/lib/db";
import { attention, dailySales, periodStats, recentLog } from "@/lib/admin-queries";
import { getDict } from "@/lib/i18n";
import { formatGBP } from "@/lib/money";
import { releaseDueOrders } from "@/lib/orders";
import ActivityLine from "@/components/ActivityLine";
import SalesChart from "@/components/SalesChart";

export default async function AdminHome({ params }: PageProps<"/[lang]/admin">) {
  const lang = (await params).lang as Locale;
  const t = getDict(lang);
  await requireAdmin(lang);
  await releaseDueOrders();

  // Sales count every order that was paid and not refunded.
  const s = await one<{ sales: string; commission: string; net: string; held: string; delivery: string; pending: string }>(
    `select
       coalesce(sum(total_pence) filter (where status in ('paid','dispatched','delivered','released')), 0) as sales,
       coalesce(sum(commission_pence) filter (where status in ('paid','dispatched','delivered','released')), 0) as commission,
       coalesce(sum(commission_pence - payment_cost_pence) filter (where status in ('paid','dispatched','delivered','released')), 0) as net,
       coalesce(sum(seller_payout_pence) filter (where status in ('paid','dispatched','delivered')), 0) as held,
       coalesce(sum(delivery_cost_pence) filter (where status in ('paid','dispatched','delivered','released')), 0) as delivery,
       (select count(*) from shops where status = 'pending') as pending
     from orders`,
  );
  const [d7, d30, days, need, log] = await Promise.all([
    periodStats(7),
    periodStats(30),
    dailySales(),
    attention(),
    recentLog(8),
  ]);
  const tiles = [
    { label: t.admin.sales, value: formatGBP(Number(s!.sales)) },
    { label: t.admin.commission, value: formatGBP(Number(s!.commission)) },
    { label: t.admin.net, value: formatGBP(Number(s!.net)) },
    { label: t.admin.heldFunds, value: formatGBP(Number(s!.held)) },
    { label: t.admin.deliveryCollected, value: formatGBP(Number(s!.delivery)) },
    { label: t.admin.pendingSellers, value: s!.pending, href: `/${lang}/admin/sellers` },
  ];

  const o = t.adminx.ov;
  const rows: { label: string; a: string; b: string }[] = [
    { label: o.sales, a: formatGBP(d7.sales), b: formatGBP(d30.sales) },
    { label: o.orders, a: String(d7.orders), b: String(d30.orders) },
    { label: o.commission, a: formatGBP(d7.commission), b: formatGBP(d30.commission) },
    { label: o.delivery, a: formatGBP(d7.delivery), b: formatGBP(d30.delivery) },
    { label: o.promotions, a: formatGBP(d7.promotions), b: formatGBP(d30.promotions) },
    { label: o.newUsers, a: String(d7.users), b: String(d30.users) },
    { label: o.newShops, a: String(d7.shops), b: String(d30.shops) },
  ];
  const base = `/${lang}/admin`;
  const items = [
    { label: o.pendingShops, n: need.pendingShops, href: `${base}/sellers?status=pending` },
    { label: o.openReports, n: need.openReports, href: `${base}/reports` },
    { label: o.stuckOrders, n: need.stuckOrders, href: `${base}/orders?stuck=1` },
    { label: o.pendingPromos, n: need.pendingPromos, href: `${base}/promotions` },
    { label: o.blockedUsers, n: need.blockedUsers, href: `${base}/customers?status=blocked` },
  ].filter((i) => i.n > 0);

  return (
    <div className="grid gap-14">
      <dl className="grid grid-cols-2 gap-x-6 gap-y-8 md:grid-cols-3">
        {tiles.map((tile) => (
          <div key={tile.label} className="rounded-2xl bg-mist p-5">
            <dt className="text-sm text-soft">{tile.label}</dt>
            <dd className="mt-1 font-display text-4xl">
              {tile.href ? <Link href={tile.href} className="hover:text-cobalt">{tile.value}</Link> : tile.value}
            </dd>
          </div>
        ))}
      </dl>

      <section aria-labelledby="attn" className="rounded-3xl bg-sand p-6 md:p-8">
        <h2 id="attn" className="text-3xl">{o.attention}</h2>
        {items.length === 0 ? (
          <p className="mt-3 text-soft">{o.attentionNone}</p>
        ) : (
          <ul className="mt-4 grid gap-1">
            {items.map((i) => (
              <li key={i.label}>
                <Link
                  href={i.href}
                  className="flex items-baseline gap-4 rounded-xl px-3 py-2 hover:bg-paper"
                >
                  <span className="min-w-8 font-display text-3xl tabular-nums">{i.n}</span>
                  <span className="underline-offset-4 hover:underline">{i.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="periods">
        <h2 id="periods" className="text-3xl">{o.periods}</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="table max-w-2xl">
            <thead>
              <tr>
                <th scope="col">{o.measure}</th>
                <th scope="col" className="text-right">{o.last7}</th>
                <th scope="col" className="text-right">{o.last30}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.label}>
                  <th scope="row" className="!border-line !font-normal !text-ink">{r.label}</th>
                  <td className="text-right tabular-nums">{r.a}</td>
                  <td className="text-right tabular-nums">{r.b}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <SalesChart days={days} lang={lang} t={t} />

      <section aria-labelledby="recent">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h2 id="recent" className="text-3xl">{o.recent}</h2>
          <Link href={`${base}/activity`} className="text-sm underline underline-offset-4 hover:text-cobalt">
            {o.allActivity}
          </Link>
        </div>
        {log.length === 0 ? (
          <p className="mt-4 text-soft">{o.recentNone}</p>
        ) : (
          <ul className="mt-4 max-w-3xl">
            {log.map((l) => (
              <li key={l.id} className="border-t border-line py-3 text-[0.9375rem]">
                <ActivityLine row={l} lang={lang} t={t} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
