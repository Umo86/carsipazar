import Link from "next/link";
import { notFound } from "next/navigation";
import { getAddress, requireUser } from "@/lib/auth";
import { isLocale } from "@/lib/config";
import { getDict } from "@/lib/i18n";
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
  const note = (section: string) =>
    sp.saved === section && (
      <p className="notice mb-5" role="status">
        {section === "password" ? t.account.passwordChanged : t.account.saved}
      </p>
    );

  return (
    <div className="wrap max-w-3xl pt-10">
      <h1 className="text-5xl">{t.account.title}</h1>
      <p className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
        <Link href={`/${lang}/orders`} className="underline underline-offset-4 hover:text-cobalt">{t.nav.orders}</Link>
        <Link href={`/${lang}/favourites`} className="underline underline-offset-4 hover:text-cobalt">{t.account.favourites}</Link>
      </p>

      <section className="panel mt-8 p-7">
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

      <section className="panel mt-6 p-7">
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

      <section className="panel mt-6 p-7">
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
  );
}
