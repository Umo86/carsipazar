import { requireAdmin } from "@/lib/auth";
import type { Locale } from "@/lib/config";
import { fmt, getDict } from "@/lib/i18n";
import { getSiteDetails, SITE_DETAIL_KEYS, SITE_DETAIL_MAX } from "@/lib/site-details";
import { saveSiteDetailsForm } from "@/lib/actions/admin";
import SubmitButton from "@/components/SubmitButton";

export default async function AdminSite({ params, searchParams }: PageProps<"/[lang]/admin/site">) {
  const lang = (await params).lang as Locale;
  const t = getDict(lang);
  await requireAdmin(lang);
  const sp = await searchParams;
  const d = await getSiteDetails();
  const x = t.adminx.si;
  const bad = typeof sp.key === "string" && (SITE_DETAIL_KEYS as readonly string[]).includes(sp.key) ? sp.key : null;
  const badLabel = bad ? x.f[bad as keyof typeof x.f].label : "";
  const isEmail = (k: string) => k === "email" || k === "complaints_email";

  return (
    <div className="max-w-2xl">
      <p className="rounded-3xl bg-sky p-6 text-[0.9375rem]">{x.intro}</p>
      {sp.saved && <p className="notice mt-6" role="status">{x.saved}</p>}
      {sp.error === "email" && badLabel && (
        <p className="notice notice-error mt-6" role="alert">{fmt(x.errEmail, { field: badLabel })}</p>
      )}
      {sp.error === "long" && badLabel && (
        <p className="notice notice-error mt-6" role="alert">{fmt(x.errLong, { field: badLabel })}</p>
      )}
      <form action={saveSiteDetailsForm} className="mt-8 grid gap-6">
        <input type="hidden" name="lang" value={lang} />
        {SITE_DETAIL_KEYS.map((k) => (
          <label key={k} className="field">
            <span>{x.f[k].label}</span>
            <input
              className="input"
              name={k}
              type={isEmail(k) ? "email" : "text"}
              defaultValue={d[k]}
              maxLength={SITE_DETAIL_MAX}
              aria-describedby={`${k}-hint`}
              autoComplete="off"
            />
            <span id={`${k}-hint`} className="hint !font-normal">{x.f[k].hint}</span>
          </label>
        ))}
        <div><SubmitButton>{t.admin.save}</SubmitButton></div>
      </form>
    </div>
  );
}
