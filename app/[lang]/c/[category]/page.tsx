import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { categoryName, isCategory, isLocale } from "@/lib/config";
import { getDict, itemCount } from "@/lib/i18n";
import { listingsByCategory } from "@/lib/queries";
import ListingCard from "@/components/ListingCard";

export async function generateMetadata({ params }: PageProps<"/[lang]/c/[category]">): Promise<Metadata> {
  const { lang, category } = await params;
  return { title: isLocale(lang) ? categoryName(category, lang) : category };
}

export default async function CategoryPage({ params, searchParams }: PageProps<"/[lang]/c/[category]">) {
  const { lang, category } = await params;
  if (!isLocale(lang) || !isCategory(category)) notFound();
  const t = getDict(lang);
  const onlyInstalments = (await searchParams).instalments === "1";
  const items = await listingsByCategory(category, onlyInstalments);
  const base = `/${lang}/c/${category}`;
  const pill = (active: boolean) => `btn btn-sm ${active ? "" : "btn-ghost"}`;

  return (
    <div className="wrap pt-5">
      <div className="rounded-3xl bg-sand px-8 py-10 md:px-12 md:py-14">
        <h1 className="text-5xl md:text-6xl">{categoryName(category, lang)}</h1>
        <p className="mt-3 text-soft">{itemCount(t, items.length)}</p>
      </div>
      <div className="mt-6 flex flex-wrap gap-2">
        <Link href={base} className={pill(!onlyInstalments)} aria-current={!onlyInstalments ? "page" : undefined}>
          {t.listing.all}
        </Link>
        <Link
          href={`${base}?instalments=1`}
          className={pill(onlyInstalments)}
          aria-current={onlyInstalments ? "page" : undefined}
        >
          {t.listing.filterInstalments}
        </Link>
      </div>
      {items.length === 0 ? (
        <p className="mt-10 text-soft">{t.listing.noneInCategory}</p>
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
