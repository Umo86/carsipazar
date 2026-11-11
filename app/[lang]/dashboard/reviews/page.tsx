import { requireShop } from "@/lib/auth";
import type { Locale } from "@/lib/config";
import { formatDate, getDict } from "@/lib/i18n";
import { shopReviews } from "@/lib/queries";
import { replyToReview } from "@/lib/actions/shop";
import Rating from "@/components/Rating";
import SubmitButton from "@/components/SubmitButton";

export default async function DashboardReviews({ params }: PageProps<"/[lang]/dashboard/reviews">) {
  const lang = (await params).lang as Locale;
  const t = getDict(lang);
  const { shop } = await requireShop(lang);
  const reviews = await shopReviews(shop.id);

  if (reviews.length === 0) return <p className="text-soft">{t.dash.r.empty}</p>;

  return (
    <ul className="max-w-3xl">
      {reviews.map((r) => (
        <li key={r.id} className="border-t border-line py-6">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <Rating value={r.rating} />
            <span className="font-medium">{r.buyer_name}</span>
            <span className="text-sm text-soft">{formatDate(new Date(r.created_at), lang)}</span>
          </div>
          <p className="mt-1 text-sm text-soft">{r.title}</p>
          {r.comment && <p className="mt-3">{r.comment}</p>}
          {r.reply ? (
            <div className="mt-4 border-l-2 border-brass pl-4">
              <p className="text-sm font-medium">{t.shop.reply}</p>
              <p className="text-soft">{r.reply}</p>
            </div>
          ) : (
            <form action={replyToReview} className="mt-4 grid gap-3">
              <input type="hidden" name="lang" value={lang} />
              <input type="hidden" name="id" value={r.id} />
              <label className="field">
                <span>{t.dash.r.reply}</span>
                <textarea className="input" name="reply" maxLength={600} required />
              </label>
              <div><SubmitButton className="btn btn-sm">{t.dash.r.send}</SubmitButton></div>
            </form>
          )}
        </li>
      ))}
    </ul>
  );
}
