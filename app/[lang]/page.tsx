import Link from "next/link";
import { notFound } from "next/navigation";
import { CATEGORIES, isLocale } from "@/lib/config";
import { q } from "@/lib/db";
import { getDict, itemCount, pick, reviewCount } from "@/lib/i18n";
import { formatGBP } from "@/lib/money";
import { approvedShops, categoryCovers, featuredListings, newestListings, spotlightListing } from "@/lib/queries";
import ListingCard from "@/components/ListingCard";
import Carousel from "@/components/Carousel";
import ShopMark from "@/components/ShopMark";
import Rating from "@/components/Rating";
import Icon from "@/components/Icon";
import HeroVideo from "@/components/HeroVideo";

export default async function Home({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDict(lang);
  const [featured, newest, covers, shops, booked, media] = await Promise.all([
    featuredListings(10),
    newestListings(8),
    categoryCovers(),
    approvedShops(),
    spotlightListing(),
    // Key and time only: the bytes are served by /media/[key].
    q<{ key: string; v: string }>(
      "select key, (extract(epoch from updated_at) * 1000)::bigint::text as v from site_media where key in ('hero-video', 'hero-poster')",
    ),
  ]);
  const video = media.find((m) => m.key === "hero-video");
  const poster = media.find((m) => m.key === "hero-poster");
  // The banner shows a piece of furniture; the arch beside it shows something else.
  const hero = featured.find((i) => i.category === "furniture" && i.image_id) ?? featured[0];
  // A seller's booked "piece of the week" takes the arch; otherwise we pick one.
  const piece =
    booked ?? featured.find((i) => i.id !== hero?.id && i.category !== hero?.category && i.image_id);
  const name = (i: { title_tr: string; title_en: string }) => pick(lang, i.title_tr, i.title_en).text;

  return (
    <>
      <div className="wrap mt-5">
        <p className="rounded-2xl bg-rose px-5 py-3 text-center text-[0.9375rem]">
          {t.home.strip}{" "}
          <Link href={`/${lang}/search?i=1`} className="font-medium underline underline-offset-4 hover:text-cobalt">
            {t.home.stripLink}
          </Link>
        </p>
      </div>

      {/* Banner: the line that sells the idea, with one piece framed in the arch beside it. */}
      <section className="wrap mt-5 grid gap-5 lg:grid-cols-[minmax(0,2.15fr)_minmax(0,1fr)]">
        <div className="grid overflow-hidden rounded-3xl bg-sand md:grid-cols-[1.1fr_1fr]">
          <div className="self-center p-8 md:p-12 lg:py-16">
            <h1 className="text-[clamp(2.5rem,4.7vw,4.4rem)] leading-[0.98] tracking-[-0.022em]">
              {t.home.coverLine}
            </h1>
            <p className="mt-5 max-w-md text-lg text-soft">{t.home.coverSub}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#new" className="btn">{t.home.shopNew}</a>
              <Link href={`/${lang}/shops`} className="btn btn-ghost">{t.nav.shops}</Link>
            </div>
          </div>
          {video ? (
            <div className="relative min-h-72 md:min-h-[27rem]">
              <HeroVideo
                src={`/media/hero-video?v=${video.v}`}
                poster={poster ? `/media/hero-poster?v=${poster.v}` : undefined}
                pauseLabel={t.home.pauseVideo}
                playLabel={t.home.playVideo}
              />
            </div>
          ) : (
            hero?.image_id && (
              <Link href={`/${lang}/l/${hero.id}`} className="group relative block min-h-72 md:min-h-[27rem]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/img/${hero.image_id}`}
                  alt={name(hero)}
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <span className="absolute right-4 bottom-4 left-4 flex items-baseline justify-between gap-4 rounded-2xl bg-paper/95 px-4 py-3 text-sm shadow-lift transition-transform duration-300 group-hover:-translate-y-1 motion-reduce:transition-none">
                  <span>{name(hero)}</span>
                  <span className="font-medium whitespace-nowrap">{formatGBP(hero.price_pence)}</span>
                </span>
              </Link>
            )
          )}
        </div>

        {piece?.image_id && (
          <Link
            href={`/${lang}/l/${piece.id}`}
            className="group flex flex-col items-center rounded-3xl bg-sky px-8 pt-8 pb-7 text-center"
          >
            <h2 className="text-[1.75rem]">{t.home.pickTitle}</h2>
            <div className="relative mt-6 w-[62%] max-w-52 lg:w-[70%]">
              <svg
                viewBox="0 0 100 140"
                preserveAspectRatio="none"
                aria-hidden="true"
                className="absolute -inset-x-2.5 -top-2.5 bottom-0 h-[calc(100%+0.625rem)] w-[calc(100%+1.25rem)]"
              >
                <path
                  d="M0.5 140V52C0.5 26 28 9 50 0.6c22 8.4 49.5 25.4 49.5 51.4v88"
                  fill="none"
                  stroke="var(--color-brass)"
                  strokeWidth="1"
                  vectorEffect="non-scaling-stroke"
                />
              </svg>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/img/${piece.image_id}`}
                alt=""
                className="arch arch-rise aspect-[5/7] w-full bg-paper object-cover"
              />
            </div>
            <p className="mt-5 leading-snug transition-colors duration-200 group-hover:text-cobalt">{name(piece)}</p>
            <p className="mt-1 text-sm text-soft">
              {piece.shop_name}
              {piece.sponsored && <span className="ml-2 rounded-full bg-paper px-2 py-0.5 text-xs">{t.promo.sponsored}</span>}
            </p>
            <p className="mt-2 text-lg font-medium">{formatGBP(piece.price_pence)}</p>
          </Link>
        )}
      </section>

      {featured.length > 0 && (
        <section className="wrap mt-20">
          <div className="flex items-end justify-between gap-6">
            <h2 className="text-3xl md:text-[2.5rem]">{t.home.featured}</h2>
            <Link href={`/${lang}/search`} className="text-[0.9375rem] font-medium underline underline-offset-4 hover:text-cobalt">
              {t.home.seeAll}
            </Link>
          </div>
          <div className="mt-7">
            <Carousel prevLabel={t.home.prev} nextLabel={t.home.next}>
              {featured.map((item) => (
                <div key={item.id} className="w-[64%] p-4 sm:w-1/3 lg:w-1/5">
                  <ListingCard item={item} lang={lang} t={t} />
                </div>
              ))}
            </Carousel>
          </div>
        </section>
      )}

      {/* Streets: the bazaar is organised by trade, one street each. */}
      <section className="wrap mt-20">
        <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-2">
          <h2 className="text-3xl md:text-[2.5rem]">{t.home.streets}</h2>
          <p className="max-w-md text-soft">{t.home.streetsSub}</p>
        </div>
        <ul className="mt-7 grid gap-5 sm:grid-cols-3">
          {CATEGORIES.map((c) => {
            const cover = covers.find((x) => x.category === c.slug);
            return (
              <li key={c.slug}>
                <Link href={`/${lang}/c/${c.slug}`} className="group relative block">
                  <div className="media aspect-[16/10] rounded-3xl sm:aspect-[4/5]">
                    {cover?.image_id && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={`/img/${cover.image_id}`} alt="" loading="lazy" className="h-full w-full object-cover" />
                    )}
                  </div>
                  <span className="absolute right-4 bottom-4 left-4 flex items-baseline justify-between gap-3 rounded-2xl bg-paper/95 px-5 py-3.5 shadow-lift">
                    <span className="font-display text-2xl leading-none">{c[lang]}</span>
                    <span className="text-sm text-soft">{itemCount(t, Number(cover?.items ?? 0))}</span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      <section id="new" className="wrap mt-20 scroll-mt-32">
        <h2 className="text-3xl md:text-[2.5rem]">{t.home.newIn}</h2>
        {newest.length === 0 ? (
          <p className="mt-6 text-soft">{t.home.empty}</p>
        ) : (
          <div className="mt-7 grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-4 md:gap-x-6">
            {newest.map((item) => (
              <ListingCard key={item.id} item={item} lang={lang} t={t} />
            ))}
          </div>
        )}
      </section>

      <section className="wrap mt-20">
        <div className="grid items-center gap-8 rounded-3xl bg-cobalt-deep px-8 py-12 text-paper md:grid-cols-[3fr_2fr] md:px-14 md:py-16">
          <div>
            <h2 className="text-4xl md:text-[3.25rem]">{t.home.sellTitle}</h2>
            <p className="mt-4 max-w-xl text-lg text-paper/80">{t.home.sellBody}</p>
          </div>
          <div className="md:justify-self-end">
            <Link href={`/${lang}/sell`} className="btn btn-light">{t.home.sellCta}</Link>
          </div>
        </div>
      </section>

      {shops.length > 0 && (
        <section className="wrap mt-20">
          <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-2">
            <div>
              <h2 className="text-3xl md:text-[2.5rem]">{t.home.shopsTitle}</h2>
              <p className="mt-2 text-soft">{t.home.shopsSub}</p>
            </div>
            <Link href={`/${lang}/shops`} className="text-[0.9375rem] font-medium underline underline-offset-4 hover:text-cobalt">
              {t.home.shopsAll}
            </Link>
          </div>
          <ul className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {shops.slice(0, 4).map((s) => (
              <li key={s.id}>
                <Link href={`/${lang}/s/${s.slug}`} className="group panel block overflow-hidden transition-shadow duration-300 hover:shadow-lift">
                  <div className="media aspect-[16/10] rounded-none">
                    {s.cover_id && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={`/img/${s.cover_id}?w=1600`} alt="" loading="lazy" className="h-full w-full object-cover" />
                    )}
                  </div>
                  <div className="flex items-end gap-4 px-5 pb-5">
                    <ShopMark name={s.name} logoId={s.logo_id} className="-mt-9 w-14 text-[0.6rem] ring-4 ring-paper" />
                    <div className="min-w-0 pt-3">
                      <p className="truncate font-medium transition-colors duration-200 group-hover:text-cobalt">{s.name}</p>
                      <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-[0.8125rem] whitespace-nowrap text-soft">
                        {s.avg ? (
                          <>
                            <Rating value={Number(s.avg)} size={12} />
                            <span>{reviewCount(t, Number(s.reviews))}</span>
                          </>
                        ) : (
                          <span>{itemCount(t, Number(s.items))}</span>
                        )}
                      </p>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="wrap mt-20">
        <ul className="panel grid divide-y divide-line md:grid-cols-3 md:divide-x md:divide-y-0">
          {(
            [
              ["shield", t.home.promise1Title, t.home.promise1Body],
              ["split", t.home.promise2Title, t.home.promise2Body],
              ["check", t.home.promise3Title, t.home.promise3Body],
            ] as const
          ).map(([icon, title, body]) => (
            <li key={title} className="flex gap-4 p-7">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-sky text-cobalt">
                <Icon name={icon} size={22} />
              </span>
              <div>
                <h3 className="text-2xl">{title}</h3>
                <p className="mt-2 text-[0.9375rem] text-soft">{body}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
