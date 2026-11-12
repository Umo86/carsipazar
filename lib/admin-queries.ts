import "server-only";
import type { PoolClient } from "pg";
import { one, q } from "./db";
import { ORDER_NO_CODE } from "./orders";

// SQL for the admin panel. Everything here takes its values as parameters.
// Money is in pence; callers format it. Nothing here selects password hashes,
// session tokens or collection codes.

export const PAGE_SIZE = 25;

// A strict UUID check. (queries.ts has a looser one that lets some bad ids reach the database.)
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const isUuidStrict = (v: unknown): v is string => typeof v === "string" && UUID.test(v);

// Search text -> a LIKE pattern. % _ and \ typed by the user match themselves; long input is cut.
export const likeArg = (raw: string) => `%${raw.trim().slice(0, 80).replace(/[\\%_]/g, "\\$&")}%`;
export const cleanSearch = (v: string | string[] | undefined) => (typeof v === "string" ? v.trim().slice(0, 80) : "");

export const pageOf = (v: string | string[] | undefined) => {
  const n = typeof v === "string" && /^\d{1,6}$/.test(v) ? parseInt(v, 10) : 1;
  return Math.max(1, n);
};

export const pick1 = <T extends string>(v: string | string[] | undefined, allowed: readonly T[]): T | "" =>
  typeof v === "string" && (allowed as readonly string[]).includes(v) ? (v as T) : "";

export const PAID_STATUSES = "('paid','dispatched','delivered','released')";

// --- admin log ---------------------------------------------------------------------------

type Runner = Pick<PoolClient, "query">;

export async function logAdmin(
  adminId: string,
  action: string,
  targetKind: string,
  targetId: string,
  detail = "",
  run?: Runner,
) {
  const sql =
    "insert into admin_log (admin_user_id, action, target_kind, target_id, detail) values ($1, $2, $3, $4, $5)";
  const args = [adminId, action, targetKind, targetId, detail.slice(0, 500)];
  if (run) await run.query(sql, args);
  else await q(sql, args);
}

export type LogRow = {
  id: string;
  action: string;
  target_kind: string;
  target_id: string;
  detail: string;
  created_at: Date;
  admin_name: string | null;
  admin_email: string | null;
};

export async function listLog(opts: { action: string; page: number }) {
  const where = "where ($1 = '' or l.action = $1)";
  const total = await one<{ n: string }>(`select count(*) as n from admin_log l ${where}`, [opts.action]);
  const rows = await q<LogRow>(
    `select l.id, l.action, l.target_kind, l.target_id, l.detail, l.created_at, u.name as admin_name, u.email as admin_email
       from admin_log l left join users u on u.id = l.admin_user_id ${where}
      order by l.created_at desc, l.id limit ${PAGE_SIZE} offset $2`,
    [opts.action, (opts.page - 1) * PAGE_SIZE],
  );
  const actions = await q<{ action: string }>("select distinct action from admin_log order by action");
  return { rows, total: Number(total?.n ?? 0), actions: actions.map((a) => a.action) };
}

export const recentLog = (n: number) =>
  q<LogRow>(
    `select l.id, l.action, l.target_kind, l.target_id, l.detail, l.created_at, u.name as admin_name, u.email as admin_email
       from admin_log l left join users u on u.id = l.admin_user_id
      order by l.created_at desc, l.id limit $1`,
    [n],
  );

// --- overview ----------------------------------------------------------------------------

export type PeriodStats = {
  sales: number;
  orders: number;
  commission: number;
  delivery: number;
  promotions: number;
  users: number;
  shops: number;
};

