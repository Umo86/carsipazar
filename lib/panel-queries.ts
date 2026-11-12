import "server-only";
import { one, q } from "./db";
import { ORDER_NO_CODE, type Order } from "./orders";
import { COLLECTION_MAX_ATTEMPTS } from "./config";
import { isUuidStrict as isUuid } from "./admin-queries";

// SQL for the seller panel and the buyer "My account" panel. Every query is parameterised.
// Nothing here selects collection_code: seller queries never ask for it, and the buyer's
// document queries blank it with ORDER_NO_CODE (the confirmation and the cancellation form
// must not carry it). Only the buyer's own order page may show the code.

export const PANEL_PAGE_SIZE = 25;

const PAID = "('paid','dispatched','delivered','released')";
const HELD = "('paid','dispatched','delivered')";

export const pageNo = (v: string | string[] | undefined) => {
  const n = typeof v === "string" && /^\d{1,6}$/.test(v) ? parseInt(v, 10) : 1;
  return Math.max(1, n);
};

// "9%" in English, "%9" in Turkish.
export function pctBps(bps: number, lang: "tr" | "en") {
  const s = new Intl.NumberFormat(lang === "tr" ? "tr-TR" : "en-GB", { maximumFractionDigits: 2 }).format(bps / 100);
  return lang === "tr" ? `%${s}` : `${s}%`;
}

// --- seller ---------------------------------------------------------------------------------

// Paid orders the seller still has to act on: dispatch, or mark ready for collection.
export async function sellerOrdersToAct(shopId: string) {
  const r = await one<{ n: string }>("select count(*) as n from orders where shop_id = $1 and status = 'paid'", [shopId]);
  return Number(r?.n ?? 0);
}

export type SellerNumbers = {
  sales7: number;
  sales30: number;
  orders30: number;
  held: number;
  paid30: number;
  toSend: number;
  toReady: number;
  waiting: number;
  locked: number;
  orders: number;
  items: number;
  low: number;
  paused: number;
  ratingAvg: number | null;
  ratingCount: number;
  unreplied: number;
};

export async function sellerNumbers(shopId: string): Promise<SellerNumbers> {
  const o = await one<Record<string, string>>(
    `select coalesce(sum(total_pence) filter (where status in ${PAID} and paid_at >= now() - interval '7 days'), 0) as sales7,
            coalesce(sum(total_pence) filter (where status in ${PAID} and paid_at >= now() - interval '30 days'), 0) as sales30,
            count(*) filter (where status in ${PAID} and paid_at >= now() - interval '30 days') as orders30,
            coalesce(sum(seller_payout_pence) filter (where status in ${HELD}), 0) as held,
            coalesce(sum(seller_payout_pence) filter (where status = 'released' and released_at >= now() - interval '30 days'), 0) as paid30,
            count(*) filter (where status = 'paid' and fulfilment = 'delivery') as to_send,
            count(*) filter (where status = 'paid' and fulfilment = 'collection') as to_ready,
            count(*) filter (where status = 'dispatched' and fulfilment = 'collection' and collection_attempts < ${COLLECTION_MAX_ATTEMPTS}) as waiting,
            count(*) filter (where status = 'dispatched' and fulfilment = 'collection' and collection_attempts >= ${COLLECTION_MAX_ATTEMPTS}) as locked,
            count(*) filter (where status <> 'pending') as orders
       from orders where shop_id = $1`,
    [shopId],
  );
  const l = await one<Record<string, string>>(
    `select count(*) filter (where status <> 'removed') as items,
            count(*) filter (where status = 'active' and stock <= 2) as low,
            count(*) filter (where status = 'paused') as paused
       from listings where shop_id = $1`,
    [shopId],
  );
  const r = await one<Record<string, string | null>>(
    `select avg(rating)::numeric(3,2) as avg, count(*) as n, count(*) filter (where reply is null) as unreplied
       from reviews where shop_id = $1 and status = 'published'`,
    [shopId],
  );
  return {
    sales7: Number(o?.sales7 ?? 0),
    sales30: Number(o?.sales30 ?? 0),
    orders30: Number(o?.orders30 ?? 0),
    held: Number(o?.held ?? 0),
    paid30: Number(o?.paid30 ?? 0),
    toSend: Number(o?.to_send ?? 0),
    toReady: Number(o?.to_ready ?? 0),
    waiting: Number(o?.waiting ?? 0),
    locked: Number(o?.locked ?? 0),
    orders: Number(o?.orders ?? 0),
    items: Number(l?.items ?? 0),
    low: Number(l?.low ?? 0),
    paused: Number(l?.paused ?? 0),
    ratingAvg: r?.avg ? Number(r.avg) : null,
    ratingCount: Number(r?.n ?? 0),
    unreplied: Number(r?.unreplied ?? 0),
  };
}

