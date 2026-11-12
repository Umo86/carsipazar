import Link from "next/link";
import { requireShop } from "@/lib/auth";
import type { Locale } from "@/lib/config";
import { fmt, formatDate, getDict } from "@/lib/i18n";
import { formatGBP } from "@/lib/money";
import { releaseDueOrders } from "@/lib/orders";
import { PANEL_PAGE_SIZE, pageNo, pctBps, releaseDate, sellerPayouts } from "@/lib/panel-queries";
import { getSettings } from "@/lib/settings";
import { clampPage } from "@/lib/paging";
import PanelPager from "@/components/PanelPager";

export default async function DashboardPayouts({ params, searchParams }: PageProps<"/[lang]/dashboard/payouts">) {
  const lang = (await params).lang as Locale;
  const t = getDict(lang);
  const { shop } = await requireShop(lang);
  const sp = await searchParams;
  await releaseDueOrders();
  const page = pageNo(sp.page);
  const [settings, p] = await Promise.all([getSettings(), sellerPayouts(shop.id, page)]);
  clampPage(`/${lang}/dashboard/payouts`, {}, page, p.total, PANEL_PAGE_SIZE);
  const x = t.sellerx.pay;
  const base = `/${lang}/dashboard`;
  const date = (d: Date | string) => formatDate(new Date(d), lang);
  const money = "tabular-nums";

  const tiles = [
    { label: x.held, value: formatGBP(p.held), hint: x.heldHint },
    {
      label: x.due,
      value: formatGBP(p.due),
      hint: p.nextFrom ? fmt(x.dueNext, { date: date(releaseDate(p.nextFrom, settings.release_days)) }) : x.dueNone,
    },
    { label: x.paidTotal, value: formatGBP(p.paid) },
  ];

  const cardRate = shop.founding
    ? `${pctBps(settings.founding_card_bps, lang)} + ${formatGBP(settings.founding_card_fixed)}`
    : pctBps(settings.card_bps, lang);
  const instRate = shop.founding
    ? `${pctBps(settings.founding_klarna_bps, lang)} + ${formatGBP(settings.founding_klarna_fixed)}`
    : pctBps(settings.klarna_bps, lang);

  const statusText = (r: (typeof p.rows)[number]) => {
    if (r.status === "refunded") return x.refunded;
    if (r.status === "released") return fmt(x.paidOut, { date: date(r.released_at ?? r.delivered_at ?? r.created_at) });
    if (r.status === "delivered" && r.delivered_at) return fmt(x.heldRelease, { date: date(releaseDate(r.delivered_at, settings.release_days)) });
    return r.fulfilment === "collection" ? x.heldCollection : x.heldDelivery;
  };

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-12">
      <div>
        <p className="max-w-2xl text-soft">{x.intro}</p>
        <dl className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-3" data-payout-summary>
          {tiles.map((tile) => (
            <div key={tile.label} className="rounded-2xl bg-mist p-5">
              <dt className="text-sm text-soft">{tile.label}</dt>
              <dd className={`mt-1 font-display text-3xl ${money}`}>{tile.value}</dd>
              <dd className="hint mt-1">{tile.hint}</dd>
            </div>
          ))}
        </dl>
      </div>

      <section>
        <h2 className="text-3xl">{x.ordersTitle}</h2>
        {p.rows.length === 0 ? (
          <p className="mt-4 text-soft">{x.empty}</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="table min-w-[44rem]" data-payout-table>
              <thead>
                <tr>
                  <th>{x.date}</th>
                  <th>{x.order}</th>
                  <th className="text-right">{x.buyerPaid}</th>
                  <th className="text-right">{x.label}</th>
                  <th className="text-right">{x.commission}</th>
                  <th className="text-right">{x.payout}</th>
                  <th>{x.status}</th>
                </tr>
              </thead>
              <tbody>
                {p.rows.map((r) => (
                  <tr key={r.id} data-order={r.number}>
                    <td className="whitespace-nowrap">{date(r.created_at)}</td>
                    <td className="whitespace-nowrap">
                      <Link href={`${base}/orders?q=${r.number}#o-${r.id}`} className="underline underline-offset-4 hover:text-cobalt">
                        {fmt(t.orders.order, { n: r.number })}
                      </Link>
                    </td>
                    <td className={`text-right ${money}`}>{formatGBP(r.total_pence)}</td>
                    <td className={`text-right ${money}`}>{r.delivery_cost_pence > 0 ? `-${formatGBP(r.delivery_cost_pence)}` : "-"}</td>
                    <td className={`text-right ${money}`}>-{formatGBP(r.commission_pence)}</td>
                    <td className={`text-right font-medium ${money} ${r.status === "refunded" ? "text-soft line-through" : ""}`}>
                      {formatGBP(r.seller_payout_pence)}
                    </td>
                    <td>{statusText(r)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <PanelPager t={t} path={`${base}/payouts`} page={page} total={p.total} pageSize={PANEL_PAGE_SIZE} />
      </section>

      <section className="max-w-2xl" data-rates>
        <h2 className="text-3xl">{x.ratesTitle}</h2>
        <p className="mt-2 text-soft">{x.ratesIntro}</p>
        <p className="mt-4"><span className="tag">{shop.founding ? x.founding : x.standard}</span></p>
        <dl className="mt-4 grid grid-cols-[1fr_auto] gap-y-2 border-t border-line pt-4">
          <dt>{x.card}</dt>
          <dd className={`font-medium ${money}`}>{cardRate}</dd>
          <dt>{x.instalments}</dt>
          <dd className={`font-medium ${money}`}>{instRate}</dd>
        </dl>
        <h3 className="mt-8 text-2xl">{x.chargedOn}</h3>
        <p className="mt-2 text-soft">{x.chargedOnBody}</p>
        <p className="mt-3 text-soft">{fmt(x.paidWhen, { days: settings.release_days })}</p>
      </section>
    </div>
  );
}
