"use server";

import { redirect } from "next/navigation";
import { DEFAULT_SETTINGS, type Settings } from "../config";
import { q, tx } from "../db";
import { isUuidStrict, logAdmin } from "../admin-queries";
import { markDelivered, refundOrder, releaseOrder } from "../orders";
import { getSettings, saveSettingsBatch } from "../settings";
import { SITE_DETAIL_KEYS, SITE_DETAIL_MAX, saveSiteDetails, type SiteDetailKey } from "../site-details";
import { adminOnly, backTo, langOf, str } from "./util";

export async function setShopStatus(fd: FormData) {
  const lang = langOf(fd);
  const me = await adminOnly(lang);
  const id = str(fd, "id");
  const to = str(fd, "to");
  const list = backTo(fd, lang, `/${lang}/admin/sellers`);
  if (isUuidStrict(id) && ["approved", "suspended", "pending"].includes(to)) {
    const owner = await q<{ blocked_at: Date | null }>(
      "select u.blocked_at from shops s join users u on u.id = s.owner_id where s.id = $1",
      [id],
    );
    // A blocked person's shop stays suspended until they are unblocked.
    if (owner[0]?.blocked_at && to === "approved") redirect(`${list}${list.includes("?") ? "&" : "?"}error=blocked`);
    const rows = await q("update shops set status = $2 where id = $1 and status <> $2 returning id", [id, to]);
    if (rows.length) await logAdmin(me.id, `shop.${to}`, "shop", id);
  }
  redirect(list);
}

export async function setFounding(fd: FormData) {
  const lang = langOf(fd);
  const me = await adminOnly(lang);
  const id = str(fd, "id");
  const on = str(fd, "to") === "1";
  if (isUuidStrict(id)) {
    const rows = await q("update shops set founding = $2 where id = $1 and founding <> $2 returning id", [id, on]);
    if (rows.length) await logAdmin(me.id, on ? "shop.founding_on" : "shop.founding_off", "shop", id);
  }
  redirect(backTo(fd, lang, `/${lang}/admin/sellers`));
}

export async function moderateListing(fd: FormData) {
  const lang = langOf(fd);
  const me = await adminOnly(lang);
  const id = str(fd, "id");
  const act = str(fd, "act");
  if (isUuidStrict(id)) {
    const sql: Record<string, string> = {
      feature: "update listings set featured = true where id = $1 and not featured returning id",
      unfeature: "update listings set featured = false where id = $1 and featured returning id",
      remove: "update listings set status = 'removed' where id = $1 and status <> 'removed' returning id",
      restore: "update listings set status = 'paused' where id = $1 and status = 'removed' returning id",
    };
    if (sql[act]) {
      const rows = await q(sql[act], [id]);
      if (rows.length) await logAdmin(me.id, `listing.${act}`, "listing", id);
    }
  }
  redirect(backTo(fd, lang, `/${lang}/admin/listings`));
}

// The money actions reuse the order functions unchanged; this only adds the log line.
export async function adminOrder(fd: FormData) {
  const lang = langOf(fd);
  const me = await adminOnly(lang);
  const id = str(fd, "id");
  const act = str(fd, "act");
  if (isUuidStrict(id)) {
    let done: unknown = null;
    if (act === "deliver") done = await markDelivered(id);
    if (act === "release") done = await releaseOrder(id);
    if (act === "refund") done = await refundOrder(id);
    if (done) await logAdmin(me.id, `order.${act}`, "order", id);
  }
  redirect(backTo(fd, lang, `/${lang}/admin/orders`));
}

export async function setReviewStatus(fd: FormData) {
  const lang = langOf(fd);
  const me = await adminOnly(lang);
  const id = str(fd, "id");
  const to = str(fd, "to");
  if (isUuidStrict(id) && ["published", "hidden"].includes(to)) {
    const rows = await q("update reviews set status = $2 where id = $1 and status <> $2 returning id", [id, to]);
    if (rows.length) await logAdmin(me.id, `review.${to === "hidden" ? "hide" : "show"}`, "review", id);
  }
  redirect(backTo(fd, lang, `/${lang}/admin/reviews`));
}

