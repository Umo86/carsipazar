import type { Bi, Doc } from "../types";

export const prohibited: Bi<Doc> = {
  en: {
    title: "Prohibited and restricted items",
    description: "What you may not list on CarsiPazar and the rules for furniture, clothing and jewellery: counterfeits, unsafe goods, fire safety, textile labels and hallmarking.",
    lead: "Some things cannot be sold here. Others can, if the seller meets the rules. This page is for sellers and for anyone who wants to report a listing.",
    legal: true,
    sections: [
      {
        id: "prohibited",
        heading: "Not allowed",
        blocks: [
          { t: "ul", items: [
            "counterfeit, fake or imitation branded goods",
            "unsafe or recalled products",
            "stolen goods",
            "illegal weapons, including knives that cannot lawfully be sold",
            "items made from protected species, such as ivory, tortoiseshell or coral",
            "precious-metal articles that break hallmarking law",
            "upholstered furniture that does not meet fire-safety law",
            "anything that is unlawful to sell in the UK",
            "services, gift cards and digital goods. {{site}} is for physical goods in furniture, clothing and jewellery",
            "items you do not have in stock, or that you cannot send",
          ] },
        ],
      },
      {
        id: "furniture",
        heading: "Furniture",
        blocks: [
          { t: "p", text: "Upholstered furniture, including sofas, armchairs, cushions and mattresses, must meet the Furniture and Furnishings (Fire) (Safety) Regulations 1988 as amended. That includes any permanent fire-resistance labelling that applies. The rules changed on 30 October 2025, so check the current rules for your item. Keep proof. Do not list upholstered furniture if you cannot show that it complies." },
          { t: "p", text: "Say clearly in the listing if an item is second-hand, damaged or needs repair. List the real dimensions." },
        ],
      },
      {
        id: "clothing",
        heading: "Clothing",
        blocks: [
          { t: "p", text: "Garments must carry the fibre composition label required by the Textile Products regulations, and the listing should give the same information. Do not use brand names you are not entitled to use." },
        ],
      },
      {
        id: "jewellery",
        heading: "Jewellery",
        blocks: [
          { t: "ul", items: [
            "Do not describe an article as gold, silver, platinum or palladium unless it is. Plated or filled items must say so.",
            "Precious-metal articles above the weight limits must be hallmarked by a UK assay office. Read [Hallmarking](/legal/hallmarking).",
            "Jewellery that touches the skin must meet the limits on nickel, lead and cadmium.",
            "Say what each stone is: natural, lab-made or imitation.",
          ] },
        ],
      },
      {
        id: "evidence",
        heading: "Proof we may ask for",
        blocks: [
          { t: "p", text: "We may ask a seller for a supplier invoice, a photo of a label or hallmark, a safety certificate, or proof of origin. A seller who cannot show them may have the listing removed." },
        ],
      },
      {
        id: "action",
        heading: "What we do when a listing breaks the rules",
        blocks: [
          { t: "ul", items: [
            "We take the listing down.",
            "If we remove a listing or suspend a shop, the seller can ask us for the reasons by writing to {{email}}; we reply within 2 working days.",
            "For a serious or repeated breach we suspend the shop. See the [seller terms](/legal/seller-terms).",
            "Where the law requires, we tell the police, Trading Standards or another authority.",
          ] },
        ],
      },
      {
        id: "report",
        heading: "Reporting a listing",
        blocks: [
          { t: "p", text: "Use the Report link on the item page. See [Complaints and reporting](/legal/complaints) for what happens next." },
        ],
      },
    ],
  },
  tr: {
    title: "Yasaklı ve kısıtlı ürünler",
    description: "CarsiPazar'da neleri listeleyemezsin ve mobilya, giyim ve takı için kurallar: sahte ürünler, güvensiz ürünler, yangın güvenliği, tekstil etiketleri ve damga.",
    lead: "Bazı şeyler burada satılamaz. Bazıları ise satıcı kurallara uyarsa satılabilir. Bu sayfa satıcılar ve bir ilanı bildirmek isteyenler için.",
    legal: true,
    sections: [
      {
        id: "prohibited",
        heading: "İzin verilmeyenler",
        blocks: [
          { t: "ul", items: [
            "sahte ürünler ve marka taklidi ürünler",
            "güvensiz veya geri çağrılmış ürünler",
            "çalıntı mallar",
            "yasa dışı silahlar; yasal olarak satılamayan bıçaklar dahil",
            "fildişi, kaplumbağa kabuğu ya da mercan gibi korunan türlerden yapılmış ürünler",
            "damga mevzuatını ihlal eden kıymetli metal ürünleri",
            "yangın güvenliği mevzuatına uymayan döşemeli mobilya",
            "Birleşik Krallık'ta satılması yasa dışı olan her şey",
            "hizmetler, hediye kartları ve dijital ürünler. {{site}}; mobilya, giyim ve takı alanında fiziksel ürünler içindir",
            "stokta olmayan ya da gönderemeyeceğin ürünler",
          ] },
        ],
      },
      {
        id: "furniture",
        heading: "Mobilya",
        blocks: [
          { t: "p", text: "Kanepe, berjer koltuk, yastık ve yatak gibi döşemeli mobilya, değişikliklerle birlikte Furniture and Furnishings (Fire) (Safety) Regulations 1988'e uymalıdır. Geçerli olan kalıcı yangına dayanıklılık etiketleri de buna dahildir. Kurallar 30 Ekim 2025'te değişti; ürünün için güncel kuralları kontrol et. Belgesini sakla. Uyduğunu gösteremiyorsan döşemeli mobilya listeleme." },
          { t: "p", text: "Bir ürün ikinci el ya da hasarlıysa veya onarım gerektiriyorsa ilanda açıkça belirt. Gerçek ölçüleri yaz." },
        ],
      },
      {
        id: "clothing",
        heading: "Giyim",
        blocks: [
          { t: "p", text: "Giysilerde Textile Products yönetmeliklerinin gerektirdiği elyaf bileşimi etiketi bulunmalı, ilanda da aynı bilgi verilmelidir. Kullanma hakkın olmayan marka adlarını kullanma." },
        ],
      },
      {
        id: "jewellery",
        heading: "Takı",
        blocks: [
          { t: "ul", items: [
            "Bir ürün gerçekten altın, gümüş, platin ya da paladyum değilse öyle tanımlama. Kaplama ya da dolgu ürünlerde bunu belirt.",
            "Ağırlık sınırlarını aşan kıymetli metal ürünleri bir Birleşik Krallık damga ofisi tarafından damgalanmış olmalıdır. [Damga](/legal/hallmarking) sayfasını oku.",
            "Cilde temas eden takılar nikel, kurşun ve kadmiyum sınırlarına uymalıdır.",
            "Her taşın ne olduğunu yaz: doğal, laboratuvar üretimi ya da taklit.",
          ] },
        ],
      },
      {
        id: "evidence",
        heading: "İsteyebileceğimiz belgeler",
        blocks: [
          { t: "p", text: "Satıcıdan tedarikçi faturası, etiket ya da damga fotoğrafı, güvenlik sertifikası veya menşe belgesi isteyebiliriz. Bunları gösteremeyen satıcının ilanı kaldırılabilir." },
        ],
      },
      {
        id: "action",
        heading: "Bir ilan kuralları çiğnediğinde ne yapıyoruz",
        blocks: [
          { t: "ul", items: [
            "İlanı kaldırırız.",
            "Bir ilanı kaldırırsak ya da bir dükkânı askıya alırsak satıcı gerekçeyi {{email}} adresine yazarak isteyebilir; 2 iş günü içinde yanıt veririz.",
            "Ciddi ya da tekrarlanan ihlalde dükkânı askıya alırız. [Satıcı koşullarına](/legal/seller-terms) bak.",
            "Yasa gerektirdiğinde polise, Trading Standards'a ya da başka bir kuruma bildiririz.",
          ] },
        ],
      },
      {
        id: "report",
        heading: "Bir ilanı bildirmek",
        blocks: [
          { t: "p", text: "Ürün sayfasındaki Bildir bağlantısını kullan. Sonrasında ne olacağı için [Şikâyetler ve bildirimler](/legal/complaints) sayfasına bak." },
        ],
      },
    ],
  },
};
