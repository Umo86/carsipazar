import tr, { type Dict } from "./tr";
import en from "./en";
import { PARCEL_SIZES, type Locale, type ParcelSize } from "../config";

const dicts: Record<Locale, Dict> = { tr, en };

export const getDict = (lang: Locale): Dict => dicts[lang];
export type { Dict };

// fmt("Order #{n}", { n: 12 }) -> "Order #12"
export const fmt = (s: string, vars: Record<string, string | number>) =>
  s.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ""));

// Seller text is stored in both languages; show the reader's language and
// fall back to the other one when it was left empty.
export function pick(lang: Locale, trText: string, enText: string) {
  const own = lang === "tr" ? trText : enText;
  const other = lang === "tr" ? enText : trText;
  return own.trim() ? { text: own, fallback: false } : { text: other, fallback: true };
}

export const formatDate = (d: Date, lang: Locale) =>
  new Intl.DateTimeFormat(lang === "tr" ? "tr-TR" : "en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);

// "1 review" / "3 reviews": English needs a singular form, Turkish does not.
export const reviewCount = (t: Dict, n: number) =>
  n === 1 ? t.shop.reviewOne : fmt(t.shop.reviews, { n });
export const itemCount = (t: Dict, n: number) =>
  n === 1 ? t.shop.itemOne : fmt(t.shop.itemsCount, { n });

// "up to 2 kg and 45 × 35 × 16 cm"
export const parcelLimits = (t: Dict, size: ParcelSize) => {
  const p = PARCEL_SIZES[size];
  return fmt(t.delivery.limits, { kg: p.kg, l: p.cm[0], w: p.cm[1], h: p.cm[2] });
};

// The status words for an order. A collection order reuses "dispatched" and "delivered"
// for "ready to collect" and "collected".
type StatusKey = keyof Dict["orders"]["status"];
export const orderStatus = (t: Dict, o: { status: StatusKey; fulfilment: string }) =>
  (o.fulfilment === "collection" &&
    (t.orders.statusCollection as Partial<Record<StatusKey, string>>)[o.status]) ||
  t.orders.status[o.status];
export const orderExplain = (t: Dict, o: { status: StatusKey; fulfilment: string }) =>
  (o.fulfilment === "collection" &&
    (t.orders.explainCollection as Partial<Record<StatusKey, string>>)[o.status]) ||
  t.orders.explain[o.status];
