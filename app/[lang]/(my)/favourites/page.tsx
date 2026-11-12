import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { isLocale } from "@/lib/config";
import { getDict } from "@/lib/i18n";
import { favouriteListings } from "@/lib/queries";
import ListingCard from "@/components/ListingCard";

export const metadata = { robots: { index: false } };

export default async function FavouritesPage({ params }: PageProps<"/[lang]/favourites">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDict(lang);
  const user = await requireUser(lang, `/${lang}/favourites`);
  const items = await favouriteListings(user.id);

  return (
    <div>
      {items.length === 0 ? (
        <p className="max-w-md text-soft">{t.account.noFavs}</p>
      ) : (
        <div className="grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-3 md:gap-x-6">
          {items.map((item) => (
            <ListingCard key={item.id} item={item} lang={lang} t={t} />
          ))}
        </div>
      )}
    </div>
  );
}
