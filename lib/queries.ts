import "server-only";
import { one, q } from "./db";

export type ListingCard = {
  id: string;
  title_tr: string;
  title_en: string;
  price_pence: number;
  postage_pence: number;
  instalments: boolean;
  stock: number;
  category: string;
  image_id: string | null;
  shop_name: string;
  shop_slug: string;
  status: string;
};

const CARD_SELECT = `
  select l.id, l.title_tr, l.title_en, l.price_pence, l.postage_pence, l.instalments, l.stock,
         l.category, l.status, s.name as shop_name, s.slug as shop_slug,
         (select i.id from listing_images i where i.listing_id = l.id order by i.position limit 1) as image_id
    from listings l join shops s on s.id = l.shop_id`;

// Public listings: live items from approved shops.
const PUBLIC = "l.status = 'active' and s.status = 'approved'";

export const featuredListings = (limit = 9) =>
  q<ListingCard>(
    `${CARD_SELECT} where ${PUBLIC} order by l.featured desc, l.created_at desc limit $1`,
    [limit],
  );

export const listingsByCategory = (category: string, instalmentsOnly: boolean) =>
  q<ListingCard>(
    `${CARD_SELECT} where ${PUBLIC} and l.category = $1 and ($2::boolean = false or l.instalments)
      order by l.created_at desc limit 120`,
    [category, instalmentsOnly],
  );

// A shop's own listings. The seller sees paused items too; the public does not.
export const listingsByShop = (shopId: string, includePaused = false) =>
  q<ListingCard>(
    `${CARD_SELECT} where l.shop_id = $1 and l.status <> 'removed'
       and ($2::boolean or l.status = 'active') order by l.created_at desc`,
    [shopId, includePaused],
  );

export type ListingFull = {
  id: string;
  shop_id: string;
  category: string;
  title_tr: string;
  title_en: string;
  description_tr: string;
  description_en: string;
  price_pence: number;
  postage_pence: number;
  stock: number;
  instalments: boolean;
  status: "active" | "paused" | "removed";
  featured: boolean;
  shop_name: string;
  shop_slug: string;
  shop_status: string;
  shop_owner: string;
  seller_type: "business" | "sole_trader";
  founding: boolean;
  shop_city: string;
};

export const getListing = (id: string) =>
  /^[0-9a-f-]{36}$/i.test(id)
    ? one<ListingFull>(
        `select l.*, s.name as shop_name, s.slug as shop_slug, s.status as shop_status,
                s.owner_id as shop_owner, s.seller_type, s.founding, s.city as shop_city
           from listings l join shops s on s.id = l.shop_id where l.id = $1`,
        [id],
      )
    : Promise.resolve(null);

export const listingImageIds = (listingId: string) =>
  q<{ id: string }>("select id from listing_images where listing_id = $1 order by position", [
    listingId,
  ]);

export type ShopRating = { avg: number | null; count: number };

export async function shopRating(shopId: string): Promise<ShopRating> {
  const r = await one<{ avg: string | null; count: string }>(
    "select avg(rating)::numeric(3,2) as avg, count(*) as count from reviews where shop_id = $1 and status = 'published'",
    [shopId],
  );
  return { avg: r?.avg ? Number(r.avg) : null, count: Number(r?.count ?? 0) };
}

export type ReviewRow = {
  id: string;
  rating: number;
  comment: string;
  reply: string | null;
  status: "published" | "hidden";
  created_at: Date;
  buyer_name: string;
  title: string;
  shop_name?: string;
};

export const shopReviews = (shopId: string, includeHidden = false) =>
  q<ReviewRow>(
    `select r.id, r.rating, r.comment, r.reply, r.status, r.created_at, u.name as buyer_name, o.title
       from reviews r join users u on u.id = r.buyer_id join orders o on o.id = r.order_id
      where r.shop_id = $1 and ($2::boolean or r.status = 'published')
      order by r.created_at desc limit 100`,
    [shopId, includeHidden],
  );

export const isUuid = (v: string) => /^[0-9a-f-]{36}$/i.test(v);

// One cover image per category, for the "streets" row on the home page.
export const categoryCovers = () =>
  q<{ category: string; image_id: string | null }>(
    `select distinct on (l.category) l.category,
            (select i.id from listing_images i where i.listing_id = l.id order by i.position limit 1) as image_id
       from listings l join shops s on s.id = l.shop_id
      where ${PUBLIC}
      order by l.category, l.featured desc, l.created_at desc`,
  );
