import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getUser } from "@/lib/auth";
import { isLocale } from "@/lib/config";
import { getDict } from "@/lib/i18n";
import { register } from "@/lib/actions/auth";
import { safeNext } from "@/lib/actions/util";
import SubmitButton from "@/components/SubmitButton";

export default async function RegisterPage({ params, searchParams }: PageProps<"/[lang]/register">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDict(lang);
  const sp = await searchParams;
  const next = safeNext(typeof sp.next === "string" ? sp.next : "", `/${lang}`);
  if (await getUser()) redirect(`/${lang}`);
  const error = sp.error === "exists" ? t.auth.errExists : sp.error ? t.auth.errFields : null;

  return (
    <div className="wrap max-w-md pt-16">
      <h1 className="text-5xl">{t.auth.registerTitle}</h1>
      {error && <p className="notice notice-error mt-6" role="alert">{error}</p>}
      <form action={register} className="mt-8 grid gap-5">
        <input type="hidden" name="lang" value={lang} />
        <input type="hidden" name="next" value={next} />
        <label className="field">
          <span>{t.auth.name}</span>
          <input className="input" name="name" autoComplete="name" required minLength={2} />
        </label>
        <label className="field">
          <span>{t.auth.email}</span>
          <input className="input" type="email" name="email" autoComplete="email" required />
        </label>
        <label className="field">
          <span>{t.auth.password}</span>
          <input className="input" type="password" name="password" autoComplete="new-password" required minLength={8} />
          <span className="hint font-normal">{t.auth.passwordHint}</span>
        </label>
        <SubmitButton>{t.auth.register}</SubmitButton>
      </form>
      <p className="mt-6 text-soft">
        {t.auth.haveAccount}{" "}
        <Link href={`/${lang}/login?next=${encodeURIComponent(next)}`} className="text-ink underline underline-offset-4">
          {t.auth.login}
        </Link>
      </p>
    </div>
  );
}
