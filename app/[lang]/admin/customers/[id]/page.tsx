import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import type { Locale } from "@/lib/config";
import {
  getUserDetail,
  isUuidStrict,
  reportsAboutUser,
  reportsByUser,
  userOrders,
  userReviews,
  userShop,
  type ReportBrief,
} from "@/lib/admin-queries";
import { formatDateTime } from "@/lib/admin-format";
import { fmt, formatDate, getDict, orderStatus, type Dict } from "@/lib/i18n";
import { formatGBP } from "@/lib/money";
import { origin } from "@/lib/actions/util";
import { createResetLink } from "@/lib/actions/account";
import { blockUser, setUserAdmin, unblockUser } from "@/lib/actions/admin";
import CopyLink from "@/components/CopyLink";
import Rating from "@/components/Rating";

const own = <T extends object>(o: T, k: unknown): string | null =>
  typeof k === "string" && Object.hasOwn(o, k) ? (o as Record<string, string>)[k] : null;

function ReportList({ rows, t, lang }: { rows: ReportBrief[]; t: Dict; lang: Locale }) {
  if (rows.length === 0) return <p className="mt-3 text-soft">{t.adminx.us.none}</p>;
  return (
    <ul className="mt-3">
      {rows.map((r) => (
        <li key={r.id} className="flex flex-wrap gap-x-4 gap-y-1 border-t border-line py-2 text-[0.9375rem]">
          <Link
            href={`/${lang}/admin/reports?status=${r.status}`}
            className="underline underline-offset-4 hover:text-cobalt"
          >
            {t.adminx.rp.kind[r.kind as "listing" | "review" | "shop"] ?? r.kind}
          </Link>
          <span>{t.adminx.rp.reason[r.reason as keyof Dict["adminx"]["rp"]["reason"]] ?? r.reason}</span>
          <span className="text-soft">{t.adminx.rp[r.status as "open" | "actioned" | "dismissed"]}</span>
          <span className="text-soft">{formatDateTime(r.created_at, lang)}</span>
        </li>
      ))}
    </ul>
  );
}

