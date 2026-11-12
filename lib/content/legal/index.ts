import type { Bi, Doc, PageStatus } from "../types";
import { terms } from "./terms";
import { sellerTerms } from "./seller-terms";
import { privacy } from "./privacy";
import { cookies } from "./cookies";
import { reviews } from "./reviews";
import { ranking } from "./ranking";
import { prohibited } from "./prohibited-items";
import { complaints } from "./complaints";
import { company } from "./company";
import { hallmarking } from "./hallmarking";

export type LegalPage = {
  slug: string;
  status: PageStatus; // from the research file
  blurb: Bi<string>; // one line for the index
  doc: Bi<Doc>;
};

// Order = order on the /legal index.
export const LEGAL_PAGES: LegalPage[] = [
  { slug: "terms", status: "REQUIRED", doc: terms, blurb: { en: "Terms of use and sale for buyers.", tr: "Alıcılar için kullanım ve satış koşulları." } },
  { slug: "seller-terms", status: "REQUIRED", doc: sellerTerms, blurb: { en: "The terms for shops that sell on CarsiPazar.", tr: "CarsiPazar'da satış yapan dükkânların koşulları." } },
  { slug: "privacy", status: "REQUIRED", doc: privacy, blurb: { en: "What personal data we collect and your rights.", tr: "Hangi kişisel verileri topladığımız ve haklarının neler olduğu." } },
  { slug: "cookies", status: "EXPECTED", doc: cookies, blurb: { en: "The two cookies we use.", tr: "Kullandığımız iki çerez." } },
  { slug: "complaints", status: "REQUIRED", doc: complaints, blurb: { en: "How to complain and how to report illegal content.", tr: "Şikâyet nasıl yapılır, yasa dışı içerik nasıl bildirilir." } },
  { slug: "reviews", status: "EXPECTED", doc: reviews, blurb: { en: "Who can review a shop and how we keep reviews honest.", tr: "Kimler yorum yazabilir, yorumları nasıl dürüst tutarız." } },
  { slug: "ranking", status: "REQUIRED", doc: ranking, blurb: { en: "How results are ordered and what Sponsored means.", tr: "Sonuçlar nasıl sıralanır, Sponsorlu ne demek." } },
  { slug: "prohibited-items", status: "EXPECTED", doc: prohibited, blurb: { en: "What may not be listed, and the rules for furniture, clothing and jewellery.", tr: "Neler listelenemez; mobilya, giyim ve takı kuralları." } },
  { slug: "hallmarking", status: "EXPECTED", doc: hallmarking, blurb: { en: "UK hallmarking rules for precious-metal jewellery.", tr: "Kıymetli maden takılar için Birleşik Krallık damga kuralları." } },
  { slug: "company", status: "REQUIRED", doc: company, blurb: { en: "Who runs CarsiPazar: legal name, address and registrations.", tr: "CarsiPazar'ı kim işletiyor: yasal ad, adres ve kayıtlar." } },
];

export const findLegal = (slug: string) => LEGAL_PAGES.find((p) => p.slug === slug) ?? null;
