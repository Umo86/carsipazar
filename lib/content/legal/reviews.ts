import type { Bi, Doc } from "../types";

export const reviews: Bi<Doc> = {
  en: {
    title: "How reviews work",
    description: "Who can review a shop on CarsiPazar, how we keep reviews honest, how to report a review and how sellers can reply.",
    lead: "Reviews help people trust a shop. They are only worth reading if they are real. This is how we keep them real.",
    legal: true,
    sections: [
      {
        id: "who",
        heading: "Who can write a review",
        blocks: [
          { t: "ul", items: [
            "Only a buyer who has received an order, by delivery or collection. You cannot review a shop you have not bought from.",
            "One review for each order.",
            "A review has a rating from 1 to 5 stars and an optional comment. It shows your name.",
          ] },
        ],
      },
      {
        id: "paid",
        heading: "Reviews are not paid for",
        blocks: [
          { t: "p", text: "Shops may not pay for reviews, offer gifts, discounts or refunds in return for reviews, write reviews of their own shop, or ask only happy customers to review. Buyers may not accept payment to write a review. We do not pay for reviews either." },
          { t: "p", text: "A shop's rating is the average of its published reviews. Paying for promotion does not change it. See [how results are ordered](/legal/ranking)." },
        ],
      },
      {
        id: "negative",
        heading: "Bad reviews are published too",
        blocks: [
          { t: "p", text: "Reviews are published on the same basis whether they are good or bad. A seller cannot edit or delete a review. A seller can reply to it once, and the reply is shown under the review." },
        ],
      },
      {
        id: "removal",
        heading: "What we remove",
        blocks: [
          { t: "p", text: "We hide a review if it:" },
          { t: "ul", items: [
            "is fake, paid for, or not based on a real order",
            "contains abuse, hate, threats or private information about someone",
            "is about something other than the order, such as an unrelated dispute",
            "is unlawful",
          ] },
          { t: "p", text: "We do not remove a review just because it is critical or the seller disagrees with it." },
        ],
      },
      {
        id: "report",
        heading: "Reporting a review",
        blocks: [
          { t: "p", text: "Use the Report link on the review or the shop page, or [contact us](/contact) with the web address and what is wrong. We look at every report and decide whether the review breaks these rules. We will tell the person who reported it what we decided where we can." },
        ],
      },
    ],
  },
  tr: {
    title: "Yorumlar nasıl çalışır",
    description: "CarsiPazar'da bir dükkân için kimler yorum yazabilir, yorumları nasıl dürüst tutarız, bir yorum nasıl bildirilir ve satıcılar nasıl cevap verebilir.",
    lead: "Yorumlar bir dükkâna güvenmeyi kolaylaştırır. Ama okumaya değer olmaları için gerçek olmaları gerekir. Onları böyle gerçek tutarız.",
    legal: true,
    sections: [
      {
        id: "who",
        heading: "Kimler yorum yazabilir",
        blocks: [
          { t: "ul", items: [
            "Yalnızca siparişini teslimatla ya da dükkândan teslimle almış alıcılar. Alışveriş yapmadığın bir dükkânı değerlendiremezsin.",
            "Her sipariş için bir yorum.",
            "Yorumda 1 ile 5 yıldız arasında bir puan ve isteğe bağlı bir yorum metni bulunur. Adın görünür.",
          ] },
        ],
      },
      {
        id: "paid",
        heading: "Yorumların karşılığı ödenmez",
        blocks: [
          { t: "p", text: "Dükkânlar yorum için ödeme yapamaz, yorum karşılığında hediye, indirim ya da iade sunamaz, kendi dükkânlarına yorum yazamaz ve yalnızca memnun müşterilerden yorum isteyemez. Alıcılar yorum yazmak için ödeme kabul edemez. Biz de yorum için ödeme yapmayız." },
          { t: "p", text: "Bir dükkânın puanı, yayımlanan yorumlarının ortalamasıdır. Tanıtım için ödeme yapmak puanı değiştirmez. [Sonuçların nasıl sıralandığına](/legal/ranking) bak." },
        ],
      },
      {
        id: "negative",
        heading: "Olumsuz yorumlar da yayımlanır",
        blocks: [
          { t: "p", text: "Yorumlar iyi de olsa kötü de olsa aynı esaslara göre yayımlanır. Satıcı bir yorumu değiştiremez ya da silemez. Bir yoruma bir kez cevap verebilir; cevap yorumun altında gösterilir." },
        ],
      },
      {
        id: "removal",
        heading: "Neleri kaldırırız",
        blocks: [
          { t: "p", text: "Bir yorum şunlardan biriyse gizleriz:" },
          { t: "ul", items: [
            "sahte, karşılığı ödenmiş ya da gerçek bir siparişe dayanmayan",
            "hakaret, nefret, tehdit ya da birinin özel bilgilerini içeren",
            "siparişle değil, başka bir konuyla, örneğin alakasız bir anlaşmazlıkla ilgili",
            "yasa dışı",
          ] },
          { t: "p", text: "Bir yorumu yalnızca eleştirel olduğu ya da satıcı katılmadığı için kaldırmayız." },
        ],
      },
      {
        id: "report",
        heading: "Bir yorumu bildirmek",
        blocks: [
          { t: "p", text: "Yorumdaki ya da dükkân sayfasındaki Bildir bağlantısını kullan ya da web adresi ve neyin yanlış olduğuyla [bize ulaş](/contact). Her bildirimi inceler ve yorumun bu kuralları çiğneyip çiğnemediğine karar veririz. Mümkün olduğunda kararımızı bildirene söyleriz." },
        ],
      },
    ],
  },
};
