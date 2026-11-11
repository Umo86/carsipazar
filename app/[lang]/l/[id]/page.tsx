import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getUser } from "@/lib/auth";
import { categoryName, isLocale } from "@/lib/config";
import { fmt, getDict, pick, reviewCount } from "@/lib/i18n";
import { formatGBP, instalmentsAllowed } from "@/lib/money";
import { getListing, listingImageIds, shopRating } from "@/lib/queries";
import { getSettings } from "@/lib/settings";
import Rating from "@/components/Rating";
import ShopMark from "@/components/ShopMark";

export async function generateMetadata({ params }: PageProps<"/[lang]/l/[id]">): Promise<Metadata> {
  const { lang, id } = await params;
  const l = await getListing(id);
  if (!l || !isLocale(lang)) return {};
  return { title: pick(lang, l.title_tr, l.title_en).text };
}

export default async function ListingPage({ params }: PageProps<"/[lang]/l/[id]">) {
  const { lang, id } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDict(lang);
  const [l, user] = await Promise.all([getListing(id), getUser()]);
  if (!l || l.status === "removed") notFound();

  // Paused items and items from shops not yet approved are visible only to
  // their owner and the admin.
  const isOwner = user?.id === l.shop_owner;
  const isPublic = l.status === "active" && l.shop_status === "approved";
  if (!isPublic && !isOwner && user?.role !== "admin") notFound();

  const [images, rating, settings] = await Promise.all([
    listingImageIds(l.id),
    shopRating(l.shop_id),
    getSettings(),
  ]);
  const title = pick(lang, l.title_tr, l.title_en);
  const description = pick(lang, l.description_tr, l.description_en);
  const total = l.price_pence + l.postage_pence;
  const instalments = instalmentsAllowed(l, total, settings);
  const canBuy = isPublic && l.stock > 0 && !isOwner;

  return (
    <div className="wrap grid gap-10 pt-10 md:grid-cols-12">
      <div className="grid gap-4 md:col-span-7">
        {images.map((img, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={img.id}
            src={`/img/${img.id}`}
            alt={i === 0 ? title.text : ""}
            className="aspect-[4/5] w-full bg-mist object-cover"
            loading={i === 0 ? "eager" : "lazy"}
          />
        ))}
      </div>

      <div className="md:col-span-5 md:col-start-8">
        <div className="md:sticky md:top-8">
          <p className="text-sm text-soft">
            <Link href={`/${lang}/c/${l.category}`} className="hover:underline underline-offset-4">
              {categoryName(l.category, lang)}
            </Link>
          </p>
          <h1 className="mt-2 text-4xl md:text-5xl">{title.text}</h1>

          <p className="mt-6 text-3xl font-medium">{formatGBP(l.price_pence)}</p>
          {instalments && (
            <p className="mt-1 text-turq">
              {fmt(t.listing.payIn3, { amount: formatGBP(Math.ceil(total / 3)) })}
            </p>
          )}
          <p className="mt-1 text-sm text-soft">
            {l.postage_pence === 0
              ? t.listing.freePostage
              : fmt(t.listing.postage, { amount: formatGBP(l.postage_pence) })}
          </p>

          {isOwner && <p className="notice mt-6">{t.listing.ownListing}</p>}

          {canBuy ? (
            <form action={`/${lang}/checkout/${l.id}`} method="get" className="mt-6 flex flex-wrap items-end gap-3">
              <label className="field w-24">
                <span>{t.listing.quantity}</span>
                <select name="qty" className="input" defaultValue="1">
                  {Array.from({ length: Math.min(l.stock, 10) }, (_, i) => (
                    <option key={i + 1}>{i + 1}</option>
                  ))}
                </select>
              </label>
              <button className="btn min-w-48 flex-1">{t.listing.buy}</button>
            </form>
          ) : (
            !isOwner && <p className="mt-6 font-medium">{l.stock === 0 ? t.listing.soldOut : t.listing.notFound}</p>
          )}
          {canBuy && <p className="mt-2 text-sm text-soft">{fmt(t.listing.inStock, { n: l.stock })}</p>}

          <div className="mt-8 border-t border-line pt-5">
            <p className="font-medium">{t.listing.protectedTitle}</p>
            <p className="text-soft">{t.listing.protectedBody}</p>
          </div>

          {description.text && (
            <div className="mt-6 border-t border-line pt-5">
              <h2 className="font-sans text-base font-medium tracking-normal">{t.listing.description}</h2>
              <p className="mt-2 whitespace-pre-line text-soft">{description.text}</p>
              {description.fallback && <p className="hint mt-2">{t.listing.otherLangNote}</p>}
            </div>
          )}

          <div className="mt-6 grid grid-cols-[auto_1fr] gap-x-4 border-t border-line pt-5">
            <Link href={`/${lang}/s/${l.shop_slug}`} className="row-span-4" aria-hidden="true" tabIndex={-1}>
              <ShopMark name={l.shop_name} logoId={l.shop_logo} className="w-16 text-sm" />
            </Link>
            <p className="text-sm text-soft">{t.listing.soldBy}</p>
            <p className="mt-1 font-display text-2xl">
              <Link href={`/${lang}/s/${l.shop_slug}`} className="hover:text-cobalt">
                {l.shop_name}
              </Link>
            </p>
            <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-soft">
              <span>{t.shop[l.seller_type]}</span>
              {rating.avg !== null ? (
                <span className="flex items-center gap-2">
                  <Rating value={rating.avg} />
                  {reviewCount(t, rating.count)}
                </span>
              ) : (
                <span>{t.shop.noReviewsYet}</span>
              )}
            </p>
            <Link href={`/${lang}/s/${l.shop_slug}`} className="mt-3 inline-block underline underline-offset-4 hover:text-cobalt">
              {t.listing.visitShop}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
