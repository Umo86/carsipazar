import type { Bi, Doc } from "../types";

export const hallmarking: Bi<Doc> = {
  en: {
    title: "Hallmarking and jewellery information",
    description: "UK hallmarking rules for gold, silver, platinum and palladium jewellery sold on CarsiPazar, the weight exemptions and the dealer's notice.",
    lead: "In the UK, most gold, silver, platinum and palladium jewellery must carry a hallmark. This page explains the basics for buyers and sellers.",
    legal: true,
    sections: [
      {
        id: "rule",
        heading: "The rule",
        blocks: [
          { t: "p", text: "Under the Hallmarking Act 1973 it is an offence to describe an article as wholly or partly made of gold, silver, platinum or palladium if that is not true, or to supply such an article without a hallmark applied by a UK assay office. This applies to online sales." },
          { t: "p", text: "A hallmark shows the metal, its purity, the assay office and the maker's mark." },
        ],
      },
      {
        id: "exempt",
        heading: "Weight exemptions",
        blocks: [
          { t: "p", text: "An article does not need a hallmark if its total metal weight is below:" },
          { t: "table", caption: "Hallmarking weight exemptions", head: ["Metal", "Does not need a hallmark if lighter than"], rows: [
            ["Gold", "1 gram"],
            ["Silver", "7.78 grams"],
            ["Platinum", "0.5 grams"],
            ["Palladium", "1 gram"],
          ] },
          { t: "p", text: "An unhallmarked article that is exempt must still be described accurately. Articles made to be sent abroad are exempt too." },
        ],
      },
      {
        id: "sellers",
        heading: "For sellers",
        blocks: [
          { t: "ul", items: [
            "Say in the listing whether the item is hallmarked, or why it is exempt.",
            "Show the metal and the purity, such as “925 sterling silver”.",
            "State plated, filled or gold-tone items clearly. They are not gold or silver.",
            "As a dealer in precious metals you must display the British Hallmarking Council's dealer's notice. On a website the notice is read as being on your premises. A short online version exists: [Digital dealer's notice](https://www.gov.uk/government/publications/hallmarking-awareness-and-learning-online-halo-award-2022/digital-dealers-notice-text-only).",
          ] },
          { t: "p", text: "More about what is not allowed is in [Prohibited and restricted items](/legal/prohibited-items)." },
        ],
      },
    ],
  },
  tr: {
    title: "Damga ve takı bilgileri",
    description: "CarsiPazar'da satılan altın, gümüş, platin ve paladyum takılar için Birleşik Krallık damga kuralları, ağırlık istisnaları ve satıcı bildirimi.",
    lead: "Birleşik Krallık'ta altın, gümüş, platin ve paladyum takıların çoğunda damga bulunmalıdır. Bu sayfa alıcılar ve satıcılar için temel bilgileri anlatır.",
    legal: true,
    sections: [
      {
        id: "rule",
        heading: "Kural",
        blocks: [
          { t: "p", text: "Hallmarking Act 1973 uyarınca bir ürünü tamamen ya da kısmen altın, gümüş, platin veya paladyumdan yapılmış diye tanımlamak (doğru değilse) ya da bu tür bir ürünü bir Birleşik Krallık damga ofisinin vurduğu damga olmadan satmak suçtur. Bu, online satışlar için de geçerlidir." },
          { t: "p", text: "Damga; madeni, saflığını, damga ofisini ve üreticinin işaretini gösterir." },
        ],
      },
      {
        id: "exempt",
        heading: "Ağırlık istisnaları",
        blocks: [
          { t: "p", text: "Toplam maden ağırlığı aşağıdakilerin altındaysa ürünün damgalı olması gerekmez:" },
          { t: "table", caption: "Damga ağırlık istisnaları", head: ["Maden", "Şundan hafifse damga gerekmez"], rows: [
            ["Altın", "1 gram"],
            ["Gümüş", "7,78 gram"],
            ["Platin", "0,5 gram"],
            ["Paladyum", "1 gram"],
          ] },
          { t: "p", text: "İstisna kapsamındaki damgasız ürün de doğru tanımlanmalıdır. Yurt dışına gönderilmek üzere yapılan ürünler de istisnadır." },
        ],
      },
      {
        id: "sellers",
        heading: "Satıcılar için",
        blocks: [
          { t: "ul", items: [
            "İlanda ürünün damgalı olup olmadığını ya da neden istisna olduğunu belirt.",
            "Madeni ve saflığı yaz; örneğin “925 ayar gümüş”.",
            "Kaplama, dolgu ya da altın rengi ürünleri açıkça belirt. Bunlar altın ya da gümüş değildir.",
            "Kıymetli maden satıcısı olarak British Hallmarking Council'in satıcı bildirimini göstermelisin. İnternet sitesi işyerin sayılır. Kısa bir online sürümü var: [Dijital satıcı bildirimi](https://www.gov.uk/government/publications/hallmarking-awareness-and-learning-online-halo-award-2022/digital-dealers-notice-text-only).",
          ] },
          { t: "p", text: "Nelerin yasak olduğuyla ilgili daha fazlası [Yasaklı ve kısıtlı ürünler](/legal/prohibited-items) sayfasında." },
        ],
      },
    ],
  },
};
