import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import type { Locale } from "@/lib/config";
import { one } from "@/lib/db";
import { getDict } from "@/lib/i18n";
import { formatGBP } from "@/lib/money";
import { releaseDueOrders } from "@/lib/orders";

export default async function AdminHome({ params }: PageProps<"/[lang]/admin">) {
  const lang = (await params).lang as Locale;
  const t = getDict(lang);
  await requireAdmin(lang);
  await releaseDueOrders();

  // Sales count every order that was paid and not refunded.
  const s = await one<{ sales: string; commission: string; net: string; held: string; pending: string }>(
    `select
       coalesce(sum(total_pence) filter (where status in ('paid','dispatched','delivered','released')), 0) as sales,
       coalesce(sum(commission_pence) filter (where status in ('paid','dispatched','delivered','released')), 0) as commission,
       coalesce(sum(commission_pence - payment_cost_pence) filter (where status in ('paid','dispatched','delivered','released')), 0) as net,
       coalesce(sum(seller_payout_pence) filter (where status in ('paid','dispatched','delivered')), 0) as held,
       (select count(*) from shops where status = 'pending') as pending
     from orders`,
  );
  const tiles = [
    { label: t.admin.sales, value: formatGBP(Number(s!.sales)) },
    { label: t.admin.commission, value: formatGBP(Number(s!.commission)) },
    { label: t.admin.net, value: formatGBP(Number(s!.net)) },
    { label: t.admin.heldFunds, value: formatGBP(Number(s!.held)) },
    { label: t.admin.pendingSellers, value: s!.pending, href: `/${lang}/admin/sellers` },
  ];
  return (
    <dl className="grid grid-cols-2 gap-x-6 gap-y-8 md:grid-cols-5">
      {tiles.map((tile) => (
        <div key={tile.label} className="border-t border-ink pt-3">
          <dt className="text-sm text-soft">{tile.label}</dt>
          <dd className="mt-1 font-display text-4xl">
            {tile.href ? <Link href={tile.href} className="hover:text-cobalt">{tile.value}</Link> : tile.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
