import "server-only";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getUser } from "../auth";
import { DEFAULT_LOCALE, isLocale, type Locale } from "../config";
import { cleanText } from "../clean";

// Form text: control characters (including NUL) stripped, line breaks normalised, ends trimmed.
export const str = (fd: FormData, key: string) => cleanText(String(fd.get(key) ?? "")).trim();

export const langOf = (fd: FormData): Locale => {
  const v = str(fd, "lang");
  return isLocale(v) ? v : DEFAULT_LOCALE;
};

// Only allow redirects back into this site. Rejects control characters, whitespace and
// backslashes (browsers strip tabs and newlines from URLs, so "/\t/evil" would become
// "//evil"), then re-parses the value against a dummy origin and returns the parsed path.
export const safeNext = (next: string, fallback: string) => {
  if (typeof next !== "string" || !next.startsWith("/")) return fallback;
  if (/[\u0000-\u0020\u007f-\u009f\\\s]/.test(next)) return fallback;
  try {
    const u = new URL(next, "http://internal.invalid");
    if (u.origin !== "http://internal.invalid") return fallback;
    if (!u.pathname.startsWith("/") || u.pathname.startsWith("//")) return fallback;
    return u.pathname + u.search + u.hash;
  } catch {
    return fallback;
  }
};

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

// Every admin server action starts here: the signed-in, unblocked admin, or a redirect home.
export async function adminOnly(lang: Locale) {
  const user = await getUser();
  if (!user || user.role !== "admin") redirect(`/${lang}`);
  return user;
}

// Where a form sends the admin afterwards: its own "back" field when that is inside the
// admin area, otherwise the fallback.
export function backTo(fd: FormData, lang: Locale, fallback: string) {
  const n = safeNext(str(fd, "back"), fallback);
  return n === `/${lang}/admin` || n.startsWith(`/${lang}/admin/`) || n.startsWith(`/${lang}/admin?`) ? n : fallback;
}
