import "server-only";
import { PARCEL_SIZE_KEYS, PARCEL_SIZES, PROMO_BOOK_AHEAD_DAYS, PROMO_KINDS, PROMO_MAX_WEEKS, type Locale, type Settings } from "@/lib/config";
import { computeFees, formatGBP } from "@/lib/money";
import type { Doc } from "./types";

// Everything numeric comes from the live settings and computeFees(); nothing is typed in here.
const EXAMPLES = [
  { en: "A scarf", tr: "Bir eşarp", pence: 4500 },
  { en: "An armchair", tr: "Bir berjer koltuk", pence: 42000 },
  { en: "A table", tr: "Bir masa", pence: 125000 },
];

export function pricingDoc(lang: Locale, s: Settings): Doc {
  const tr = lang === "tr";
  const pc = (bps: number) =>
    new Intl.NumberFormat(tr ? "tr-TR" : "en-GB", { maximumFractionDigits: 2 }).format(bps / 100);
  const pct = (bps: number) => (tr ? `%${pc(bps)}` : `${pc(bps)}%`);
  const rate = pct(s.card_bps);
  const founding = tr
    ? `${pct(s.founding_card_bps)} + ${s.founding_card_fixed}p`
    : `${pct(s.founding_card_bps)} + ${s.founding_card_fixed}p`;

  const examples = EXAMPLES.map((e) => {
    const std = computeFees({ total: e.pence, method: "card", founding: false, settings: s });
    const fnd = computeFees({ total: e.pence, method: "card", founding: true, settings: s });
    return [
      tr ? e.tr : e.en,
      formatGBP(e.pence),
      formatGBP(std.commission),
      formatGBP(std.sellerPayout),
      formatGBP(fnd.commission),
      formatGBP(fnd.sellerPayout),
    ];
  });

  // One item sent with a CarsiPazar delivery label: the label price is not part of the commission base.
  const label = s.delivery_small_price;
  const scarf = EXAMPLES[0].pence;
  const lab = computeFees({ total: scarf + label, method: "card", founding: false, settings: s, deliveryCost: label });

  const promoRows = (
    [
      ["featured", tr ? "Ana sayfada öne çıkanlar" : "Featured on the home page",
        tr ? "Ana sayfadaki “Öne çıkanlar” sırasının başında gösterilir." : "Shown first in the “Featured” row on the home page."],
      ["spotlight", tr ? "Haftanın parçası" : "Piece of the week",
        tr ? "Ana sayfanın en üstünde, tek başına gösterilir." : "Shown on its own at the top of the home page."],
      ["category_top", tr ? "Sokağın başında" : "Top of its street",
        tr ? "Kendi sokağının (kategorisinin) ilk sırasında gösterilir." : "Shown in the first row of its own street (category)."],
    ] as const
  ).map(([k, name, what]) => [
    name,
    what,
    tr
      ? k === "category_top" ? `Sokak başına ${PROMO_KINDS[k].slots}` : `${PROMO_KINDS[k].slots}`
      : k === "category_top" ? `${PROMO_KINDS[k].slots} per street` : `${PROMO_KINDS[k].slots}`,
    formatGBP(s[PROMO_KINDS[k].priceKey]),
  ]);

  const sizeName = { small: tr ? "Küçük" : "Small", medium: tr ? "Orta" : "Medium", large: tr ? "Büyük" : "Large" };
  const parcelRows = PARCEL_SIZE_KEYS.map((k) => {
    const p = PARCEL_SIZES[k];
    return [
      sizeName[k],
      tr ? `en fazla ${p.kg} kg, ${p.cm[0]} × ${p.cm[1]} × ${p.cm[2]} cm` : `up to ${p.kg} kg, ${p.cm[0]} × ${p.cm[1]} × ${p.cm[2]} cm`,
      formatGBP(s[p.priceKey]),
    ];
  });
  const maxItem = s.delivery_max_item_price > 0 ? formatGBP(s.delivery_max_item_price) : null;

  if (!tr) {
    return {
      title: "Pricing",
      description: `Opening a shop and listing items is free. CarsiPazar takes ${rate} commission on card sales, and nothing else unless you choose a paid extra.`,
      lead: "Opening a shop and listing items is free. You pay commission only when you sell.",
      sections: [
        {
          id: "buyers",
          heading: "If you are buying",
          blocks: [{ t: "p", text: "Buying is free: the price you see plus delivery is what you pay. We add no service fee at checkout." }],
        },
        {
          id: "free",
          heading: "What is free",
          blocks: [
            { t: "ul", items: ["Opening a shop", "Listing items", "No monthly fee", "No listing fee", "No set-up fee"] },
            { t: "p", text: "Your shop page, your link for Instagram and WhatsApp, and the seller panel cost nothing." },
          ],
        },
        {
          id: "commission",
          heading: "Commission on sales",
          blocks: [
            { t: "p", text: `When an item sells and the buyer pays by card, we keep ${rate} commission. That covers taking the payment, holding it safely and paying you.` },
            { t: "p", text: `Founding sellers, the first shops to open with us, pay a lower rate: ${founding} on card sales. The lower rate applies automatically if your shop is a founding seller.` },
            { t: "p", text: "If an order is refunded before you are paid, you pay no commission on it." },
            { t: "note", text: "Other payment methods, where a seller switches them on, carry their own rate. It is shown in the seller panel before you switch them on." },
            { t: "p", text: "We give at least 15 days' notice of a change to the seller terms. See [Seller terms](/legal/seller-terms)." },
          ],
        },
        {
          id: "base",
          heading: "What commission is charged on",
          blocks: [
            { t: "p", text: "Commission is charged on the price of the item. It is not charged on the delivery label when you use CarsiPazar delivery, because that charge pays for the delivery and is not part of your sale." },
            { t: "p", text: "If you deliver the item yourself and set your own postage, the postage is part of the sale, so commission is charged on the item price and your postage together." },
          ],
        },
        {
          id: "examples",
          heading: "Worked examples",
          blocks: [
            { t: "p", text: "Card sales, with the seller delivering. The commission is rounded to the nearest penny." },
            {
              t: "table",
              caption: "Worked examples of commission on card sales",
              head: ["Item", "Price", "Commission", "You receive", "Founding commission", "Founding you receive"],
              rows: examples,
            },
            { t: "p", text: `The same scarf sent with a small CarsiPazar delivery label: the buyer pays ${formatGBP(scarf + label)}, which is the ${formatGBP(scarf)} price plus the ${formatGBP(label)} label. Commission is charged on ${formatGBP(scarf)} only.` },
            {
              t: "table",
              caption: "Example with a CarsiPazar delivery label",
              head: ["Buyer pays", "Delivery label", "Commission", "You receive"],
              rows: [[formatGBP(scarf + label), formatGBP(label), formatGBP(lab.commission), formatGBP(lab.sellerPayout)]],
            },
          ],
        },
        {
          id: "paid",
          heading: "When you are paid",
          blocks: [
            { t: "p", text: "We hold the buyer's payment until the item has been delivered or collected. We pay you {{release_days}} days after the buyer confirms they have received the item, or after a collection is confirmed with the handover code. If a buyer does not confirm, tell us: we check the delivery and can confirm it ourselves. You need a connected bank account to be paid." },
            { t: "p", text: "The payout is processed the next time we run payouts, so it can arrive a little after that date. That short wait lets a buyer tell us if something is wrong. It is how the payment protection works. See [Delivery and collection](/help/delivery) for the steps." },
          ],
        },
        {
          id: "promotions",
          heading: "Paid promotion (optional)",
          blocks: [
            { t: "p", text: `You can pay to show an item more prominently. It is optional and you book it from the seller panel. Choose ${PROMO_MAX_WEEKS} weeks at most, starting within ${PROMO_BOOK_AHEAD_DAYS} days. Prices are per week.` },
            { t: "table", caption: "Paid promotion packages", head: ["Package", "What it does", "Places at one time", "Price per week"], rows: promoRows },
            { t: "p", text: "Promoted items are labelled “Sponsored”. If you cancel before the start date, you are refunded in full. Paying for promotion does not change your reviews or your rating. See [how results are ordered](/legal/ranking)." },
          ],
        },
        {
          id: "delivery",
          heading: "CarsiPazar delivery labels (optional)",
          blocks: [
            { t: "p", text: `Instead of arranging postage yourself, you can use a tracked CarsiPazar delivery label. There are three parcel sizes, shown below${maxItem ? `, and a label is available for items priced up to ${maxItem}` : ""}. The buyer pays the label price at checkout. It goes to CarsiPazar, not to you.` },
            { t: "table", caption: "Delivery label prices by parcel size", head: ["Parcel size", "Limits", "Buyer pays"], rows: parcelRows },
            { t: "p", text: maxItem ? `Anything that does not fit the largest size, or is priced above ${maxItem}, such as a sofa or a table, you deliver yourself or the buyer collects.` : "Anything bigger than the largest size, such as a sofa or a table, you deliver yourself or the buyer collects." },
          ],
        },
      ],
    };
  }

  return {
    title: "Ücretler",
    description: `Dükkân açmak ve ürün listelemek ücretsiz. CarsiPazar kartlı satışlardan ${rate} komisyon alır; ücretli ekstralar isteğe bağlıdır.`,
    lead: "Dükkân açmak ve ürün eklemek ücretsiz. Yalnızca sattığında komisyon ödersin.",
    sections: [
      {
        id: "buyers",
        heading: "Alıcıysan",
        blocks: [{ t: "p", text: "Alışveriş ücretsiz: gördüğün fiyat artı teslimat, ödeyeceğin tutardır. Ödeme sırasında hizmet bedeli eklemeyiz." }],
      },
      {
        id: "free",
        heading: "Ücretsiz olanlar",
        blocks: [
          { t: "ul", items: ["Dükkân açmak", "Ürün listelemek", "Aylık ücret yok", "Listeleme ücreti yok", "Kurulum ücreti yok"] },
          { t: "p", text: "Dükkân sayfan, Instagram ve WhatsApp için bağlantın ve satıcı paneli ücretsizdir." },
        ],
      },
      {
        id: "commission",
        heading: "Satışlardan komisyon",
        blocks: [
          { t: "p", text: `Bir ürün satıldığında ve alıcı kartla ödediğinde ${rate} komisyon alırız. Bu tutar ödemenin alınmasını, güvenle tutulmasını ve sana aktarılmasını kapsar.` },
          { t: "p", text: `Kurucu satıcılar, yani bizimle ilk açılan dükkânlar, daha düşük oran öder: kartlı satışlarda ${founding}. Dükkânın kurucu satıcıysa düşük oran kendiliğinden uygulanır.` },
          { t: "p", text: "Bir sipariş sana ödeme yapılmadan önce iade edilirse o sipariş için komisyon ödemezsin." },
          { t: "note", text: "Satıcının açtığı diğer ödeme yöntemlerinin kendi oranı vardır. Yöntemi açmadan önce oranı satıcı panelinde görürsün." },
          { t: "p", text: "Satıcı koşullarında yapılacak bir değişikliği en az 15 gün önceden bildiririz. [Satıcı koşulları](/legal/seller-terms) sayfasına bak." },
        ],
      },
      {
        id: "base",
        heading: "Komisyon neye uygulanır",
        blocks: [
          { t: "p", text: "Komisyon ürünün fiyatı üzerinden alınır. CarsiPazar teslimatı kullanırsan teslimat etiketi bedelinden alınmaz; çünkü o bedel teslimatın masrafını karşılar ve senin satışının parçası değildir." },
          { t: "p", text: "Ürünü kendin gönderir ve kendi kargo ücretini belirlersen kargo ücreti satışın parçasıdır. Komisyon ürün fiyatı ile kargo ücretinin toplamı üzerinden alınır." },
        ],
      },
      {
        id: "examples",
        heading: "Örnek hesaplar",
        blocks: [
          { t: "p", text: "Kartlı satışlar, ürünü satıcı gönderiyor. Komisyon en yakın peniye yuvarlanır." },
          {
            t: "table",
            caption: "Kartlı satışlarda komisyon örnekleri",
            head: ["Ürün", "Fiyat", "Komisyon", "Eline geçen", "Kurucu satıcı komisyonu", "Kurucu satıcının eline geçen"],
            rows: examples,
          },
          { t: "p", text: `Aynı eşarp küçük bir CarsiPazar teslimat etiketiyle gönderilirse alıcı ${formatGBP(scarf + label)} öder: ${formatGBP(scarf)} ürün fiyatı artı ${formatGBP(label)} etiket bedeli. Komisyon yalnızca ${formatGBP(scarf)} üzerinden alınır.` },
          {
            t: "table",
            caption: "CarsiPazar teslimat etiketiyle örnek",
            head: ["Alıcı öder", "Teslimat etiketi", "Komisyon", "Eline geçen"],
            rows: [[formatGBP(scarf + label), formatGBP(label), formatGBP(lab.commission), formatGBP(lab.sellerPayout)]],
          },
        ],
      },
      {
        id: "paid",
        heading: "Ödemeni ne zaman alırsın",
        blocks: [
          { t: "p", text: "Alıcının ödemesini ürün teslim edilene ya da teslim alınana kadar bizde tutarız. Alıcı ürünü aldığını onayladıktan, ya da dükkândan teslim, teslim koduyla onaylandıktan {{release_days}} gün sonra ödemeni yaparız. Alıcı onaylamazsa bize haber ver: teslimatı kontrol eder, gerekirse biz onaylarız. Ödeme alabilmen için bağlı bir banka hesabın olmalıdır." },
          { t: "p", text: "Ödeme, bir sonraki ödeme işlemi çalıştırıldığında yapılır; bu yüzden o tarihten biraz sonra hesabına geçebilir. Bu kısa bekleme, bir sorun olursa alıcının bize haber vermesini sağlar. Korumalı ödeme böyle çalışır. Adımlar için [Teslimat ve teslim alma](/help/delivery) sayfasına bak." },
        ],
      },
      {
        id: "promotions",
        heading: "Ücretli tanıtım (isteğe bağlı)",
        blocks: [
          { t: "p", text: `Bir ürünü daha görünür yapmak için ödeme yapabilirsin. Zorunlu değildir; satıcı panelinden ayırtırsın. En fazla ${PROMO_MAX_WEEKS} hafta seçebilirsin ve başlangıç tarihi en geç ${PROMO_BOOK_AHEAD_DAYS} gün sonra olabilir. Fiyatlar haftalıktır.` },
          { t: "table", caption: "Ücretli tanıtım paketleri", head: ["Paket", "Ne yapar", "Aynı anda kaç yer", "Haftalık fiyat"], rows: promoRows },
          { t: "p", text: "Tanıtılan ürünlerde “Sponsorlu” etiketi görünür. Başlangıç tarihinden önce iptal edersen ücretin tamamı iade edilir. Tanıtım için ödeme yapman yorumlarını ya da puanını değiştirmez. [Sonuçların nasıl sıralandığına](/legal/ranking) bak." },
        ],
      },
      {
        id: "delivery",
        heading: "CarsiPazar teslimat etiketi (isteğe bağlı)",
        blocks: [
          { t: "p", text: `Kargoyu kendin ayarlamak yerine takipli bir CarsiPazar teslimat etiketi kullanabilirsin. Aşağıda gösterilen üç paket boyu var${maxItem ? `; etiket ${maxItem} ve altındaki ürünlerde kullanılabilir` : ""}. Etiket bedelini alıcı ödeme sırasında öder. Bu tutar sana değil CarsiPazar'a gider.` },
          { t: "table", caption: "Paket boyuna göre etiket fiyatları", head: ["Paket boyu", "Sınırlar", "Alıcı öder"], rows: parcelRows },
          { t: "p", text: maxItem ? `En büyük boya sığmayan ya da ${maxItem} üzerinde fiyatlanan ürünleri, örneğin kanepe ya da masayı, kendin gönderirsin ya da alıcı dükkândan alır.` : "En büyük boyu aşan ürünleri, örneğin kanepe ya da masayı, kendin gönderirsin ya da alıcı dükkândan alır." },
        ],
      },
    ],
  };
}

export const pricingCta = {
  en: { title: "Open a shop for free", body: "Opening a shop and listing items is free. You pay commission only when you sell." },
  tr: { title: "Ücretsiz dükkân aç", body: "Dükkân açmak ve ürün eklemek ücretsiz. Yalnızca sattığında komisyon ödersin." },
};
