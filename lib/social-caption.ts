import type { Locale } from "./config";
import type { Dict } from "./i18n";
import { pick } from "./i18n";
import { formatGBP, instalmentsAllowed } from "./money";
import type { Settings } from "./config";
import type { ListingCard } from "./queries";

// The text a seller pastes under the picture: name, price, instalments when
// they apply, the shop link and a few hashtags from the category.
export function itemCaption(args: {
  item: ListingCard;
  lang: Locale;
  t: Dict;
  settings: Settings;
  shopUrl: string;
}) {
  const { item, lang, t, settings, shopUrl } = args;
  const tags = (t.social.tags as Record<string, string>)[item.category] ?? t.social.tagsOther;
  const lines = [pick(lang, item.title_tr, item.title_en).text, formatGBP(item.price_pence)];
  if (instalmentsAllowed(item, item.price_pence + item.postage_pence, settings)) lines.push(t.social.pill);
  lines.push("", t.social.captionShop.replace("{url}", shopUrl), "", tags);
  return lines.join("\n");
}

export function brandCaption(t: Dict, key: keyof Dict["social"]["brand"], url: string) {
  const b = t.social.brand[key];
  return t.social.brandCaption.replace("{head}", b.head).replace("{sub}", b.sub).replace("{url}", url);
}
