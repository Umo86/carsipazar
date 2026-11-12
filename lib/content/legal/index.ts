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
  { slug: "terms", status: "REQUIRED", doc: terms, blurb: { en: "the rules for using the site and for buying from its shops.", tr: "siteyi kullanma ve dükkânlardan alışveriş yapma kuralları." } },
  { slug: "seller-terms", status: "REQUIRED", doc: sellerTerms, blurb: { en: "what shops agree to when they sell here: fees, payouts, delivery and returns.", tr: "dükkânların burada satış yaparken kabul ettiği ücret, ödeme, teslimat ve iade koşulları." } },
  { slug: "privacy", status: "REQUIRED", doc: privacy, blurb: { en: "what personal data we collect, why, and your rights.", tr: "hangi kişisel verileri neden topladığımız ve haklarının neler olduğu." } },
  { slug: "cookies", status: "EXPECTED", doc: cookies, blurb: { en: "the two cookies we use.", tr: "kullandığımız iki çerez." } },
  { slug: "complaints", status: "REQUIRED", doc: complaints, blurb: { en: "how to complain and how to report illegal content.", tr: "şikâyet nasıl yapılır, yasa dışı içerik nasıl bildirilir." } },
  { slug: "reviews", status: "EXPECTED", doc: reviews, blurb: { en: "who can review a shop and how we keep reviews honest.", tr: "kimler yorum yazabilir, yorumları nasıl dürüst tutarız." } },
  { slug: "ranking", status: "REQUIRED", doc: ranking, blurb: { en: "what we show first, and what the Sponsored label means.", tr: "önce neyi gösterdiğimiz ve Sponsorlu etiketinin ne demek olduğu." } },
  { slug: "prohibited-items", status: "EXPECTED", doc: prohibited, blurb: { en: "what may not be listed, and the rules for furniture, clothing and jewellery.", tr: "neler listelenemez; mobilya, giyim ve takı kuralları." } },
  { slug: "hallmarking", status: "EXPECTED", doc: hallmarking, blurb: { en: "UK hallmarking rules for precious-metal jewellery.", tr: "kıymetli metal takılar için Birleşik Krallık damga kuralları." } },
  { slug: "company", status: "REQUIRED", doc: company, blurb: { en: "who runs CarsiPazar: legal name, address and registrations.", tr: "CarsiPazar'ı kim işletiyor: yasal ad, adres ve kayıtlar." } },
];

export const findLegal = (slug: string) => LEGAL_PAGES.find((p) => p.slug === slug) ?? null;
