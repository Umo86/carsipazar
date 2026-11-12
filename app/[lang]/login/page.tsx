import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getUser } from "@/lib/auth";
import { isLocale } from "@/lib/config";
import { getDict } from "@/lib/i18n";
import { login } from "@/lib/actions/auth";
import { safeNext } from "@/lib/actions/util";
import SubmitButton from "@/components/SubmitButton";

export default async function LoginPage({ params, searchParams }: PageProps<"/[lang]/login">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDict(lang);
  const sp = await searchParams;
  const next = safeNext(typeof sp.next === "string" ? sp.next : "", `/${lang}`);
  if (await getUser()) redirect(`/${lang}`);

  return (
    <div className="wrap max-w-md pt-16">
      <h1 className="text-5xl">{t.auth.loginTitle}</h1>
      {sp.reset && <p className="notice mt-6" role="status">{t.account.resetDone}</p>}
      {sp.error && (
        <p className="notice notice-error mt-6" role="alert">
          {sp.error === "locked" ? t.auth.errLocked : sp.error === "blocked" ? t.auth.errBlocked : t.auth.errInvalid}
        </p>
      )}
      <form action={login} className="mt-8 grid gap-5">
        <input type="hidden" name="lang" value={lang} />
        <input type="hidden" name="next" value={next} />
        <label className="field">
          <span>{t.auth.email}</span>
          <input className="input" type="email" name="email" autoComplete="email" required />
        </label>
        <label className="field">
          <span>{t.auth.password}</span>
          <input className="input" type="password" name="password" autoComplete="current-password" required />
        </label>
        <SubmitButton>{t.auth.login}</SubmitButton>
      </form>
      <p className="hint mt-4">
        {t.auth.forgot}{" "}
        <Link href={`/${lang}/contact`} className="underline underline-offset-4">{t.auth.forgotLink}</Link>{" "}
        {t.auth.forgotAfter}
      </p>
      <p className="mt-6 text-soft">
        {t.auth.noAccount}{" "}
        <Link href={`/${lang}/register?next=${encodeURIComponent(next)}`} className="text-ink underline underline-offset-4">
          {t.auth.register}
        </Link>
      </p>
    </div>
  );
}
