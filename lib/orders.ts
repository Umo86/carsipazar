import "server-only";
import { one, q, tx } from "./db";
import { computeFees, instalmentsAllowed, type PaymentMethod } from "./money";
import { getSettings } from "./settings";
import { paymentsMode } from "./payments";
import * as stripe from "./payments/stripe";

export type OrderStatus =
  | "pending"
  | "paid"
  | "dispatched"
  | "delivered"
  | "released"
  | "refunded"
  | "cancelled";

export type Order = {
  id: string;
  number: number;
  buyer_id: string;
  shop_id: string;
  listing_id: string | null;
  title: string;
  quantity: number;
  item_pence: number;
  postage_pence: number;
  total_pence: number;
  payment_method: PaymentMethod;
  commission_pence: number;
  payment_cost_pence: number;
  seller_payout_pence: number;
  status: OrderStatus;
  ship_name: string;
  ship_line1: string;
  ship_line2: string;
  ship_city: string;
  ship_postcode: string;
  ship_phone: string;
  tracking_carrier: string | null;
  tracking_number: string | null;
  provider: string;
  provider_ref: string | null;
  created_at: Date;
  paid_at: Date | null;
  dispatched_at: Date | null;
  delivered_at: Date | null;
  released_at: Date | null;
  refunded_at: Date | null;
};

export type Shipping = {
  name: string;
  line1: string;
  line2: string;
  city: string;
  postcode: string;
  phone: string;
};

export class OrderError extends Error {
  constructor(public code: "stock" | "unavailable" | "klarna") {
    super(code);
  }
}

// Creates the order with fees fixed at the moment of purchase. In demo mode
// it is paid on the spot; in Stripe mode the caller sends the buyer to the
// returned checkout URL and the webhook marks it paid.
export async function createOrder(args: {
  buyer: { id: string; email: string };
  listingId: string;
  quantity: number;
  method: PaymentMethod;
  shipping: Shipping;
  title: string;
  returnBase: string; // e.g. https://site/tr
}): Promise<{ orderId: string; redirectUrl: string | null }> {
  const settings = await getSettings();
  const mode = paymentsMode();

  const order = await tx(async (c) => {
    const { rows } = await c.query(
      `select l.id, l.price_pence, l.postage_pence, l.stock, l.instalments, l.status,
              s.id as shop_id, s.status as shop_status, s.founding, s.owner_id
         from listings l join shops s on s.id = l.shop_id
        where l.id = $1 for update of l`,
      [args.listingId],
    );
    const l = rows[0];
    if (!l || l.status !== "active" || l.shop_status !== "approved") {
      throw new OrderError("unavailable");
    }
    if (l.owner_id === args.buyer.id) throw new OrderError("unavailable");
    if (l.stock < args.quantity) throw new OrderError("stock");

    const item = l.price_pence * args.quantity;
    const total = item + l.postage_pence;
    if (args.method === "klarna" && !instalmentsAllowed(l, total, settings)) {
      throw new OrderError("klarna");
    }
    const fees = computeFees({ total, method: args.method, founding: l.founding, settings });

    const ins = await c.query<Order>(
      `insert into orders
         (buyer_id, shop_id, listing_id, title, quantity, item_pence, postage_pence, total_pence,
          payment_method, commission_pence, payment_cost_pence, seller_payout_pence,
          ship_name, ship_line1, ship_line2, ship_city, ship_postcode, ship_phone, provider)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19)
       returning *`,
      [
        args.buyer.id, l.shop_id, l.id, args.title, args.quantity, item, l.postage_pence, total,
        args.method, fees.commission, fees.paymentCost, fees.sellerPayout,
        args.shipping.name, args.shipping.line1, args.shipping.line2, args.shipping.city,
        args.shipping.postcode, args.shipping.phone, mode,
      ],
    );
    const created = ins.rows[0];
    if (mode === "demo") {
      await c.query("update orders set status = 'paid', paid_at = now() where id = $1", [created.id]);
      await c.query("update listings set stock = stock - $2 where id = $1", [l.id, args.quantity]);
    }
    return created;
  });

  if (mode === "demo") return { orderId: order.id, redirectUrl: null };

  const session = await stripe.createCheckoutSession({
    orderId: order.id,
    orderNumber: order.number,
    title: order.title,
    quantity: order.quantity,
    itemPence: order.item_pence,
    postagePence: order.postage_pence,
    method: order.payment_method,
    buyerEmail: args.buyer.email,
    successUrl: `${args.returnBase}/orders/${order.id}`,
    cancelUrl: `${args.returnBase}/l/${args.listingId}`,
  });
  await q("update orders set provider_ref = $2 where id = $1", [order.id, session.sessionId]);
  return { orderId: order.id, redirectUrl: session.url };
}

