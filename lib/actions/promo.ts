"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getMyShop, getUser } from "../auth";
import { isPromoKind } from "../config";
import { bookPromotion, cancelPromotion, PromoError } from "../promotions";
import { isUuid } from "../queries";
import { langOf, origin, str } from "./util";

export async function bookPromo(fd: FormData) {
  const lang = langOf(fd);
  const here = `/${lang}/dashboard/promote`;
  const user = await getUser();
  if (!user) redirect(`/${lang}/login?next=${encodeURIComponent(here)}`);
  const shop = await getMyShop(user.id);
  if (!shop) redirect(`/${lang}/sell`);

  const kind = str(fd, "kind");
  const listingId = str(fd, "listing");
  if (!isPromoKind(kind) || !isUuid(listingId)) redirect(`${here}?error=fields`);

  let result;
  try {
    result = await bookPromotion({
      shop,
      listingId,
      kind,
      startsOn: str(fd, "starts_on"),
      weeks: parseInt(str(fd, "weeks") || "1", 10),
      buyerEmail: user.email,
      returnUrl: `${await origin()}${here}`,
    });
  } catch (e) {
    if (e instanceof PromoError) redirect(`${here}?error=${e.code}`);
    throw e;
  }
  revalidatePath(`/${lang}`);
  redirect(result.redirectUrl ?? `${here}?booked=1`);
}

export async function cancelPromo(fd: FormData) {
  const lang = langOf(fd);
  const id = str(fd, "id");
  const user = await getUser();
  if (!user) redirect(`/${lang}/login`);

  if (str(fd, "as") === "admin") {
    if (user.role !== "admin") redirect(`/${lang}`);
    if (isUuid(id)) await cancelPromotion(id, "admin");
    redirect(`/${lang}/admin/promotions`);
  }
  const shop = await getMyShop(user.id);
  if (!shop) redirect(`/${lang}/sell`);
  const done = isUuid(id) && (await cancelPromotion(id, { shopId: shop.id }));
  redirect(`/${lang}/dashboard/promote?${done ? "cancelled=1" : "error=cancel"}`);
}
