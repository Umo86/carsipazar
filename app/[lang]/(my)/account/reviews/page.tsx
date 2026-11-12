import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { isLocale } from "@/lib/config";
import { fmt, formatDate, getDict } from "@/lib/i18n";
import { buyerReviews, reviewableOrders } from "@/lib/panel-queries";
import Rating from "@/components/Rating";

export const metadata = { robots: { index: false } };

export default async function MyReviewsPage({ params }: PageProps<"/[lang]/account/reviews">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDict(lang);
  const user = await requireUser(lang, `/${lang}/account/reviews`);
  const [written, toWrite] = await Promise.all([buyerReviews(user.id), reviewableOrders(user.id)]);
  const x = t.my.rv;

  return (
    <div className="grid max-w-3xl gap-12">
      <section data-written>
        <h2 className="text-3xl">{x.written}</h2>
        {written.length === 0 ? (
          <p className="mt-3 text-soft">{x.none}</p>
        ) : (
          <ul className="mt-3">
            {written.map((r) => (
              <li key={r.id} className="border-t border-line py-5" data-review={r.order_number}>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <Rating value={r.rating} />
                  <Link href={`/${lang}/s/${r.shop_slug}`} className="font-medium underline-offset-4 hover:underline">{r.shop_name}</Link>
                  <span className="text-sm text-soft">{formatDate(new Date(r.created_at), lang)}</span>
                  <span className={r.status === "published" ? "tag" : "tag bg-rose text-tulip"}>
                    {r.status === "published" ? x.published : x.hidden}
                  </span>
                </div>
                <p className="mt-1 text-sm text-soft">
                  <Link href={`/${lang}/orders/${r.order_id}`} className="underline underline-offset-4 hover:text-cobalt">
                    {fmt(t.orders.order, { n: r.order_number })}
                  </Link>
                  , {r.title}
                </p>
                {r.comment && <p className="mt-3">{r.comment}</p>}
                {r.status === "hidden" && <p className="hint mt-2">{x.hiddenHint}</p>}
                {r.reply && (
                  <div className="mt-4 border-l-2 border-brass pl-4">
                    <p className="text-sm font-medium">{t.shop.reply}</p>
                    <p className="text-soft">{r.reply}</p>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section data-to-write>
        <h2 className="text-3xl">{x.toWrite}</h2>
        {toWrite.length === 0 ? (
          <p className="mt-3 text-soft">{x.toWriteNone}</p>
        ) : (
          <ul className="mt-3">
            {toWrite.map((o) => (
              <li key={o.id} className="flex flex-wrap items-center justify-between gap-3 border-t border-line py-4">
                <span>
                  <span className="block font-medium">{o.title} × {o.quantity}</span>
                  <span className="block text-sm text-soft">{fmt(t.orders.order, { n: o.number })}, {o.shop_name}</span>
                </span>
                <Link href={`/${lang}/orders/${o.id}#review`} className="btn btn-ghost btn-sm">{t.my.ov.writeReview}</Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
