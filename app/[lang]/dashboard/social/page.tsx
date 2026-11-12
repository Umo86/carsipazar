import { requireShop } from "@/lib/auth";
import type { Locale } from "@/lib/config";
import { getDict, pick } from "@/lib/i18n";
import { listingsByShop } from "@/lib/queries";
import { itemCaption } from "@/lib/social-caption";
import { origin } from "@/lib/actions/util";
import SocialCard from "@/components/SocialCard";

export default async function SocialPage({ params }: PageProps<"/[lang]/dashboard/social">) {
  const lang = (await params).lang as Locale;
  const t = getDict(lang);
  const { shop } = await requireShop(lang);
  const approved = shop.status === "approved";
  const [items, base] = await Promise.all([
    approved ? listingsByShop(shop.id) : Promise.resolve([]),
    origin(),
  ]);
  const shopUrl = `${base}/${lang}/s/${shop.slug}`;

  return (
    <div>
      <h2 className="text-3xl">{t.social.title}</h2>
      <p className="mt-2 max-w-xl text-soft">{t.social.intro}</p>
      <p className="hint mt-2">{t.social.formatsHint}</p>
      {!approved ? (
        <p className="notice mt-6">{t.social.needApproval}</p>
      ) : items.length === 0 ? (
        <p className="mt-6 text-soft">{t.social.none}</p>
      ) : (
        <ul className="mt-6 grid gap-6">
          {items.map((item) => (
            <SocialCard
              key={item.id}
              kind="item"
              path={`/social/item/${item.id}`}
              title={pick(lang, item.title_tr, item.title_en).text}
              lang={lang}
              t={t}
              caption={itemCaption({ item, lang, t, shopUrl })}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
