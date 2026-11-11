import Link from "next/link";
import { requireShop } from "@/lib/auth";
import type { Locale } from "@/lib/config";
import { getDict, pick } from "@/lib/i18n";
import { formatGBP } from "@/lib/money";
import { listingsByShop } from "@/lib/queries";
import { setListingStatus } from "@/lib/actions/shop";

export default async function DashboardListings({ params }: PageProps<"/[lang]/dashboard/listings">) {
  const lang = (await params).lang as Locale;
  const t = getDict(lang);
  const { shop } = await requireShop(lang);
  const items = await listingsByShop(shop.id, true);

  return (
    <div>
      <Link href={`/${lang}/dashboard/listings/new`} className="btn">{t.dash.newListing}</Link>
      {items.length === 0 ? (
        <p className="mt-8 text-soft">{t.dash.noListings}</p>
      ) : (
        <ul className="mt-8">
          {items.map((l) => (
            <li key={l.id} className="grid grid-cols-[4.5rem_1fr] gap-4 border-t border-line py-5 md:grid-cols-[4.5rem_1fr_auto] md:items-center">
              <div className="aspect-[4/5] overflow-hidden rounded-xl bg-mist">
                {l.image_id && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={`/img/${l.image_id}`} alt="" className="h-full w-full object-cover" />
                )}
              </div>
              <div>
                <Link href={`/${lang}/l/${l.id}`} className="font-medium hover:underline underline-offset-4">
                  {pick(lang, l.title_tr, l.title_en).text}
                </Link>
                <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-soft">
                  <span className="text-ink">{formatGBP(l.price_pence)}</span>
                  <span>{l.stock === 0 ? t.listing.soldOut : `${t.dash.f.stock}: ${l.stock}`}</span>
                  <span className={l.status === "active" ? "text-turq" : ""}>
                    {l.status === "active" ? t.dash.statusActive : t.dash.statusPaused}
                  </span>
                  {l.instalments && <span className="tag">{t.listing.instalments}</span>}
                </p>
              </div>
              <div className="col-span-2 flex flex-wrap gap-2 md:col-span-1">
                <Link href={`/${lang}/dashboard/listings/${l.id}`} className="btn btn-ghost btn-sm">{t.dash.edit}</Link>
                <form action={setListingStatus}>
                  <input type="hidden" name="lang" value={lang} />
                  <input type="hidden" name="id" value={l.id} />
                  <input type="hidden" name="to" value={l.status === "active" ? "paused" : "active"} />
                  <button className="btn btn-ghost btn-sm">{l.status === "active" ? t.dash.pause : t.dash.activate}</button>
                </form>
                <form action={setListingStatus}>
                  <input type="hidden" name="lang" value={lang} />
                  <input type="hidden" name="id" value={l.id} />
                  <input type="hidden" name="to" value="removed" />
                  <button className="btn btn-danger btn-sm">{t.dash.remove}</button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
