import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import type { Locale } from "@/lib/config";
import { listLog, pageOf } from "@/lib/admin-queries";
import { getDict } from "@/lib/i18n";
import ActivityLine from "@/components/ActivityLine";
import AdminPager from "@/components/AdminPager";

export default async function AdminActivity({ params, searchParams }: PageProps<"/[lang]/admin/activity">) {
  const lang = (await params).lang as Locale;
  const t = getDict(lang);
  await requireAdmin(lang);
  const sp = await searchParams;
  const page = pageOf(sp.page);
  const wanted = typeof sp.action === "string" ? sp.action.slice(0, 60) : "";
  const { rows, total, actions } = await listLog({ action: wanted, page });
  // Only an action that exists can be filtered on.
  const action = actions.includes(wanted) ? wanted : "";
  const x = t.adminx;
  const path = `/${lang}/admin/activity`;

  return (
    <div className="max-w-4xl">
      <form className="flex flex-wrap items-end gap-3" role="search">
        <label className="field">
          <span>{x.ac.filter}</span>
          <select className="input" name="action" defaultValue={action}>
            <option value="">{x.ac.allActions}</option>
            {actions.map((a) => (
              <option key={a} value={a}>{x.ac.actions[a] ?? a}</option>
            ))}
          </select>
        </label>
        <button className="btn btn-ghost">{x.filter}</button>
        {action && <Link href={path} className="py-3 text-sm underline underline-offset-4">{x.clear}</Link>}
      </form>
      {rows.length === 0 ? (
        <p className="mt-8 text-soft">{x.ac.empty}</p>
      ) : (
        <ul className="mt-6">
          {rows.map((l) => (
            <li key={l.id} className="border-t border-line py-3 text-[0.9375rem]">
              <ActivityLine row={l} lang={lang} t={t} />
            </li>
          ))}
        </ul>
      )}
      <AdminPager t={t} path={path} params={{ action }} page={page} total={total} />
    </div>
  );
}
