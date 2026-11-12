import { requireAdmin } from "@/lib/auth";
import type { Locale } from "@/lib/config";
import { q } from "@/lib/db";
import { formatDate, getDict } from "@/lib/i18n";
import { origin } from "@/lib/actions/util";
import { createResetLink } from "@/lib/actions/account";
import CopyLink from "@/components/CopyLink";

type Row = { id: string; name: string; email: string; role: "buyer" | "seller" | "admin"; created_at: Date; orders: string };

export default async function AdminCustomers({ params, searchParams }: PageProps<"/[lang]/admin/customers">) {
  const lang = (await params).lang as Locale;
  const t = getDict(lang);
  await requireAdmin(lang);
  const sp = await searchParams;
  const find = typeof sp.q === "string" ? sp.q.trim().slice(0, 80) : "";
  const rows = await q<Row>(
    `select u.id, u.name, u.email, u.role, u.created_at,
            (select count(*) from orders o where o.buyer_id = u.id) as orders
       from users u
      where $1 = '' or u.email ilike '%' || $1 || '%' or u.name ilike '%' || $1 || '%'
      order by u.created_at desc limit 200`,
    [find.replace(/[\\%_]/g, "\\$&")],
  );
  const link =
    typeof sp.link === "string" && /^[0-9a-f]{48}$/.test(sp.link) ? `${await origin()}/${lang}/reset/${sp.link}` : null;

  return (
    <div>
      <form className="flex max-w-md gap-2" role="search">
        <label className="flex-1">
          <span className="sr-only">{t.account.search}</span>
          <input className="input" type="search" name="q" defaultValue={find} placeholder={t.account.search} />
        </label>
        <button className="btn btn-ghost">{t.search.submit}</button>
      </form>
      {link && (
        <div className="notice mt-6 max-w-2xl" role="status">
          <p className="mb-3">{t.account.resetReady}</p>
          <CopyLink url={link} copy={t.misc.copy} copied={t.misc.copied} />
        </div>
      )}
      {rows.length === 0 ? (
        <p className="mt-8 text-soft">{t.admin.none}</p>
      ) : (
        <div className="mt-8 overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>{t.auth.name}</th>
                <th>{t.auth.email}</th>
                <th>{t.promo.status}</th>
                <th>{t.account.joined}</th>
                <th>{t.account.ordersCount}</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((u) => (
                <tr key={u.id} className={sp.for === u.id ? "bg-sky" : ""}>
                  <td>{u.name}</td>
                  <td className="break-all">{u.email}</td>
                  <td>{t.account.role[u.role]}</td>
                  <td className="whitespace-nowrap">{formatDate(new Date(u.created_at), lang)}</td>
                  <td>{u.orders}</td>
                  <td>
                    {u.role !== "admin" && (
                      <form action={createResetLink}>
                        <input type="hidden" name="lang" value={lang} />
                        <input type="hidden" name="user" value={u.id} />
                        <button className="btn btn-ghost btn-sm">{t.account.resetLink}</button>
                      </form>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
