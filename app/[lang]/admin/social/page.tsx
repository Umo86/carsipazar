import { requireAdmin } from "@/lib/auth";
import { BRAND_KEYS } from "@/lib/social";
import type { Locale } from "@/lib/config";
import { getDict, pick } from "@/lib/i18n";
import { featuredListings } from "@/lib/queries";
import { getSettings } from "@/lib/settings";
import { brandCaption, itemCaption } from "@/lib/social-caption";
import { origin } from "@/lib/actions/util";
import SocialCard from "@/components/SocialCard";

export default async function AdminSocial({ params }: PageProps<"/[lang]/admin/social">) {
  const lang = (await params).lang as Locale;
  const t = getDict(lang);
  await requireAdmin(lang);
  const [items, settings, base] = await Promise.all([featuredListings(8), getSettings(), origin()]);

  return (
    <div className="grid gap-12">
      <section>
        <h2 className="text-3xl">{t.social.brandTitle}</h2>
        <p className="mt-2 max-w-xl text-soft">{t.social.brandIntro}</p>
        <p className="hint mt-2">{t.social.formatsHint}</p>
        <ul className="mt-6 grid gap-6">
          {BRAND_KEYS.map((key) => (
            <SocialCard
              key={key}
              kind="brand"
              path={`/social/brand/${key}`}
              title={t.social.brandNames[key]}
              lang={lang}
              t={t}
              caption={brandCaption(t, key, `${base}/${lang}${key === "sell" ? "/sell" : ""}`)}
            />
          ))}
        </ul>
      </section>
      <section>
        <h2 className="text-3xl">{t.social.featuredTitle}</h2>
        {items.length === 0 ? (
          <p className="mt-4 text-soft">{t.social.featuredNone}</p>
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
                caption={itemCaption({ item, lang, t, settings, shopUrl: `${base}/${lang}/s/${item.shop_slug}` })}
              />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
