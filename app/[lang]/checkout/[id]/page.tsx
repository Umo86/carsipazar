import { notFound, redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { isLocale } from "@/lib/config";
import { fmt, getDict, pick } from "@/lib/i18n";
import { formatGBP, instalmentsAllowed } from "@/lib/money";
import { paymentsMode } from "@/lib/payments";
import { getListing, listingImageIds } from "@/lib/queries";
import { getSettings } from "@/lib/settings";
import { placeOrder } from "@/lib/actions/buy";
import SubmitButton from "@/components/SubmitButton";

export const metadata = { robots: { index: false } };

export default async function CheckoutPage({ params, searchParams }: PageProps<"/[lang]/checkout/[id]">) {
  const { lang, id } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDict(lang);
  const sp = await searchParams;
  const qty = Math.max(1, Math.min(20, parseInt(String(sp.qty ?? "1"), 10) || 1));
  const user = await requireUser(lang, `/${lang}/checkout/${id}?qty=${qty}`);

  const l = await getListing(id);
  if (!l) notFound();
  if (l.status !== "active" || l.shop_status !== "approved" || l.shop_owner === user.id) {
    redirect(`/${lang}/l/${id}`);
  }
  const [images, settings] = await Promise.all([listingImageIds(l.id), getSettings()]);
  const item = l.price_pence * qty;
  const total = item + l.postage_pence;
  const klarna = instalmentsAllowed(l, total, settings);
  const title = pick(lang, l.title_tr, l.title_en).text;
  const error =
    sp.error === "stock" ? t.checkout.errStock
    : sp.error === "fields" ? t.checkout.errFields
    : sp.error ? t.checkout.errUnavailable
    : null;

  const radio =
    "flex cursor-pointer items-start gap-3 rounded-md border border-[#b9b4a8] p-4 has-[:checked]:border-cobalt has-[:checked]:bg-mist";

  return (
    <div className="wrap pt-12">
      <h1 className="text-5xl">{t.checkout.title}</h1>
      {paymentsMode() === "demo" && <p className="notice mt-6">{t.checkout.demo}</p>}
      {error && <p className="notice notice-error mt-4" role="alert">{error}</p>}

      <form action={placeOrder} className="mt-10 grid gap-12 md:grid-cols-[3fr_2fr]">
        <input type="hidden" name="lang" value={lang} />
        <input type="hidden" name="listing" value={l.id} />
        <input type="hidden" name="qty" value={qty} />

        <div className="grid gap-10">
          <fieldset className="grid gap-5">
            <legend className="mb-4 font-display text-3xl">{t.checkout.shipTo}</legend>
            <label className="field">
              <span>{t.checkout.name}</span>
              <input className="input" name="name" autoComplete="name" defaultValue={user.name} required />
            </label>
            <label className="field">
              <span>{t.checkout.line1}</span>
              <input className="input" name="line1" autoComplete="address-line1" required />
            </label>
            <label className="field">
              <span>{t.checkout.line2}</span>
              <input className="input" name="line2" autoComplete="address-line2" />
            </label>
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="field">
                <span>{t.checkout.city}</span>
                <input className="input" name="city" autoComplete="address-level2" required />
              </label>
              <label className="field">
                <span>{t.checkout.postcode}</span>
                <input className="input" name="postcode" autoComplete="postal-code" required />
              </label>
            </div>
            <label className="field">
              <span>{t.checkout.phone}</span>
              <input className="input" type="tel" name="phone" autoComplete="tel" required />
            </label>
          </fieldset>

          <fieldset className="grid gap-3">
            <legend className="mb-4 font-display text-3xl">{t.checkout.payment}</legend>
            <label className={radio}>
              <input type="radio" name="method" value="card" defaultChecked className="mt-1.5" />
              <span>
                <span className="block font-medium">{t.checkout.card}</span>
                <span className="hint">{t.checkout.cardHint}</span>
              </span>
            </label>
            {klarna ? (
              <label className={radio}>
                <input type="radio" name="method" value="klarna" className="mt-1.5" />
                <span>
                  <span className="block font-medium">{t.checkout.klarna}</span>
                  <span className="hint">
                    {fmt(t.checkout.klarnaHint, { first: formatGBP(Math.ceil(total / 3)) })}
                  </span>
                </span>
              </label>
            ) : (
              <p className="hint">{t.checkout.klarnaOff}</p>
            )}
          </fieldset>
        </div>

        <aside className="h-fit rounded-3xl bg-mist p-7 md:sticky md:top-28">
          <h2 className="text-3xl">{t.checkout.summary}</h2>
          <div className="mt-5 flex gap-4">
            {images[0] && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={`/img/${images[0].id}`} alt="" className="h-28 w-[5.6rem] shrink-0 object-cover" />
            )}
            <div>
              <p className="leading-snug">{title}</p>
              <p className="mt-1 text-sm text-soft">{l.shop_name}</p>
              <p className="mt-1 text-sm text-soft">
                {t.listing.quantity}: {qty}
              </p>
            </div>
          </div>
          <dl className="mt-6 grid grid-cols-[1fr_auto] gap-y-2">
            <dt className="text-soft">{t.checkout.item}</dt>
            <dd>{formatGBP(item)}</dd>
            <dt className="text-soft">{t.checkout.postage}</dt>
            <dd>{l.postage_pence === 0 ? t.listing.freePostage : formatGBP(l.postage_pence)}</dd>
            <dt className="mt-2 border-t border-line pt-3 font-medium">{t.checkout.total}</dt>
            <dd className="mt-2 border-t border-line pt-3 font-medium">{formatGBP(total)}</dd>
          </dl>
          <SubmitButton className="btn mt-6 w-full">{fmt(t.checkout.pay, { amount: formatGBP(total) })}</SubmitButton>
          <p className="hint mt-3">{t.checkout.protectedNote}</p>
        </aside>
      </form>
    </div>
  );
}
