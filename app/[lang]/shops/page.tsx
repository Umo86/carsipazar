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
    <div className="wrap pt-5">
      <div className="rounded-3xl bg-sky px-8 py-10 md:px-12 md:py-14">
        <h1 className="text-5xl md:text-6xl">{t.shop.allTitle}</h1>
        <p className="mt-3 max-w-xl text-lg text-soft">{t.shop.allSub}</p>
      </div>
      {shops.length === 0 ? (
        <p className="mt-10 text-soft">{t.shop.none}</p>
      ) : (
        <ul className="mt-8 grid gap-5 md:grid-cols-2">
          {shops.map((s) => {
            const bio = pick(lang, s.bio_tr, s.bio_en).text;
            return (
              <li key={s.id}>
                <Link
                  href={`/${lang}/s/${s.slug}`}
                  className="group panel flex h-full gap-5 overflow-hidden p-5 transition-shadow duration-300 hover:shadow-lift"
                >
                  <div className="media hidden w-36 shrink-0 self-stretch sm:block">
                    {s.cover_id && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={`/img/${s.cover_id}`} alt="" loading="lazy" className="h-full w-full object-cover" />
                    )}
                  </div>
                  <ShopMark name={s.name} logoId={s.logo_id} className="w-16 self-start text-[0.8rem] sm:hidden" />
                  <div className="min-w-0 self-center">
                    <h2 className="text-3xl transition-colors duration-200 group-hover:text-cobalt">{s.name}</h2>
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
