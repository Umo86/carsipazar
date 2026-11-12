"use server";

import { getMyShop, getUser } from "../auth";
import { navCounts } from "../admin-queries";
import { sellerOrdersToAct } from "../panel-queries";

// Fresh sidebar badge numbers. A layout is kept while you move between sibling pages, so the panel
// shell asks for these again after every navigation. Anyone who is not allowed gets nothing.
export async function sellerNavCounts(): Promise<Record<string, number>> {
  const user = await getUser();
  const shop = user ? await getMyShop(user.id) : null;
  return shop ? { orders: await sellerOrdersToAct(shop.id) } : {};
}

export async function adminNavCounts(): Promise<Record<string, number>> {
  const user = await getUser();
  if (!user || user.role !== "admin") return {};
  const c = await navCounts();
  return { sellers: c.shops, reports: c.reports };
}
