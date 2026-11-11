import "server-only";
import { headers } from "next/headers";
import { DEFAULT_LOCALE, isLocale, type Locale } from "../config";

export const str = (fd: FormData, key: string) => String(fd.get(key) ?? "").trim();

export const langOf = (fd: FormData): Locale => {
  const v = str(fd, "lang");
  return isLocale(v) ? v : DEFAULT_LOCALE;
};

// Only allow redirects back into this site.
export const safeNext = (next: string, fallback: string) =>
  next.startsWith("/") && !next.startsWith("//") && !next.includes("\\") ? next : fallback;

export async function origin() {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

// "Lale Çeyiz Evi" -> "lale-ceyiz-evi"
export function slugify(name: string) {
  const map: Record<string, string> = { ç: "c", ğ: "g", ı: "i", ö: "o", ş: "s", ü: "u", â: "a", î: "i", û: "u" };
  return name
    .toLocaleLowerCase("tr")
    .replace(/[çğıöşüâîû]/g, (ch) => map[ch] ?? ch)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}