export async function periodStats(days: number): Promise<PeriodStats> {
  const o = await one<{ sales: string; orders: string; commission: string; delivery: string }>(
    `select coalesce(sum(total_pence), 0) as sales, count(*) as orders,
            coalesce(sum(commission_pence), 0) as commission, coalesce(sum(delivery_cost_pence), 0) as delivery
       from orders where status in ${PAID_STATUSES} and paid_at >= now() - make_interval(days => $1::int)`,
    [days],
  );
  const p = await one<{ n: string }>(
    `select coalesce(sum(price_pence), 0) as n from promotions
      where status = 'booked' and coalesce(paid_at, created_at) >= now() - make_interval(days => $1::int)`,
    [days],
  );
  const u = await one<{ users: string; shops: string }>(
    `select (select count(*) from users where created_at >= now() - make_interval(days => $1::int)) as users,
            (select count(*) from shops where created_at >= now() - make_interval(days => $1::int)) as shops`,
    [days],
  );
  return {
    sales: Number(o?.sales ?? 0),
    orders: Number(o?.orders ?? 0),
    commission: Number(o?.commission ?? 0),
    delivery: Number(o?.delivery ?? 0),
    promotions: Number(p?.n ?? 0),
    users: Number(u?.users ?? 0),
    shops: Number(u?.shops ?? 0),
  };
}

export type DaySales = { day: string; pence: number; orders: number };

// The last 30 days, today last, with a row for every day (zero when nothing sold).
export async function dailySales(): Promise<DaySales[]> {
  const rows = await q<{ day: string; pence: string; orders: string }>(
    `select to_char(d, 'YYYY-MM-DD') as day, coalesce(sum(o.total_pence), 0) as pence, count(o.id) as orders
       from generate_series(((now() at time zone 'UTC')::date - 29)::timestamp, (now() at time zone 'UTC')::date::timestamp, interval '1 day') d
       left join orders o on (o.paid_at at time zone 'UTC')::date = d::date and o.status in ${PAID_STATUSES}
      group by d order by d`,
  );
  return rows.map((r) => ({ day: r.day, pence: Number(r.pence), orders: Number(r.orders) }));
}

export type Attention = {
  pendingShops: number;
  openReports: number;
  stuckOrders: number;
  pendingPromos: number;
  blockedUsers: number;
};

export async function attention(): Promise<Attention> {
  const r = await one<Record<keyof Attention, string>>(
    `select (select count(*) from shops where status = 'pending') as "pendingShops",
            (select count(*) from reports where status = 'open') as "openReports",
            (select count(*) from orders where status = 'paid' and paid_at < now() - interval '3 days') as "stuckOrders",
            (select count(*) from promotions where status = 'pending') as "pendingPromos",
            (select count(*) from users where blocked_at is not null) as "blockedUsers"`,
  );
  return {
    pendingShops: Number(r?.pendingShops ?? 0),
    openReports: Number(r?.openReports ?? 0),
    stuckOrders: Number(r?.stuckOrders ?? 0),
    pendingPromos: Number(r?.pendingPromos ?? 0),
    blockedUsers: Number(r?.blockedUsers ?? 0),
  };
}

// Counts for the sidebar badges.
export async function navCounts() {
  const r = await one<{ reports: string; shops: string }>(
    `select (select count(*) from reports where status = 'open') as reports,
            (select count(*) from shops where status = 'pending') as shops`,
  );
  return { reports: Number(r?.reports ?? 0), shops: Number(r?.shops ?? 0) };
}

// --- users -------------------------------------------------------------------------------

export const ROLES = ["buyer", "seller", "admin"] as const;
export type Role = (typeof ROLES)[number];

export type UserRow = {
  id: string;
  name: string;
  email: string;
  role: Role;
  created_at: Date;
  blocked_at: Date | null;
  orders: string;
};

export async function listUsers(opts: { text: string; role: string; blocked: boolean; page: number }) {
  const args: unknown[] = [opts.text ? likeArg(opts.text) : "", opts.role, opts.blocked];
  const where = `where ($1 = '' or u.email ilike $1 or u.name ilike $1)
                   and ($2 = '' or u.role = $2) and (not $3::boolean or u.blocked_at is not null)`;
  const total = await one<{ n: string }>(`select count(*) as n from users u ${where}`, args);
  const rows = await q<UserRow>(
    `select u.id, u.name, u.email, u.role, u.created_at, u.blocked_at,
            (select count(*) from orders o where o.buyer_id = u.id) as orders
       from users u ${where} order by u.created_at desc, u.id limit ${PAGE_SIZE} offset $4`,
    [...args, (opts.page - 1) * PAGE_SIZE],
  );
  return { rows, total: Number(total?.n ?? 0) };
}

