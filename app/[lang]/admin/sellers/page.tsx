import Link from "next/link";
import { requireAdmin, type Shop } from "@/lib/auth";
import type { Locale } from "@/lib/config";
import { q } from "@/lib/db";
import { formatDate, getDict } from "@/lib/i18n";
import { setFounding, setShopStatus } from "@/lib/actions/admin";

export default async function AdminSellers({ params }: PageProps<"/[lang]/admin/sellers">) {
  const lang = (await params).lang as Locale;
  const t = getDict(lang);
  await requireAdmin(lang);
  const shops = await q<Shop & { email: string; listings: string }>(
    `select s.*, u.email, (select count(*) from listings l where l.shop_id = s.id and l.status = 'active') as listings
       from shops s join users u on u.id = s.owner_id
      order by (s.status = 'pending') desc, s.created_at desc`,
  );
  if (shops.length === 0) return <p className="text-soft">{t.admin.none}</p>;

  const Action = ({ id, to, label, danger }: { id: string; to: string; label: string; danger?: boolean }) => (
    <form action={setShopStatus}>
      <input type="hidden" name="lang" value={lang} />
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="to" value={to} />
      <button className={`btn btn-sm ${danger ? "btn-danger" : ""}`}>{label}</button>
    </form>
  );

  return (
    <ul>
      {shops.map((s) => (
        <li key={s.id} className="grid gap-4 border-t border-line py-6 md:grid-cols-[2fr_2fr_auto]">
          <div>
            <Link href={`/${lang}/s/${s.slug}`} className="font-display text-2xl hover:text-cobalt">{s.name}</Link>
            <p className="mt-1 text-sm">
              <span className={s.status === "approved" ? "text-turq" : s.status === "suspended" ? "text-tulip" : "font-medium"}>
                {t.status[s.status]}
              </span>
              <span className="text-soft">, {t.shop[s.seller_type]}</span>
              {s.founding && <span className="tag ml-2">{t.shop.founding}</span>}
            </p>
            <p className="mt-1 text-sm text-soft">
              {formatDate(new Date(s.created_at), lang)}, {t.dash.live.toLocaleLowerCase(lang)}: {s.listings}
            </p>
          </div>
          {/* The details to check before approving a trader. */}
          <div className="text-sm text-soft">
            <p className="text-ink">{s.legal_name}{s.company_number ? ` (${s.company_number})` : ""}</p>
            <p>{s.address}, {s.city} {s.postcode}</p>
            <p>{s.phone}, {s.email}</p>
            {s.instagram && <p>@{s.instagram}</p>}
          </div>
          <div className="flex flex-wrap items-start gap-2">
            {s.status !== "approved" && <Action id={s.id} to="approved" label={t.admin.approve} />}
            {s.status !== "suspended" && <Action id={s.id} to="suspended" label={t.admin.suspend} danger />}
            <form action={setFounding}>
              <input type="hidden" name="lang" value={lang} />
              <input type="hidden" name="id" value={s.id} />
              <input type="hidden" name="to" value={s.founding ? "0" : "1"} />
              <button className="btn btn-ghost btn-sm">{s.founding ? t.admin.removeFounding : t.admin.makeFounding}</button>
            </form>
          </div>
        </li>
      ))}
    </ul>
  );
}
