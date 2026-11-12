// The one place for the name, languages and launch categories.

export const SITE_NAME = "CarsiPazar";

export const LOCALES = ["tr", "en"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "tr";

export const isLocale = (v: string): v is Locale =>
  (LOCALES as readonly string[]).includes(v);

// What the marketplace sells. Add a line here to open another category.
export const CATEGORIES = [
  { slug: "furniture", tr: "Mobilya", en: "Furniture" },
  { slug: "clothing", tr: "Giyim", en: "Clothing" },
  { slug: "jewellery", tr: "Takı", en: "Jewellery" },
] as const;

export type CategorySlug = (typeof CATEGORIES)[number]["slug"];

export const isCategory = (v: string): v is CategorySlug =>
  CATEGORIES.some((c) => c.slug === v);

export const categoryName = (slug: string, lang: Locale) => {
  const c = CATEGORIES.find((x) => x.slug === slug);
  return c ? c[lang] : slug;
};

// Fees and limits. The admin can change these on the settings page;
// these are the values used until then. Money is always in pence.
export const DEFAULT_SETTINGS = {
  card_bps: 900, // 9% commission when the buyer pays by card
  klarna_bps: 1300, // 13% when the buyer pays in instalments
  founding_card_bps: 200, // founding sellers: 2% + 20p on card
  founding_card_fixed: 20,
  founding_klarna_bps: 500, // founding sellers: 5% + 35p on instalments
  founding_klarna_fixed: 35,
  instalments_min: 3000, // £30
  instalments_max: 200000, // £2,000
  release_days: 2, // days after delivery before the seller is paid
  promo_featured_price: 1500, // price per week, in pence
  promo_spotlight_price: 4000,
  promo_category_price: 1000,
  delivery_small_price: 395, // what the BUYER pays for CarsiPazar delivery, by parcel size
  delivery_medium_price: 695,
  delivery_large_price: 1495,
  delivery_max_item_price: 7500, // items priced above this cannot use CarsiPazar delivery; 0 = no limit
} as const;

export type Settings = { -readonly [K in keyof typeof DEFAULT_SETTINGS]: number };

// What the payment provider charges us, used to show the platform's net.
export const PAYMENT_COST = {
  card: { bps: 150, fixed: 20 },
  klarna: { bps: 499, fixed: 35 },
} as const;

// Who delivers an item. "seller": the seller posts it and sets the postage.
// "platform": CarsiPazar delivery, a fixed price by parcel size that the platform keeps.
export const DELIVERY_METHODS = ["seller", "platform"] as const;
export type DeliveryMethod = (typeof DELIVERY_METHODS)[number];

// Collection from the shop. "no": delivery only. "optional": the buyer chooses.
// "only": no delivery at all. An order's fulfilment is "delivery" or "collection".
export const COLLECTION_MODES = ["no", "optional", "only"] as const;
export type CollectionMode = (typeof COLLECTION_MODES)[number];
export const isCollectionMode = (v: string): v is CollectionMode =>
  (COLLECTION_MODES as readonly string[]).includes(v);
export type Fulfilment = "delivery" | "collection";

// Wrong handover codes allowed on one collection order before it is locked.
export const COLLECTION_MAX_ATTEMPTS = 5;

// Parcel sizes for CarsiPazar delivery. Anything bigger (sofas, tables) is delivered by the seller.
export const PARCEL_SIZES = {
  small: { kg: 2, cm: [45, 35, 16], priceKey: "delivery_small_price" },
  medium: { kg: 10, cm: [60, 45, 45], priceKey: "delivery_medium_price" },
  large: { kg: 25, cm: [120, 60, 60], priceKey: "delivery_large_price" },
} as const;
export type ParcelSize = keyof typeof PARCEL_SIZES;
export const PARCEL_SIZE_KEYS = Object.keys(PARCEL_SIZES) as ParcelSize[];
export const isParcelSize = (v: string | null | undefined): v is ParcelSize =>
  typeof v === "string" && (PARCEL_SIZE_KEYS as string[]).includes(v);

// What the buyer pays for a parcel of this size, in pence.
export const deliveryPrice = (size: ParcelSize, s: Settings) => s[PARCEL_SIZES[size].priceKey];

export const MAX_IMAGES = 5;

// Promotion a seller can book for one of their items. `slots` is how many
// items can run at the same time (per category for the category package).
export const PROMO_KINDS = {
  featured: { slots: 8, priceKey: "promo_featured_price" },
  spotlight: { slots: 1, priceKey: "promo_spotlight_price" },
  category_top: { slots: 4, priceKey: "promo_category_price" },
} as const;
export type PromoKind = keyof typeof PROMO_KINDS;
export const isPromoKind = (v: string): v is PromoKind => v in PROMO_KINDS;
export const PROMO_MAX_WEEKS = 4;
export const PROMO_BOOK_AHEAD_DAYS = 60;
