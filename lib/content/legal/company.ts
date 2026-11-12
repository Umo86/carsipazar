import type { Bi, Doc } from "../types";

export const company: Bi<Doc> = {
  en: {
    title: "Company details",
    description: "Who runs CarsiPazar: legal name, company number, registered office, contact details and tax and data protection registrations.",
    lead: "{{site}} is a marketplace. The items on it are sold by independent businesses. This page says who runs the marketplace.",
    legal: true,
    sections: [
      {
        id: "who",
        heading: "Who we are",
        blocks: [
          { t: "table", caption: "Company details", head: ["Detail", "Value"], rows: [
            ["Trading name", "{{site}}"],
            ["Legal name", "{{legal_name}}"],
            ["Legal form", "{{legal_form}}"],
            ["Company number", "{{company_no_or_na}}"],
            ["Registered office (or business address)", "{{registered_address}}"],
            ["Postal address for customers", "{{postal_address}}"],
          ] },
          { t: "p", text: "{{legal_note}}" },
        ],
      },
      {
        id: "contact",
        heading: "How to contact us",
        blocks: [
          { t: "table", caption: "Contact details", head: ["Detail", "Value"], rows: [
            ["Email", "{{email}}"],
            ["Complaints email", "{{complaints_email}}"],
            ["Telephone (if any)", "{{phone_or_na}}"],
          ] },
          { t: "p", text: "We aim to reply within 2 working days. See [Contact us](/contact)." },
        ],
      },
      {
        id: "registrations",
        heading: "Tax and registrations",
        blocks: [
          { t: "table", caption: "Registrations", head: ["Detail", "Value"], rows: [
            ["VAT number", "{{vat_no_or_na}}"],
            ["ICO registration number", "{{ico_no}}"],
          ] },
          { t: "p", text: "A VAT number is shown only if we are registered for VAT." },
        ],
      },
      {
        id: "role",
        heading: "Our role",
        blocks: [
          { t: "p", text: "{{site}} is a marketplace. The items are sold by independent businesses, and each sale is a contract between the buyer and that seller. We run the site, take payment, hold it until the order is delivered or collected, and pay the seller. See the [buyer terms](/legal/terms). Each shop's page shows the seller's own company details." },
        ],
      },
    ],
  },
  tr: {
    title: "Şirket bilgileri",
    description: "CarsiPazar'ı kim işletiyor: yasal ad, şirket numarası, tescilli adres, iletişim bilgileri ile vergi ve veri koruma kayıtları.",
    lead: "{{site}} bir çarşıdır. Buradaki ürünleri bağımsız işletmeler satar. Bu sayfa çarşıyı kimin işlettiğini söyler.",
    legal: true,
    sections: [
      {
        id: "who",
        heading: "Biz kimiz",
        blocks: [
          { t: "table", caption: "Şirket bilgileri", head: ["Bilgi", "Değer"], rows: [
            ["Ticari ad", "{{site}}"],
            ["Yasal ad", "{{legal_name}}"],
            ["Şirket türü", "{{legal_form}}"],
            ["Şirket numarası", "{{company_no_or_na}}"],
            ["Tescilli adres (ya da iş adresi)", "{{registered_address}}"],
            ["Müşteriler için posta adresi", "{{postal_address}}"],
          ] },
          { t: "p", text: "{{legal_note}}" },
        ],
      },
      {
        id: "contact",
        heading: "Bize nasıl ulaşırsın",
        blocks: [
          { t: "table", caption: "İletişim bilgileri", head: ["Bilgi", "Değer"], rows: [
            ["E-posta", "{{email}}"],
            ["Şikâyet e-postası", "{{complaints_email}}"],
            ["Telefon (varsa)", "{{phone_or_na}}"],
          ] },
          { t: "p", text: "2 iş günü içinde cevap vermeyi hedefleriz. [İletişim](/contact) sayfasına bak." },
        ],
      },
      {
        id: "registrations",
        heading: "Vergi ve kayıtlar",
        blocks: [
          { t: "table", caption: "Kayıtlar", head: ["Bilgi", "Değer"], rows: [
            ["KDV numarası", "{{vat_no_or_na}}"],
            ["ICO kayıt numarası", "{{ico_no}}"],
          ] },
          { t: "p", text: "KDV numarası yalnızca KDV mükellefiysek gösterilir." },
        ],
      },
      {
        id: "role",
        heading: "Rolümüz",
        blocks: [
          { t: "p", text: "{{site}} bir çarşıdır. Ürünleri bağımsız işletmeler satar ve her satış, alıcı ile o satıcı arasındaki bir sözleşmedir. Biz siteyi işletiriz, ödemeyi alırız, sipariş teslim edilene ya da teslim alınana kadar bekletiriz ve satıcıya öderiz. [Alıcı koşullarına](/legal/terms) bak. Her dükkân sayfasında satıcının kendi şirket bilgileri yer alır." },
        ],
      },
    ],
  },
};