export type UserDetail = {
  id: string;
  name: string;
  email: string;
  role: Role;
  created_at: Date;
  blocked_at: Date | null;
  blocked_reason: string | null;
};

export const getUserDetail = (id: string) =>
  one<UserDetail>(
    "select id, name, email, role, created_at, blocked_at, blocked_reason from users where id = $1",
    [id],
  );

export const userOrders = (id: string) =>
  q<{ id: string; number: number; title: string; total_pence: number; status: string; fulfilment: string; created_at: Date; shop_name: string }>(
    `select o.id, o.number, o.title, o.total_pence, o.status, o.fulfilment, o.created_at, s.name as shop_name
       from orders o join shops s on s.id = o.shop_id where o.buyer_id = $1 order by o.created_at desc limit 50`,
    [id],
  );

export const userShop = (ownerId: string) =>
  one<{ id: string; name: string; slug: string; status: string }>(
    "select id, name, slug, status from shops where owner_id = $1",
    [ownerId],
  );

export const userReviews = (id: string) =>
  q<{ id: string; rating: number; comment: string; status: string; created_at: Date; shop_name: string }>(
    `select r.id, r.rating, r.comment, r.status, r.created_at, s.name as shop_name
       from reviews r join shops s on s.id = r.shop_id where r.buyer_id = $1 order by r.created_at desc limit 50`,
    [id],
  );

export type ReportBrief = {
  id: string;
  kind: string;
  target_id: string;
  reason: string;
  status: string;
  created_at: Date;
};

export const reportsByUser = (id: string) =>
  q<ReportBrief>(
    "select id, kind, target_id, reason, status, created_at from reports where reporter_user_id = $1 order by created_at desc limit 50",
    [id],
  );

// Reports about this person's shop, items or reviews.
export const reportsAboutUser = (id: string) =>
  q<ReportBrief>(
    `select r.id, r.kind, r.target_id, r.reason, r.status, r.created_at from reports r
      where (r.kind = 'shop' and r.target_id in (select id from shops where owner_id = $1))
         or (r.kind = 'listing' and r.target_id in (select l.id from listings l join shops s on s.id = l.shop_id where s.owner_id = $1))
         or (r.kind = 'review' and r.target_id in (select id from reviews where buyer_id = $1))
      order by r.created_at desc limit 50`,
    [id],
  );

// --- sellers -----------------------------------------------------------------------------

export const SHOP_STATUSES = ["pending", "approved", "suspended"] as const;

export type ShopRow = {
  id: string;
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
  status: "pending" | "approved" | "suspended";
  founding: boolean;
  created_at: Date;
  email: string;
  listings: string;
};

const SHOP_COLS = `s.id, s.slug, s.name, s.seller_type, s.legal_name, s.company_number, s.phone, s.address, s.city,
  s.postcode, s.instagram, s.status, s.founding, s.created_at`;

export async function listShops(opts: { text: string; status: string; page: number }) {
  const args: unknown[] = [opts.text ? likeArg(opts.text) : "", opts.status];
  const where = `where ($1 = '' or s.name ilike $1 or s.legal_name ilike $1 or s.slug ilike $1 or s.city ilike $1 or u.email ilike $1)
                   and ($2 = '' or s.status = $2)`;
  const total = await one<{ n: string }>(
    `select count(*) as n from shops s join users u on u.id = s.owner_id ${where}`,
    args,
  );
  const rows = await q<ShopRow>(
    `select ${SHOP_COLS}, u.email,
            (select count(*) from listings l where l.shop_id = s.id and l.status = 'active') as listings
       from shops s join users u on u.id = s.owner_id ${where}
      order by (s.status = 'pending') desc, s.created_at desc, s.id limit ${PAGE_SIZE} offset $3`,
    [...args, (opts.page - 1) * PAGE_SIZE],
  );
  return { rows, total: Number(total?.n ?? 0) };
}