// Called by the Stripe webhook when the buyer's payment succeeds.
export async function markPaid(orderId: string, paymentIntentId: string) {
  await tx(async (c) => {
    const { rows } = await c.query<Order>(
      `update orders set status = 'paid', paid_at = now(), provider_ref = $2
        where id = $1 and status = 'pending' returning *`,
      [orderId, paymentIntentId],
    );
    const o = rows[0];
    if (o?.listing_id) {
      await c.query("update listings set stock = greatest(stock - $2, 0) where id = $1", [
        o.listing_id,
        o.quantity,
      ]);
    }
  });
}

export async function markDispatched(args: {
  orderId: string;
  shopId: string;
  carrier: string;
  tracking: string;
}) {
  return one<Order>(
    `update orders
        set status = 'dispatched', dispatched_at = now(), tracking_carrier = $3, tracking_number = $4
      where id = $1 and shop_id = $2 and status = 'paid' returning *`,
    [args.orderId, args.shopId, args.carrier || null, args.tracking || null],
  );
}

// The buyer confirms receipt (or the admin does it for them).
export async function markDelivered(orderId: string, buyerId?: string) {
  return one<Order>(
    `update orders set status = 'delivered', delivered_at = now()
      where id = $1 and status = 'dispatched' and ($2::uuid is null or buyer_id = $2) returning *`,
    [orderId, buyerId ?? null],
  );
}

// Pay the seller. In Stripe mode this moves the money; in demo mode it only
// records that it would have.
export async function releaseOrder(orderId: string) {
  const o = await one<Order & { stripe_account_id: string | null }>(
    `select o.*, s.stripe_account_id from orders o join shops s on s.id = o.shop_id
      where o.id = $1 and o.status = 'delivered'`,
    [orderId],
  );
  if (!o) return null;
  if (o.provider === "stripe") {
    if (!o.stripe_account_id || !o.provider_ref) return null; // seller has no bank account linked yet
    await stripe.transferToSeller({
      orderId: o.id,
      paymentIntentId: o.provider_ref,
      destinationAccount: o.stripe_account_id,
      amountPence: o.seller_payout_pence,
    });
  }
  return one<Order>(
    "update orders set status = 'released', released_at = now() where id = $1 and status = 'delivered' returning *",
    [orderId],
  );
}

// Releases every delivered order whose inspection window has passed.
// Runs whenever the admin or a seller opens their panel.
export async function releaseDueOrders() {
  const { release_days } = await getSettings();
  const due = await q<{ id: string }>(
    `select id from orders
      where status = 'delivered' and delivered_at < now() - make_interval(days => $1::int)`,
    [release_days],
  );
  for (const o of due) {
    try {
      await releaseOrder(o.id);
    } catch (e) {
      console.error("release failed", o.id, e);
    }
  }
}

// Admin only, and only before the seller has been paid.
export async function refundOrder(orderId: string) {
  const o = await one<Order>(
    "select * from orders where id = $1 and status in ('paid', 'dispatched', 'delivered')",
    [orderId],
  );
  if (!o) return null;
  if (o.provider === "stripe" && o.provider_ref) await stripe.refundPayment(o.provider_ref);
  return tx(async (c) => {
    const { rows } = await c.query<Order>(
      `update orders set status = 'refunded', refunded_at = now()
        where id = $1 and status in ('paid', 'dispatched', 'delivered') returning *`,
      [orderId],
    );
    if (rows[0]?.listing_id) {
      await c.query("update listings set stock = stock + $2 where id = $1", [
        rows[0].listing_id,
        rows[0].quantity,
      ]);
    }
    return rows[0] ?? null;
  });
}
