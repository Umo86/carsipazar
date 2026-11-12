import "server-only";
import { getSiteDetails, type SiteDetailKey } from "@/lib/site-details";
import { getSettings } from "@/lib/settings";
import { COLLECTION_MAX_ATTEMPTS, PROMO_BOOK_AHEAD_DAYS, PROMO_MAX_WEEKS, SITE_NAME, type Locale } from "@/lib/config";
import { formatGBP } from "@/lib/money";

// What each site-detail token is called in the "to be added" marker.
const LABELS: Record<SiteDetailKey | "postal_address", { en: string; tr: string }> = {
  legal_name: { en: "registered company name", tr: "şirket unvanı" },
  legal_form: { en: "legal form of the business", tr: "şirket türü" },
  legal_form_tr: { en: "legal form of the business (Turkish)", tr: "şirket türü" },
  company_no: { en: "company number", tr: "şirket numarası" },
  registered_address: { en: "registered office address", tr: "tescilli adres" },
  contact_address: { en: "postal address", tr: "posta adresi" },
  postal_address: { en: "postal address", tr: "posta adresi" },
  email: { en: "contact email", tr: "iletişim e-postası" },
  phone: { en: "phone number", tr: "telefon numarası" },
  vat_no: { en: "VAT number", tr: "KDV numarası" },
  ico_no: { en: "ICO registration number", tr: "ICO kayıt numarası" },
  complaints_email: { en: "complaints email", tr: "şikâyet e-postası" },
  adr: { en: "statement on alternative dispute resolution", tr: "alternatif uyuşmazlık çözümü açıklaması" },
  adr_tr: { en: "statement on alternative dispute resolution (Turkish)", tr: "alternatif uyuşmazlık çözümü açıklaması" },
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

  // Language-specific details. The Turkish pages use the Turkish legal form and ADR sentence.
  const formRaw = (lang === "tr" ? d.legal_form_tr : d.legal_form).trim();
  out.legal_form = formRaw
    ? { kind: "text", text: formRaw }
    : { kind: "missing", label: LABELS.legal_form[lang] };
  // Alternative dispute resolution: one sentence the owner writes (what we use, or that we use none).
  const adrRaw = (lang === "tr" ? d.adr_tr : d.adr).trim();
  out.adr = adrRaw
    ? { kind: "text", text: adrRaw }
    : {
        kind: "missing",
        label: lang === "tr"
          ? "uyuşmazlık çözüm kuruluşu ya da kullanılmadığına dair açıklama"
          : "approved dispute resolution body, or a statement that we do not use one",
      };

  // "Who runs the site", composed from whatever is filled in. A sole trader has no company number,
  // so it is only named when there is one. Until the legal name is filled in, a single marker shows.
  const legalName = d.legal_name.trim();
  const companyNo = d.company_no.trim();
  const address = (d.registered_address || d.contact_address).trim();
  if (!legalName) {
    out.operator = {
      kind: "missing",
      label: lang === "tr" ? "işletme adı ve yasal bilgiler" : "business name and legal details",
    };
  } else {
    const inner = [formRaw, companyNo && (lang === "tr" ? `şirket numarası ${companyNo}` : `company number ${companyNo}`)].filter(Boolean);
    let op = legalName + (inner.length ? ` (${inner.join(", ")})` : "");
    if (address) {
      const where = companyNo
        ? lang === "tr" ? "tescilli adres" : "registered office"
        : lang === "tr" ? "iş adresi" : "business address";
      op += `, ${where}: ${address}`;
    }
    out.operator = { kind: "text", text: op };
  }

  // Rows of the company details page. Once the legal name is filled in, a detail that does not apply
  // to this business (no company number, no VAT number, no phone) reads "Not applicable" instead of a marker.
  const orNA = (k: "company_no" | "vat_no" | "phone") =>
    d[k].trim()
      ? ({ kind: "text", text: d[k].trim() } as TokenValue)
      : legalName
        ? ({ kind: "text", text: lang === "tr" ? "Geçerli değil" : "Not applicable" } as TokenValue)
        : ({ kind: "missing", label: LABELS[k][lang] } as TokenValue);
  out.company_no_or_na = orNA("company_no");
  out.vat_no_or_na = orNA("vat_no");
  out.phone_or_na = orNA("phone");

  // The note under the company table. It only matters while the legal name is missing.
  out.legal_note = {
    kind: "text",
    text: legalName
      ? ""
      : lang === "tr"
        ? "Şirketsek ad, numara ve tescilli adres Companies House'ta kayıtlı olduğu gibidir. Şahıs işletmesiysek yasal ad işletme sahibinin adıdır ve adres, tebligat yapılabilecek bir Birleşik Krallık adresidir."
        : "If we are a company, the name, number and registered office are as registered at Companies House. If we are a sole trader, the legal name is the owner's name and the address is a UK address where documents can be served.",
  };

  text("site", SITE_NAME);
  text("release_days", s.release_days);
  text("commission_card", pct(s.card_bps, lang));
  text(
    "commission_founding",
    lang === "tr"
      ? `${pct(s.founding_card_bps, lang)} + ${s.founding_card_fixed}p`
      : `${pct(s.founding_card_bps, lang)} + ${s.founding_card_fixed}p`,
  );
  text("collection_attempts", COLLECTION_MAX_ATTEMPTS);
  text("promo_max_weeks", PROMO_MAX_WEEKS);
  text("book_ahead_days", PROMO_BOOK_AHEAD_DAYS);
  text("delivery_max_item", s.delivery_max_item_price > 0 ? formatGBP(s.delivery_max_item_price) : "");
  return out;
}

export const KNOWN_TOKENS_NOTE = "Tokens are defined in buildTokens(); an unknown one throws.";
