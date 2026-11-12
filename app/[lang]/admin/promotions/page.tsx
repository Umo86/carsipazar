import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import type { Locale } from "@/lib/config";
import { formatDate, getDict, pick } from "@/lib/i18n";
import { formatGBP } from "@/lib/money";
import { allPromotions, promotionIncome } from "@/lib/promotions";
import { cancelPromo } from "@/lib/actions/promo";

const day = (isoDate: string, lang: Locale) => formatDate(new Date(`${isoDate}T12:00:00Z`), lang);

export default async function AdminPromotions({ params }: PageProps<"/[lang]/admin/promotions">) {
  const lang = (await params).lang as Locale;
  const t = getDict(lang);
  await requireAdmin(lang);
  const [rows, income] = await Promise.all([allPromotions(), promotionIncome()]);

  return (
    <div>
      <div className="inline-block rounded-2xl bg-mist p-5">
        <p className="text-sm text-soft">{t.promo.income}</p>
        <p className="mt-1 text-3xl font-medium">{formatGBP(income)}</p>
      </div>
      {rows.length === 0 ? (
        <p className="mt-8 text-soft">{t.admin.none}</p>
      ) : (
        <div className="mt-8 overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>{t.admin.sellers}</th>
                <th>{t.promo.package}</th>
                <th>{t.promo.item}</th>
                <th>{t.promo.dates}</th>
                <th>{t.promo.price}</th>
                <th>{t.promo.status}</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => (
                <tr key={p.id}>
                  <td>
                    <Link href={`/${lang}/s/${p.shop_slug}`} className="underline underline-offset-4">{p.shop_name}</Link>
                  </td>
                  <td>{t.promo.kind[p.kind]}</td>
                  <td>
                    <Link href={`/${lang}/l/${p.listing_id}`} className="underline underline-offset-4">
                      {pick(lang, p.title_tr, p.title_en).text}
                    </Link>
                  </td>
                  <td className="whitespace-nowrap">{day(p.starts_on, lang)} – {day(p.ends_on, lang)}</td>
                  <td>{formatGBP(p.price_pence)}</td>
                  <td>{t.promo.phase[p.phase]}</td>
                  <td>
                    {(p.phase === "upcoming" || p.phase === "live") && (
                      <form action={cancelPromo}>
                        <input type="hidden" name="lang" value={lang} />
                        <input type="hidden" name="id" value={p.id} />
                        <input type="hidden" name="as" value="admin" />
                        <button className="btn btn-danger btn-sm">{t.promo.cancelRefund}</button>
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