export type ShopDetail = ShopRow & {
  owner_id: string;
  owner_name: string;
  owner_blocked: boolean;
  public_email: string | null;
  website: string | null;
  vat_number: string | null;
};

export const getShopDetail = (id: string) =>
  one<ShopDetail>(
    `select ${SHOP_COLS}, s.owner_id, s.public_email, s.website, s.vat_number, u.email, u.name as owner_name,
            (u.blocked_at is not null) as owner_blocked,
            (select count(*) from listings l where l.shop_id = s.id and l.status = 'active') as listings
       from shops s join users u on u.id = s.owner_id where s.id = $1`,
    [id],
  );

export async function shopTotals(shopId: string) {
  const r = await one<Record<string, string>>(
    `select coalesce(sum(total_pence) filter (where status in ${PAID_STATUSES}), 0) as sales,
            count(*) filter (where status in ${PAID_STATUSES}) as orders,
            coalesce(sum(commission_pence) filter (where status in ${PAID_STATUSES}), 0) as commission,
            coalesce(sum(seller_payout_pence) filter (where status in ('paid','dispatched','delivered')), 0) as held,
            coalesce(sum(seller_payout_pence) filter (where status = 'released'), 0) as paid_out,
            count(*) filter (where status = 'refunded') as refunded
       from orders where shop_id = $1`,
    [shopId],
  );
  return {
    sales: Number(r?.sales ?? 0),
    orders: Number(r?.orders ?? 0),
    commission: Number(r?.commission ?? 0),
    held: Number(r?.held ?? 0),
    paidOut: Number(r?.paid_out ?? 0),
    refunded: Number(r?.refunded ?? 0),
  };
}

export const shopItems = (shopId: string) =>
  q<{ id: string; title_tr: string; title_en: string; price_pence: number; stock: number; status: string }>(
    "select id, title_tr, title_en, price_pence, stock, status from listings where shop_id = $1 order by created_at desc limit 100",
    [shopId],
  );

export const shopOrders = (shopId: string) =>
  q<{ id: string; number: number; title: string; total_pence: number; seller_payout_pence: number; status: string; fulfilment: string; created_at: Date }>(
    `select id, number, title, total_pence, seller_payout_pence, status, fulfilment, created_at
       from orders where shop_id = $1 and status <> 'pending' order by created_at desc limit 20`,
    [shopId],
  );

export const reportsAboutShop = (shopId: string) =>
  q<ReportBrief>(
    `select id, kind, target_id, reason, status, created_at from reports
      where (kind = 'shop' and target_id = $1)
         or (kind = 'listing' and target_id in (select id from listings where shop_id = $1))
         or (kind = 'review' and target_id in (select id from reviews where shop_id = $1))
      order by created_at desc limit 50`,
    [shopId],
  );

// --- orders ------------------------------------------------------------------------------

export const ORDER_STATUSES = ["pending", "paid", "dispatched", "delivered", "released", "refunded", "cancelled"] as const;

export async function listOrders(opts: { text: string; status: string; fulfilment: string; stuck: boolean; page: number }) {
  const num = /^#?\d{1,9}$/.test(opts.text.trim()) ? parseInt(opts.text.trim().replace("#", ""), 10) : -1;
  const args: unknown[] = [opts.text ? likeArg(opts.text) : "", num, opts.status, opts.fulfilment, opts.stuck];
  const where = `where ($3 = '' and o.status <> 'pending' or $3 <> '' and o.status = $3)
                   and ($4 = '' or o.fulfilment = $4)
                   and (not $5::boolean or (o.status = 'paid' and o.paid_at < now() - interval '3 days'))
                   and ($1 = '' or o.number = $2 or u.email ilike $1 or s.name ilike $1)`;
  const from = "from orders o join shops s on s.id = o.shop_id join users u on u.id = o.buyer_id";
  const total = await one<{ n: string }>(`select count(*) as n ${from} ${where}`, args);
  const rows = await q(
    `select o.*, ${ORDER_NO_CODE}, s.name as shop_name, u.email as buyer_email
       ${from} ${where} order by o.created_at desc, o.id limit ${PAGE_SIZE} offset $6`,
    [...args, (opts.page - 1) * PAGE_SIZE],
  );
  return { rows, total: Number(total?.n ?? 0) };
}

