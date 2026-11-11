import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale } from "@/lib/config";
import { getDict, itemCount, pick } from "@/lib/i18n";
import { approvedShops } from "@/lib/queries";
import Rating from "@/components/Rating";
import ShopMark from "@/components/ShopMark";

export async function generateMetadata({ params }: PageProps<"/[lang]/shops">) {
  const { lang } = await params;
  return { title: getDict(isLocale(lang) ? lang : "tr").shop.allTitle };
}

export default async function ShopsPage({ params }: PageProps<"/[lang]/shops">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDict(lang);
  const shops = await approvedShops();

  return (
    <div className="wrap pt-12">
      <h1 className="text-5xl md:text-7xl">{t.shop.allTitle}</h1>
      <p className="mt-4 max-w-xl text-lg text-soft">{t.shop.allSub}</p>
      {shops.length === 0 ? (
        <p className="mt-10 text-soft">{t.shop.none}</p>
      ) : (
        <ul className="mt-10 grid gap-x-10 md:grid-cols-2">
          {shops.map((s) => {
            const bio = pick(lang, s.bio_tr, s.bio_en).text;
            return (
              <li key={s.id} className="border-t border-line">
                <Link href={`/${lang}/s/${s.slug}`} className="group flex gap-5 py-6">
                  <ShopMark name={s.name} logoId={s.logo_id} className="w-20 text-base" />
                  <div className="min-w-0">
                    <h2 className="text-3xl group-hover:text-cobalt">{s.name}</h2>
                    <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-soft">
                      <span>{s.city}</span>
                      <span>{t.shop[s.seller_type]}</span>
                      <span>{itemCount(t, Number(s.items))}</span>
                      {s.avg !== null && (
                        <span className="flex items-center gap-1.5">
                          <Rating value={Number(s.avg)} size={12} />
                          {Number(s.avg).toFixed(1)}
                        </span>
                      )}
                    </p>
                    {bio && <p className="mt-2 line-clamp-2 text-soft">{bio}</p>}
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
