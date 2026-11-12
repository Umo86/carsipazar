import "server-only";
import { one, q, tx } from "./db";
import { PROMO_BOOK_AHEAD_DAYS, PROMO_KINDS, PROMO_MAX_WEEKS, type PromoKind } from "./config";
import { paymentsMode } from "./payments";
import * as stripe from "./payments/stripe";
import { getSettings } from "./settings";

// Paid promotion: a seller books a package for one item, for one to four
// weeks from a chosen start date. A booking is confirmed once it is paid
// (straight away in demo mode). Each package has a fixed number of slots,
// so it cannot be oversold.

export type Promotion = {
  id: string;
  shop_id: string;
  listing_id: string;
  kind: PromoKind;
  category: string;
  starts_on: string; // YYYY-MM-DD
  ends_on: string;
  weeks: number;
  price_pence: number;
  status: "pending" | "booked" | "cancelled";
  provider: string;
  provider_ref: string | null;
  created_at: Date;
};

export type PromotionRow = Promotion & {
  title_tr: string;
  title_en: string;
  shop_name: string;
  shop_slug: string;
  phase: "upcoming" | "live" | "ended" | "cancelled" | "pending";
};

export class PromoError extends Error {
  constructor(public code: "fields" | "listing" | "shop" | "dates" | "full") {
    super(code);
  }
}

const DAY = 86400_000;
const iso = (d: Date) => d.toISOString().slice(0, 10);
export const todayIso = () => iso(new Date());
export const lastBookableIso = () => iso(new Date(Date.now() + PROMO_BOOK_AHEAD_DAYS * DAY));

// Dates come back from the database as text, so they never shift by a time zone.
const SELECT = `
  select p.id, p.shop_id, p.listing_id, p.kind, p.category, p.starts_on::text as starts_on,
         p.ends_on::text as ends_on, p.weeks, p.price_pence, p.status, p.provider, p.provider_ref,
         p.created_at, l.title_tr, l.title_en, s.name as shop_name, s.slug as shop_slug,
         case when p.status = 'cancelled' then 'cancelled'
              when p.status = 'pending' then 'pending'
              when current_date < p.starts_on then 'upcoming'
              when current_date > p.ends_on then 'ended'
              else 'live' end as phase
    from promotions p join listings l on l.id = p.listing_id join shops s on s.id = p.shop_id`;

export const promotionsByShop = (shopId: string) =>
  q<PromotionRow>(`${SELECT} where p.shop_id = $1 and p.status <> 'pending' order by p.created_at desc limit 100`, [shopId]);

export const allPromotions = () =>
  q<PromotionRow>(`${SELECT} where p.status <> 'pending' order by p.created_at desc limit 300`);

export async function promotionIncome() {
  const r = await one<{ total: string }>(
    "select coalesce(sum(price_pence), 0) as total from promotions where status = 'booked'",
  );
  return Number(r?.total ?? 0);
}

// A slot is taken by a confirmed booking, or by one that is being paid for
// right now (held for 30 minutes).
const TAKES_SLOT = "(p.status = 'booked' or (p.status = 'pending' and p.created_at > now() - interval '30 minutes'))";

// Dates already taken for the one-slot package, so the seller can avoid them.
export const spotlightTaken = () =>
  q<{ starts_on: string; ends_on: string }>(
    `select p.starts_on::text as starts_on, p.ends_on::text as ends_on from promotions p
      where p.kind = 'spotlight' and ${TAKES_SLOT} and p.ends_on >= current_date
      order by p.starts_on`,
  );

