"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getUser } from "../auth";
import { one, q } from "../db";
import { pick } from "../i18n";
import { createOrder, markDelivered, OrderError } from "../orders";
import { getListing, isUuid } from "../queries";
import { langOf, origin, str } from "./util";

const ADDRESS = (a: { line1: string; line2: string; city: string; postcode: string; phone: string }) =>
  [a.line1, a.line2, a.city, a.postcode, a.phone].map((v) => v.slice(0, 120));

export async function placeOrder(fd: FormData) {
  const lang = langOf(fd);
  const listingId = str(fd, "listing");
  const quantity = Math.max(1, Math.min(20, parseInt(str(fd, "qty") || "1", 10) || 1));
  // "how" is the buyer's choice; createOrder checks it against the item before anything is stored.
  const fulfilment = str(fd, "how") === "collection" ? "collection" : "delivery";
  const here = `/${lang}/checkout/${listingId}?qty=${quantity}${fulfilment === "collection" ? "&how=collection" : ""}`;

  const user = await getUser();
  if (!user) redirect(`/${lang}/login?next=${encodeURIComponent(here)}`);

  const listing = await getListing(listingId);
  if (!listing) redirect(`/${lang}/unavailable`);
  // Your own item cannot be bought; an item that was removed or whose shop is paused is gone for good.
  if (listing.shop_owner === user.id) redirect(`/${lang}/l/${listingId}`);
  if (listing.status !== "active" || listing.shop_status !== "approved") redirect(`/${lang}/unavailable`);

  const shipping = {
    name: str(fd, "name"),
    line1: str(fd, "line1"),
    line2: str(fd, "line2"),
    city: str(fd, "city"),
    postcode: str(fd, "postcode").toUpperCase(),
    phone: str(fd, "phone"),
  };
  if (fulfilment === "collection") {
    // Only a name and a phone number are needed to collect.
    if (!shipping.name || !shipping.phone) redirect(`${here}&error=collectfields`);
  } else if (!shipping.name || !shipping.line1 || !shipping.city || !shipping.postcode || !shipping.phone) {
    redirect(`${here}&error=fields`);
  }
  const method = str(fd, "method") === "klarna" ? "klarna" : "card";

  let result;
  try {
    result = await createOrder({
      buyer: user,
      listingId,
      quantity,
      method,
      fulfilment,
      shipping,
      title: pick(lang, listing.title_tr, listing.title_en).text,
      returnBase: `${await origin()}/${lang}`,
    });
  } catch (e) {
    if (e instanceof OrderError) {
      if (e.code === "unavailable") redirect(`/${lang}/unavailable`);
      redirect(`${here}&error=${e.code === "stock" ? "stock" : e.code === "how" ? "how" : "unavailable"}`);
    }
    throw e;
  }
  // A collection order has no address, so there is nothing to save.
  if (fulfilment === "delivery" && fd.get("save_address") === "on") {
    await q(
      `update users set ship_line1=$2, ship_line2=$3, ship_city=$4, ship_postcode=$5, ship_phone=$6 where id = $1`,
      [user.id, ...ADDRESS(shipping)],
    );
  }
  redirect(result.redirectUrl ?? `/${lang}/orders/${result.orderId}`);
}

export async function confirmReceived(fd: FormData) {
  const lang = langOf(fd);
  const orderId = str(fd, "order");
  const user = await getUser();
  if (!user || !isUuid(orderId)) redirect(`/${lang}/login`);
  await markDelivered(orderId, user.id);
  revalidatePath(`/${lang}/orders/${orderId}`);
  redirect(`/${lang}/orders/${orderId}`);
}

// A buyer can review the seller once per order, after delivery.
export async function leaveReview(fd: FormData) {
  const lang = langOf(fd);
  const orderId = str(fd, "order");
  const user = await getUser();
  if (!user || !isUuid(orderId)) redirect(`/${lang}/login`);

  const rating = parseInt(str(fd, "rating"), 10);
  const comment = str(fd, "comment").slice(0, 1000);
  const order = await one<{ id: string; shop_id: string }>(
    "select id, shop_id from orders where id = $1 and buyer_id = $2 and status in ('delivered', 'released')",
    [orderId, user.id],
  );
  if (order && rating >= 1 && rating <= 5) {
    await q(
      `insert into reviews (order_id, shop_id, buyer_id, rating, comment)
       values ($1, $2, $3, $4, $5) on conflict (order_id) do nothing`,
      [order.id, order.shop_id, user.id, rating, comment],
    );
  }
  redirect(`/${lang}/orders/${orderId}`);
}
