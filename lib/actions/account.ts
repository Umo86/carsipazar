"use server";

import { redirect } from "next/navigation";
import { createSession, getUser, hashPassword, hashToken, newToken, verifyPassword } from "../auth";
import { one, q, tx } from "../db";
import { isUuid } from "../queries";
import { langOf, str } from "./util";

async function me(lang: string, next: string) {
  const user = await getUser();
  if (!user) redirect(`/${lang}/login?next=${encodeURIComponent(next)}`);
  return user;
}

export async function updateProfile(fd: FormData) {
  const lang = langOf(fd);
  const user = await me(lang, `/${lang}/account`);
  const name = str(fd, "name");
  if (name.length < 2 || name.length > 80) redirect(`/${lang}/account?error=name`);
  await q("update users set name = $2 where id = $1", [user.id, name]);
  redirect(`/${lang}/account?saved=profile`);
}

export async function saveAddress(fd: FormData) {
  const lang = langOf(fd);
  const user = await me(lang, `/${lang}/account`);
  const v = (k: string) => str(fd, k).slice(0, 120);
  await q(
    `update users set ship_line1=$2, ship_line2=$3, ship_city=$4, ship_postcode=$5, ship_phone=$6 where id = $1`,
    [user.id, v("line1"), v("line2"), v("city"), v("postcode").toUpperCase(), v("phone")],
  );
  redirect(`/${lang}/account?saved=address`);
}

// Changing the password logs every other device out.
export async function changePassword(fd: FormData) {
  const lang = langOf(fd);
  const user = await me(lang, `/${lang}/account`);
  const current = String(fd.get("current") ?? "");
  const next = String(fd.get("new") ?? "");
  const row = await one<{ password_hash: string }>("select password_hash from users where id = $1", [user.id]);
  if (!row || next.length < 8 || next.length > 200 || !(await verifyPassword(current, row.password_hash))) {
    redirect(`/${lang}/account?error=password`);
  }
  const hash = await hashPassword(next);
  await tx(async (c) => {
    await c.query("update users set password_hash = $2 where id = $1", [user.id, hash]);
    await c.query("delete from sessions where user_id = $1", [user.id]);
  });
  await createSession(user.id);
  redirect(`/${lang}/account?saved=password`);
}

export async function toggleFavourite(fd: FormData) {
  const lang = langOf(fd);
  const listingId = str(fd, "listing");
  if (!isUuid(listingId)) redirect(`/${lang}`);
  const user = await me(lang, `/${lang}/l/${listingId}`);
  const removed = await q("delete from favourites where user_id = $1 and listing_id = $2 returning 1", [
    user.id,
    listingId,
  ]);
  if (removed.length === 0) {
    await q(
      `insert into favourites (user_id, listing_id)
       select $1, id from listings where id = $2 and status <> 'removed' on conflict do nothing`,
      [user.id, listingId],
    );
  }
  redirect(str(fd, "back") === "favourites" ? `/${lang}/favourites` : `/${lang}/l/${listingId}`);
}

// Admin only. The link is shown once, to pass on to the customer by hand.
export async function createResetLink(fd: FormData) {
  const lang = langOf(fd);
  const admin = await getUser();
  if (!admin || admin.role !== "admin") redirect(`/${lang}`);
  const userId = str(fd, "user");
  if (!isUuid(userId) || !(await one("select 1 from users where id = $1 and role <> 'admin'", [userId]))) {
    redirect(`/${lang}/admin/customers`);
  }
  const token = newToken();
  await q("delete from password_resets where user_id = $1 or expires_at < now()", [userId]);
  await q(
    "insert into password_resets (token_hash, user_id, expires_at) values ($1, $2, now() + interval '24 hours')",
    [hashToken(token), userId],
  );
  redirect(`/${lang}/admin/customers?for=${userId}&link=${token}`);
}

export async function resetPassword(fd: FormData) {
  const lang = langOf(fd);
  const token = str(fd, "token");
  const password = String(fd.get("password") ?? "");
  if (password.length < 8 || password.length > 200) redirect(`/${lang}/reset/${token}?error=short`);
  const hash = await hashPassword(password);
  const ok = await tx(async (c) => {
    const { rows } = await c.query(
      `update password_resets set used_at = now()
        where token_hash = $1 and used_at is null and expires_at > now() returning user_id`,
      [hashToken(token)],
    );
    if (!rows[0]) return false;
    await c.query("update users set password_hash = $2 where id = $1", [rows[0].user_id, hash]);
    await c.query("delete from sessions where user_id = $1", [rows[0].user_id]);
    await c.query("delete from login_attempts where email = (select email from users where id = $1)", [rows[0].user_id]);
    return true;
  });
  redirect(ok ? `/${lang}/login?reset=1` : `/${lang}/reset/${token}?error=invalid`);
}