export type OrderDetail = {
  id: string;
  number: number;
  title: string;
  quantity: number;
  item_pence: number;
  postage_pence: number;
  total_pence: number;
  payment_method: string;
  commission_pence: number;
  payment_cost_pence: number;
  seller_payout_pence: number;
  delivery_cost_pence: number;
  delivery_method: string;
  parcel_size: string | null;
  fulfilment: string;
  status: "pending" | "paid" | "dispatched" | "delivered" | "released" | "refunded" | "cancelled";
  tracking_carrier: string | null;
  tracking_number: string | null;
  label_ref: string | null;
  provider: string;
  listing_id: string | null;
  created_at: Date;
  paid_at: Date | null;
  dispatched_at: Date | null;
  delivered_at: Date | null;
  released_at: Date | null;
  refunded_at: Date | null;
  shop_id: string;
  shop_name: string;
  seller_email: string;
  buyer_id: string;
  buyer_name: string;
  buyer_email: string;
};

// Explicit column list: no collection_code, no address, no provider reference.
export const getOrderDetail = (id: string) =>
  one<OrderDetail>(
    `select o.id, o.number, o.title, o.quantity, o.item_pence, o.postage_pence, o.total_pence, o.payment_method,
            o.commission_pence, o.payment_cost_pence, o.seller_payout_pence, o.delivery_cost_pence, o.delivery_method,
            o.parcel_size, o.fulfilment, o.status, o.tracking_carrier, o.tracking_number, o.label_ref, o.provider,
            o.listing_id, o.created_at, o.paid_at, o.dispatched_at, o.delivered_at, o.released_at, o.refunded_at,
            o.shop_id, s.name as shop_name, su.email as seller_email,
            o.buyer_id, bu.name as buyer_name, bu.email as buyer_email
       from orders o join shops s on s.id = o.shop_id join users su on su.id = s.owner_id
       join users bu on bu.id = o.buyer_id where o.id = $1`,
    [id],
  );

// --- payouts -----------------------------------------------------------------------------

export type PayoutRow = {
  id: string;
  name: string;
  status: string;
  held: string;
  due: string;
  released30: string;
  commission: string;
};

export async function listPayouts(opts: { releaseDays: number; page: number }) {
  const total = await one<{ n: string }>("select count(*) as n from shops");
  const rows = await q<PayoutRow>(
    `select s.id, s.name, s.status,
            coalesce(sum(o.seller_payout_pence) filter (where o.status in ('paid','dispatched','delivered')), 0) as held,
            coalesce(sum(o.seller_payout_pence) filter (where o.status = 'delivered' and o.delivered_at < now() - make_interval(days => $1::int)), 0) as due,
            coalesce(sum(o.seller_payout_pence) filter (where o.status = 'released' and o.released_at > now() - interval '30 days'), 0) as released30,
            coalesce(sum(o.commission_pence) filter (where o.status in ${PAID_STATUSES}), 0) as commission
       from shops s left join orders o on o.shop_id = s.id
      group by s.id order by held desc, s.name, s.id limit ${PAGE_SIZE} offset $2`,
    [opts.releaseDays, (opts.page - 1) * PAGE_SIZE],
  );
  const sum = await one<Record<string, string>>(
    `select coalesce(sum(seller_payout_pence) filter (where status in ('paid','dispatched','delivered')), 0) as held,
            coalesce(sum(seller_payout_pence) filter (where status = 'delivered' and delivered_at < now() - make_interval(days => $1::int)), 0) as due,
            coalesce(sum(seller_payout_pence) filter (where status = 'released' and released_at > now() - interval '30 days'), 0) as released30,
            coalesce(sum(commission_pence) filter (where status in ${PAID_STATUSES}), 0) as commission
       from orders`,
    [opts.releaseDays],
  );
  return {
    rows,
    total: Number(total?.n ?? 0),
    totals: {
      held: Number(sum?.held ?? 0),
      due: Number(sum?.due ?? 0),
      released30: Number(sum?.released30 ?? 0),
      commission: Number(sum?.commission ?? 0),
    },
  };
}

