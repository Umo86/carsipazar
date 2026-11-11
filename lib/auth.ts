import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createHash, randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { cache } from "react";
import { one, q } from "./db";
import type { Locale } from "./config";

const scryptAsync = promisify(scrypt) as (
  password: string,
  salt: Buffer,
  keylen: number,
) => Promise<Buffer>;

const COOKIE = "cp_session";
const SESSION_DAYS = 30;

export type User = {
  id: string;
  email: string;
  name: string;
  role: "buyer" | "seller" | "admin";
};

export async function hashPassword(password: string) {
  const salt = randomBytes(16);
  const hash = await scryptAsync(password, salt, 64);
  return `${salt.toString("hex")}:${hash.toString("hex")}`;
}

export async function verifyPassword(password: string, stored: string) {
  const [saltHex, hashHex] = stored.split(":");
  if (!saltHex || !hashHex) return false;
  const expected = Buffer.from(hashHex, "hex");
  const actual = await scryptAsync(password, Buffer.from(saltHex, "hex"), 64);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

const sha = (v: string) => createHash("sha256").update(v).digest("hex");

export async function createSession(userId: string) {
  const token = randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + SESSION_DAYS * 86400_000);
  await q("insert into sessions (token_hash, user_id, expires_at) values ($1, $2, $3)", [
    sha(token),
    userId,
    expires,
  ]);
  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires,
  });
}

export async function destroySession() {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (token) await q("delete from sessions where token_hash = $1", [sha(token)]);
  jar.delete(COOKIE);
}

// Cached per request, so layouts and pages can both ask without extra queries.
export const getUser = cache(async (): Promise<User | null> => {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  return one<User>(
    `select u.id, u.email, u.name, u.role
       from sessions s join users u on u.id = s.user_id
      where s.token_hash = $1 and s.expires_at > now()`,
    [sha(token)],
  );
});

export async function requireUser(lang: Locale, next: string): Promise<User> {
  const user = await getUser();
  if (!user) redirect(`/${lang}/login?next=${encodeURIComponent(next)}`);
  return user;
}

export async function requireAdmin(lang: Locale): Promise<User> {
  const user = await requireUser(lang, `/${lang}/admin`);
  if (user.role !== "admin") redirect(`/${lang}`);
  return user;
}

export type Shop = {
  id: string;
  owner_id: string;
  slug: string;
  name: string;
  seller_type: "business" | "sole_trader";
  legal_name: string;
  company_number: string | null;
  phone: string;
  address: string;
  city: string;
  postcode: string;
  instagram: string | null;
  bio_tr: string;
  bio_en: string;
  status: "pending" | "approved" | "suspended";
  founding: boolean;
  stripe_account_id: string | null;
  created_at: Date;
  vat_number: string | null;
  website: string | null;
  public_email: string | null;
  show_phone: boolean;
  delivery_tr: string;
  delivery_en: string;
  returns_tr: string;
  returns_en: string;
  logo_id: string | null;
  cover_id: string | null;
};

export const getMyShop = cache(async (userId: string) =>
  one<Shop>("select * from shops where owner_id = $1", [userId]),
);

// Sellers only: sends buyers to the "open a shop" page.
export async function requireShop(lang: Locale): Promise<{ user: User; shop: Shop }> {
  const user = await requireUser(lang, `/${lang}/dashboard`);
  const shop = await getMyShop(user.id);
  if (!shop) redirect(`/${lang}/sell`);
  return { user, shop };
}
