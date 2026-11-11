import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { isLocale } from "@/lib/config";
import { one } from "@/lib/db";
import { fmt, formatDate, getDict } from "@/lib/i18n";
import { formatGBP } from "@/lib/money";
import type { Order } from "@/lib/orders";
import { isUuid } from "@/lib/queries";
import { confirmReceived, leaveReview } from "@/lib/actions/buy";
import Rating from "@/components/Rating";
import SubmitButton from "@/components/SubmitButton";

export const metadata = { robots: { index: false } };

const STEPS = ["paid", "dispatched", "delivered", "released"] as const;

export default async function OrderPage({ params }: PageProps<"/[lang]/orders/[id]">) {
  const { lang, id } = await params;
  if (!isLocale(lang) || !isUuid(id)) notFound();
  const t = getDict(lang);
  const user = await requireUser(lang, `/${lang}/orders/${id}`);
  const o = await one<Order & { shop_name: string; shop_slug: string }>(
    `select o.*, s.name as shop_name, s.slug as shop_slug from orders o join shops s on s.id = o.shop_id
      where o.id = $1 and (o.buyer_id = $2 or $3)`,
    [id, user.id, user.role === "admin"],
  );
  if (!o) notFound();
  const review = await one<{ rating: number; comment: string; reply: string | null }>(
    "select rating, comment, reply from reviews where order_id = $1",
    [o.id],
  );
  const stepIndex = STEPS.indexOf(o.status as (typeof STEPS)[number]);
  const canReview = (o.status === "delivered" || o.status === "released") && !review && o.buyer_id === user.id;

  return (
    <div className="wrap max-w-3xl pt-12">
      <p className="text-sm text-soft">
        <Link href={`/${lang}/orders`} className="underline underline-offset-4">{t.orders.title}</Link>
      </p>
      <h1 className="mt-2 text-5xl">{fmt(t.orders.order, { n: o.number })}</h1>
      <p className="mt-2 text-soft">{fmt(t.orders.placed, { date: formatDate(new Date(o.created_at), lang) })}</p>

      {/* The order really is a sequence, so it is shown as one. */}
      {stepIndex >= 0 && (
        <ol className="mt-8 grid grid-cols-4 gap-2">
          {STEPS.map((s, i) => (
            <li
              key={s}
              aria-current={i === stepIndex ? "step" : undefined}
              className={`border-t-2 pt-2 text-sm ${i <= stepIndex ? "border-cobalt font-medium" : "border-line text-soft"}`}
            >
              {t.orders.status[s]}
            </li>
          ))}
        </ol>
      )}
      <p className="notice mt-6">{t.orders.explain[o.status]}</p>

      {o.status === "dispatched" && o.buyer_id === user.id && (
        <form action={confirmReceived} className="mt-6">
          <input type="hidden" name="lang" value={lang} />
          <input type="hidden" name="order" value={o.id} />
          <SubmitButton>{t.orders.confirm}</SubmitButton>
          <p className="hint mt-2">{t.orders.confirmHint}</p>
        </form>
      )}

      <dl className="mt-10 grid gap-x-8 gap-y-6 border-t border-line pt-8 sm:grid-cols-2">
        <div>
          <dt className="text-sm text-soft">{t.checkout.item}</dt>
          <dd className="mt-1">
            {o.title} × {o.quantity}
          </dd>
          <dd className="mt-1 font-medium">{formatGBP(o.total_pence)}</dd>
          <dd className="text-sm text-soft">{t.orders.paidWith[o.payment_method]}</dd>
        </div>
        <div>
          <dt className="text-sm text-soft">{t.orders.seller}</dt>
          <dd className="mt-1">
            <Link href={`/${lang}/s/${o.shop_slug}`} className="underline underline-offset-4 hover:text-cobalt">
              {o.shop_name}
            </Link>
          </dd>
        </div>
        <div>
          <dt className="text-sm text-soft">{t.orders.shipTo}</dt>
          <dd className="mt-1 whitespace-pre-line">
            {[o.ship_name, o.ship_line1, o.ship_line2, `${o.ship_city} ${o.ship_postcode}`].filter(Boolean).join("\n")}
          </dd>
        </div>
        {o.tracking_number && (
          <div>
            <dt className="text-sm text-soft">{t.orders.tracking}</dt>
            <dd className="mt-1">
              {o.tracking_carrier} {o.tracking_number}
            </dd>
          </div>
        )}
      </dl>

      {review && (
        <section className="mt-10 border-t border-line pt-8">
          <h2 className="text-3xl">{t.orders.yourReview}</h2>
          <div className="mt-3"><Rating value={review.rating} size={16} /></div>
          {review.comment && <p className="mt-2">{review.comment}</p>}
          {review.reply && (
            <div className="mt-4 border-l-2 border-brass pl-4">
              <p className="text-sm font-medium">{t.shop.reply}</p>
              <p className="text-soft">{review.reply}</p>
            </div>
          )}
        </section>
      )}

      {canReview && (
        <section className="mt-10 border-t border-line pt-8">
          <h2 className="text-3xl">{t.orders.reviewTitle}</h2>
          <form action={leaveReview} className="mt-5 grid gap-5">
            <input type="hidden" name="lang" value={lang} />
            <input type="hidden" name="order" value={o.id} />
            <label className="field max-w-40">
              <span>{t.orders.rating}</span>
              <select name="rating" className="input" defaultValue="5" required>
                {[5, 4, 3, 2, 1].map((n) => (
                  <option key={n} value={n}>
                    {"★".repeat(n)} {n}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>{t.orders.comment}</span>
              <textarea name="comment" className="input" maxLength={1000} />
              <span className="hint font-normal">{t.orders.commentHint}</span>
            </label>
            <div><SubmitButton>{t.orders.submitReview}</SubmitButton></div>
          </form>
        </section>
      )}
    </div>
  );
}
