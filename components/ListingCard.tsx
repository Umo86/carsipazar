import Link from "next/link";
import type { Locale } from "@/lib/config";
import { pick, type Dict } from "@/lib/i18n";
import { formatGBP } from "@/lib/money";
import type { ListingCard as Card } from "@/lib/queries";

export default function ListingCard({
  item,
  lang,
  t,
  showShop = true,
}: {
  item: Card;
  lang: Locale;
  t: Dict;
  showShop?: boolean;
}) {
  const title = pick(lang, item.title_tr, item.title_en).text;
  return (
    <Link href={`/${lang}/l/${item.id}`} className="group block">
      <div className="aspect-[4/5] overflow-hidden bg-mist">
        {item.image_id && (
          // Plain <img>: photos come from our own image route.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={`/img/${item.image_id}`}
            alt={title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        )}
      </div>
      <div className="mt-3">
        {showShop && <p className="text-[0.8125rem] text-soft">{item.shop_name}</p>}
        <p className="leading-snug group-hover:underline underline-offset-4">{title}</p>
        <p className="mt-1 flex items-center gap-2">
          <span className="font-medium">{formatGBP(item.price_pence)}</span>
          {item.stock === 0 ? (
            <span className="text-sm text-soft">{t.listing.soldOut}</span>
          ) : (
            item.instalments && <span className="tag">{t.listing.instalments}</span>
          )}
        </p>
      </div>
    </Link>
  );
}
