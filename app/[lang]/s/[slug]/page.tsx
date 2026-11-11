import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getUser, type Shop } from "@/lib/auth";
import { isLocale } from "@/lib/config";
import { one } from "@/lib/db";
import { fmt, formatDate, getDict, pick } from "@/lib/i18n";
import { listingsByShop, shopRating, shopReviews } from "@/lib/queries";
import { origin } from "@/lib/actions/util";
import ListingCard from "@/components/ListingCard";
import Rating from "@/components/Rating";

const getShop = (slug: string) => one<Shop>("select * from shops where slug = $1", [slug]);

export async function generateMetadata({ params }: PageProps<"/[lang]/s/[slug]">): Promise<Metadata> {
  const { lang, slug } = await params;
  const shop = await getShop(slug);
  if (!shop || !isLocale(lang)) return {};
  return { title: shop.name, description: pick(lang, shop.bio_tr, shop.bio_en).text };
}

// The shop page doubles as the seller's link-in-bio: everything a buyer
// arriving from Instagram needs is on this one page.
export default async function ShopPage({ params }: PageProps<"/[lang]/s/[slug]">) {
  const { lang, slug } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDict(lang);
  const [shop, user] = await Promise.all([getShop(slug), getUser()]);
  if (!shop) notFound();
  const isOwner = user?.id === shop.owner_id;
  if (shop.status !== "approved" && !isOwner && user?.role !== "admin") notFound();

  const [items, rating, reviews, base] = await Promise.all([
    listingsByShop(shop.id),
    shopRating(shop.id),
    shopReviews(shop.id),
    origin(),
  ]);
  const bio = pick(lang, shop.bio_tr, shop.bio_en).text;
  const shareUrl = `${base}/s/${shop.slug}`;
  const whatsapp = `https://wa.me/?text=${encodeURIComponent(
    `${fmt(t.shop.shareText, { name: shop.name })} ${shareUrl}`,
  )}`;

  return (
    <div className="wrap pt-12">
      {shop.status !== "approved" && <p className="notice mb-8">{t.shop.pendingNotice}</p>}

      <header className="grid gap-8 border-b border-line pb-10 md:grid-cols-[3fr_2fr] md:items-end">
        <div>
          <h1 className="text-5xl md:text-7xl">{shop.name}</h1>
          <div className="mt-5 flex flex-wrap items-center gap-2">
            {shop.status === "approved" && <span className="tag">{t.shop.verified}</span>}
            <span className="tag">{t.shop[shop.seller_type]}</span>
            {shop.founding && <span className="tag">{t.shop.founding}</span>}
          </div>
          <p className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-soft">
            {rating.avg !== null ? (
              <>
                <Rating value={rating.avg} size={16} />
                <span>
                  {rating.avg.toFixed(1)} ({fmt(t.shop.reviews, { n: rating.count })})
                </span>
              </>
            ) : (
              <span>{t.shop.noReviewsYet}</span>
            )}
          </p>
        </div>
        <div>
          {bio && <p className="text-lg">{bio}</p>}
          <p className="mt-3 text-sm text-soft">
            {fmt(t.shop.since, { city: shop.city, year: new Date(shop.created_at).getFullYear() })}
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <a href={whatsapp} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm">
              {t.shop.share}
            </a>
            {shop.instagram && (
              <a
                href={`https://instagram.com/${encodeURIComponent(shop.instagram)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-ghost btn-sm"
              >
                Instagram
              </a>
            )}
          </div>
        </div>
      </header>

      <section className="mt-12">
        <h2 className="text-4xl">{t.shop.products}</h2>
        {items.length === 0 ? (
          <p className="mt-6 text-soft">{t.shop.noListings}</p>
        ) : (
          <div className="mt-8 grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-4 md:gap-x-6">
            {items.map((item) => (
              <ListingCard key={item.id} item={item} lang={lang} t={t} showShop={false} />
            ))}
          </div>
        )}
      </section>

      <section className="mt-20 max-w-3xl">
        <h2 className="text-4xl">{t.shop.reviewsTitle}</h2>
        {reviews.length === 0 ? (
          <p className="mt-6 text-soft">{t.shop.noReviewsYet}</p>
        ) : (
          <ul className="mt-6">
            {reviews.map((r) => (
              <li key={r.id} className="border-t border-line py-6">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <Rating value={r.rating} />
                  <span className="font-medium">{r.buyer_name}</span>
                  <span className="text-sm text-soft">{formatDate(new Date(r.created_at), lang)}</span>
                </div>
                <p className="mt-1 text-sm text-soft">{r.title}</p>
                {r.comment && <p className="mt-3">{r.comment}</p>}
                {r.reply && (
                  <div className="mt-4 border-l-2 border-brass pl-4">
                    <p className="text-sm font-medium">{t.shop.reply}</p>
                    <p className="text-soft">{r.reply}</p>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
