import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import type { Locale } from "@/lib/config";
import { cleanSearch, listUsers, pageOf, pick1, ROLES } from "@/lib/admin-queries";
import { formatDate, getDict } from "@/lib/i18n";
import { PAGE_SIZE } from "@/lib/admin-queries";
import { clampPage } from "@/lib/paging";
import AdminPager from "@/components/AdminPager";
import ResetLinkForm from "@/components/ResetLinkForm";

export default async function AdminCustomers({ params, searchParams }: PageProps<"/[lang]/admin/customers">) {
  const lang = (await params).lang as Locale;
  const t = getDict(lang);
  await requireAdmin(lang);
  const sp = await searchParams;
  const find = cleanSearch(sp.q);
  const role = pick1(sp.role, ROLES);
  const blocked = sp.status === "blocked";
  const page = pageOf(sp.page);
  const { rows, total } = await listUsers({ text: find, role, blocked, page });
  clampPage(`/${lang}/admin/customers`, { q: find, role, status: blocked ? "blocked" : "" }, page, total, PAGE_SIZE);
  const x = t.adminx;
  const path = `/${lang}/admin/customers`;

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <form className="flex flex-wrap items-end gap-3" role="search">
          <label className="field w-full sm:w-72">
            <span>{t.account.search}</span>
            <input className="input" type="search" name="q" defaultValue={find} placeholder={x.us.placeholder} maxLength={80} />
          </label>
          <label className="field">
            <span>{x.us.role}</span>
            <select className="input" name="role" defaultValue={role}>
              <option value="">{x.us.allRoles}</option>
              {ROLES.map((r) => (
                <option key={r} value={r}>{t.account.role[r]}</option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>{x.us.status}</span>
            <select className="input" name="status" defaultValue={blocked ? "blocked" : ""}>
              <option value="">{x.all}</option>
              <option value="blocked">{x.us.blockedOnly}</option>
            </select>
          </label>
          <button className="btn btn-ghost">{t.search.submit}</button>
          {(find || role || blocked) && <Link href={path} className="py-3 text-sm underline underline-offset-4">{x.clear}</Link>}
        </form>
        <a href={`/${lang}/admin/export/users`} className="btn btn-ghost btn-sm" download>
          {x.csv}
        </a>
      </div>
      {rows.length === 0 ? (
        <p className="mt-8 text-soft">{t.admin.none}</p>
      ) : (
        <div className="mt-8 overflow-x-auto">
          <table className="table min-w-[44rem]">
            <thead>
              <tr>
                <th>{t.auth.name}</th>
                <th>{t.auth.email}</th>
                <th>{x.us.role}</th>
                <th>{t.account.joined}</th>
                <th>{t.account.ordersCount}</th>
                <th>{x.us.status}</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((u) => (
                <tr key={u.id}>
                  <td>
                    <Link href={`${path}/${u.id}`} className="underline underline-offset-4 hover:text-cobalt">{u.name}</Link>
                  </td>
                  <td className="break-all">{u.email}</td>
                  <td>{t.account.role[u.role]}</td>
                  <td className="whitespace-nowrap">{formatDate(new Date(u.created_at), lang)}</td>
                  <td className="tabular-nums">{u.orders}</td>
                  <td>{u.blocked_at ? <span className="tag !bg-rose !text-[#7d0a1d]">{x.us.blocked}</span> : x.us.active}</td>
                  <td>
                    {u.role !== "admin" && (
                      <ResetLinkForm
                        lang={lang}
                        userId={u.id}
                        label={t.account.resetLink}
                        ready={t.account.resetReady}
                        failed={x.us.resetFailed}
                        copy={t.misc.copy}
                        copied={t.misc.copied}
                      />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <AdminPager t={t} path={path} params={{ q: find, role, status: blocked ? "blocked" : "" }} page={page} total={total} />
    </div>
  );
}
