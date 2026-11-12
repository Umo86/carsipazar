import "server-only";
import { getSiteDetails, type SiteDetailKey } from "@/lib/site-details";
import { getSettings } from "@/lib/settings";
import { COLLECTION_MAX_ATTEMPTS, PROMO_BOOK_AHEAD_DAYS, PROMO_MAX_WEEKS, SITE_NAME, type Locale } from "@/lib/config";
import { formatGBP } from "@/lib/money";

// What each site-detail token is called in the "to be added" marker.
const LABELS: Record<SiteDetailKey | "postal_address", { en: string; tr: string }> = {
  legal_name: { en: "registered company name", tr: "şirket unvanı" },
  legal_form: { en: "legal form of the business", tr: "şirket türü" },
  company_no: { en: "company number", tr: "şirket numarası" },
  registered_address: { en: "registered office address", tr: "tescilli adres" },
  contact_address: { en: "postal address", tr: "posta adresi" },
  postal_address: { en: "postal address", tr: "posta adresi" },
  email: { en: "contact email", tr: "iletişim e-postası" },
  phone: { en: "phone number", tr: "telefon numarası" },
  vat_no: { en: "VAT number", tr: "KDV numarası" },
  ico_no: { en: "ICO registration number", tr: "ICO kayıt numarası" },
  complaints_email: { en: "complaints email", tr: "şikâyet e-postası" },
};

export type TokenValue = { kind: "text"; text: string } | { kind: "email"; text: string } | { kind: "missing"; label: string };

export type TokenMap = Record<string, TokenValue>;

const pct = (bps: number, lang: Locale) => {
  const n = bps / 100;
  const s = new Intl.NumberFormat(lang === "tr" ? "tr-TR" : "en-GB", { maximumFractionDigits: 2 }).format(n);
  return lang === "tr" ? `%${s}` : `${s}%`;
};

// Builds every token for one language. Fixed text tokens come from config and
// settings; the operator's details come from the database and are never invented.
export async function buildTokens(lang: Locale): Promise<TokenMap> {
  const [d, s] = await Promise.all([getSiteDetails(), getSettings()]);
  const out: TokenMap = {};
  const text = (k: string, v: string | number) => (out[k] = { kind: "text", text: String(v) });

  const detail = (k: SiteDetailKey, v: string) =>
    (out[k] = v.trim() ? { kind: k === "email" || k === "complaints_email" ? "email" : "text", text: v.trim() } : { kind: "missing", label: LABELS[k][lang] });
  for (const k of Object.keys(LABELS) as (SiteDetailKey | "postal_address")[]) {
    if (k === "postal_address" || k === "complaints_email") continue;
    detail(k as SiteDetailKey, d[k as SiteDetailKey]);
  }
  const postal = (d.contact_address || d.registered_address).trim();
  out.postal_address = postal ? { kind: "text", text: postal } : { kind: "missing", label: LABELS.postal_address[lang] };
  const ce = (d.complaints_email || d.email).trim();
  out.complaints_email = ce ? { kind: "email", text: ce } : { kind: "missing", label: LABELS.complaints_email[lang] };

  // Not known yet: the owner has to decide. Always shows the marker until this line is changed.
  out.adr_provider = {
    kind: "missing",
    label: lang === "tr" ? "uyuşmazlık çözüm kuruluşu ya da kullanılmadığına dair açıklama" : "approved dispute resolution body, or a statement that we do not use one",
  };

  text("site", SITE_NAME);
  text("release_days", s.release_days);
  text("commission_card", pct(s.card_bps, lang));
  text(
    "commission_founding",
    lang === "tr"
      ? `${pct(s.founding_card_bps, lang)} + ${s.founding_card_fixed} peni`
      : `${pct(s.founding_card_bps, lang)} + ${s.founding_card_fixed}p`,
  );
  text("collection_attempts", COLLECTION_MAX_ATTEMPTS);
  text("promo_max_weeks", PROMO_MAX_WEEKS);
  text("book_ahead_days", PROMO_BOOK_AHEAD_DAYS);
  text("delivery_max_item", s.delivery_max_item_price > 0 ? formatGBP(s.delivery_max_item_price) : "");
  return out;
}

export const KNOWN_TOKENS_NOTE = "Tokens are defined in buildTokens(); an unknown one throws.";