export async function bookPromotion(args: {
  shop: { id: string; status: string };
  listingId: string;
  kind: PromoKind;
  startsOn: string;
  weeks: number;
  buyerEmail: string;
  returnUrl: string;
}): Promise<{ id: string; redirectUrl: string | null }> {
  const { shop, kind, weeks } = args;
  if (shop.status !== "approved") throw new PromoError("shop");
  if (!Number.isInteger(weeks) || weeks < 1 || weeks > PROMO_MAX_WEEKS) throw new PromoError("fields");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(args.startsOn)) throw new PromoError("dates");
  const start = new Date(`${args.startsOn}T00:00:00Z`);
  if (Number.isNaN(start.getTime()) || iso(start) !== args.startsOn) throw new PromoError("dates");
  if (args.startsOn < todayIso() || args.startsOn > lastBookableIso()) throw new PromoError("dates");
  const endsOn = iso(new Date(start.getTime() + (weeks * 7 - 1) * DAY));

  const settings = await getSettings();
  const price = settings[PROMO_KINDS[kind].priceKey] * weeks;
  const mode = paymentsMode();

  const promo = await tx(async (c) => {
    // One booking at a time per package, so two sellers cannot take the last slot together.
    await c.query("select pg_advisory_xact_lock(hashtext($1))", [`promo:${kind}`]);
    const { rows } = await c.query(
      "select id, category, status from listings where id = $1 and shop_id = $2",
      [args.listingId, shop.id],
    );
    const listing = rows[0];
    if (!listing || listing.status !== "active") throw new PromoError("listing");

    // The busiest day in the requested dates decides whether there is room.
    const busiest = await c.query(
      `select coalesce(max(n), 0) as n from (
         select (select count(*) from promotions p
                  where p.kind = $1 and ${TAKES_SLOT}
                    and p.starts_on <= d::date and p.ends_on >= d::date
                    and ($4::text is null or p.category = $4)) as n
           from generate_series($2::date, $3::date, interval '1 day') d
       ) days`,
      [kind, args.startsOn, endsOn, kind === "category_top" ? listing.category : null],
    );
    if (Number(busiest.rows[0].n) >= PROMO_KINDS[kind].slots) throw new PromoError("full");

    // The same item cannot run the same package twice over the same dates.
    const dup = await c.query(
      `select 1 from promotions p where p.listing_id = $1 and p.kind = $2 and ${TAKES_SLOT}
          and p.starts_on <= $4::date and p.ends_on >= $3::date`,
      [listing.id, kind, args.startsOn, endsOn],
    );
    if (dup.rowCount) throw new PromoError("full");

    const ins = await c.query<Promotion>(
      `insert into promotions (shop_id, listing_id, kind, category, starts_on, ends_on, weeks,
                               price_pence, status, provider, paid_at)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10, case when $9 = 'booked' then now() end)
       returning id, price_pence`,
      [shop.id, listing.id, kind, listing.category, args.startsOn, endsOn, weeks, price,
       mode === "demo" ? "booked" : "pending", mode],
    );
    return ins.rows[0];
  });

  if (mode === "demo") return { id: promo.id, redirectUrl: null };

  const session = await stripe.createPromotionCheckout({
    promotionId: promo.id,
    label: `CarsiPazar promotion (${kind}, ${weeks} week${weeks === 1 ? "" : "s"})`,
    amountPence: price,
    buyerEmail: args.buyerEmail,
    returnUrl: args.returnUrl,
  });
  await q("update promotions set provider_ref = $2 where id = $1", [promo.id, session.sessionId]);
  return { id: promo.id, redirectUrl: session.url };
}

// Called by the payment provider's webhook in live mode.
export async function markPromotionPaid(id: string, paymentRef: string) {
  await q(
    "update promotions set status = 'booked', paid_at = now(), provider_ref = $2 where id = $1 and status = 'pending'",
    [id, paymentRef],
  );
}

// Cancels and refunds in full. A seller may cancel only before the start
// date; the admin may cancel at any time.
export async function cancelPromotion(id: string, by: { shopId: string } | "admin") {
  const promo = await one<Promotion & { started: boolean }>(
    `select p.*, (current_date >= p.starts_on) as started from promotions p
      where p.id = $1 and p.status = 'booked'`,
    [id],
  );
  if (!promo) return false;
  if (by !== "admin" && (promo.shop_id !== by.shopId || promo.started)) return false;
  if (promo.provider === "stripe" && promo.provider_ref) await stripe.refundPayment(promo.provider_ref);
  await q("update promotions set status = 'cancelled', cancelled_at = now() where id = $1", [id]);
  return true;
}
