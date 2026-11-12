import "server-only";
import { randomBytes, randomInt } from "node:crypto";
import type { Order } from "../orders";

// CarsiPazar delivery. The courier account does not exist yet, so everything
// runs in demo mode: labels are made by this site and marked as test labels.
// To go live, add the real provider here (see README, "Delivery"): switch
// deliveryMode() on its credentials and make createLabel() call it.
export const deliveryMode = (): "demo" | "live" => "demo";

export type Label = {
  carrier: string;
  trackingNumber: string;
  labelRef: string;
};

// The one function the rest of the site calls to buy a label. It runs inside
// the transaction that stores the result, so it must not use the database.
// Demo mode: a fake carrier name, "CP" and 12 digits, and a "TEST-" reference.
export async function createLabel(order: Pick<Order, "number">): Promise<Label> {
  if (deliveryMode() === "demo") {
    return {
      carrier: "CarsiPazar Delivery (test)",
      trackingNumber: `CP${String(randomInt(0, 1_000_000_000_000)).padStart(12, "0")}`,
      labelRef: `TEST-${order.number}-${randomBytes(2).toString("hex")}`,
    };
  }
  throw new Error("No delivery provider is connected");
}