// --- reports -----------------------------------------------------------------------------

export const REPORT_STATUSES = ["open", "actioned", "dismissed"] as const;
export const REPORT_KINDS = ["listing", "review", "shop"] as const;
export type ReportKind = (typeof REPORT_KINDS)[number];
export const REPORT_REASONS = ["illegal", "counterfeit", "unsafe", "misleading", "offensive", "fake_review", "other"] as const;
export type ReportReason = (typeof REPORT_REASONS)[number];

export type ReportRow = {
  id: string;
  kind: ReportKind;
  target_id: string;
  reason: ReportReason;
  details: string;
  status: "open" | "actioned" | "dismissed";
  resolution_note: string | null;
  reporter_email: string | null;
  created_at: Date;
  resolved_at: Date | null;
  reporter_name: string | null;
  reporter_account_email: string | null;
  reporter_user_id: string | null;
  l_id: string | null;
  l_title_tr: string | null;
  l_title_en: string | null;
  l_status: string | null;
  l_shop: string | null;
  rv_id: string | null;
  rv_rating: number | null;
  rv_comment: string | null;
  rv_status: string | null;
  rv_shop: string | null;
  s_id: string | null;
  s_name: string | null;
  s_status: string | null;
};

export async function listReports(opts: { status: string; page: number }) {
  const total = await one<{ n: string }>("select count(*) as n from reports where status = $1", [opts.status]);
  const rows = await q<ReportRow>(
    `select r.id, r.kind, r.target_id, r.reason, r.details, r.status, r.resolution_note, r.reporter_email,
            r.created_at, r.resolved_at, r.reporter_user_id, u.name as reporter_name, u.email as reporter_account_email,
            l.id as l_id, l.title_tr as l_title_tr, l.title_en as l_title_en, l.status as l_status, ls.name as l_shop,
            rv.id as rv_id, rv.rating as rv_rating, rv.comment as rv_comment, rv.status as rv_status, rs.name as rv_shop,
            sh.id as s_id, sh.name as s_name, sh.status as s_status
       from reports r
       left join users u on u.id = r.reporter_user_id
       left join listings l on r.kind = 'listing' and l.id = r.target_id
       left join shops ls on ls.id = l.shop_id
       left join reviews rv on r.kind = 'review' and rv.id = r.target_id
       left join shops rs on rs.id = rv.shop_id
       left join shops sh on r.kind = 'shop' and sh.id = r.target_id
      where r.status = $1 order by r.created_at ${opts.status === "open" ? "asc" : "desc"}, r.id
      limit ${PAGE_SIZE} offset $2`,
    [opts.status, (opts.page - 1) * PAGE_SIZE],
  );
  return { rows, total: Number(total?.n ?? 0) };
}

// --- CSV exports -------------------------------------------------------------------------

const pounds = (pence: number) => (pence / 100).toFixed(2);
const iso = (d: Date | null) => (d ? new Date(d).toISOString() : "");

export const EXPORT_KINDS = ["orders", "users", "shops"] as const;
export type ExportKind = (typeof EXPORT_KINDS)[number];

