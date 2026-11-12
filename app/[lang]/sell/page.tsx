import { notFound, redirect } from "next/navigation";
import { getMyShop, getUser } from "@/lib/auth";
import { isLocale } from "@/lib/config";
import { fmt, getDict } from "@/lib/i18n";
import { getSettings } from "@/lib/settings";
import { applyToSell } from "@/lib/actions/shop";
import SubmitButton from "@/components/SubmitButton";

export async function generateMetadata({ params }: PageProps<"/[lang]/sell">) {
  const { lang } = await params;
  return { title: getDict(isLocale(lang) ? lang : "tr").sell.title };
}

export default async function SellPage({ params, searchParams }: PageProps<"/[lang]/sell">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDict(lang);
  const sp = await searchParams;
  const user = await getUser();
  if (user && (await getMyShop(user.id))) redirect(`/${lang}/dashboard`);
  const s = await getSettings();
  const error =
    sp.error === "name" ? t.sell.errName
    : sp.error === "exists" ? t.auth.errExists
    : sp.error ? t.sell.errFields
    : null;

  return (
    <div className="wrap pt-12">
      <div className="grid gap-12 md:grid-cols-[2fr_3fr]">
        <div>
          <h1 className="text-5xl md:text-7xl">{t.sell.title}</h1>
          <p className="mt-5 text-lg text-soft">{t.sell.intro}</p>
          <ul className="mt-8 grid gap-6">
            {(
              [
                [t.sell.b1Title, t.sell.b1Body],
                [t.sell.b2Title, t.sell.b2Body],
                [t.sell.b3Title, t.sell.b3Body],
              ] as const
            ).map(([title, body]) => (
              <li key={title} className="rounded-2xl bg-mist p-6">
                <p className="font-display text-2xl">{title}</p>
                <p className="mt-1 text-soft">{body}</p>
              </li>
            ))}
          </ul>
          <p className="notice mt-8">
            {fmt(t.sell.fees, { card: s.card_bps / 100 })}
          </p>
        </div>

        <form action={applyToSell} className="grid h-fit gap-5">
          <input type="hidden" name="lang" value={lang} />
          {error && <p className="notice notice-error" role="alert">{error}</p>}

          {!user && (
            <fieldset className="grid gap-5">
              <legend className="mb-4 font-display text-3xl">{t.sell.account}</legend>
              <label className="field">
                <span>{t.auth.name}</span>
                <input className="input" name="name" autoComplete="name" required minLength={2} />
              </label>
              <div className="grid gap-5 sm:grid-cols-2">
                <label className="field">
                  <span>{t.auth.email}</span>
                  <input className="input" type="email" name="email" autoComplete="email" required />
                </label>
                <label className="field">
                  <span>{t.auth.password}</span>
                  <input className="input" type="password" name="password" autoComplete="new-password" required minLength={8} />
                  <span className="hint font-normal">{t.auth.passwordHint}</span>
                </label>
              </div>
            </fieldset>
          )}

          <fieldset className="grid gap-5">
            <legend className="mb-4 font-display text-3xl">{t.sell.shopDetails}</legend>
            <label className="field">
              <span>{t.sell.shopName}</span>
              <input className="input" name="shop_name" required minLength={3} maxLength={40} />
            </label>
            <label className="field">
              <span>{t.sell.sellerType}</span>
              <select className="input" name="seller_type" defaultValue="sole_trader">
                <option value="sole_trader">{t.shop.sole_trader}</option>
                <option value="business">{t.shop.business}</option>
              </select>
            </label>
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="field">
                <span>{t.sell.legalName}</span>
                <input className="input" name="legal_name" required />
              </label>
              <label className="field">
                <span>{t.sell.companyNumber}</span>
                <input className="input" name="company_number" />
              </label>
            </div>
            <label className="field">
              <span>{t.sell.address}</span>
              <input className="input" name="address" autoComplete="street-address" required />
              <span className="hint font-normal">{t.sell.addressHint}</span>
            </label>
            <div className="grid gap-5 sm:grid-cols-3">
              <label className="field">
                <span>{t.sell.city}</span>
                <input className="input" name="city" required />
              </label>
              <label className="field">
                <span>{t.sell.postcode}</span>
                <input className="input" name="postcode" required />
              </label>
              <label className="field">
                <span>{t.sell.phone}</span>
                <input className="input" type="tel" name="phone" required />
              </label>
            </div>
            <div className="grid gap-5 sm:grid-cols-3">
              <label className="field">
                <span>{t.sell.vatNumber}</span>
                <input className="input" name="vat_number" maxLength={20} />
              </label>
              <label className="field">
                <span>{t.sell.website}</span>
                <input className="input" name="website" inputMode="url" />
              </label>
              <label className="field">
                <span>{t.sell.instagram}</span>
                <input className="input" name="instagram" />
              </label>
            </div>
            <label className="field">
              <span>{t.sell.bioTr}</span>
              <textarea className="input" name="bio_tr" maxLength={600} lang="tr" />
            </label>
            <label className="field">
              <span>{t.sell.bioEn}</span>
              <textarea className="input" name="bio_en" maxLength={600} lang="en" />
            </label>
          </fieldset>
          <p className="hint">{t.sell.traderNote}</p>
          <div><SubmitButton>{t.sell.submit}</SubmitButton></div>
        </form>
      </div>
    </div>
  );
}
