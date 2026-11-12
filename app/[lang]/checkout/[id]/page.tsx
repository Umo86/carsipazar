import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getAddress, requireUser } from "@/lib/auth";
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
  const wantsCollection = sp.how === "collection";
  const user = await requireUser(lang, `/${lang}/checkout/${id}?qty=${qty}${wantsCollection ? "&how=collection" : ""}`);

  const l = await getListing(id);
  if (!l) notFound();
  if (l.status !== "active" || l.shop_status !== "approved" || l.shop_owner === user.id) {
    redirect(`/${lang}/l/${id}`);
  }
  const [images, settings, saved] = await Promise.all([
    listingImageIds(l.id),
    getSettings(),
    getAddress(user.id),
  ]);
  // "no" items ignore ?how=collection; "only" items always collect; "optional" follows the link.
  const collect = l.collection === "only" || (l.collection === "optional" && wantsCollection);
  const item = l.price_pence * qty;
  const postage = collect ? 0 : l.postage_pence;
  const total = item + postage;
  const klarna = !collect && instalmentsAllowed(l, total, settings);
  const title = pick(lang, l.title_tr, l.title_en).text;
  const error =
    sp.error === "stock" ? t.checkout.errStock
    : sp.error === "fields" ? t.checkout.errFields
    : sp.error === "collectfields" ? t.checkout.errCollectFields
    : sp.error === "how" ? t.checkout.errHow
    : sp.error ? t.checkout.errUnavailable
    : null;
  const base = `/${lang}/checkout/${l.id}?qty=${qty}`;
  const shopNote = pick(lang, l.collection_note_tr, l.collection_note_en).text;
  const sw = (on: boolean) => `btn btn-sm ${on ? "" : "btn-ghost"}`;

  const radio =
    "flex cursor-pointer items-start gap-3 rounded-2xl border border-line p-5 transition-colors duration-200 has-[:checked]:border-cobalt has-[:checked]:bg-sky";

  return (
    <div className="wrap pt-12">
      <h1 className="text-5xl">{t.checkout.title}</h1>
      {paymentsMode() === "demo" && <p className="notice mt-6">{t.checkout.demo}</p>}
      {error && <p className="notice notice-error mt-4" role="alert">{error}</p>}

      <form action={placeOrder} className="mt-10 grid gap-12 md:grid-cols-[3fr_2fr]">
        <input type="hidden" name="lang" value={lang} />
        <input type="hidden" name="listing" value={l.id} />
        <input type="hidden" name="qty" value={qty} />
        {collect && <input type="hidden" name="how" value="collection" />}

        <div className="grid gap-10">
          {l.collection === "optional" && (
            <nav aria-label={t.checkout.howTitle} className="grid gap-3">
              <p className="font-display text-3xl">{t.checkout.howTitle}</p>
              <div className="flex flex-wrap gap-2">
                <Link href={base} className={sw(!collect)} aria-current={collect ? undefined : "page"} data-how="delivery">
                  {t.checkout.howDelivery}
                </Link>
                <Link href={`${base}&how=collection`} className={sw(collect)} aria-current={collect ? "page" : undefined} data-how="collection">
                  {t.checkout.howCollection}
                </Link>
              </div>
            </nav>
          )}

          {collect ? (
          <fieldset className="grid gap-5">
            <legend className="mb-4 font-display text-3xl">{t.checkout.collectTitle}</legend>
            <div className="rounded-2xl bg-mist p-5" data-collection-shop>
              <p className="text-sm text-soft">{t.checkout.collectWhere}</p>
              <p className="mt-1 font-medium">{l.shop_name}</p>
              <p>{l.shop_address}, {l.shop_city} {l.shop_postcode}</p>
              {shopNote && (
                <>
                  <p className="mt-4 text-sm text-soft">{t.checkout.collectNote}</p>
                  <p className="mt-1 whitespace-pre-line">{shopNote}</p>
                </>
              )}
            </div>
            <p className="font-display text-2xl">{t.checkout.collectYou}</p>
            <label className="field">
              <span>{t.checkout.name}</span>
              <input className="input" name="name" autoComplete="name" defaultValue={user.name} required />
            </label>
            <label className="field">
              <span>{t.checkout.phone}</span>
              <input className="input" type="tel" name="phone" autoComplete="tel" defaultValue={saved?.ship_phone} required />
            </label>
            <p className="hint">{t.checkout.collectCode}</p>
          </fieldset>
          ) : (
          <fieldset className="grid gap-5">
            <legend className="mb-4 font-display text-3xl">{t.checkout.shipTo}</legend>
            <label className="field">
              <span>{t.checkout.name}</span>
              <input className="input" name="name" autoComplete="name" defaultValue={user.name} required />
            </label>
            <label className="field">
              <span>{t.checkout.line1}</span>
              <input className="input" name="line1" autoComplete="address-line1" defaultValue={saved?.ship_line1} required />
            </label>
            <label className="field">
              <span>{t.checkout.line2}</span>
              <input className="input" name="line2" autoComplete="address-line2" defaultValue={saved?.ship_line2} />
            </label>
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="field">
                <span>{t.checkout.city}</span>
                <input className="input" name="city" autoComplete="address-level2" defaultValue={saved?.ship_city} required />
              </label>
              <label className="field">
                <span>{t.checkout.postcode}</span>
                <input className="input" name="postcode" autoComplete="postal-code" defaultValue={saved?.ship_postcode} required />
              </label>
            </div>
            <label className="field">
              <span>{t.checkout.phone}</span>
              <input className="input" type="tel" name="phone" autoComplete="tel" defaultValue={saved?.ship_phone} required />
            </label>
            <label className="flex items-center gap-3">
              <input type="checkbox" name="save_address" defaultChecked className="h-4 w-4" />
              <span>{t.account.saveForNext}</span>
            </label>
          </fieldset>
          )}

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
              // A collection order is card only; it simply does not offer the option.
              !collect && <p className="hint">{t.checkout.klarnaOff}</p>
            )}
          </fieldset>
        </div>

        <aside className="h-fit rounded-3xl bg-mist p-7 md:sticky md:top-28">
          <h2 className="text-3xl">{t.checkout.summary}</h2>
          <div className="mt-5 flex gap-4">
            {images[0] && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={`/img/${images[0].id}`} alt="" className="h-28 w-[5.6rem] shrink-0 rounded-lg object-cover" />
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
            {collect ? (
              <>
                <dt className="text-soft">{t.checkout.collectRow}</dt>
                <dd>{t.checkout.free}</dd>
              </>
            ) : (
              <>
                <dt className="text-soft">
                  {t.checkout.postage}
                  <span className="block text-sm" data-delivery={l.delivery_method}>{t.delivery.by[l.delivery_method]}</span>
                </dt>
                <dd>{l.postage_pence === 0 ? t.listing.freePostage : formatGBP(l.postage_pence)}</dd>
              </>
            )}
            <dt className="mt-2 border-t border-line pt-3 font-medium">{t.checkout.total}</dt>
            <dd className="mt-2 border-t border-line pt-3 font-medium">{formatGBP(total)}</dd>
          </dl>
          <SubmitButton className="btn mt-6 w-full">{fmt(t.checkout.pay, { amount: formatGBP(total) })}</SubmitButton>
          <p className="hint mt-3">{collect ? t.checkout.protectedNoteCollection : t.checkout.protectedNote}</p>
        </aside>
      </form>
    </div>
  );
}
