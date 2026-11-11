// The one place for the name, languages and launch categories.

export const SITE_NAME = "CarsiPazar";

export const LOCALES = ["tr", "en"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "tr";

export const isLocale = (v: string): v is Locale =>
  (LOCALES as readonly string[]).includes(v);

// Launch categories: higher-priced goods, where paying in instalments matters.
export const CATEGORIES = [
  { slug: "wedding", tr: "Düğün ve Çeyiz", en: "Wedding and Çeyiz" },
  { slug: "rugs", tr: "Halı ve Kilim", en: "Rugs and Kilims" },
  { slug: "furniture", tr: "Mobilya", en: "Furniture" },
  { slug: "textiles", tr: "Ev Tekstili", en: "Home Textiles" },
  { slug: "occasion", tr: "Abiye ve Özel Gün", en: "Occasion Wear" },
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
} as const;

export type Settings = { -readonly [K in keyof typeof DEFAULT_SETTINGS]: number };

// What the payment provider charges us, used to show the platform's net.
export const PAYMENT_COST = {
  card: { bps: 150, fixed: 20 },
  klarna: { bps: 499, fixed: 35 },
} as const;

export const MAX_IMAGES = 5;
