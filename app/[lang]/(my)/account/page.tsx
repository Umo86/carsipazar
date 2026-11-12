import Link from "next/link";
import { notFound } from "next/navigation";
import { getAddress, requireUser } from "@/lib/auth";
import { COLLECTION_MAX_ATTEMPTS, isLocale } from "@/lib/config";
import { fmt, formatDate, getDict, orderStatus } from "@/lib/i18n";
import { formatGBP } from "@/lib/money";
import { buyerOverview } from "@/lib/panel-queries";
import { changePassword, saveAddress, updateProfile } from "@/lib/actions/account";
import SubmitButton from "@/components/SubmitButton";

export const metadata = { robots: { index: false } };

export default async function AccountPage({ params, searchParams }: PageProps<"/[lang]/account">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDict(lang);
  const user = await requireUser(lang, `/${lang}/account`);
  const sp = await searchParams;
  const a = await getAddress(user.id);
  const ov = await buyerOverview(user.id);
  const m = t.my.ov;
  const note = (section: string) =>
    sp.saved === section && (
      <p className="notice mb-5" role="status">
        {section === "password" ? t.account.passwordChanged : t.account.saved}
      </p>
    );

  return (
    <div className="grid max-w-3xl gap-12">
      <dl className="grid grid-cols-2 gap-6" data-account-counts>
        <div className="rounded-2xl bg-mist p-5">
          <dt className="text-sm text-soft">{m.ordersCount}</dt>
          <dd className="mt-1 font-display text-4xl tabular-nums">
            <Link href={`/${lang}/orders`} className="hover:text-cobalt">{ov.orders}</Link>
          </dd>
        </div>
        <div className="rounded-2xl bg-mist p-5">
          <dt className="text-sm text-soft">{m.favCount}</dt>
          <dd className="mt-1 font-display text-4xl tabular-nums">
            <Link href={`/${lang}/favourites`} className="hover:text-cobalt">{ov.favs}</Link>
          </dd>
        </div>
      </dl>

      <section data-in-progress>
        <h2 className="text-3xl">{m.inProgress}</h2>
        {ov.inProgress.length === 0 ? (
          <p className="mt-3 text-soft">{m.inProgressNone}</p>
        ) : (
          <ul className="mt-3">
            {ov.inProgress.map((o) => (
              <li key={o.id} className="border-t border-line">
                <Link href={`/${lang}/orders/${o.id}`} className="group grid gap-1 py-4 sm:grid-cols-[1fr_auto] sm:gap-6">
                  <span>
                    <span className="block font-medium group-hover:underline underline-offset-4">{o.title} × {o.quantity}</span>
                    <span className="block text-sm text-soft">
                      {fmt(t.orders.order, { n: o.number })}, {o.shop_name}, {formatDate(new Date(o.created_at), lang)}
                    </span>
                    <span className="mt-1 block text-sm" data-next-step>
                      {o.status === "paid"
                        ? m.nextPaid
                        : o.fulfilment === "collection"
                          ? o.collection_attempts >= COLLECTION_MAX_ATTEMPTS
                            ? m.nextLocked
                            : m.nextCollect
                          : m.nextDelivery}
                    </span>
                  </span>
                  <span className="sm:text-right">
                    <span className="block tabular-nums">{formatGBP(o.total_pence)}</span>
                    <span className="block text-sm text-turq">{orderStatus(t, o)}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section data-to-review>
        <h2 className="text-3xl">{m.toReview}</h2>
        <p className="hint mt-1">{m.toReviewHint}</p>
        {ov.toReview.length === 0 ? (
          <p className="mt-3 text-soft">{m.toReviewNone}</p>
        ) : (
          <ul className="mt-3">
            {ov.toReview.map((o) => (
              <li key={o.id} className="flex flex-wrap items-center justify-between gap-3 border-t border-line py-4">
                <span>
                  <span className="block font-medium">{o.title} × {o.quantity}</span>
                  <span className="block text-sm text-soft">{fmt(t.orders.order, { n: o.number })}, {o.shop_name}</span>
                </span>
                <Link href={`/${lang}/orders/${o.id}#review`} className="btn btn-ghost btn-sm">{m.writeReview}</Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div id="details" className="grid scroll-mt-28 gap-6">
      <section className="panel p-7">
        <h2 className="mb-5 text-3xl">{t.account.profile}</h2>
        {note("profile")}
        {sp.error === "name" && <p className="notice notice-error mb-5" role="alert">{t.account.errName}</p>}
        <form action={updateProfile} className="grid gap-5">
          <input type="hidden" name="lang" value={lang} />
          <label className="field">
            <span>{t.auth.name}</span>
            <input className="input" name="name" autoComplete="name" defaultValue={user.name} required minLength={2} maxLength={80} />
          </label>
          <label className="field">
            <span>{t.auth.email}</span>
            <input className="input bg-mist text-soft" value={user.email} readOnly />
            <span className="hint font-normal">{t.account.emailFixed}</span>
          </label>
          <div><SubmitButton>{t.account.saveProfile}</SubmitButton></div>
        </form>
      </section>

      <section className="panel p-7">
        <h2 className="text-3xl">{t.account.address}</h2>
        <p className="hint mt-1 mb-5">{t.account.addressHint}</p>
        {note("address")}
        <form action={saveAddress} className="grid gap-5">
          <input type="hidden" name="lang" value={lang} />
          <label className="field">
            <span>{t.checkout.line1}</span>
            <input className="input" name="line1" autoComplete="address-line1" defaultValue={a?.ship_line1} />
          </label>
          <label className="field">
            <span>{t.checkout.line2}</span>
            <input className="input" name="line2" autoComplete="address-line2" defaultValue={a?.ship_line2} />
          </label>
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="field">
              <span>{t.checkout.city}</span>
              <input className="input" name="city" autoComplete="address-level2" defaultValue={a?.ship_city} />
            </label>
            <label className="field">
              <span>{t.checkout.postcode}</span>
              <input className="input" name="postcode" autoComplete="postal-code" defaultValue={a?.ship_postcode} />
            </label>
          </div>
          <label className="field">
            <span>{t.checkout.phone}</span>
            <input className="input" type="tel" name="phone" autoComplete="tel" defaultValue={a?.ship_phone} />
          </label>
          <div><SubmitButton>{t.account.saveAddress}</SubmitButton></div>
        </form>
      </section>

      <section className="panel p-7">
        <h2 className="mb-5 text-3xl">{t.account.password}</h2>
        {note("password")}
        {sp.error === "password" && <p className="notice notice-error mb-5" role="alert">{t.account.errPassword}</p>}
        <form action={changePassword} className="grid gap-5">
          <input type="hidden" name="lang" value={lang} />
          <label className="field">
            <span>{t.account.current}</span>
            <input className="input" type="password" name="current" autoComplete="current-password" required />
          </label>
          <label className="field">
            <span>{t.account.newPassword}</span>
            <input className="input" type="password" name="new" autoComplete="new-password" required minLength={8} />
            <span className="hint font-normal">{t.auth.passwordHint}</span>
          </label>
          <div><SubmitButton>{t.account.changePassword}</SubmitButton></div>
        </form>
      </section>
    </div>
    </div>
  );
}
