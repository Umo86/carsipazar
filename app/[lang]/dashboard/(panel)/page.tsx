import Link from "next/link";
import { requireShop } from "@/lib/auth";
import type { Locale } from "@/lib/config";
import { one } from "@/lib/db";
import { fmt, formatDate, getDict, orderStatus, reviewCount } from "@/lib/i18n";
import { formatGBP } from "@/lib/money";
import { sellerNumbers, sellerRecentOrders } from "@/lib/panel-queries";
import { releaseDueOrders } from "@/lib/orders";
import { origin } from "@/lib/actions/util";
import CopyLink from "@/components/CopyLink";

export default async function DashboardHome({ params }: PageProps<"/[lang]/dashboard">) {
  const lang = (await params).lang as Locale;
  const t = getDict(lang);
  const { shop } = await requireShop(lang);
  await releaseDueOrders();

  const stats = await one<{ paid_out: string; live: string }>(
    `select
       coalesce((select sum(seller_payout_pence) from orders where shop_id = $1 and status = 'released'), 0) as paid_out,
       (select count(*) from listings where shop_id = $1 and status = 'active') as live`,
    [shop.id],
  );
  const n = await sellerNumbers(shop.id);
  const recent = await sellerRecentOrders(shop.id, 5);
  const x = t.sellerx.ov;
  const base = `/${lang}/dashboard`;
  // A shop with no items and no orders gets first steps instead of a wall of zeros.
  const empty = n.items === 0 && n.orders === 0;
  const key = [
    { label: x.sales7, value: formatGBP(n.sales7) },
    { label: x.sales30, value: formatGBP(n.sales30) },
    { label: x.orders30, value: String(n.orders30) },
    { label: x.held, value: formatGBP(n.held), hint: x.heldHint },
    { label: x.paid30, value: formatGBP(n.paid30), href: `${base}/payouts` },
    {
      label: x.rating,
      value: n.ratingAvg !== null ? n.ratingAvg.toFixed(1) : "-",
      hint: n.ratingCount > 0 ? reviewCount(t, n.ratingCount) : x.noRating,
      href: `${base}/reviews`,
    },
  ];
  const attention = [
    { label: x.toSend, n: n.toSend, href: `${base}/orders?status=send` },
    { label: x.toReady, n: n.toReady, href: `${base}/orders?status=ready` },
    { label: x.waiting, n: n.waiting, href: `${base}/orders?status=waiting` },
    { label: x.locked, n: n.locked, href: `${base}/orders?status=waiting` },
    { label: x.lowStock, n: n.low, href: `${base}/listings?show=low` },
    { label: x.paused, n: n.paused, href: `${base}/listings?show=paused` },
    { label: x.unreplied, n: n.unreplied, href: `${base}/reviews` },
  ].filter((a) => a.n > 0);
  const url = `${await origin()}/s/${shop.slug}`;
  const tiles = [
    { label: t.dash.paidOut, value: formatGBP(Number(stats!.paid_out)) },
    { label: t.dash.live, value: stats!.live, href: `/${lang}/dashboard/listings` },
  ];

  return (
    <div className="grid gap-12">
      {empty ? (
        <section>
          <h2 className="text-3xl">{x.firstTitle}</h2>
          <p className="mt-1 text-soft">{x.firstLead}</p>
          <ol className="mt-5 grid max-w-2xl gap-3">
            {[
              { href: `${base}/listings/new`, title: x.stepItem, hint: x.stepItemHint },
              { href: `${base}/shop`, title: x.stepShop, hint: x.stepShopHint },
            ].map((step, i) => (
              <li key={step.href}>
                <Link href={step.href} className="panel flex items-start gap-4 p-5 transition-colors hover:bg-mist">
                  <span className="font-display text-3xl leading-none text-brass">{i + 1}</span>
                  <span>
                    <span className="block font-medium">{step.title}</span>
                    <span className="hint block">{step.hint}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </section>
      ) : (
        <>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-6 md:grid-cols-3" data-key-numbers>
            {key.map((k) => (
              <div key={k.label} className="rounded-2xl bg-mist p-5">
                <dt className="text-sm text-soft">{k.label}</dt>
                <dd className="mt-1 font-display text-3xl tabular-nums">
                  {k.href ? <Link href={k.href} className="hover:text-cobalt">{k.value}</Link> : k.value}
                </dd>
                {k.hint && <dd className="hint mt-1">{k.hint}</dd>}
              </div>
            ))}
          </dl>

          <section>
            <h2 className="text-3xl">{x.attention}</h2>
            {attention.length === 0 ? (
              <p className="mt-3 text-soft">{x.attentionNone}</p>
            ) : (
              <ul className="mt-3 max-w-2xl" data-attention>
                {attention.map((a) => (
                  <li key={a.label} className="border-t border-line">
                    <Link href={a.href} className="flex items-center justify-between gap-4 py-3 hover:text-cobalt">
                      <span>{a.label}</span>
                      <span className="rounded-full bg-tulip px-2.5 text-sm tabular-nums text-paper">{a.n}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {recent.length > 0 && (
            <section>
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <h2 className="text-3xl">{x.recent}</h2>
                <Link href={`${base}/orders`} className="text-sm underline underline-offset-4 hover:text-cobalt">{x.allOrders}</Link>
              </div>
              <ul className="mt-3" data-recent-orders>
                {recent.map((o) => (
                  <li key={o.id} className="border-t border-line">
                    <Link
                      href={`${base}/orders?q=${o.number}#o-${o.id}`}
                      className="grid gap-1 py-4 hover:text-cobalt sm:grid-cols-[1fr_auto] sm:gap-6"
                    >
                      <span>
                        <span className="block font-medium">{o.title} × {o.quantity}</span>
                        <span className="block text-sm text-soft">
                          {fmt(t.orders.order, { n: o.number })}, {formatDate(new Date(o.created_at), lang)}
                        </span>
                      </span>
                      <span className="sm:text-right">
                        <span className="block tabular-nums">{formatGBP(o.total_pence)}</span>
                        <span className="block text-sm text-turq">{orderStatus(t, o)}</span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}

      <h2 className="-mb-8 text-3xl">{x.totals}</h2>
      <dl className="grid grid-cols-2 gap-x-6 gap-y-8 md:grid-cols-4">
        {tiles.map((tile) => (
          <div key={tile.label} className="rounded-2xl bg-mist p-5">
            <dt className="text-sm text-soft">{tile.label}</dt>
            <dd className="mt-1 font-display text-4xl">
              {tile.href ? <Link href={tile.href} className="hover:text-cobalt">{tile.value}</Link> : tile.value}
            </dd>
          </div>
        ))}
      </dl>

      <section>
        <h2 className="text-3xl">{t.dash.yourLink}</h2>
        <p className="mt-1 text-soft">{t.dash.linkHint}</p>
        <div className="mt-4">
          <CopyLink url={url} copy={t.misc.copy} copied={t.misc.copied} />
        </div>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link href={`/${lang}/s/${shop.slug}`} className="btn btn-ghost btn-sm">{t.dash.viewShop}</Link>
          <Link href={`/${lang}/dashboard/listings/new`} className="btn btn-sm">{t.dash.newListing}</Link>
        </div>
      </section>
    </div>
  );
}
