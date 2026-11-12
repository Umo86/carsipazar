import type { Locale } from "./config";

// "12 Nov 2026, 14:05" in London time.
export const formatDateTime = (d: Date | string, lang: Locale) =>
  new Intl.DateTimeFormat(lang === "tr" ? "tr-TR" : "en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/London",
  }).format(new Date(d));

// "3 Nov"
export const formatShortDay = (isoDay: string, lang: Locale) =>
  new Intl.DateTimeFormat(lang === "tr" ? "tr-TR" : "en-GB", { day: "numeric", month: "short", timeZone: "UTC" }).format(
    new Date(`${isoDay}T12:00:00Z`),
  );

// Where a log row's target points, when there is somewhere useful to go.
export function targetHref(kind: string, id: string, lang: Locale): string | null {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return kind === "settings" ? `/${lang}/admin/settings` : kind === "site" ? `/${lang}/admin/site` : null;
  const a = `/${lang}/admin`;
  if (kind === "user") return `${a}/customers/${id}`;
  if (kind === "shop") return `${a}/sellers/${id}`;
  if (kind === "order") return `${a}/orders/${id}`;
  if (kind === "listing") return `/${lang}/l/${id}`;
  return null;
}
