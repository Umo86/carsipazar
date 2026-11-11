import Link from "next/link";
import { CATEGORIES, type Locale } from "@/lib/config";
import { pick, type Dict } from "@/lib/i18n";
import { formatGBP } from "@/lib/money";
import type { ListingCard as Card } from "@/lib/queries";

export default function ListingCard({
  item,
  lang,
  t,
  showShop = true,
  className = "",
}: {
  item: Card;
  lang: Locale;
  t: Dict;
  showShop?: boolean;
  className?: string;
}) {
  const title = pick(lang, item.title_tr, item.title_en).text;
  const category = CATEGORIES.find((c) => c.slug === item.category)?.[lang];
  const avg = item.shop_avg ? Number(item.shop_avg) : null;
  return (
    <Link href={`/${lang}/l/${item.id}`} className={`group block ${className}`}>
      <div className="media relative aspect-[4/5]">
        {item.image_id && (
          // Plain <img>: photos come from our own image route.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={`/img/${item.image_id}`} alt={title} loading="lazy" className="h-full w-full object-cover" />
        )}
        {item.stock === 0 ? (
          <span className="absolute top-3 left-3 rounded-full bg-ink px-2.5 py-1 text-xs font-medium text-paper">
            {t.listing.soldOut}
          </span>
        ) : (
          item.instalments && (
            <span className="absolute top-3 left-3 rounded-full bg-paper px-2.5 py-1 text-xs font-medium shadow-sm">
              {t.listing.instalments}
            </span>
          )
        )}
        <span
          aria-hidden="true"
          className="absolute inset-x-3 bottom-3 translate-y-3 rounded-full bg-paper/95 py-2.5 text-center text-sm font-medium opacity-0 shadow-lift transition duration-300 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100 motion-reduce:transition-none"
        >
          {t.listing.view}
        </span>
      </div>
      <div className="mt-3.5">
        <p className="text-[0.8125rem] text-soft">
          {showShop ? item.shop_name : category}
        </p>
        <p className="mt-0.5 leading-snug transition-colors duration-200 group-hover:text-cobalt">{title}</p>
        <p className="mt-1.5 flex items-center justify-between gap-3">
          <span className="text-[1.0625rem] font-medium">{formatGBP(item.price_pence)}</span>
          {showShop && avg !== null && (
            <span className="inline-flex items-center gap-1 text-[0.8125rem] text-soft">
              <svg width="13" height="13" viewBox="0 0 20 20" aria-hidden="true">
                <path d="M10 1.5l2.6 5.4 5.9.8-4.3 4.1 1 5.9L10 14.9 4.8 17.7l1-5.9L1.5 7.7l5.9-.8z" fill="#96763f" />
              </svg>
              <span aria-label={`${avg.toFixed(1)} / 5`}>{avg.toFixed(1)}</span>
            </span>
          )}
        </p>
      </div>
    </Link>
  );
}
