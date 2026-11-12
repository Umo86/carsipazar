import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import type { Locale } from "@/lib/config";
import { listReports, pageOf, pick1, REPORT_STATUSES, type ReportRow } from "@/lib/admin-queries";
import { formatDateTime } from "@/lib/admin-format";
import { fmt, getDict, pick, type Dict } from "@/lib/i18n";
import { resolveReport } from "@/lib/actions/reports";
import AdminPager from "@/components/AdminPager";
import Rating from "@/components/Rating";

function Target({ r, t, lang }: { r: ReportRow; t: Dict; lang: Locale }) {
  const x = t.adminx;
  if (r.kind === "listing") {
    if (!r.l_id) return <p className="text-soft">{x.gone}</p>;
    return (
      <p>
        <Link href={`/${lang}/l/${r.l_id}`} className="font-medium underline underline-offset-4 hover:text-cobalt">
          {pick(lang, r.l_title_tr ?? "", r.l_title_en ?? "").text}
        </Link>{" "}
        <span className="text-soft">{fmt(x.rp.itemOf, { shop: r.l_shop ?? "" })}</span>
        {r.l_status === "removed" && <span className="tag ml-2">{x.rp.removedNow}</span>}
      </p>
    );
  }
  if (r.kind === "review") {
    if (!r.rv_id) return <p className="text-soft">{x.gone}</p>;
    return (
      <div>
        <p className="flex flex-wrap items-center gap-x-3">
          <Rating value={r.rv_rating ?? 0} />
          <span className="text-soft">{fmt(x.rp.reviewOf, { shop: r.rv_shop ?? "" })}</span>
          {r.rv_status === "hidden" && <span className="tag">{x.rp.hiddenNow}</span>}
        </p>
        {r.rv_comment && <p className="mt-1 break-words">{r.rv_comment}</p>}
      </div>
    );
  }
  if (!r.s_id) return <p className="text-soft">{x.gone}</p>;
  return (
    <p>
      <Link href={`/${lang}/admin/sellers/${r.s_id}`} className="font-medium underline underline-offset-4 hover:text-cobalt">
        {r.s_name}
      </Link>{" "}
      <span className="text-soft">({t.status[r.s_status as "pending" | "approved" | "suspended"]})</span>
    </p>
  );
}

export default async function AdminReports({ params, searchParams }: PageProps<"/[lang]/admin/reports">) {
  const lang = (await params).lang as Locale;
  const t = getDict(lang);
  await requireAdmin(lang);
  const sp = await searchParams;
  const status = pick1(sp.status, REPORT_STATUSES) || "open";
  const page = pageOf(sp.page);
  const { rows, total } = await listReports({ status, page });
  const x = t.adminx;
  const path = `/${lang}/admin/reports`;
  const pill = (active: boolean) => `btn btn-sm ${active ? "" : "btn-ghost"}`;

  return (
    <div className="max-w-4xl">
      {sp.done && <p className="notice mb-6" role="status">{x.rp.ok}</p>}
      {sp.error === "note" && <p className="notice notice-error mb-6" role="alert">{x.rp.errNote}</p>}
      {sp.error === "gone" && <p className="notice notice-error mb-6" role="alert">{x.rp.errGone}</p>}
      <div className="flex flex-wrap gap-2" role="group" aria-label={x.rp.queue}>
        {REPORT_STATUSES.map((s) => (
          <Link key={s} href={`${path}?status=${s}`} className={pill(s === status)} aria-current={s === status ? "true" : undefined}>
            {x.rp[s]}
          </Link>
        ))}
      </div>

      {rows.length === 0 ? (
        <p className="mt-8 text-soft">{x.rp.empty}</p>
      ) : (
        <ul className="mt-6">
          {rows.map((r) => (
            <li key={r.id} className="border-t border-line py-6" data-report={r.id}>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className="tag">{x.rp.kind[r.kind]}</span>
                <span className="font-medium">{x.rp.reason[r.reason]}</span>
                <span className="text-sm text-soft tabular-nums">{formatDateTime(r.created_at, lang)}</span>
              </div>
              <div className="mt-3"><Target r={r} t={t} lang={lang} /></div>
              <p className="mt-3 text-[0.9375rem] break-words">
                {r.details ? r.details : <span className="text-soft">{x.rp.noDetails}</span>}
              </p>
              <p className="mt-2 text-sm text-soft break-words">
                {x.rp.reportedBy}:{" "}
                {r.reporter_user_id ? (
                  <Link href={`/${lang}/admin/customers/${r.reporter_user_id}`} className="underline underline-offset-4">
                    {r.reporter_name}, {r.reporter_account_email}
                  </Link>
                ) : r.reporter_email ? (
                  r.reporter_email
                ) : (
                  x.notLoggedIn
                )}
              </p>

              {r.status === "open" ? (
                <form action={resolveReport} className="mt-4 grid max-w-xl gap-3">
                  <input type="hidden" name="lang" value={lang} />
                  <input type="hidden" name="id" value={r.id} />
                  <label className="field">
                    <span>{x.rp.note}</span>
                    <textarea className="input" name="note" required maxLength={1000} rows={2} />
                    <span className="hint !font-normal">{x.rp.noteHint}</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {r.kind === "listing" && (
                      <button name="act" value="remove" className="btn btn-danger btn-sm">{x.rp.removeItem}</button>
                    )}
                    {r.kind === "review" && (
                      <button name="act" value="hide" className="btn btn-danger btn-sm">{x.rp.hideReview}</button>
                    )}
                    {r.kind === "shop" && r.s_id && (
                      <Link href={`/${lang}/admin/sellers/${r.s_id}`} className="btn btn-sm">{x.rp.openShop}</Link>
                    )}
                    <button name="act" value="dismiss" className="btn btn-ghost btn-sm">{x.rp.dismiss}</button>
                  </div>
                </form>
              ) : (
                <p className="mt-3 rounded-xl bg-mist px-4 py-3 text-[0.9375rem] break-words">
                  <span className="text-soft">{x.rp.resolved}{r.resolved_at ? `, ${formatDateTime(r.resolved_at, lang)}` : ""}:</span>{" "}
                  {r.resolution_note}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
      <AdminPager t={t} path={path} params={{ status }} page={page} total={total} />
    </div>
  );
}
