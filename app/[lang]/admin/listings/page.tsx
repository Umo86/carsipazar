import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { categoryName, type Locale } from "@/lib/config";
import { q } from "@/lib/db";
import { getDict, pick } from "@/lib/i18n";
import { formatGBP } from "@/lib/money";
import { moderateListing } from "@/lib/actions/admin";

type Row = {
  id: string; title_tr: string; title_en: string; price_pence: number; category: string;
  status: string; featured: boolean; shop_name: string; image_id: string | null;
};

export default async function AdminListings({ params }: PageProps<"/[lang]/admin/listings">) {
  const lang = (await params).lang as Locale;
  const t = getDict(lang);
  await requireAdmin(lang);
  const rows = await q<Row>(
    `select l.id, l.title_tr, l.title_en, l.price_pence, l.category, l.status, l.featured, s.name as shop_name,
            (select i.id from listing_images i where i.listing_id = l.id order by i.position limit 1) as image_id
       from listings l join shops s on s.id = l.shop_id order by l.created_at desc limit 300`,
  );
  if (rows.length === 0) return <p className="text-soft">{t.admin.none}</p>;

  const Act = ({ id, act, label, danger }: { id: string; act: string; label: string; danger?: boolean }) => (
    <form action={moderateListing}>
      <input type="hidden" name="lang" value={lang} />
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="act" value={act} />
      <button className={`btn btn-sm ${danger ? "btn-danger" : "btn-ghost"}`}>{label}</button>
    </form>
  );

  return (
    <ul>
      {rows.map((l) => (
        <li key={l.id} className="grid grid-cols-[4rem_1fr] gap-4 border-t border-line py-4 md:grid-cols-[4rem_1fr_auto] md:items-center">
          <div className="aspect-[4/5] bg-mist">
            {l.image_id && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={`/img/${l.image_id}`} alt="" className="h-full w-full object-cover" />
            )}
          </div>
          <div>
            <Link href={`/${lang}/l/${l.id}`} className="font-medium hover:underline underline-offset-4">
              {pick(lang, l.title_tr, l.title_en).text}
            </Link>
            <p className="mt-1 text-sm text-soft">
              {l.shop_name}, {categoryName(l.category, lang)}, {formatGBP(l.price_pence)},{" "}
              <span className={l.status === "removed" ? "text-tulip" : ""}>{l.status}</span>
              {l.featured && <span className="tag ml-2">{t.admin.feature}</span>}
            </p>
          </div>
          <div className="col-span-2 flex flex-wrap gap-2 md:col-span-1">
            {l.status !== "removed" && (
              <Act id={l.id} act={l.featured ? "unfeature" : "feature"} label={l.featured ? t.admin.unfeature : t.admin.feature} />
            )}
            {l.status === "removed" ? (
              <Act id={l.id} act="restore" label={t.admin.restore} />
            ) : (
              <Act id={l.id} act="remove" label={t.admin.remove} danger />
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
