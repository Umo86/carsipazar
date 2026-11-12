import { requireShop } from "@/lib/auth";
import { COLLECTION_MAX_ATTEMPTS, type Locale } from "@/lib/config";
import { q } from "@/lib/db";
import { fmt, formatDate, getDict, orderStatus } from "@/lib/i18n";
import { formatGBP } from "@/lib/money";
import { ORDER_NO_CODE, releaseDueOrders, type Order } from "@/lib/orders";
import { getSettings } from "@/lib/settings";
import { confirmHandoverAction, createLabelAction, dispatchOrder, markReadyAction } from "@/lib/actions/shop";
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
      `select *, ${ORDER_NO_CODE} from orders where shop_id = $1 and status <> 'pending' order by (status = 'paid') desc, created_at desc limit 200`,
      [shop.id],
    ),
    getSettings(),
  ]);

  if (orders.length === 0) return <p className="text-soft">{o.empty}</p>;

  return (
    <>
    {(sp.error === "label" || sp.error === "tracking") && (
      <p className="notice notice-error mb-6" role="alert">
        {sp.error === "label" ? o.labelFirst : o.trackingRequired}
      </p>
    )}
    <ul>
      {orders.map((ord) => {
        const col = ord.fulfilment === "collection";
        return (
        <li key={ord.id} id={`o-${ord.id}`} className="grid gap-6 border-t border-line py-6 md:grid-cols-[3fr_2fr]">
          <div>
            <p className="text-sm text-soft">
              {fmt(t.orders.order, { n: ord.number })}, {formatDate(new Date(ord.created_at), lang)}
            </p>
            <p className="mt-1 font-medium">
              {ord.title} × {ord.quantity}
            </p>
            <p className="mt-1 text-sm">
              <span className="text-turq">{orderStatus(t, ord)}</span>
              <span className="text-soft">, {t.orders.paidWith[ord.payment_method]}</span>
            </p>
            <p className="mt-1 text-sm text-soft">
              {col ? o.collection : t.delivery.by[ord.delivery_method]}
              {ord.parcel_size && `, ${fmt(t.delivery.parcel, { size: t.delivery.size[ord.parcel_size] }).toLowerCase()}`}
            </p>
            {/* What the buyer paid, what the platform keeps, what the seller gets. */}
            <dl className="mt-4 grid max-w-xs grid-cols-[1fr_auto] gap-y-1 text-sm">
              <dt className="text-soft">{o.buyerPaid}</dt>
              <dd>{formatGBP(ord.total_pence)}</dd>
              {ord.delivery_method === "platform" && (
                <>
                  <dt className="text-soft">{o.deliveryCharge}</dt>
                  <dd>-{formatGBP(ord.delivery_cost_pence)}</dd>
                </>
              )}
              <dt className="text-soft">{o.commission}</dt>
              <dd>-{formatGBP(ord.commission_pence)}</dd>
              <dt className="font-medium">{o.youGet}</dt>
              <dd className="font-medium">{formatGBP(ord.seller_payout_pence)}</dd>
            </dl>
          </div>

          <div>
            <p className="text-sm text-soft">{col ? o.collector : o.shipTo}</p>
            <p className="mt-1 whitespace-pre-line text-sm">
              {(col
                ? [ord.ship_name, ord.ship_phone]
                : [ord.ship_name, ord.ship_line1, ord.ship_line2, `${ord.ship_city} ${ord.ship_postcode}`, ord.ship_phone]
              )
                .filter(Boolean)
                .join("\n")}
            </p>

            {col && ord.status === "paid" && (
              <form action={markReadyAction} className="mt-4 grid gap-3">
                <input type="hidden" name="lang" value={lang} />
                <input type="hidden" name="order" value={ord.id} />
                <p className="hint">{o.readyHint}</p>
                <div><SubmitButton className="btn btn-sm">{o.markReady}</SubmitButton></div>
              </form>
            )}
            {col && ord.status === "dispatched" && (
              <div className="mt-4 grid gap-3">
                <p className="notice">{o.waitingCollect}</p>
                {ord.collection_attempts >= COLLECTION_MAX_ATTEMPTS ? (
                  <p className="notice notice-error" role="alert">{o.locked}</p>
                ) : (
                  <form action={confirmHandoverAction} className="grid gap-3" autoComplete="off">
                    <input type="hidden" name="lang" value={lang} />
                    <input type="hidden" name="order" value={ord.id} />
                    {(sp.error === "code" || sp.error === "codeformat") && sp.o === ord.id && (
                      <p className="notice notice-error" role="alert">
                        {sp.error === "code"
                          ? fmt(o.errCode, { n: COLLECTION_MAX_ATTEMPTS - ord.collection_attempts })
                          : o.errCodeFormat}
                      </p>
                    )}
                    <label className="field max-w-48">
                      <span>{o.handoverTitle}</span>
                      <input
                        className="input"
                        name="code"
                        inputMode="numeric"
                        pattern="[0-9]{6}"
                        maxLength={6}
                        autoComplete="off"
                        required
                      />
                    </label>
                    <p className="hint">{o.handoverHint}</p>
                    <div><SubmitButton className="btn btn-sm">{o.confirmHandover}</SubmitButton></div>
                  </form>
                )}
              </div>
            )}

            {ord.status === "paid" && !col && ord.delivery_method === "platform" && !ord.label_ref && (
              <form action={createLabelAction} className="mt-4 grid gap-3">
                <input type="hidden" name="lang" value={lang} />
                <input type="hidden" name="order" value={ord.id} />
                <p className="hint">{o.labelHint}</p>
                <div><SubmitButton className="btn btn-sm">{o.createLabel}</SubmitButton></div>
              </form>
            )}
            {ord.status === "paid" && !col && ord.delivery_method === "platform" && ord.label_ref && (
              <div className="mt-4 grid gap-3">
                <p className="text-sm">
                  {fmt(o.labelRef, { ref: ord.label_ref })}
                  <span className="block text-soft">{ord.tracking_carrier} {ord.tracking_number}</span>
                </p>
                <p>
                  <a
                    href={`/${lang}/dashboard/orders/${ord.id}/label`}
                    target="_blank"
                    rel="noopener"
                    className="btn btn-sm btn-ghost"
                  >
                    {o.printLabel}
                  </a>
                </p>
                <form action={dispatchOrder}>
                  <input type="hidden" name="lang" value={lang} />
                  <input type="hidden" name="order" value={ord.id} />
                  <SubmitButton className="btn btn-sm">{o.handedOver}</SubmitButton>
                </form>
              </div>
            )}
            {ord.status === "paid" && !col && ord.delivery_method === "seller" && (
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
            {ord.status === "dispatched" && !col && (
              <p className="notice mt-4">
                {o.waitingBuyer}
                {ord.tracking_number && ` ${ord.tracking_carrier ?? ""} ${ord.tracking_number}`}
              </p>
            )}
            {ord.status === "delivered" && (
              <p className="notice mt-4">{fmt(col ? o.collectedRelease : o.waitingRelease, { days: settings.release_days })}</p>
            )}
            {ord.status === "released" && <p className="notice mt-4">{o.released}</p>}
          </div>
        </li>
        );
      })}
    </ul>
    </>
  );
}
