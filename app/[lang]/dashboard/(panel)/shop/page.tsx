import { requireShop } from "@/lib/auth";
import type { Locale } from "@/lib/config";
import { getDict } from "@/lib/i18n";
import { paymentsMode } from "@/lib/payments";
import { sellerCanReceivePayouts } from "@/lib/payments/stripe";
import { connectPayouts, updateShop } from "@/lib/actions/shop";
import PhotoInput from "@/components/PhotoInput";
import ShopMark from "@/components/ShopMark";
import SubmitButton from "@/components/SubmitButton";

// Where a seller fills in everything buyers see on their shop page.
export default async function DashboardShop({ params, searchParams }: PageProps<"/[lang]/dashboard/shop">) {
  const lang = (await params).lang as Locale;
  const t = getDict(lang);
  const s = t.dash.s;
  const { shop } = await requireShop(lang);
  const sp = await searchParams;
  const live = paymentsMode() === "stripe";
  const connected = live && shop.stripe_account_id ? await sellerCanReceivePayouts(shop.stripe_account_id) : false;

  return (
    <div className="grid max-w-3xl gap-12">
      <form action={updateShop} className="grid gap-6">
        <input type="hidden" name="lang" value={lang} />
        <h2 className="text-4xl">{s.pageTitle}</h2>
        {sp.saved && <p className="notice" role="status">{s.saved}</p>}

        <div className="grid gap-6 sm:grid-cols-[auto_1fr] sm:items-start">
          <ShopMark name={shop.name} logoId={shop.logo_id} className="w-24 text-xl" />
          <div className="grid gap-2">
            <p className="label">{s.logo}</p>
            <PhotoInput name="logo" max={1} hint={s.logoHint} />
          </div>
        </div>

        <div className="grid gap-2">
          <p className="label">{s.cover}</p>
          {shop.cover_id && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={`/img/${shop.cover_id}`} alt="" className="h-28 w-72 bg-mist object-cover" />
          )}
          <PhotoInput name="cover" max={1} hint={s.coverHint} wide />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <label className="field">
            <span>{t.sell.bioTr}</span>
            <textarea className="input" name="bio_tr" maxLength={600} defaultValue={shop.bio_tr} lang="tr" />
          </label>
          <label className="field">
            <span>{t.sell.bioEn}</span>
            <textarea className="input" name="bio_en" maxLength={600} defaultValue={shop.bio_en} lang="en" />
          </label>
          <label className="field">
            <span>{s.deliveryTr}</span>
            <textarea className="input" name="delivery_tr" maxLength={800} defaultValue={shop.delivery_tr} lang="tr" />
          </label>
          <label className="field">
            <span>{s.deliveryEn}</span>
            <textarea className="input" name="delivery_en" maxLength={800} defaultValue={shop.delivery_en} lang="en" />
          </label>
          <label className="field">
            <span>{s.returnsTr}</span>
            <textarea className="input" name="returns_tr" maxLength={800} defaultValue={shop.returns_tr} lang="tr" />
          </label>
          <label className="field">
            <span>{s.returnsEn}</span>
            <textarea className="input" name="returns_en" maxLength={800} defaultValue={shop.returns_en} lang="en" />
          </label>
          <label className="field">
            <span>{s.collectionTr}</span>
            <textarea className="input" name="collection_note_tr" maxLength={500} defaultValue={shop.collection_note_tr} lang="tr" />
          </label>
          <label className="field">
            <span>{s.collectionEn}</span>
            <textarea className="input" name="collection_note_en" maxLength={500} defaultValue={shop.collection_note_en} lang="en" />
          </label>
          <p className="hint -mt-2 sm:col-span-2">{s.collectionHint}</p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <label className="field">
            <span>{t.sell.phone}</span>
            <input className="input" type="tel" name="phone" defaultValue={shop.phone} />
          </label>
          <label className="field">
            <span>{s.publicEmail}</span>
            <input className="input" type="email" name="public_email" defaultValue={shop.public_email ?? ""} />
          </label>
          <label className="field">
            <span>{t.sell.website}</span>
            <input className="input" name="website" inputMode="url" defaultValue={shop.website ?? ""} />
          </label>
          <label className="field">
            <span>{t.sell.instagram}</span>
            <input className="input" name="instagram" defaultValue={shop.instagram ?? ""} />
          </label>
        </div>
        <label className="flex cursor-pointer items-center gap-3">
          <input type="checkbox" name="show_phone" defaultChecked={shop.show_phone} />
          <span>{s.showPhone}</span>
        </label>

        {/* Checked at approval, so shown here but not editable. */}
        <div className="rounded-2xl bg-mist p-5">
          <p className="font-medium">{t.shop.details}</p>
          <p className="mt-2 text-sm">
            {shop.legal_name}
            {shop.company_number ? ` (${shop.company_number})` : ""}
            {shop.vat_number ? `, VAT ${shop.vat_number}` : ""}
          </p>
          <p className="text-sm">
            {shop.address}, {shop.city} {shop.postcode}
          </p>
          <p className="hint mt-2">{s.detailsNote}</p>
        </div>

        <div><SubmitButton>{s.save}</SubmitButton></div>
      </form>

      <section className="border-t border-line pt-8">
        <h2 className="text-3xl">{s.payouts}</h2>
        {!live ? (
          <p className="mt-3 text-soft">{s.payoutsDemo}</p>
        ) : connected ? (
          <p className="notice mt-4">{s.payoutsConnected}</p>
        ) : (
          <form action={connectPayouts} className="mt-4">
            <input type="hidden" name="lang" value={lang} />
            <SubmitButton>{s.payoutsConnect}</SubmitButton>
          </form>
        )}
      </section>
    </div>
  );
}