export type RecentOrder = {
  id: string;
  number: number;
  title: string;
  quantity: number;
  total_pence: number;
  status: Order["status"];
  fulfilment: Order["fulfilment"];
  created_at: Date;
};

export const sellerRecentOrders = (shopId: string, n = 5) =>
  q<RecentOrder>(
    `select id, number, title, quantity, total_pence, status, fulfilment, created_at
       from orders where shop_id = $1 and status <> 'pending' order by created_at desc, number desc limit $2`,
    [shopId, n],
  );

export type PayoutRow = {
  id: string;
  number: number;
  created_at: Date;
  title: string;
  total_pence: number;
  delivery_cost_pence: number;
  commission_pence: number;
  seller_payout_pence: number;
  status: Order["status"];
  fulfilment: Order["fulfilment"];
  delivered_at: Date | null;
  released_at: Date | null;
};

export async function sellerPayouts(shopId: string, page: number) {
  const s = await one<Record<string, string | null>>(
    `select coalesce(sum(seller_payout_pence) filter (where status in ${HELD}), 0) as held,
            coalesce(sum(seller_payout_pence) filter (where status = 'delivered'), 0) as due,
            min(delivered_at) filter (where status = 'delivered') as next_from,
            coalesce(sum(seller_payout_pence) filter (where status = 'released'), 0) as paid,
            count(*) filter (where status in ${PAID} or status = 'refunded') as total
       from orders where shop_id = $1`,
    [shopId],
  );
  const rows = await q<PayoutRow>(
    `select id, number, created_at, title, total_pence, delivery_cost_pence, commission_pence, seller_payout_pence,
            status, fulfilment, delivered_at, released_at
       from orders where shop_id = $1 and (status in ${PAID} or status = 'refunded')
      order by created_at desc, id limit ${PANEL_PAGE_SIZE} offset $2`,
    [shopId, (page - 1) * PANEL_PAGE_SIZE],
  );
  return {
    rows,
    total: Number(s?.total ?? 0),
    held: Number(s?.held ?? 0),
    due: Number(s?.due ?? 0),
    nextFrom: s?.next_from ? new Date(s.next_from) : null,
    paid: Number(s?.paid ?? 0),
  };
}

// When a delivered order becomes payable: the delivery time plus the wait.
export const releaseDate = (deliveredAt: Date | string, releaseDays: number) =>
  new Date(new Date(deliveredAt).getTime() + releaseDays * 86400_000);

export const ORDER_FILTERS = ["send", "ready", "sent", "waiting", "delivered", "collected", "refunded"] as const;
export type OrderFilter = (typeof ORDER_FILTERS)[number];
export const isOrderFilter = (v: unknown): v is OrderFilter =>
  typeof v === "string" && (ORDER_FILTERS as readonly string[]).includes(v);

// Fixed SQL fragments, chosen from the list above and never built from input.
const FILTER_SQL: Record<OrderFilter, string> = {
  send: "status = 'paid' and fulfilment = 'delivery'",
  ready: "status = 'paid' and fulfilment = 'collection'",
  sent: "status = 'dispatched' and fulfilment = 'delivery'",
  waiting: "status = 'dispatched' and fulfilment = 'collection'",
  delivered: "status in ('delivered','released') and fulfilment = 'delivery'",
  collected: "status in ('delivered','released') and fulfilment = 'collection'",
  refunded: "status = 'refunded'",
};

// "1001" or "#1001" -> "1001"; anything that is not only digits -> null (matches nothing).
export function orderNumberDigits(v: string): string | null {
  const m = /^#?\s*(\d{1,9})$/.exec(v.trim());
  return m ? m[1] : null;
}

// One page of the seller's orders. The search matches any part of the order number (digits only).
export async function sellerOrders(shopId: string, filter: OrderFilter | "", search: string, page: number) {
  const args: unknown[] = [shopId];
  let where = "shop_id = $1 and status <> 'pending'";
  if (filter) where += ` and ${FILTER_SQL[filter]}`;
  if (search) {
    const d = orderNumberDigits(search);
    if (d === null) where += " and false";
    else {
      args.push(`%${d}%`);
      where += ` and number::text like $${args.length}`;
    }
  }
  const c = await one<{ n: string }>(`select count(*) as n from orders where ${where}`, args);
  const rows = await q<Order>(
    `select *, ${ORDER_NO_CODE} from orders where ${where}
      order by (status = 'paid') desc, created_at desc, id limit ${PANEL_PAGE_SIZE} offset ${(page - 1) * PANEL_PAGE_SIZE}`,
    args,
  );
  return { rows, total: Number(c?.n ?? 0) };
}

