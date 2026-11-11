import { requireShop } from "@/lib/auth";
import type { Locale } from "@/lib/config";
import { getDict } from "@/lib/i18n";
import { paymentsMode } from "@/lib/payments";
import { sellerCanReceivePayouts } from "@/lib/payments/stripe";
import { connectPayouts, updateShop } from "@/lib/actions/shop";
import SubmitButton from "@/components/SubmitButton";

export default async function DashboardShop({ params, searchParams }: PageProps<"/[lang]/dashboard/shop">) {
  const lang = (await params).lang as Locale;
  const t = getDict(lang);
  const { shop } = await requireShop(lang);
  const sp = await searchParams;
  const live = paymentsMode() === "stripe";
  const connected = live && shop.stripe_account_id ? await sellerCanReceivePayouts(shop.stripe_account_id) : false;

  return (
    <div className="grid max-w-3xl gap-12">
      <form action={updateShop} className="grid gap-5">
        <input type="hidden" name="lang" value={lang} />
        {sp.saved && <p className="notice" role="status">{t.dash.s.saved}</p>}
        <label className="field">
          <span>{t.sell.bioTr}</span>
          <textarea className="input" name="bio_tr" maxLength={600} defaultValue={shop.bio_tr} lang="tr" />
        </label>
        <label className="field">
          <span>{t.sell.bioEn}</span>
          <textarea className="input" name="bio_en" maxLength={600} defaultValue={shop.bio_en} lang="en" />
        </label>
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="field">
            <span>{t.sell.instagram}</span>
            <input className="input" name="instagram" defaultValue={shop.instagram ?? ""} />
          </label>
          <label className="field">
            <span>{t.sell.phone}</span>
            <input className="input" type="tel" name="phone" defaultValue={shop.phone} />
          </label>
        </div>
        <div><SubmitButton>{t.dash.s.save}</SubmitButton></div>
      </form>

      <section className="border-t border-line pt-8">
        <h2 className="text-3xl">{t.dash.s.payouts}</h2>
        {!live ? (
          <p className="mt-3 text-soft">{t.dash.s.payoutsDemo}</p>
        ) : connected ? (
          <p className="notice mt-4">{t.dash.s.payoutsConnected}</p>
        ) : (
          <form action={connectPayouts} className="mt-4">
            <input type="hidden" name="lang" value={lang} />
            <SubmitButton>{t.dash.s.payoutsConnect}</SubmitButton>
          </form>
        )}
      </section>
    </div>
  );
}
