"use server";

import { redirect } from "next/navigation";
import { getUser } from "../auth";
import { DEFAULT_SETTINGS, type Settings } from "../config";
import { q } from "../db";
import { markDelivered, refundOrder, releaseOrder } from "../orders";
import { isUuid } from "../queries";
import { saveSettingsBatch } from "../settings";
import { langOf, str } from "./util";

async function admin(lang: string) {
  const user = await getUser();
  if (!user || user.role !== "admin") redirect(`/${lang}`);
  return user;
}

export async function setShopStatus(fd: FormData) {
  const lang = langOf(fd);
  await admin(lang);
  const id = str(fd, "id");
  const to = str(fd, "to");
  if (isUuid(id) && ["approved", "suspended", "pending"].includes(to)) {
    await q("update shops set status = $2 where id = $1", [id, to]);
  }
  redirect(`/${lang}/admin/sellers`);
}

export async function setFounding(fd: FormData) {
  const lang = langOf(fd);
  await admin(lang);
  const id = str(fd, "id");
  if (isUuid(id)) await q("update shops set founding = $2 where id = $1", [id, str(fd, "to") === "1"]);
  redirect(`/${lang}/admin/sellers`);
}

export async function moderateListing(fd: FormData) {
  const lang = langOf(fd);
  await admin(lang);
  const id = str(fd, "id");
  const act = str(fd, "act");
  if (isUuid(id)) {
    if (act === "feature") await q("update listings set featured = true where id = $1", [id]);
    if (act === "unfeature") await q("update listings set featured = false where id = $1", [id]);
    if (act === "remove") await q("update listings set status = 'removed' where id = $1", [id]);
    if (act === "restore") await q("update listings set status = 'paused' where id = $1", [id]);
  }
  redirect(`/${lang}/admin/listings`);
}

export async function adminOrder(fd: FormData) {
  const lang = langOf(fd);
  await admin(lang);
  const id = str(fd, "id");
  const act = str(fd, "act");
  if (isUuid(id)) {
    if (act === "deliver") await markDelivered(id);
    if (act === "release") await releaseOrder(id);
    if (act === "refund") await refundOrder(id);
  }
  redirect(`/${lang}/admin/orders`);
}

export async function setReviewStatus(fd: FormData) {
  const lang = langOf(fd);
  await admin(lang);
  const id = str(fd, "id");
  const to = str(fd, "to");
  if (isUuid(id) && ["published", "hidden"].includes(to)) {
    await q("update reviews set status = $2 where id = $1", [id, to]);
  }
  redirect(`/${lang}/admin/reviews`);
}

// Percentages are typed as "9" or "12.5"; pounds as "30". Stored as integers.
// Every key ending in _price (promotion and delivery prices, including
// delivery_max_item_price) is typed in pounds and stored in pence.
export async function saveSettings(fd: FormData) {
  const lang = langOf(fd);
  await admin(lang);
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
  await saveSettingsBatch(entries);
  redirect(`/${lang}/admin/settings?saved=1`);
}
