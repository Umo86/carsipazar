import type { Bi } from "./types";

// Footer column headings and links added by the pages work. The brand block,
// the About link, category names and "Open a shop" keep using the existing dictionary.
export const footerText: Bi<{
  shop: string; help: string; selling: string; legal: string;
  helpCentre: string; delivery: string; returns: string; contact: string;
  pricing: string; sellerGuide: string;
  terms: string; sellerTerms: string; privacy: string; cookies: string; allLegal: string;
  companyNo: string; registeredOffice: string;
}> = {
  en: {
    shop: "Shop", help: "Help", selling: "Selling", legal: "Legal",
    helpCentre: "Help centre", delivery: "Delivery and collection", returns: "Returns and refunds", contact: "Contact",
    pricing: "Pricing", sellerGuide: "Seller guide",
    terms: "Terms", sellerTerms: "Seller terms", privacy: "Privacy", cookies: "Cookies", allLegal: "All legal pages",
    companyNo: "Company number", registeredOffice: "Registered office",
  },
  tr: {
    shop: "Alışveriş", help: "Yardım", selling: "Satış", legal: "Yasal",
    helpCentre: "Yardım merkezi", delivery: "Teslimat ve teslim alma", returns: "İade ve geri ödeme", contact: "İletişim",
    pricing: "Ücretler", sellerGuide: "Satıcı rehberi",
    terms: "Koşullar", sellerTerms: "Satıcı koşulları", privacy: "Gizlilik", cookies: "Çerezler", allLegal: "Tüm yasal sayfalar",
    companyNo: "Şirket numarası", registeredOffice: "Tescilli adres",
  },
};
