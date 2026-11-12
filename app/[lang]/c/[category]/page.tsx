import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { categoryName, isCategory, isLocale } from "@/lib/config";
import { getDict, itemCount } from "@/lib/i18n";
import { listingsByCategory } from "@/lib/queries";
import Link from "next/link";
import ListingCard from "@/components/ListingCard";

export async function generateMetadata({ params }: PageProps<"/[lang]/c/[category]">): Promise<Metadata> {
  const { lang, category } = await params;
  return { title: isLocale(lang) ? categoryName(category, lang) : category };
}

export default async function CategoryPage({ params }: PageProps<"/[lang]/c/[category]">) {
  const { lang, category } = await params;
  if (!isLocale(lang) || !isCategory(category)) notFound();
  const t = getDict(lang);
  const items = await listingsByCategory(category);

  return (
    <div className="wrap pt-5">
      <div className="rounded-3xl bg-sand px-8 py-10 md:px-12 md:py-14">
        <h1 className="text-5xl md:text-6xl">{categoryName(category, lang)}</h1>
        <p className="mt-3 text-soft">{itemCount(t, items.length)}</p>
        {category === "jewellery" && (
          <p className="mt-3 text-[0.9375rem] text-soft">
            <Link href={`/${lang}/legal/hallmarking`} className="underline underline-offset-4 hover:text-cobalt">
              {lang === "tr" ? "Altın, gümüş ve platinde ayar damgası hakkında" : "About hallmarks on gold, silver and platinum"}
            </Link>
          </p>
        )}
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
