import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { CATEGORIES, categoryName, isCategory, isLocale } from "@/lib/config";
import { fmt, getDict, itemCount } from "@/lib/i18n";
import { searchListings } from "@/lib/queries";
import { cleanText } from "@/lib/clean";
import ListingCard from "@/components/ListingCard";

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";

export async function generateMetadata({ params }: PageProps<"/[lang]/search">): Promise<Metadata> {
  const { lang } = await params;
  return { title: getDict(isLocale(lang) ? lang : "tr").search.submit };
}

export default async function SearchPage({ params, searchParams }: PageProps<"/[lang]/search">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDict(lang);
  const sp = await searchParams;
  const text = cleanText(first(sp.q)).trim().slice(0, 80);
  const c = first(sp.c);
  const category = isCategory(c) ? c : null;
  const items = await searchListings({ text, category });

  // Links keep whatever else is already chosen.
  const href = (next: { c?: string | null }) => {
    const p = new URLSearchParams();
    if (text) p.set("q", text);
    const cat = next.c === undefined ? category : next.c;
    if (cat) p.set("c", cat);
    const qs = p.toString();
    return `/${lang}/search${qs ? `?${qs}` : ""}`;
  };
  const pill = (active: boolean) => `btn btn-sm ${active ? "" : "btn-ghost"}`;
  const title = text
    ? fmt(t.search.resultsFor, { q: text })
    : category
      ? categoryName(category, lang)
      : t.listing.all;

  return (
    <div className="wrap pt-10">
      <h1 className="text-4xl break-words md:text-5xl">{title}</h1>
      <p className="mt-2 text-soft">{itemCount(t, items.length)}</p>
      <div className="mt-6 flex flex-wrap gap-2">
        <Link href={href({ c: null })} className={pill(!category)} aria-current={!category ? "true" : undefined}>
          {t.search.allCategories}
        </Link>
        {CATEGORIES.map((cat) => (
          <Link
            key={cat.slug}
            href={href({ c: cat.slug })}
            className={pill(category === cat.slug)}
            aria-current={category === cat.slug ? "true" : undefined}
          >
            {cat[lang]}
          </Link>
        ))}
      </div>
      {items.length === 0 ? (
        <div className="mt-10 rounded-3xl bg-mist px-8 py-14 text-center">
          <p className="mx-auto max-w-md text-soft">{t.search.none}</p>
          <Link href={`/${lang}/search`} className="btn mt-6">{t.listing.all}</Link>
        </div>
      ) : (
        <div className="mt-10 grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-4 md:gap-x-6">
          {items.map((item) => (
            <ListingCard key={item.id} item={item} lang={lang} t={t} />
          ))}
        </div>
      )}
    </div>
  );
}