// Rows for a CSV. No hashes, sessions, addresses or handover codes.
export async function exportRows(kind: ExportKind): Promise<string[][]> {
  if (kind === "orders") {
    const rows = await q<{
      number: number; created_at: Date; status: string; fulfilment: string; shop_name: string; buyer_email: string;
      title: string; quantity: number; item_pence: number; postage_pence: number; delivery_cost_pence: number;
      total_pence: number; commission_pence: number; payment_cost_pence: number; seller_payout_pence: number;
      payment_method: string; delivery_method: string;
    }>(
      `select o.number, o.created_at, o.status, o.fulfilment, s.name as shop_name, u.email as buyer_email, o.title,
              o.quantity, o.item_pence, o.postage_pence, o.delivery_cost_pence, o.total_pence, o.commission_pence,
              o.payment_cost_pence, o.seller_payout_pence, o.payment_method, o.delivery_method
         from orders o join shops s on s.id = o.shop_id join users u on u.id = o.buyer_id
        order by o.created_at desc, o.id`,
    );
    return [
      ["Order", "Created", "Status", "Fulfilment", "Shop", "Buyer email", "Item", "Quantity", "Item total (GBP)",
        "Postage (GBP)", "Delivery cost kept (GBP)", "Total (GBP)", "Commission (GBP)", "Payment cost (GBP)",
        "Seller payout (GBP)", "Payment method", "Delivery method"],
      ...rows.map((r) => [
        String(r.number), iso(r.created_at), r.status, r.fulfilment, r.shop_name, r.buyer_email, r.title,
        String(r.quantity), pounds(r.item_pence), pounds(r.postage_pence), pounds(r.delivery_cost_pence),
        pounds(r.total_pence), pounds(r.commission_pence), pounds(r.payment_cost_pence), pounds(r.seller_payout_pence),
        r.payment_method, r.delivery_method,
      ]),
    ];
  }
  if (kind === "users") {
    const rows = await q<{ id: string; name: string; email: string; role: string; created_at: Date; blocked_at: Date | null; orders: string }>(
      `select u.id, u.name, u.email, u.role, u.created_at, u.blocked_at,
              (select count(*) from orders o where o.buyer_id = u.id) as orders
         from users u order by u.created_at desc, u.id`,
    );
    return [
      ["Id", "Name", "Email", "Role", "Joined", "Blocked", "Orders"],
      ...rows.map((r) => [r.id, r.name, r.email, r.role, iso(r.created_at), r.blocked_at ? "yes" : "no", r.orders]),
    ];
  }
  const rows = await q<{
    id: string; name: string; slug: string; status: string; founding: boolean; seller_type: string; legal_name: string;
    company_number: string | null; owner_email: string; city: string; postcode: string; created_at: Date;
    live: string; sales: string; commission: string;
  }>(
    `select s.id, s.name, s.slug, s.status, s.founding, s.seller_type, s.legal_name, s.company_number,
            u.email as owner_email, s.city, s.postcode, s.created_at,
            (select count(*) from listings l where l.shop_id = s.id and l.status = 'active') as live,
            coalesce((select sum(total_pence) from orders o where o.shop_id = s.id and o.status in ${PAID_STATUSES}), 0) as sales,
            coalesce((select sum(commission_pence) from orders o where o.shop_id = s.id and o.status in ${PAID_STATUSES}), 0) as commission
       from shops s join users u on u.id = s.owner_id order by s.created_at desc, s.id`,
  );
  return [
    ["Id", "Name", "Slug", "Status", "Founding", "Type", "Legal name", "Company number", "Owner email", "City",
      "Postcode", "Opened", "Items live", "Sales (GBP)", "Commission (GBP)"],
    ...rows.map((r) => [
      r.id, r.name, r.slug, r.status, r.founding ? "yes" : "no", r.seller_type, r.legal_name, r.company_number ?? "",
      r.owner_email, r.city, r.postcode, iso(r.created_at), r.live, pounds(Number(r.sales)), pounds(Number(r.commission)),
    ]),
  ];
}

// One CSV cell. A value a spreadsheet could read as a formula gets a leading apostrophe.
export function csvCell(value: string) {
  let v = value;
  if (/^[=+\-@\t\r]/.test(v)) v = `'${v}`;
  return /[",\r\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
}

export const toCsv = (rows: string[][]) => rows.map((r) => r.map(csvCell).join(",")).join("\r\n") + "\r\n";
