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
//  - deliveryCost: the part of the total that pays for CarsiPazar delivery (the
//    postage on a platform order, 0 when the seller delivers). The platform keeps
//    it, so commission is charged on the rest only.
//  - commission: what the platform keeps from the sale, on total less deliveryCost
//  - paymentCost: what the payment provider charges the platform, on the full total
//  - sellerPayout: total less deliveryCost less commission
//  - platformNet: commission less payment cost (delivery money is not profit)
export function computeFees(args: {
  total: number;
  method: PaymentMethod;
  founding: boolean;
  settings: Settings;
  deliveryCost?: number;
}) {
  const { total, method, founding, settings: s, deliveryCost = 0 } = args;
  if (!Number.isInteger(deliveryCost) || deliveryCost < 0 || deliveryCost > total) {
    throw new Error("delivery cost must be between 0 and the total");
  }
  const base = total - deliveryCost;
  let commission: number;
  if (founding) {
    commission =
      method === "klarna"
        ? pct(base, s.founding_klarna_bps) + s.founding_klarna_fixed
        : pct(base, s.founding_card_bps) + s.founding_card_fixed;
  } else {
    commission = pct(base, method === "klarna" ? s.klarna_bps : s.card_bps);
  }
  const cost = PAYMENT_COST[method];
  const paymentCost = pct(total, cost.bps) + cost.fixed;
  return {
    commission,
    paymentCost,
    deliveryCost,
    sellerPayout: base - commission,
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
