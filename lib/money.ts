import { PAYMENT_COST, type Settings } from "./config";

export type PaymentMethod = "card" | "klarna";

export const formatGBP = (pence: number) =>
  new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    minimumFractionDigits: pence % 100 === 0 ? 0 : 2,
  }).format(pence / 100);

// "149.99" or "149,99" -> 14999. Returns null when it is not a price.
export function parsePounds(input: string): number | null {
  const cleaned = input.trim().replace("£", "").replace(",", ".");
  if (!/^\d+(\.\d{1,2})?$/.test(cleaned)) return null;
  return Math.round(parseFloat(cleaned) * 100);
}

const pct = (amount: number, bps: number) => Math.round((amount * bps) / 10000);

// The whole fee model in one function. `total` is item plus postage.
//  - commission: what the platform keeps from the sale
//  - paymentCost: what the payment provider charges the platform
//  - sellerPayout: what reaches the seller
//  - platformNet: commission less payment cost
export function computeFees(args: {
  total: number;
  method: PaymentMethod;
  founding: boolean;
  settings: Settings;
}) {
  const { total, method, founding, settings: s } = args;
  let commission: number;
  if (founding) {
    commission =
      method === "klarna"
        ? pct(total, s.founding_klarna_bps) + s.founding_klarna_fixed
        : pct(total, s.founding_card_bps) + s.founding_card_fixed;
  } else {
    commission = pct(total, method === "klarna" ? s.klarna_bps : s.card_bps);
  }
  const cost = PAYMENT_COST[method];
  const paymentCost = pct(total, cost.bps) + cost.fixed;
  return {
    commission,
    paymentCost,
    sellerPayout: total - commission,
    platformNet: commission - paymentCost,
  };
}

export function instalmentsAllowed(
  listing: { instalments: boolean },
  total: number,
  s: Settings,
) {
  return listing.instalments && total >= s.instalments_min && total <= s.instalments_max;
}
