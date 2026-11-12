import Link from "next/link";
import { notFound } from "next/navigation";
import { getMyShop, getUser } from "@/lib/auth";
import { isLocale, isParcelSize } from "@/lib/config";
import { one } from "@/lib/db";
import { deliveryMode } from "@/lib/delivery";
import { fmt, getDict, parcelLimits } from "@/lib/i18n";
import type { Order } from "@/lib/orders";
import { isUuid } from "@/lib/queries";
import PrintButton from "@/components/PrintButton";

export const metadata = { robots: { index: false } };

// This page sits outside the seller panel's layout on purpose: anyone who is not
// the owning seller (a visitor, a buyer, another seller) gets a plain 404.
export default async function LabelPage({ params }: PageProps<"/[lang]/dashboard/orders/[id]/label">) {
  const { lang, id } = await params;
  if (!isLocale(lang) || !isUuid(id)) notFound();
  const user = await getUser();
  const shop = user ? await getMyShop(user.id) : null;
  if (!shop) notFound();
  const o = await one<Order>(
    `select * from orders where id = $1 and shop_id = $2 and delivery_method = 'platform'
        and label_ref is not null and status in ('paid', 'dispatched', 'delivered', 'released')`,
    [id, shop.id],
  );
  if (!o || !isParcelSize(o.parcel_size)) notFound();

  const t = getDict(lang);
  const L = t.dash.label;
  const test = deliveryMode() === "demo" || o.label_ref!.startsWith("TEST-");
  const digits = (o.tracking_number ?? "").replace(/\D/g, "");

  return (
    <div className="wrap py-10" data-label>
      {/* A6 on paper; what is left off the paper is set in app/globals.css. */}
      <style>{`
        @media print {
          @page { size: A6; margin: 0; }
          body:has([data-label]) main { padding: 0 !important; }
          [data-label] { padding: 0 !important; max-width: none !important; }
          [data-label] .label-card { border: 0 !important; margin: 0 !important; }
          * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
      `}</style>
      <p className="no-print mb-6 flex items-center gap-6">
        <Link href={`/${lang}/dashboard/orders#o-${o.id}`} className="text-sm underline underline-offset-4">
          {L.back}
        </Link>
        <PrintButton>{L.print}</PrintButton>
      </p>

      <div
        className="label-card mx-auto grid w-[105mm] min-h-[148mm] grid-rows-[auto_auto_1fr_auto] gap-3 border-2 border-ink bg-paper p-[5mm] text-[0.8rem] leading-snug text-ink"
      >
        {test ? (
          <p className="bg-ink px-2 py-2 text-center font-bold text-paper">{L.test}</p>
        ) : (
          <span />
        )}
        <div className="flex items-baseline justify-between border-b-2 border-ink pb-2">
          <p className="font-display text-2xl">{L.title}</p>
          <p className="text-right font-medium">
            {L.order} #{o.number}
          </p>
        </div>

        <div className="grid content-start gap-3">
          <div>
            <p className="text-[0.7rem] font-bold uppercase tracking-wide">{L.parcel}</p>
            <p>
              {fmt(t.delivery.parcel, { size: t.delivery.size[o.parcel_size] })}, {parcelLimits(t, o.parcel_size)}
            </p>
          </div>
          <div>
            <p className="text-[0.7rem] font-bold uppercase tracking-wide">{L.from}</p>
            <p className="whitespace-pre-line">
              {[shop.legal_name, shop.address, `${shop.city} ${shop.postcode}`].filter(Boolean).join("\n")}
            </p>
          </div>
          <div className="border-2 border-ink p-2">
            <p className="text-[0.7rem] font-bold uppercase tracking-wide">{L.to}</p>
            <p className="whitespace-pre-line text-base font-medium">
              {[o.ship_name, o.ship_line1, o.ship_line2, `${o.ship_city} ${o.ship_postcode}`, o.ship_phone]
                .filter(Boolean)
                .join("\n")}
            </p>
          </div>
        </div>

        <div className="border-t-2 border-ink pt-2">
          <p className="text-[0.7rem] font-bold uppercase tracking-wide">{L.tracking}</p>
          <p className="font-mono text-2xl font-bold tracking-wider">{o.tracking_number}</p>
          {/* Decoration only, drawn from the digits; it is not a scannable barcode. */}
          <div aria-hidden="true" className="mt-2 flex h-14 items-stretch">
            {[...digits].map((d, i) => (
              <span key={i} className="flex">
                <span className="bg-ink" style={{ width: `${2 + (Number(d) % 4) * 2}px` }} />
                <span style={{ width: `${2 + ((Number(d) + 2) % 3) * 2}px` }} />
                <span className="bg-ink" style={{ width: `${2 + (Number(d) % 2) * 2}px` }} />
                <span style={{ width: "4px" }} />
              </span>
            ))}
          </div>
          <p className="mt-2 text-[0.7rem]">
            {L.carrier}: {o.tracking_carrier} · {o.label_ref}
          </p>
        </div>
      </div>
    </div>
  );
}
