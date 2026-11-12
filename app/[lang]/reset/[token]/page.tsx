import { notFound } from "next/navigation";
import { hashToken } from "@/lib/auth";
import { isLocale } from "@/lib/config";
import { one } from "@/lib/db";
import { getDict } from "@/lib/i18n";
import { resetPassword } from "@/lib/actions/account";
import SubmitButton from "@/components/SubmitButton";

export const metadata = { robots: { index: false }, referrer: "no-referrer" as const };

export default async function ResetPage({ params, searchParams }: PageProps<"/[lang]/reset/[token]">) {
  const { lang, token } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDict(lang);
  const sp = await searchParams;
  const valid = await one(
    "select 1 from password_resets where token_hash = $1 and used_at is null and expires_at > now()",
    [hashToken(token)],
  );

  return (
    <div className="wrap max-w-md pt-16">
      <h1 className="text-5xl">{t.account.resetTitle}</h1>
      {!valid ? (
        <p className="notice notice-error mt-6" role="alert">{t.account.resetInvalid}</p>
      ) : (
        <form action={resetPassword} className="mt-8 grid gap-5">
          <input type="hidden" name="lang" value={lang} />
          <input type="hidden" name="token" value={token} />
          {sp.error && <p className="notice notice-error" role="alert">{t.auth.passwordHint}</p>}
          <label className="field">
            <span>{t.account.newPassword}</span>
            <input className="input" type="password" name="password" autoComplete="new-password" required minLength={8} />
            <span className="hint font-normal">{t.auth.passwordHint}</span>
          </label>
          <SubmitButton>{t.account.resetSubmit}</SubmitButton>
        </form>
      )}
    </div>
  );
}
