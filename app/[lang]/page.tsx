import Link from "next/link";
import { notFound } from "next/navigation";
import { CATEGORIES, isLocale } from "@/lib/config";
import { getDict, pick } from "@/lib/i18n";
import { formatGBP } from "@/lib/money";
import { categoryCovers, featuredListings } from "@/lib/queries";
import ListingCard from "@/components/ListingCard";

export default async function Home({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDict(lang);
  const [items, covers] = await Promise.all([featuredListings(9), categoryCovers()]);
  const cover = items[0];
  const rest = items.slice(1);
  const coverOf = (slug: string) => covers.find((c) => c.category === slug)?.image_id;

  return (
    <>
      {/* Cover: the line that sells the idea, beside one item framed in the arch. */}
      <section className="wrap grid items-end gap-10 pt-10 md:grid-cols-12 md:pt-16">
        <div className="md:col-span-7 md:pb-10">
          <h1 className="text-[clamp(2.75rem,7.4vw,6.75rem)] leading-[0.95] tracking-[-0.025em]">
            {t.home.coverLine}
          </h1>
          <p className="mt-6 max-w-[34rem] text-lg text-soft">{t.home.coverSub}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#new" className="btn">{t.home.shopNew}</a>
            <Link href={`/${lang}/sell`} className="btn btn-ghost">{t.nav.sell}</Link>
          </div>
        </div>
        {cover?.image_id && (
          <figure className="mx-auto w-full max-w-xs md:col-span-4 md:col-start-9 md:max-w-none">
            <Link href={`/${lang}/l/${cover.id}`} className="relative block">
              <svg
                viewBox="0 0 100 140"
                preserveAspectRatio="none"
                aria-hidden="true"
                className="absolute -inset-x-3 -top-3 bottom-0 h-[calc(100%+0.75rem)] w-[calc(100%+1.5rem)]"
              >
                <path
                  d="M0.5 140V52C0.5 26 28 9 50 0.6c22 8.4 49.5 25.4 49.5 51.4v88"
                  fill="none"
                  stroke="var(--color-brass)"
                  strokeWidth="0.5"
                  vectorEffect="non-scaling-stroke"
                />
              </svg>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/img/${cover.image_id}`}
                alt={pick(lang, cover.title_tr, cover.title_en).text}
                className="arch arch-rise aspect-[5/7] w-full object-cover"
              />
            </Link>
            <figcaption className="mt-3 flex items-baseline justify-between gap-4 text-sm">
              <span>{pick(lang, cover.title_tr, cover.title_en).text}</span>
              <span className="font-medium">{formatGBP(cover.price_pence)}</span>
            </figcaption>
          </figure>
        )}
      </section>

      {/* Streets: the bazaar is organised by trade, one street each. */}
      <section className="wrap mt-24">
        <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-2">
          <h2 className="text-4xl md:text-5xl">{t.home.streets}</h2>
          <p className="max-w-md text-soft">{t.home.streetsSub}</p>
        </div>
        <ul className="mt-8 flex gap-5 overflow-x-auto pb-2 md:grid md:grid-cols-3 md:gap-10 md:overflow-visible">
          {CATEGORIES.map((c) => (
            <li key={c.slug} className="w-52 shrink-0 md:w-auto">
              <Link href={`/${lang}/c/${c.slug}`} className="group block text-center">
                <div className="arch aspect-[5/7] bg-mist">
                  {coverOf(c.slug) && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={`/img/${coverOf(c.slug)}`}
                      alt=""
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  )}
                </div>
                <span className="mt-4 block font-display text-2xl leading-tight group-hover:text-cobalt md:text-3xl">
                  {c[lang]}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section id="new" className="wrap mt-24 scroll-mt-6">
        <h2 className="text-4xl md:text-5xl">{t.home.newIn}</h2>
        {rest.length === 0 && !cover ? (
          <p className="mt-6 text-soft">{t.home.empty}</p>
        ) : (
          <div className="mt-8 grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-4 md:gap-x-6">
            {(rest.length ? rest : items).map((item) => (
              <ListingCard key={item.id} item={item} lang={lang} t={t} />
            ))}
          </div>
        )}
      </section>

      <section className="wrap mt-24 grid gap-10 md:grid-cols-3 md:gap-12">
        {(
          [
            [t.home.promise1Title, t.home.promise1Body],
            [t.home.promise2Title, t.home.promise2Body],
            [t.home.promise3Title, t.home.promise3Body],
          ] as const
        ).map(([title, body]) => (
          <div key={title} className="border-t border-ink pt-5">
            <h3 className="text-3xl">{title}</h3>
            <p className="mt-3 text-soft">{body}</p>
          </div>
        ))}
      </section>

      <section className="mt-24 -mb-24 bg-cobalt-deep text-paper">
        <div className="wrap grid items-center gap-8 py-16 md:grid-cols-[3fr_2fr] md:py-20">
          <div>
            <h2 className="text-4xl md:text-6xl">{t.home.sellTitle}</h2>
            <p className="mt-5 max-w-xl text-lg text-paper/80">{t.home.sellBody}</p>
          </div>
          <div className="md:justify-self-end">
            <Link href={`/${lang}/sell`} className="btn btn-light">{t.home.sellCta}</Link>
          </div>
        </div>
      </section>
    </>
  );
}
