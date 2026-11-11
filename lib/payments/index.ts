import "server-only";

// Demo mode until Stripe keys are added to the environment. In demo mode no
// money moves: checkout marks the order as paid and "payouts" are ledger
// entries only. Everything else (holding, release, refunds, fees) runs the
// same code paths as live mode.
export const paymentsMode = (): "demo" | "stripe" =>
  process.env.STRIPE_SECRET_KEY ? "stripe" : "demo";
