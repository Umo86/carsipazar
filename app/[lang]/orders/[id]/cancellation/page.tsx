import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { isLocale } from "@/lib/config";
import { returns } from "@/lib/content/help/returns";
import { fmt, formatDate, getDict } from "@/lib/i18n";
import { ownOrderForDocument } from "@/lib/panel-queries";
import { isUuidStrict as isUuid } from "@/lib/admin-queries";
import PrintButton from "@/components/PrintButton";
import PrintStyle from "@/components/PrintStyle";

export const metadata = { robots: { index: false } };

// The model cancellation form, filled in from the order, for the buyer to print and send to the
// seller. It does not cancel or refund anything. Only the buyer's own paid order opens.
export default async function CancellationPage({ params }: PageProps<"/[lang]/orders/[id]/cancellation">) {
  const { lang, id } = await params;
  if (!isLocale(lang) || !isUuid(id)) notFound();
  const user = await requireUser(lang, `/${lang}/orders/${id}/cancellation`);
  const o = await ownOrderForDocument(id, user.id);
  if (!o || !["paid", "dispatched", "delivered", "released"].includes(o.status)) notFound();

  const t = getDict(lang);
  const c = t.my.cancel;

  // The wording is the statutory model form from the returns page. Its first lines address the
  // seller and CarsiPazar generically; here the "To" line is filled in, so those two sentences
  // are dropped and the notice sentence is kept as written.
  const form = returns[lang].sections.flatMap((s) => s.blocks).find((b) => b.t === "form");
  if (!form || form.t !== "form") notFound();
  const notice = form.intro
    .split(/(?<=\.)\s+/)
    .filter((sentence) => !/^(To|Kime):/.test(sentence) && !sentence.includes("{{email}}"))
    .join(" ");
  // The first field is the "To" line, which is filled in above; the others line up with `values`.
  const labels = form.fields.slice(1).map((f) => f.replace(/\s*\[\*\]/g, ""));

  const received = o.delivered_at ? new Date(o.delivered_at) : null;
  const late = received !== null && o.window_over;
  const address = [o.shop_address, `${o.shop_city} ${o.shop_postcode}`].filter((x) => x.trim()).join(", ");
  const email = o.shop_public_email?.trim() ?? "";
  const toLine = [
    o.shop_legal_name.trim() || o.shop_name,
    o.shop_legal_name.trim() && o.shop_legal_name.trim() !== o.shop_name ? fmt(c.tradingAs, { name: o.shop_name }) : "",
    address,
    email,
  ].filter(Boolean);
  const buyerAddress =
    o.fulfilment === "delivery"
      ? [o.ship_line1, o.ship_line2, `${o.ship_city} ${o.ship_postcode}`].filter((x) => x.trim()).join(", ")
      : "";
  const values = [
    fmt(c.goodsValue, { title: o.title, qty: o.quantity, n: o.number }),
    `${fmt(c.orderedOn, { date: formatDate(new Date(o.created_at), lang) })} / ${
      received ? fmt(c.receivedOn, { date: formatDate(received, lang) }) : fmt(c.receivedOn, { date: c.blank })
    }`,
    o.ship_name || o.buyer_name,
    buyerAddress || "\u00a0",
    c.blank,
    c.blank,
  ];

  return (
    <div className="wrap max-w-3xl py-10" data-doc="cancellation">
      <PrintStyle />
      <p className="no-print mb-8 flex flex-wrap items-center gap-6">
        <Link href={`/${lang}/orders/${o.id}`} className="text-sm underline underline-offset-4">{c.back}</Link>
        <PrintButton>{c.print}</PrintButton>
      </p>

      <h1 className="text-4xl md:text-5xl">{c.title}</h1>
      <p className="mt-3 text-soft">{c.lead}</p>
      <p className="notice mt-5" data-no-cancel-notice>{c.notice}</p>
      {late && <p className="notice notice-error no-print mt-3" data-late role="alert">{c.late}</p>}
      {!received && <p className="hint mt-3 no-print">{c.notYet}</p>}

      <section className="mt-8 rounded-2xl border border-line p-6" data-form>
        <p className="font-medium">{c.to}:</p>
        <p className="mt-1 whitespace-pre-line" data-form-to>{toLine.join("\n")}</p>
        <p className="mt-5">{notice}</p>
        <dl className="mt-5 grid gap-4">
          {labels.map((label, i) => (
            <div key={i}>
              <dt className="text-sm text-soft">{label}</dt>
              <dd className="mt-1 min-h-6 border-b border-line pb-1">{values[i] ?? c.blank}</dd>
            </div>
          ))}
        </dl>
        {form.outro && <p className="mt-5 text-sm text-soft">{form.outro}</p>}
      </section>

      <section className="no-print mt-8">
        <h2 className="text-2xl">{c.howTitle}</h2>
        <ul className="mt-3 grid gap-2">
          <li>{email ? fmt(c.howEmail, { email }) : fmt(c.howPost, { address: [o.shop_legal_name || o.shop_name, address].filter(Boolean).join(", ") })}</li>
          <li>{c.howContact}</li>
        </ul>
        <p className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
          <Link href={`/${lang}/contact`} className="underline underline-offset-4 hover:text-cobalt">{c.contactLink}</Link>
          <Link href={`/${lang}/help/returns`} className="underline underline-offset-4 hover:text-cobalt">{c.returnsLink}</Link>
        </p>
      </section>
    </div>
  );
}
