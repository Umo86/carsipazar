import "server-only";
import Stripe from "stripe";

// Real payments. Active only when STRIPE_SECRET_KEY is set; until then the
// site runs in demo mode (see ./index.ts).
//
// Model: "separate charges and transfers" on Stripe Connect. The buyer pays
// the platform, the money is held, and the seller's share is transferred to
// their connected account when the order is released.
//
// NOTE: written against Stripe's documented API but not yet run with real
// keys. Test every path in Stripe test mode before going live.

let client: Stripe | null = null;
const stripe = () => (client ??= new Stripe(process.env.STRIPE_SECRET_KEY!));

export async function createCheckoutSession(args: {
  orderId: string;
  orderNumber: number;
  title: string;
  quantity: number;
  itemPence: number; // total for all units
  postagePence: number;
  method: "card" | "klarna";
  buyerEmail: string;
  successUrl: string;
  cancelUrl: string;
}) {
  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [
    {
      quantity: args.quantity,
      price_data: {
        currency: "gbp",
        unit_amount: Math.round(args.itemPence / args.quantity),
        product_data: { name: args.title },
      },
    },
  ];
  if (args.postagePence > 0) {
    lineItems.push({
      quantity: 1,
      price_data: {
        currency: "gbp",
        unit_amount: args.postagePence,
        product_data: { name: "Postage" },
      },
    });
  }
  const session = await stripe().checkout.sessions.create({
    mode: "payment",
    // The buyer chose card or instalments on our checkout page, so Stripe is
    // limited to that one method. The price is the same either way: Klarna's
    // rules forbid a surcharge.
    allowed_payment_method_types: [args.method],
    line_items: lineItems,
    customer_email: args.buyerEmail,
    client_reference_id: args.orderId,
    metadata: { order_id: args.orderId },
    payment_intent_data: {
      transfer_group: args.orderId,
      metadata: { order_id: args.orderId, order_number: String(args.orderNumber) },
    },
    success_url: args.successUrl,
    cancel_url: args.cancelUrl,
  });
  return { url: session.url!, sessionId: session.id };
}

export function parseWebhook(body: string, signature: string) {
  return stripe().webhooks.constructEvent(
    body,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET!,
  );
}

// Pay the seller their share once the order is released.
export async function transferToSeller(args: {
  orderId: string;
  paymentIntentId: string;
  destinationAccount: string;
  amountPence: number;
}) {
  const pi = await stripe().paymentIntents.retrieve(args.paymentIntentId);
  const charge = typeof pi.latest_charge === "string" ? pi.latest_charge : pi.latest_charge?.id;
  return stripe().transfers.create({
    amount: args.amountPence,
    currency: "gbp",
    destination: args.destinationAccount,
    transfer_group: args.orderId,
    source_transaction: charge,
  });
}

export async function refundPayment(paymentIntentId: string) {
  return stripe().refunds.create({ payment_intent: paymentIntentId });
}

// Seller onboarding: Stripe collects ID and bank details on its own pages.
export async function createSellerAccount(args: { email: string; business: boolean }) {
  const account = await stripe().accounts.create({
    type: "express",
    country: "GB",
    email: args.email,
    business_type: args.business ? "company" : "individual",
    capabilities: { transfers: { requested: true } },
  });
  return account.id;
}

export async function sellerOnboardingLink(accountId: string, returnUrl: string) {
  const link = await stripe().accountLinks.create({
    account: accountId,
    refresh_url: returnUrl,
    return_url: returnUrl,
    type: "account_onboarding",
  });
  return link.url;
}

export async function sellerCanReceivePayouts(accountId: string) {
  const account = await stripe().accounts.retrieve(accountId);
  return Boolean(account.payouts_enabled);
}
