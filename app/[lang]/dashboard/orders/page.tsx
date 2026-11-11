import { requireShop } from "@/lib/auth";
import type { Locale } from "@/lib/config";
import { q } from "@/lib/db";
import { fmt, formatDate, getDict } from "@/lib/i18n";
import { formatGBP } from "@/lib/money";
import { releaseDueOrders, type Order } from "@/lib/orders";
import { getSettings } from "@/lib/settings";
import { dispatchOrder } from "@/lib/actions/shop";
import SubmitButton from "@/components/SubmitButton";

export default async function DashboardOrders({ params, searchParams }: PageProps<"/[lang]/dashboard/orders">) {
  const lang = (await params).lang as Locale;
  const t = getDict(lang);
  const o = t.dash.o;
  const { shop } = await requireShop(lang);
  const sp = await searchParams;
  await releaseDueOrders();
  const [orders, settings] = await Promise.all([
    q<Order>(
      "select * from orders where shop_id = $1 and status <> 'pending' order by (status = 'paid') desc, created_at desc limit 200",
      [shop.id],
    ),
    getSettings(),
  ]);

  if (orders.length === 0) return <p className="text-soft">{o.empty}</p>;

  return (
    <>
    {sp.error && <p className="notice notice-error mb-6" role="alert">{o.trackingRequired}</p>}
    <ul>
      {orders.map((ord) => (
        <li key={ord.id} id={`o-${ord.id}`} className="grid gap-6 border-t border-line py-6 md:grid-cols-[3fr_2fr]">
          <div>
            <p className="text-sm text-soft">
              {fmt(t.orders.order, { n: ord.number })}, {formatDate(new Date(ord.created_at), lang)}
            </p>
            <p className="mt-1 font-medium">
              {ord.title} × {ord.quantity}
            </p>
            <p className="mt-1 text-sm">
              <span className="text-turq">{t.orders.status[ord.status]}</span>
              <span className="text-soft">, {t.orders.paidWith[ord.payment_method]}</span>
            </p>
            {/* What the buyer paid, what the platform keeps, what the seller gets. */}
            <dl className="mt-4 grid max-w-xs grid-cols-[1fr_auto] gap-y-1 text-sm">
              <dt className="text-soft">{o.buyerPaid}</dt>
              <dd>{formatGBP(ord.total_pence)}</dd>
              <dt className="text-soft">{o.commission}</dt>
              <dd>-{formatGBP(ord.commission_pence)}</dd>
              <dt className="font-medium">{o.youGet}</dt>
              <dd className="font-medium">{formatGBP(ord.seller_payout_pence)}</dd>
            </dl>
          </div>

          <div>
            <p className="text-sm text-soft">{o.shipTo}</p>
            <p className="mt-1 whitespace-pre-line text-sm">
              {[ord.ship_name, ord.ship_line1, ord.ship_line2, `${ord.ship_city} ${ord.ship_postcode}`, ord.ship_phone]
                .filter(Boolean)
                .join("\n")}
            </p>

            {ord.status === "paid" && (
              <form action={dispatchOrder} className="mt-4 grid gap-3">
                <input type="hidden" name="lang" value={lang} />
                <input type="hidden" name="order" value={ord.id} />
                <div className="grid grid-cols-2 gap-3">
                  <label className="field">
                    <span>{o.carrier}</span>
                    <input className="input" name="carrier" placeholder="Royal Mail" />
                  </label>
                  <label className="field">
                    <span>{o.trackingNo}</span>
                    <input className="input" name="tracking" required={ord.payment_method === "klarna"} />
                  </label>
                </div>
                {ord.payment_method === "klarna" && <p className="hint">{o.trackingRequired}</p>}
                <div><SubmitButton className="btn btn-sm">{o.markDispatched}</SubmitButton></div>
              </form>
            )}
            {ord.status === "dispatched" && (
              <p className="notice mt-4">
                {o.waitingBuyer}
                {ord.tracking_number && ` ${ord.tracking_carrier ?? ""} ${ord.tracking_number}`}
              </p>
            )}
            {ord.status === "delivered" && (
              <p className="notice mt-4">{fmt(o.waitingRelease, { days: settings.release_days })}</p>
            )}
            {ord.status === "released" && <p className="notice mt-4">{o.released}</p>}
          </div>
        </li>
      ))}
    </ul>
    </>
  );
}
