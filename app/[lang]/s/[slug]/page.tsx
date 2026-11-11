import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getUser, type Shop } from "@/lib/auth";
import { CATEGORIES, isCategory, isLocale } from "@/lib/config";
import { one } from "@/lib/db";
import { fmt, formatDate, getDict, itemCount, pick, reviewCount } from "@/lib/i18n";
import { listingsByShop, shopRating, shopReviews } from "@/lib/queries";
import { origin } from "@/lib/actions/util";
import ListingCard from "@/components/ListingCard";
import Rating from "@/components/Rating";
import ShopMark from "@/components/ShopMark";

const getShop = (slug: string) => one<Shop>("select * from shops where slug = $1", [slug]);

export async function generateMetadata({ params }: PageProps<"/[lang]/s/[slug]">): Promise<Metadata> {
  const { lang, slug } = await params;
  const shop = await getShop(slug);
  if (!shop || !isLocale(lang)) return {};
  return { title: shop.name, description: pick(lang, shop.bio_tr, shop.bio_en).text };
}

// Every company gets this page: who they are, how to reach them, how they
// deliver and take returns, what they sell and what buyers said. It is also
// the link the seller puts in their Instagram profile.
export default async function ShopPage({ params, searchParams }: PageProps<"/[lang]/s/[slug]">) {
  const { lang, slug } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDict(lang);
  const [shop, user] = await Promise.all([getShop(slug), getUser()]);
  if (!shop) notFound();
  const isOwner = user?.id === shop.owner_id;
  if (shop.status !== "approved" && !isOwner && user?.role !== "admin") notFound();

  const [allItems, rating, reviews, base] = await Promise.all([
    listingsByShop(shop.id),
    shopRating(shop.id),
    shopReviews(shop.id),
    origin(),
  ]);
  const sp = await searchParams;
  const filter = typeof sp.c === "string" && isCategory(sp.c) ? sp.c : null;
  const shopCategories = CATEGORIES.filter((c) => allItems.some((i) => i.category === c.slug));
  const items = filter ? allItems.filter((i) => i.category === filter) : allItems;

  const bio = pick(lang, shop.bio_tr, shop.bio_en).text;
  const delivery = pick(lang, shop.delivery_tr, shop.delivery_en).text;
  const returns = pick(lang, shop.returns_tr, shop.returns_en).text;
  const self = `/${lang}/s/${shop.slug}`;
  const shareUrl = `${base}/s/${shop.slug}`;
  const whatsapp = `https://wa.me/?text=${encodeURIComponent(
    `${fmt(t.shop.shareText, { name: shop.name })} ${shareUrl}`,
  )}`;

  // Company details, in the order a buyer checks them. Empty rows are left out.
  const details: { label: string; value: React.ReactNode }[] = [
    { label: t.shop.legalName, value: shop.legal_name },
    { label: t.shop.companyNumber, value: shop.company_number },
    { label: t.shop.vatNumber, value: shop.vat_number },
    { label: t.shop.address, value: `${shop.address}, ${shop.city} ${shop.postcode}` },
    {
      label: t.shop.phone,
      value: shop.show_phone ? (
        <a href={`tel:${shop.phone.replace(/\s/g, "")}`} className="underline underline-offset-4">{shop.phone}</a>
      ) : null,
    },
    {
      label: t.shop.email,
      value: shop.public_email ? (
        <a href={`mailto:${shop.public_email}`} className="underline underline-offset-4 break-all">{shop.public_email}</a>
      ) : null,
    },
    {
      label: t.shop.website,
      value: shop.website ? (
        <a href={shop.website} target="_blank" rel="noopener noreferrer nofollow" className="underline underline-offset-4 break-all">
          {shop.website.replace(/^https?:\/\//, "").replace(/\/$/, "")}
        </a>
      ) : null,
    },
    {
      label: "Instagram",
      value: shop.instagram ? (
        <a
          href={`https://instagram.com/${encodeURIComponent(shop.instagram)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-4"
        >
          @{shop.instagram}
        </a>
      ) : null,
    },
  ].filter((d) => d.value);

  const pill = (active: boolean) => `btn btn-sm ${active ? "" : "btn-ghost"}`;

  return (
    <>
      {shop.cover_id && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={`/img/${shop.cover_id}`} alt="" className="h-44 w-full bg-mist object-cover md:h-72" />
      )}
      <div className="wrap pt-10">
        {shop.status !== "approved" && <p className="notice mb-8">{t.shop.pendingNotice}</p>}

        <header className="flex flex-wrap items-end gap-x-8 gap-y-6">
          <ShopMark
            name={shop.name}
            logoId={shop.logo_id}
            className="w-28 text-2xl md:w-36"
          />
          <div className="min-w-0 flex-1 basis-80">
            <h1 className="text-5xl md:text-7xl">{shop.name}</h1>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              {shop.status === "approved" && <span className="tag">{t.shop.verified}</span>}
              <span className="tag">{t.shop[shop.seller_type]}</span>
              {shop.founding && <span className="tag">{t.shop.founding}</span>}
            </div>
            <p className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-soft">
              {rating.avg !== null ? (
                <>
                  <Rating value={rating.avg} size={16} />
                  <a href="#reviews" className="hover:underline underline-offset-4">
                    {rating.avg.toFixed(1)} ({reviewCount(t, rating.count)})
                  </a>
                </>
              ) : (
                <span>{t.shop.noReviewsYet}</span>
              )}
              <span>{fmt(t.shop.since, { city: shop.city, year: new Date(shop.created_at).getFullYear() })}</span>
            </p>
          </div>
          <a href={whatsapp} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm">
            {t.shop.share}
          </a>
        </header>

        <div className="mt-10 grid gap-10 border-t border-line pt-10 md:grid-cols-[3fr_2fr] md:gap-16">
          <div className="grid h-fit gap-8">
            {bio && (
              <section>
                <h2 className="text-3xl">{t.shop.about}</h2>
                <p className="mt-3 max-w-[38rem] whitespace-pre-line text-lg">{bio}</p>
              </section>
            )}
            {delivery && (
              <section>
                <h2 className="text-3xl">{t.shop.delivery}</h2>
                <p className="mt-3 max-w-[38rem] whitespace-pre-line text-soft">{delivery}</p>
              </section>
            )}
            {returns && (
              <section>
                <h2 className="text-3xl">{t.shop.returns}</h2>
                <p className="mt-3 max-w-[38rem] whitespace-pre-line text-soft">{returns}</p>
              </section>
            )}
          </div>

          <aside className="h-fit bg-mist p-6">
            <h2 className="text-3xl">{t.shop.details}</h2>
            <dl className="mt-4">
              {details.map((d) => (
                <div key={d.label} className="grid grid-cols-[8.5rem_1fr] gap-3 border-t border-line py-3 first:border-t-0">
                  <dt className="text-sm text-soft">{d.label}</dt>
                  <dd>{d.value}</dd>
                </div>
              ))}
            </dl>
          </aside>
        </div>

        <section className="mt-16">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 className="text-4xl">
              {t.shop.products}{" "}
              <span className="font-sans text-base text-soft">{itemCount(t, allItems.length)}</span>
            </h2>
            {shopCategories.length > 1 && (
              <div className="flex flex-wrap gap-2">
                <Link href={self} className={pill(!filter)} scroll={false}>{t.shop.allItems}</Link>
                {shopCategories.map((c) => (
                  <Link key={c.slug} href={`${self}?c=${c.slug}`} className={pill(filter === c.slug)} scroll={false}>
                    {c[lang]}
                  </Link>
                ))}
              </div>
            )}
          </div>
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

        <section id="reviews" className="mt-20 max-w-3xl scroll-mt-6">
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
    </>
  );
}