// Percentages are typed as "9" or "12.5"; pounds as "30". Stored as integers.
// Every key ending in _price (promotion and delivery prices, including
// delivery_max_item_price) is typed in pounds and stored in pence.
export async function saveSettings(fd: FormData) {
  const lang = langOf(fd);
  const me = await adminOnly(lang);
  const entries: [keyof Settings, number][] = [];
  for (const key of Object.keys(DEFAULT_SETTINGS) as (keyof Settings)[]) {
    const raw = parseFloat(str(fd, key).replace(",", "."));
    if (!Number.isFinite(raw) || raw < 0) continue;
    let value = Math.round(raw);
    if (key.endsWith("_bps")) value = Math.round(raw * 100);
    if (key === "instalments_min" || key === "instalments_max" || key.endsWith("_price")) {
      value = Math.round(raw * 100);
    }
    if (key.endsWith("_bps") && value > 5000) continue; // never above 50%
    entries.push([key, value]);
  }
  const before = await getSettings();
  const changed = entries.filter(([k, v]) => before[k] !== v).map(([k, v]) => `${k}: ${before[k]} to ${v}`);
  await saveSettingsBatch(entries);
  if (changed.length) await logAdmin(me.id, "settings.save", "settings", "", changed.join("; "));
  redirect(`/${lang}/admin/settings?saved=1`);
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const EMAIL_KEYS: SiteDetailKey[] = ["email", "complaints_email"];

export type SiteFormState = {
  values: Record<string, string>;
  errors: Partial<Record<SiteDetailKey, "email" | "long">>;
  saved: boolean;
} | null;

// Returns the typed values with any problems, so the form keeps everything the admin entered and
// shows each message by its own field. Nothing is saved unless every field is valid.
export async function saveSiteDetailsForm(_prev: SiteFormState, fd: FormData): Promise<SiteFormState> {
  const lang = langOf(fd);
  const me = await adminOnly(lang);
  const entries: [SiteDetailKey, string][] = [];
  const values: Record<string, string> = {};
  const errors: Partial<Record<SiteDetailKey, "email" | "long">> = {};
  for (const key of SITE_DETAIL_KEYS) {
    const v = str(fd, key);
    values[key] = v;
    if (v.length > SITE_DETAIL_MAX) errors[key] = "long";
    else if (v && EMAIL_KEYS.includes(key) && !EMAIL.test(v)) errors[key] = "email";
    entries.push([key, v]);
  }
  if (Object.keys(errors).length) return { values, errors, saved: false };

  const rows = await q<{ key: string; value: string }>("select key, value from site_details");
  const before = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  const short = (v: string) => (v === "" ? "empty" : v.length > 60 ? `${v.slice(0, 57)}...` : v);
  const changed = entries
    .filter(([k, v]) => (before[k] ?? "") !== v)
    .map(([k, v]) => `${k}: ${short(before[k] ?? "")} to ${short(v)}`);
  await saveSiteDetails(entries);
  if (changed.length) await logAdmin(me.id, "site.save", "site", "", changed.join("; "));
  return { values, errors: {}, saved: true };
}

// --- users ---------------------------------------------------------------------------------

type Outcome = "ok" | "ok_shop" | "missing" | "already" | "lastadmin" | "blockedtarget" | "notadmin" | "isadmin";

export async function blockUser(fd: FormData) {
  const lang = langOf(fd);
  const me = await adminOnly(lang);
  const id = str(fd, "id");
  if (!isUuidStrict(id)) redirect(`/${lang}/admin/customers`);
  const here = `/${lang}/admin/customers/${id}`;
  const reason = str(fd, "reason").slice(0, 300);
  if (id === me.id) redirect(`${here}?error=self`);
  if (!reason) redirect(`${here}?error=reason`);

  const out = await tx<Outcome>(async (c) => {
    const u = (
      await c.query<{ role: string; blocked_at: Date | null }>(
        "select role, blocked_at from users where id = $1 for update",
        [id],
      )
    ).rows[0];
    if (!u) return "missing";
    if (u.blocked_at) return "already";
    // An admin cannot be blocked: unblocking would quietly give the admin role back.
    // Remove the admin rights first, then block.
    if (u.role === "admin") return "isadmin";
    await c.query("update users set blocked_at = now(), blocked_reason = $2 where id = $1", [id, reason]);
    await c.query("delete from sessions where user_id = $1", [id]);
    await c.query("delete from password_resets where user_id = $1", [id]);
    // Their shop is suspended the same way the Sellers page does it; items then stop being buyable.
    const shop = await c.query(
      "update shops set status = 'suspended' where owner_id = $1 and status <> 'suspended' returning id",
      [id],
    );
    await logAdmin(me.id, "user.block", "user", id, shop.rowCount ? `${reason} (shop suspended)` : reason, c);
    return shop.rowCount ? "ok_shop" : "ok";
  });
  redirect(`${here}?${out === "ok" || out === "ok_shop" ? `done=${out === "ok_shop" ? "blocked_shop" : "blocked"}` : `error=${out}`}`);
}

export async function unblockUser(fd: FormData) {
  const lang = langOf(fd);
  const me = await adminOnly(lang);
  const id = str(fd, "id");
  if (!isUuidStrict(id)) redirect(`/${lang}/admin/customers`);
  const rows = await q(
    "update users set blocked_at = null, blocked_reason = null where id = $1 and blocked_at is not null returning id",
    [id],
  );
  if (rows.length) await logAdmin(me.id, "user.unblock", "user", id);
  redirect(`/${lang}/admin/customers/${id}?${rows.length ? "done=unblocked" : "error=missing"}`);
}

export async function setUserAdmin(fd: FormData) {
  const lang = langOf(fd);
  const me = await adminOnly(lang);
  const id = str(fd, "id");
  if (!isUuidStrict(id)) redirect(`/${lang}/admin/customers`);
  const here = `/${lang}/admin/customers/${id}`;
  const make = str(fd, "to") === "1";
  if (!make && id === me.id) redirect(`${here}?error=self`);

  const out = await tx<Outcome | "made" | "removed">(async (c) => {
    const admins = await c.query<{ id: string }>(
      "select id from users where role = 'admin' and blocked_at is null for update",
    );
    const u = (
      await c.query<{ role: string; blocked_at: Date | null }>(
        "select role, blocked_at from users where id = $1 for update",
        [id],
      )
    ).rows[0];
    if (!u) return "missing";
    if (make) {
      if (u.blocked_at) return "blockedtarget";
      if (u.role === "admin") return "already";
      await c.query("update users set role = 'admin' where id = $1", [id]);
      await logAdmin(me.id, "user.make_admin", "user", id, "", c);
      return "made";
    }
    if (u.role !== "admin") return "notadmin";
    if (!admins.rows.some((a) => a.id !== id)) return "lastadmin";
    // Back to the role they would have had: seller if they own a shop, otherwise buyer.
    await c.query(
      "update users set role = case when exists (select 1 from shops where owner_id = $1) then 'seller' else 'buyer' end where id = $1",
      [id],
    );
    await logAdmin(me.id, "user.remove_admin", "user", id, "", c);
    return "removed";
  });
  redirect(`${here}?${out === "made" || out === "removed" ? `done=${out}` : `error=${out}`}`);
}
