import { NextResponse } from "next/server";
import { markPaid } from "@/lib/orders";
import { parseWebhook } from "@/lib/payments/stripe";

// Stripe calls this when a buyer's payment succeeds. Unused in demo mode.
export async function POST(request: Request) {
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "payments not configured" }, { status: 503 });
  }
  const signature = request.headers.get("stripe-signature");
  if (!signature) return NextResponse.json({ error: "missing signature" }, { status: 400 });

  let event;
  try {
    event = parseWebhook(await request.text(), signature);
  } catch {
    return NextResponse.json({ error: "bad signature" }, { status: 400 });
  }

  if (
    event.type === "checkout.session.completed" ||
    event.type === "checkout.session.async_payment_succeeded"
  ) {
    const session = event.data.object;
    const orderId = session.metadata?.order_id;
    const pi = typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id;
    if (orderId && pi && session.payment_status === "paid") await markPaid(orderId, pi);
  }
  return NextResponse.json({ received: true });
}