export default async function AdminUser({ params, searchParams }: PageProps<"/[lang]/admin/customers/[id]">) {
  const { lang: l, id } = await params;
  const lang = l as Locale;
  const t = getDict(lang);
  const me = await requireAdmin(lang);
  if (!isUuidStrict(id)) notFound();
  const user = await getUserDetail(id);
  if (!user) notFound();
  const sp = await searchParams;
  const x = t.adminx;
  const [orders, shop, reviews, by, about] = await Promise.all([
    userOrders(id),
    userShop(id),
    userReviews(id),
    reportsByUser(id),
    reportsAboutUser(id),
  ]);
  const link =
    typeof sp.link === "string" && /^[0-9a-f]{48}$/.test(sp.link) ? `${await origin()}/${lang}/reset/${sp.link}` : null;
  const ok = own(x.us.ok, sp.done);
  const err = own(x.us.err, sp.error);
  const isMe = user.id === me.id;
  const hid = (
    <>
      <input type="hidden" name="lang" value={lang} />
      <input type="hidden" name="id" value={user.id} />
    </>
  );

  return (
    <div className="grid max-w-4xl gap-12">
      <div>
        <Link href={`/${lang}/admin/customers`} className="text-sm underline underline-offset-4 hover:text-cobalt">
          ← {x.us.allUsers}
        </Link>
        {ok && <p className="notice mt-4" role="status">{ok}</p>}
        {err && <p className="notice notice-error mt-4" role="alert">{err}</p>}
        {link && (
          <div className="notice mt-4" role="status">
            <p className="mb-3">{t.account.resetReady}</p>
            <CopyLink url={link} copy={t.misc.copy} copied={t.misc.copied} />
          </div>
        )}
        <h2 className="mt-6 text-4xl">{user.name}</h2>
        <dl className="mt-5 grid gap-x-8 gap-y-3 rounded-3xl bg-mist p-6 sm:grid-cols-[10rem_1fr]">
          <dt className="text-sm text-soft">{t.auth.email}</dt>
          <dd className="break-all">{user.email}</dd>
          <dt className="text-sm text-soft">{x.us.role}</dt>
          <dd>{t.account.role[user.role]}</dd>
          <dt className="text-sm text-soft">{t.account.joined}</dt>
          <dd>{formatDate(new Date(user.created_at), lang)}</dd>
          <dt className="text-sm text-soft">{x.us.status}</dt>
          <dd>
            {user.blocked_at ? (
              <>
                <span className="tag !bg-rose !text-[#7d0a1d]">{x.us.blocked}</span>
                <span className="ml-2 text-soft">{fmt(x.us.blockedOn, { date: formatDate(new Date(user.blocked_at), lang) })}</span>
                {user.blocked_reason && <p className="mt-1">{x.us.reason}: {user.blocked_reason}</p>}
              </>
            ) : (
              x.us.active
            )}
          </dd>
        </dl>
      </div>

      <section aria-labelledby="actions">
        <h2 id="actions" className="sr-only">{x.us.detail}</h2>
        <div className="grid gap-8 md:grid-cols-2">
          <div className="rounded-3xl border border-line p-6">
            <h3 className="text-2xl">{x.us.blockTitle}</h3>
            {isMe ? (
              <p className="mt-3 text-soft">{x.us.you}</p>
            ) : user.blocked_at ? (
              <>
                <p className="hint mt-3">{x.us.unblockNote}</p>
                <form action={unblockUser} className="mt-4">
                  {hid}
                  <button className="btn btn-ghost">{x.us.unblockBtn}</button>
                </form>
              </>
            ) : (
              <form action={blockUser} className="mt-3 grid gap-4">
                {hid}
                <p className="hint">{x.us.blockHint}</p>
                <label className="field">
                  <span>{x.us.reason}</span>
                  <input className="input" name="reason" required maxLength={300} />
                </label>
                <div><button className="btn btn-danger">{x.us.blockBtn}</button></div>
              </form>
            )}
          </div>

          <div className="rounded-3xl border border-line p-6">
            <h3 className="text-2xl">{x.us.roleTitle}</h3>
            {user.role === "admin" ? (
              isMe ? (
                <p className="mt-3 text-soft">{x.us.you}</p>
              ) : (
                <form action={setUserAdmin} className="mt-4">
                  {hid}
                  <input type="hidden" name="to" value="0" />
                  <button className="btn btn-danger">{x.us.removeAdmin}</button>
                </form>
              )
            ) : user.blocked_at ? (
              <p className="mt-3 text-soft">{x.us.err.blockedtarget}</p>
            ) : (
              <form action={setUserAdmin} className="mt-4">
                {hid}
                <input type="hidden" name="to" value="1" />
                <button className="btn btn-ghost">{x.us.makeAdmin}</button>
              </form>
            )}
            <p className="hint mt-3">{x.us.lastAdmin}</p>
            {user.role !== "admin" && (
              <form action={createResetLink} className="mt-6 border-t border-line pt-5">
                <input type="hidden" name="lang" value={lang} />
                <input type="hidden" name="user" value={user.id} />
                <input type="hidden" name="back" value="detail" />
                <button className="btn btn-ghost btn-sm">{t.account.resetLink}</button>
              </form>
            )}
          </div>
        </div>
      </section>

      <section aria-labelledby="u-shop">
        <h2 id="u-shop" className="text-3xl">{x.us.shopTitle}</h2>
        {shop ? (
          <p className="mt-3">
            <Link href={`/${lang}/admin/sellers/${shop.id}`} className="font-display text-2xl underline underline-offset-4 hover:text-cobalt">
              {shop.name}
            </Link>{" "}
            <span className="text-soft">({t.status[shop.status as "pending" | "approved" | "suspended"]})</span>
          </p>
        ) : (
          <p className="mt-3 text-soft">{x.us.none}</p>
        )}
      </section>

      <section aria-labelledby="u-orders">
        <h2 id="u-orders" className="text-3xl">{x.us.ordersTitle}</h2>
        {orders.length === 0 ? (
          <p className="mt-3 text-soft">{x.us.none}</p>
        ) : (
          <div className="mt-3 overflow-x-auto">
            <table className="table min-w-[32rem]">
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id}>
                    <td>
                      <Link href={`/${lang}/admin/orders/${o.id}`} className="font-medium underline underline-offset-4">#{o.number}</Link>
                    </td>
                    <td>{o.title}<div className="text-soft">{o.shop_name}</div></td>
                    <td className="tabular-nums">{formatGBP(o.total_pence)}</td>
                    <td>{orderStatus(t, { status: o.status as keyof Dict["orders"]["status"], fulfilment: o.fulfilment })}</td>
                    <td className="whitespace-nowrap">{formatDate(new Date(o.created_at), lang)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section aria-labelledby="u-reviews">
        <h2 id="u-reviews" className="text-3xl">{x.us.reviewsTitle}</h2>
        {reviews.length === 0 ? (
          <p className="mt-3 text-soft">{x.us.none}</p>
        ) : (
          <ul className="mt-3">
            {reviews.map((r) => (
              <li key={r.id} className="border-t border-line py-3">
                <div className="flex flex-wrap items-center gap-x-3">
                  <Rating value={r.rating} />
                  <span className="text-sm text-soft">{r.shop_name}, {formatDate(new Date(r.created_at), lang)}</span>
                  {r.status === "hidden" && <span className="tag">{t.admin.hide}</span>}
                </div>
                {r.comment && <p className="mt-1">{r.comment}</p>}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="u-rep">
        <h2 id="u-rep" className="text-3xl">{x.us.reportsBy}</h2>
        <ReportList rows={by} t={t} lang={lang} />
        <h2 className="mt-10 text-3xl">{x.us.reportsAbout}</h2>
        <ReportList rows={about} t={t} lang={lang} />
      </section>
    </div>
  );
}
