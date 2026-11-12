import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import type { Locale } from "@/lib/config";
import {
  getShopDetail,
  isUuidStrict,
  reportsAboutShop,
  shopItems,
  shopOrders,
  shopTotals,
} from "@/lib/admin-queries";
import { formatDateTime, itemStatusLabel } from "@/lib/admin-format";
import { formatDate, getDict, itemCount, orderStatus, pick, type Dict } from "@/lib/i18n";
import { formatGBP } from "@/lib/money";
import { setFounding, setShopStatus } from "@/lib/actions/admin";

export default async function AdminSeller({ params, searchParams }: PageProps<"/[lang]/admin/sellers/[id]">) {
  const { lang: l, id } = await params;
  const lang = l as Locale;
  const t = getDict(lang);
  await requireAdmin(lang);
  if (!isUuidStrict(id)) notFound();
  const shop = await getShopDetail(id);
  if (!shop) notFound();
  const sp = await searchParams;
  const x = t.adminx;
  const [totals, items, orders, reports] = await Promise.all([
    shopTotals(id),
    shopItems(id),
    shopOrders(id),
    reportsAboutShop(id),
  ]);
  const here = `/${lang}/admin/sellers/${id}`;
  const act = (to: string, label: string, danger?: boolean) => (
    <form action={setShopStatus}>
      <input type="hidden" name="lang" value={lang} />
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="to" value={to} />
      <input type="hidden" name="back" value={here} />
      <button className={`btn btn-sm ${danger ? "btn-danger" : ""}`}>{label}</button>
    </form>
  );
  const tiles = [
    { label: x.se.salesTotal, value: formatGBP(totals.sales) },
    { label: x.se.orders, value: String(totals.orders) },
    { label: x.se.commission, value: formatGBP(totals.commission) },
    { label: x.se.held, value: formatGBP(totals.held) },
    { label: x.se.paidOut, value: formatGBP(totals.paidOut) },
    { label: x.se.refunded, value: String(totals.refunded) },
  ];
  const facts: [string, React.ReactNode][] = [
    [t.shop.legalName, shop.legal_name],
    [t.shop.companyNumber, shop.company_number],
    [t.shop.vatNumber, shop.vat_number],
    [t.shop.address, `${shop.address}, ${shop.city} ${shop.postcode}`],
    [t.shop.phone, shop.phone],
    [t.shop.email, shop.public_email],
    [t.shop.website, shop.website],
    ["Instagram", shop.instagram ? `@${shop.instagram}` : null],
    [
      x.se.owner,
      <Link key="o" href={`/${lang}/admin/customers/${shop.owner_id}`} className="underline underline-offset-4 hover:text-cobalt">
        {shop.owner_name}, {shop.email}
      </Link>,
    ],
  ];

  return (
    <div className="grid max-w-5xl grid-cols-[minmax(0,1fr)] gap-12">
      <div>
        <Link href={`/${lang}/admin/sellers`} className="text-sm underline underline-offset-4 hover:text-cobalt">
          ← {x.se.allShops}
        </Link>
        {sp.error === "blocked" && <p className="notice notice-error mt-4" role="alert">{x.se.blockedOwner}</p>}
        <h2 className="mt-6 text-4xl break-words">{shop.name}</h2>
        <p className="mt-2 flex flex-wrap items-center gap-2 text-sm">
          <span className={shop.status === "approved" ? "text-turq" : shop.status === "suspended" ? "text-tulip" : "font-medium"}>
            {t.status[shop.status]}
          </span>
          <span className="text-soft">, {t.shop[shop.seller_type]}, {formatDate(new Date(shop.created_at), lang)}</span>
          {shop.founding && <span className="tag">{t.shop.founding}</span>}
          {shop.owner_blocked && <span className="tag !bg-rose !text-[#7d0a1d]">{x.us.blocked}</span>}
        </p>
        <div className="mt-5 flex flex-wrap items-center gap-2">
          {shop.status !== "approved" && act("approved", shop.status === "suspended" ? x.se.reinstate : t.admin.approve)}
          {shop.status !== "suspended" && act("suspended", t.admin.suspend, true)}
          <form action={setFounding}>
            <input type="hidden" name="lang" value={lang} />
            <input type="hidden" name="id" value={id} />
            <input type="hidden" name="to" value={shop.founding ? "0" : "1"} />
            <input type="hidden" name="back" value={here} />
            <button className="btn btn-ghost btn-sm">{shop.founding ? t.admin.removeFounding : t.admin.makeFounding}</button>
          </form>
          {shop.status === "approved" && (
            <Link href={`/${lang}/s/${shop.slug}`} className="btn btn-ghost btn-sm">{x.se.publicPage}</Link>
          )}
        </div>
      </div>

      <dl className="grid grid-cols-2 gap-x-6 gap-y-6 md:grid-cols-3">
        {tiles.map((tile) => (
          <div key={tile.label} className="rounded-2xl bg-mist p-5">
            <dt className="text-sm text-soft">{tile.label}</dt>
            <dd className="mt-1 font-display text-3xl tabular-nums">{tile.value}</dd>
          </div>
        ))}
      </dl>

      <section aria-labelledby="s-details">
        <h2 id="s-details" className="text-3xl">{x.se.detail}</h2>
        <dl className="mt-4 rounded-3xl bg-mist p-6">
          {facts
            .filter(([, v]) => v)
            .map(([k, v]) => (
              <div key={k} className="grid gap-1 border-t border-line py-3 first:border-t-0 sm:grid-cols-[10rem_1fr]">
                <dt className="text-sm text-soft">{k}</dt>
                <dd className="break-words">{v}</dd>
              </div>
            ))}
        </dl>
      </section>

      <section aria-labelledby="s-items">
        <h2 id="s-items" className="text-3xl">
          {x.se.items} <span className="font-sans text-base text-soft">{itemCount(t, items.length)}</span>
        </h2>
        {items.length === 0 ? (
          <p className="mt-3 text-soft">{t.admin.none}</p>
        ) : (
          <div className="mt-3 overflow-x-auto">
            <table className="table min-w-[32rem]">
              <tbody>
                {items.map((i) => (
                  <tr key={i.id}>
                    <td>
                      {i.status === "removed" ? (
                        pick(lang, i.title_tr, i.title_en).text
                      ) : (
                        <Link href={`/${lang}/l/${i.id}`} className="underline underline-offset-4 hover:text-cobalt">
                          {pick(lang, i.title_tr, i.title_en).text}
                        </Link>
                      )}
                    </td>
                    <td className="tabular-nums">{formatGBP(i.price_pence)}</td>
                    <td className="tabular-nums text-soft">{x.se.stock}: {i.stock}</td>
                    <td>{itemStatusLabel(t, i.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section aria-labelledby="s-orders">
        <h2 id="s-orders" className="text-3xl">{x.se.recentOrders}</h2>
        {orders.length === 0 ? (
          <p className="mt-3 text-soft">{t.admin.none}</p>
        ) : (
          <div className="mt-3 overflow-x-auto">
            <table className="table min-w-[32rem]">
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id}>
                    <td><Link href={`/${lang}/admin/orders/${o.id}`} className="font-medium underline underline-offset-4">#{o.number}</Link></td>
                    <td>{o.title}</td>
                    <td className="tabular-nums">{formatGBP(o.total_pence)}</td>
                    <td className="tabular-nums text-soft">{formatGBP(o.seller_payout_pence)}</td>
                    <td>{orderStatus(t, { status: o.status as keyof Dict["orders"]["status"], fulfilment: o.fulfilment })}</td>
                    <td className="whitespace-nowrap">{formatDate(new Date(o.created_at), lang)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section aria-labelledby="s-rep">
        <h2 id="s-rep" className="text-3xl">{x.se.reports}</h2>
        {reports.length === 0 ? (
          <p className="mt-3 text-soft">{t.admin.none}</p>
        ) : (
          <ul className="mt-3">
            {reports.map((r) => (
              <li key={r.id} className="flex flex-wrap gap-x-4 gap-y-1 border-t border-line py-2 text-[0.9375rem]">
                <Link href={`/${lang}/admin/reports?status=${r.status}`} className="underline underline-offset-4 hover:text-cobalt">
                  {x.rp.kind[r.kind as "listing" | "review" | "shop"]}
                </Link>
                <span>{x.rp.reason[r.reason as keyof Dict["adminx"]["rp"]["reason"]] ?? r.reason}</span>
                <span className="text-soft">{x.rp[r.status as "open" | "actioned" | "dismissed"]}</span>
                <span className="text-soft">{formatDateTime(r.created_at, lang)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