export async function sellerHasOrders(shopId: string) {
  const r = await one("select 1 as x from orders where shop_id = $1 and status <> 'pending' limit 1", [shopId]);
  return Boolean(r);
}

// --- buyer ----------------------------------------------------------------------------------

export type BuyerOrderLine = {
  id: string;
  number: number;
  title: string;
  quantity: number;
  total_pence: number;
  status: Order["status"];
  fulfilment: Order["fulfilment"];
  created_at: Date;
  shop_name: string;
  collection_attempts: number;
};

const LINE_COLS = `o.id, o.number, o.title, o.quantity, o.total_pence, o.status, o.fulfilment, o.created_at, o.collection_attempts, s.name as shop_name`;

export async function buyerOverview(userId: string) {
  const [inProgress, toReview, c] = await Promise.all([
    q<BuyerOrderLine>(
      `select ${LINE_COLS} from orders o join shops s on s.id = o.shop_id
        where o.buyer_id = $1 and o.status in ('paid','dispatched') order by o.created_at desc limit 20`,
      [userId],
    ),
    reviewableOrders(userId),
    one<{ orders: string; favs: string }>(
      `select (select count(*) from orders where buyer_id = $1 and status <> 'pending') as orders,
              (select count(*) from favourites f join listings l on l.id = f.listing_id join shops s on s.id = l.shop_id
                where f.user_id = $1 and l.status <> 'removed' and s.status = 'approved') as favs`,
      [userId],
    ),
  ]);
  return { inProgress, toReview, orders: Number(c?.orders ?? 0), favs: Number(c?.favs ?? 0) };
}

// Delivered or collected orders of this buyer that have no review yet.
export const reviewableOrders = (userId: string) =>
  q<BuyerOrderLine>(
    `select ${LINE_COLS} from orders o join shops s on s.id = o.shop_id
      where o.buyer_id = $1 and o.status in ('delivered','released')
        and not exists (select 1 from reviews r where r.order_id = o.id)
      order by o.created_at desc limit 50`,
    [userId],
  );

export type MyReview = {
  id: string;
  rating: number;
  comment: string;
  reply: string | null;
  status: "published" | "hidden";
  created_at: Date;
  order_id: string;
  order_number: number;
  title: string;
  shop_name: string;
  shop_slug: string;
};

export const buyerReviews = (userId: string) =>
  q<MyReview>(
    `select r.id, r.rating, r.comment, r.reply, r.status, r.created_at, o.id as order_id, o.number as order_number,
            o.title, s.name as shop_name, s.slug as shop_slug
       from reviews r join orders o on o.id = r.order_id join shops s on s.id = r.shop_id
      where r.buyer_id = $1 order by r.created_at desc limit 100`,
    [userId],
  );

export type DocOrder = Order & {
  buyer_name: string;
  shop_name: string;
  shop_slug: string;
  shop_legal_name: string;
  shop_company_number: string | null;
  shop_vat_number: string | null;
  shop_address: string;
  shop_city: string;
  shop_postcode: string;
  shop_public_email: string | null;
  shop_phone: string;
  shop_show_phone: boolean;
  collection_note_tr: string;
  collection_note_en: string;
  window_over: boolean;
};

// The order for the confirmation or the cancellation form: the buyer's own order only, and
// never the handover code. A bad id or someone else's order gives null (the page answers 404).
export async function ownOrderForDocument(orderId: string, userId: string) {
  if (!isUuid(orderId)) return null;
  return one<DocOrder>(
    `select o.*, ${ORDER_NO_CODE}, u.name as buyer_name,
            s.name as shop_name, s.slug as shop_slug, s.legal_name as shop_legal_name,
            s.company_number as shop_company_number, s.vat_number as shop_vat_number,
            s.address as shop_address, s.city as shop_city, s.postcode as shop_postcode,
            s.public_email as shop_public_email, s.phone as shop_phone, s.show_phone as shop_show_phone,
            s.collection_note_tr, s.collection_note_en,
            coalesce((now() at time zone 'Europe/London')::date > (o.delivered_at at time zone 'Europe/London')::date + 14, false) as window_over
       from orders o join shops s on s.id = o.shop_id join users u on u.id = o.buyer_id
      where o.id = $1 and o.buyer_id = $2`,
    [orderId, userId],
  );
}
