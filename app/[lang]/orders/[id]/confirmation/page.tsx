import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { isLocale } from "@/lib/config";
import { fmt, formatDate, getDict, orderStatus, pick } from "@/lib/i18n";
import { formatGBP } from "@/lib/money";
import { ownOrderForDocument } from "@/lib/panel-queries";
import { isUuidStrict as isUuid } from "@/lib/admin-queries";
import { getSiteDetails } from "@/lib/site-details";
import PrintButton from "@/components/PrintButton";
import PrintStyle from "@/components/PrintStyle";

export const metadata = { robots: { index: false } };

// A printable record of the order for the buyer. It sits outside the "My account" layout so the
// sidebar is not on the page. Only the buyer's own order opens; anyone else gets a plain 404.
// It never carries the handover code.
export default async function ConfirmationPage({ params }: PageProps<"/[lang]/orders/[id]/confirmation">) {
  const { lang, id } = await params;
  if (!isLocale(lang) || !isUuid(id)) notFound();
  const user = await requireUser(lang, `/${lang}/orders/${id}/confirmation`);
  const o = await ownOrderForDocument(id, user.id);
  if (!o || !["paid", "dispatched", "delivered", "released", "refunded"].includes(o.status)) notFound();

  const t = getDict(lang);
  const c = t.my.conf;
  const site = await getSiteDetails();
  const collection = o.fulfilment === "collection";
  const note = pick(lang, o.collection_note_tr, o.collection_note_en).text;
  const itemTotal = o.item_pence;
  const by = new Date(new Date(o.created_at).getTime() + 30 * 86400_000);
  const shopAddress = [o.shop_address, `${o.shop_city} ${o.shop_postcode}`].filter((x) => x.trim()).join("\n");
  const row = (label: string, value: React.ReactNode) => (
    <div className="grid gap-x-6 gap-y-0.5 py-1.5 sm:grid-cols-[11rem_1fr]">
      <dt className="text-sm text-soft">{label}</dt>
      <dd className="whitespace-pre-line">{value}</dd>
    </div>
  );

  return (
    <div className="wrap max-w-3xl py-10" data-doc="confirmation">
      <PrintStyle />
      <p className="no-print mb-8 flex flex-wrap items-center gap-6">
        <Link href={`/${lang}/orders/${o.id}`} className="text-sm underline underline-offset-4">{c.back}</Link>
        <PrintButton>{c.print}</PrintButton>
      </p>

      <h1 className="text-4xl md:text-5xl">{c.title}</h1>
      <p className="no-print mt-3 text-soft">{c.lead}</p>

      <dl className="mt-8 border-t border-line pt-4">
        {row(c.orderNo, `#${o.number}`)}
        {row(c.placedOn, formatDate(new Date(o.created_at), lang))}
        {row(c.status, orderStatus(t, o))}
      </dl>

      <section className="mt-8 border-t border-line pt-6">
        <h2 className="text-2xl">{c.sellerTitle}</h2>
        <dl className="mt-3" data-seller>
          {row(c.tradingName, o.shop_name)}
          {o.shop_legal_name.trim() && row(c.legalName, o.shop_legal_name)}
          {o.shop_company_number?.trim() && row(c.companyNo, o.shop_company_number)}
          {o.shop_vat_number?.trim() && row(c.vatNo, o.shop_vat_number)}
          {shopAddress && row(c.address, shopAddress)}
          {o.shop_public_email?.trim() && row(c.email, o.shop_public_email)}
          {o.shop_show_phone && o.shop_phone.trim() && row(c.phone, o.shop_phone)}
        </dl>
      </section>

      <section className="mt-8 border-t border-line pt-6">
        <h2 className="text-2xl">{c.itemsTitle}</h2>
        <dl className="mt-3">
          {row(c.item, `${o.title} × ${o.quantity}`)}
          {row(c.itemPrice, <span className="tabular-nums">{formatGBP(itemTotal)}</span>)}
          {row(
            c.delivery,
            collection ? c.collectionFree : <span className="tabular-nums">{o.postage_pence === 0 ? t.checkout.free : formatGBP(o.postage_pence)}</span>,
          )}
          {row(c.total, <strong className="tabular-nums">{formatGBP(o.total_pence)}</strong>)}
          {row(c.payment, t.orders.paidWith[o.payment_method])}
        </dl>
      </section>

      <section className="mt-8 border-t border-line pt-6">
        <h2 className="text-2xl">{collection ? t.orders.collectFrom : t.orders.shipTo}</h2>
        <p className="mt-3 whitespace-pre-line">
          {collection
            ? [o.shop_name, o.shop_address, `${o.shop_city} ${o.shop_postcode}`].filter((x) => x.trim()).join("\n")
            : [o.ship_name, o.ship_line1, o.ship_line2, `${o.ship_city} ${o.ship_postcode}`].filter((x) => x.trim()).join("\n")}
        </p>
        {collection && note && <p className="mt-3 whitespace-pre-line text-soft">{note}</p>}
        <h3 className="mt-6 text-xl">{c.deliveryTime}</h3>
        <p className="mt-1">
          {collection ? c.collectTimeBody : fmt(c.deliveryTimeBody, { date: formatDate(by, lang) })}
        </p>
      </section>

      <section className="mt-8 border-t border-line pt-6">
        <h2 className="text-2xl">{c.rightsTitle}</h2>
        <h3 className="mt-4 text-xl">{c.cancelTitle}</h3>
        <p className="mt-1">{c.cancelBody}</p>
        <h3 className="mt-4 text-xl">{c.faultyTitle}</h3>
        <p className="mt-1">{c.faultyBody}</p>
        <p className="mt-4">
          <Link href={`/${lang}/help/returns`} className="underline underline-offset-4 hover:text-cobalt">{c.moreRights}</Link>
          <span className="hidden print:inline"> /{lang}/help/returns</span>
        </p>
      </section>

      <section className="mt-8 border-t border-line pt-6">
        <h2 className="text-2xl">{c.contactTitle}</h2>
        <p className="mt-2">{fmt(c.contactBody, { n: `#${o.number}` })}</p>
        <dl className="mt-3">
          {row(c.contactSeller, [o.shop_name, o.shop_public_email?.trim() ?? ""].filter(Boolean).join("\n"))}
          {row(
            c.contactUs,
            <>
              {site.email.trim() && <span className="block">{site.email.trim()}</span>}
              <Link href={`/${lang}/contact`} className="underline underline-offset-4 hover:text-cobalt">{c.contactPage}</Link>
            </>,
          )}
        </dl>
      </section>
    </div>
  );
}
