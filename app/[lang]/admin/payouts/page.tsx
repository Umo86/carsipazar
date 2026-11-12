import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import type { Locale } from "@/lib/config";
import { listPayouts, pageOf } from "@/lib/admin-queries";
import { fmt, getDict } from "@/lib/i18n";
import { formatGBP } from "@/lib/money";
import { getSettings } from "@/lib/settings";
import { PAGE_SIZE } from "@/lib/admin-queries";
import { clampPage } from "@/lib/paging";
import AdminPager from "@/components/AdminPager";

export default async function AdminPayouts({ params, searchParams }: PageProps<"/[lang]/admin/payouts">) {
  const lang = (await params).lang as Locale;
  const t = getDict(lang);
  await requireAdmin(lang);
  const sp = await searchParams;
  const page = pageOf(sp.page);
  const { release_days } = await getSettings();
  const { rows, total, totals } = await listPayouts({ releaseDays: release_days, page });
  const x = t.adminx;
  const path = `/${lang}/admin/payouts`;
  clampPage(path, {}, page, total, PAGE_SIZE);
  const tiles = [
    { label: x.pa.held, value: totals.held },
    { label: x.pa.due, value: totals.due, hint: fmt(x.pa.dueHint, { days: release_days }) },
    { label: x.pa.released30, value: totals.released30 },
    { label: x.pa.commission, value: totals.commission },
  ];

  return (
    <div>
      <p className="max-w-2xl text-soft">{x.pa.intro}</p>
      <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-6 lg:grid-cols-4">
        {tiles.map((tile) => (
          <div key={tile.label} className="rounded-2xl bg-mist p-5">
            <dt className="text-sm text-soft">{tile.label}</dt>
            <dd className="mt-1 font-display text-3xl tabular-nums">{formatGBP(tile.value)}</dd>
            {tile.hint && <p className="hint mt-1">{tile.hint}</p>}
          </div>
        ))}
      </dl>
      {rows.length === 0 ? (
        <p className="mt-8 text-soft">{t.admin.none}</p>
      ) : (
        <div className="mt-8 overflow-x-auto">
          <table className="table min-w-[40rem]">
            <thead>
              <tr>
                <th>{x.pa.shop}</th>
                <th className="text-right">{x.pa.held}</th>
                <th className="text-right">{x.pa.due}</th>
                <th className="text-right">{x.pa.released30}</th>
                <th className="text-right">{x.pa.commission}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td>
                    <Link href={`/${lang}/admin/sellers/${r.id}`} className="underline underline-offset-4 hover:text-cobalt">{r.name}</Link>
                    {r.status !== "approved" && (
                      <span className="ml-2 text-sm text-soft">({t.status[r.status as "pending" | "suspended"]})</span>
                    )}
                  </td>
                  <td className="text-right tabular-nums">{formatGBP(Number(r.held))}</td>
                  <td className="text-right tabular-nums">{formatGBP(Number(r.due))}</td>
                  <td className="text-right tabular-nums">{formatGBP(Number(r.released30))}</td>
                  <td className="text-right tabular-nums">{formatGBP(Number(r.commission))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <AdminPager t={t} path={path} params={{}} page={page} total={total} />
      <p className="mt-4 text-sm">
        <Link href={`/${lang}/admin/orders`} className="underline underline-offset-4 hover:text-cobalt">{t.panel.nav.orders}</Link>
      </p>
    </div>
  );
}
