import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { isLocale } from "@/lib/config";
import { q } from "@/lib/db";
import { fmt, formatDate, getDict } from "@/lib/i18n";
import { formatGBP } from "@/lib/money";
import type { Order } from "@/lib/orders";

export const metadata = { robots: { index: false } };

export default async function OrdersPage({ params }: PageProps<"/[lang]/orders">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDict(lang);
  const user = await requireUser(lang, `/${lang}/orders`);
  const orders = await q<Order & { shop_name: string }>(
    `select o.*, s.name as shop_name from orders o join shops s on s.id = o.shop_id
      where o.buyer_id = $1 and o.status <> 'pending' order by o.created_at desc`,
    [user.id],
  );

  return (
    <div className="wrap max-w-3xl pt-12">
      <h1 className="text-5xl">{t.orders.title}</h1>
      {orders.length === 0 ? (
        <div className="mt-8">
          <p className="text-soft">{t.orders.empty}</p>
          <Link href={`/${lang}`} className="btn mt-5">{t.orders.browse}</Link>
        </div>
      ) : (
        <ul className="mt-8">
          {orders.map((o) => (
            <li key={o.id} className="border-t border-line">
              <Link href={`/${lang}/orders/${o.id}`} className="group grid gap-1 py-5 sm:grid-cols-[1fr_auto] sm:gap-6">
                <div>
                  <p className="font-medium group-hover:underline underline-offset-4">{o.title}</p>
                  <p className="text-sm text-soft">
                    {fmt(t.orders.order, { n: o.number })}, {o.shop_name},{" "}
                    {formatDate(new Date(o.created_at), lang)}
                  </p>
                </div>
                <div className="sm:text-right">
                  <p className="font-medium">{formatGBP(o.total_pence)}</p>
                  <p className="text-sm text-turq">{t.orders.status[o.status]}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
