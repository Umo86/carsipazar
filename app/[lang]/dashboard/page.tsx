import Link from "next/link";
import { requireShop } from "@/lib/auth";
import type { Locale } from "@/lib/config";
import { one } from "@/lib/db";
import { getDict } from "@/lib/i18n";
import { formatGBP } from "@/lib/money";
import { releaseDueOrders } from "@/lib/orders";
import { origin } from "@/lib/actions/util";
import CopyLink from "@/components/CopyLink";

export default async function DashboardHome({ params }: PageProps<"/[lang]/dashboard">) {
  const lang = (await params).lang as Locale;
  const t = getDict(lang);
  const { shop } = await requireShop(lang);
  await releaseDueOrders();

  const stats = await one<{ held: string; paid_out: string; to_dispatch: string; live: string }>(
    `select
       coalesce((select sum(seller_payout_pence) from orders where shop_id = $1 and status in ('paid','dispatched','delivered')), 0) as held,
       coalesce((select sum(seller_payout_pence) from orders where shop_id = $1 and status = 'released'), 0) as paid_out,
       (select count(*) from orders where shop_id = $1 and status = 'paid') as to_dispatch,
       (select count(*) from listings where shop_id = $1 and status = 'active') as live`,
    [shop.id],
  );
  const url = `${await origin()}/s/${shop.slug}`;
  const tiles = [
    { label: t.dash.toDispatch, value: stats!.to_dispatch, href: `/${lang}/dashboard/orders` },
    { label: t.dash.held, value: formatGBP(Number(stats!.held)), hint: t.dash.heldHint },
    { label: t.dash.paidOut, value: formatGBP(Number(stats!.paid_out)) },
    { label: t.dash.live, value: stats!.live, href: `/${lang}/dashboard/listings` },
  ];

  return (
    <div className="grid gap-12">
      <dl className="grid grid-cols-2 gap-x-6 gap-y-8 md:grid-cols-4">
        {tiles.map((tile) => (
          <div key={tile.label} className="rounded-2xl bg-mist p-5">
            <dt className="text-sm text-soft">{tile.label}</dt>
            <dd className="mt-1 font-display text-4xl">
              {tile.href ? <Link href={tile.href} className="hover:text-cobalt">{tile.value}</Link> : tile.value}
            </dd>
            {tile.hint && <dd className="hint mt-1">{tile.hint}</dd>}
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
