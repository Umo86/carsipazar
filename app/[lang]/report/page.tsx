import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getUser } from "@/lib/auth";
import { isLocale, type Locale } from "@/lib/config";
import { one } from "@/lib/db";
import { isUuidStrict, REPORT_KINDS, REPORT_REASONS_BY_KIND, type ReportKind } from "@/lib/admin-queries";
import { fmt, getDict, pick } from "@/lib/i18n";
import { submitReport } from "@/lib/actions/reports";
import Rating from "@/components/Rating";
import SubmitButton from "@/components/SubmitButton";

export async function generateMetadata({ params }: PageProps<"/[lang]/report">): Promise<Metadata> {
  const { lang } = await params;
  return { title: getDict(isLocale(lang) ? lang : "tr").report.title, robots: { index: false } };
}

// What is being reported, as long as the public can see it. Anything else is a 404.
async function target(kind: ReportKind, id: string, lang: Locale) {
  if (kind === "listing") {
    const l = await one<{ title_tr: string; title_en: string; shop: string; slug: string }>(
      `select l.title_tr, l.title_en, s.name as shop, s.slug from listings l join shops s on s.id = l.shop_id
        where l.id = $1 and l.status = 'active' and s.status = 'approved'`,
      [id],
    );
    return l && { title: pick(lang, l.title_tr, l.title_en).text, sub: l.shop, back: `/${lang}/l/${id}`, rating: null as number | null, comment: "" };
  }
  if (kind === "review") {
    const r = await one<{ rating: number; comment: string; shop: string; slug: string }>(
      `select r.rating, r.comment, s.name as shop, s.slug from reviews r join shops s on s.id = r.shop_id
        where r.id = $1 and r.status = 'published' and s.status = 'approved'`,
      [id],
    );
    return r && { title: r.shop, sub: "", back: `/${lang}/s/${r.slug}#reviews`, rating: r.rating as number | null, comment: r.comment.slice(0, 300) };
  }
  const s = await one<{ name: string; slug: string }>(
    "select name, slug from shops where id = $1 and status = 'approved'",
    [id],
  );
  return s && { title: s.name, sub: "", back: `/${lang}/s/${s.slug}`, rating: null as number | null, comment: "" };
}

export default async function ReportPage({ params, searchParams }: PageProps<"/[lang]/report">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDict(lang);
  const sp = await searchParams;
  const kind = typeof sp.kind === "string" && (REPORT_KINDS as readonly string[]).includes(sp.kind) ? (sp.kind as ReportKind) : null;
  const id = typeof sp.id === "string" ? sp.id : "";
  if (!kind || !isUuidStrict(id)) notFound();
  const [what, user] = await Promise.all([target(kind, id, lang), getUser()]);
  if (!what) notFound();
  const r = t.report;
  const errors: Record<string, string> = {
    reason: r.errReason,
    details: r.errDetails,
    long: r.errLong,
    email: r.errEmail,
    limit: r.errLimit,
  };
  const err = typeof sp.error === "string" && Object.hasOwn(errors, sp.error) ? errors[sp.error] : null;

  return (
    <div className="wrap max-w-2xl pt-12">
      <h1 className="text-5xl">{r.title}</h1>

      {sp.done ? (
        <div className="mt-8 rounded-3xl bg-sky p-7" role="status">
          <h2 className="text-3xl">{r.thanksTitle}</h2>
          <p className="mt-3 text-soft">{r.thanksBody}</p>
          <Link href={what.back} className="btn mt-6">{r.back}</Link>
        </div>
      ) : (
        <>
          <p className="mt-3 text-soft">{r.intro}</p>
          <div className="mt-8 rounded-3xl bg-mist p-6">
            <p className="text-sm text-soft">{r.what}</p>
            <p className="mt-1 text-sm text-soft">{r.kind[kind]}</p>
            <p className="mt-1 font-display text-2xl break-words">{what.title}</p>
            {what.sub && <p className="text-soft">{what.sub}</p>}
            {what.rating !== null && (
              <div className="mt-2">
                <Rating value={what.rating} />
                <span className="sr-only">{fmt(r.reviewBy, { rating: what.rating })}</span>
              </div>
            )}
            {what.comment && <p className="mt-2 break-words">{what.comment}</p>}
          </div>

          {err && <p className="notice notice-error mt-6" role="alert">{err}</p>}
          <form action={submitReport} className="mt-8 grid gap-6">
            <input type="hidden" name="lang" value={lang} />
            <input type="hidden" name="kind" value={kind} />
            <input type="hidden" name="id" value={id} />
            <label className="field">
              <span>{r.reason}</span>
              <select className="input" name="reason" required defaultValue="">
                <option value="" disabled>{r.choose}</option>
                {REPORT_REASONS_BY_KIND[kind].map((k) => (
                  <option key={k} value={k}>{r.reasons[k as keyof typeof r.reasons]}</option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>{r.details}</span>
              <textarea className="input" name="details" maxLength={1000} rows={5} aria-describedby="details-hint" />
              <span id="details-hint" className="hint !font-normal">{r.detailsHint}</span>
            </label>
            {!user && (
              <label className="field">
                <span>{r.email}</span>
                <input className="input" type="email" name="email" maxLength={200} autoComplete="email" aria-describedby="email-hint" />
                <span id="email-hint" className="hint !font-normal">{r.emailHint}</span>
              </label>
            )}
            <div><SubmitButton>{r.submit}</SubmitButton></div>
          </form>
        </>
      )}
    </div>
  );
}
