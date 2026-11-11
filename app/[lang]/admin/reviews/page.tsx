import { requireAdmin } from "@/lib/auth";
import type { Locale } from "@/lib/config";
import { q } from "@/lib/db";
import { formatDate, getDict } from "@/lib/i18n";
import type { ReviewRow } from "@/lib/queries";
import { setReviewStatus } from "@/lib/actions/admin";
import Rating from "@/components/Rating";

export default async function AdminReviews({ params }: PageProps<"/[lang]/admin/reviews">) {
  const lang = (await params).lang as Locale;
  const t = getDict(lang);
  await requireAdmin(lang);
  const reviews = await q<ReviewRow>(
    `select r.id, r.rating, r.comment, r.reply, r.status, r.created_at, u.name as buyer_name, o.title, s.name as shop_name
       from reviews r join users u on u.id = r.buyer_id join orders o on o.id = r.order_id
       join shops s on s.id = r.shop_id order by r.created_at desc limit 300`,
  );
  if (reviews.length === 0) return <p className="text-soft">{t.admin.none}</p>;

  return (
    <ul className="max-w-3xl">
      {reviews.map((r) => (
        <li key={r.id} className={`border-t border-line py-5 ${r.status === "hidden" ? "opacity-60" : ""}`}>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <Rating value={r.rating} />
            <span className="font-medium">{r.buyer_name}</span>
            <span className="text-sm text-soft">
              {r.shop_name}, {formatDate(new Date(r.created_at), lang)}
            </span>
          </div>
          <p className="mt-1 text-sm text-soft">{r.title}</p>
          {r.comment && <p className="mt-2">{r.comment}</p>}
          {r.reply && <p className="mt-2 border-l-2 border-brass pl-4 text-soft">{r.reply}</p>}
          <form action={setReviewStatus} className="mt-3">
            <input type="hidden" name="lang" value={lang} />
            <input type="hidden" name="id" value={r.id} />
            <input type="hidden" name="to" value={r.status === "published" ? "hidden" : "published"} />
            <button className={`btn btn-sm ${r.status === "published" ? "btn-danger" : "btn-ghost"}`}>
              {r.status === "published" ? t.admin.hide : t.admin.show}
            </button>
          </form>
        </li>
      ))}
    </ul>
  );
}
