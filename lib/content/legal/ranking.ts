import type { Bi, Doc } from "../types";

export const ranking: Bi<Doc> = {
  en: {
    title: "How results are ordered",
    description: "How CarsiPazar orders items on the home page, in categories, in search and in the shops directory, and what the Sponsored label means.",
    lead: "Here is how we decide what you see first, and what “Sponsored” means.",
    legal: true,
    sections: [
      {
        id: "where",
        heading: "How each list is ordered",
        blocks: [
          {
            t: "table",
            caption: "Ordering by page",
            head: ["Where", "Order"],
            rows: [
              ["Home page, “Featured” row", "Items with paid Featured promotion running today first. Then items we have picked. Then the newest."],
              ["Home page, “Piece of the week”", "One item that a seller has paid to show alone. If nobody has booked it, it is not shown."],
              ["A street (category) page", "Items with paid Top of its street promotion running today first. Then the newest first."],
              ["Search results", "Items we have picked first, then the newest first. Paid promotion does not change the order of search results."],
              ["Shops directory", "Founding shops first, then by the date the shop opened."],
            ],
          },
          { t: "p", text: "Search finds items where every word you type appears in the title, description or shop name. It ignores capital letters and Turkish accents, so “sandik” finds “sandık”." },
          { t: "p", text: "Ratings and reviews do not change the order. A shop's rating is shown beside its items so you can judge for yourself." },
        ],
      },
      {
        id: "sponsored",
        heading: "What “Sponsored” means",
        blocks: [
          { t: "p", text: "A seller can pay for promotion. See [Pricing](/pricing) for the packages and prices. Items in a paid package are shown with a **Sponsored** label. Paid placement affects only where an item appears in the lists above. It does not change a shop's reviews or rating, and we do not check or endorse sponsored items more than others." },
          { t: "p", text: "Items we pick ourselves are not paid for." },
        ],
      },
    ],
  },
  tr: {
    title: "Sonuçlar nasıl sıralanır",
    description: "CarsiPazar'da ürünler ana sayfada, kategorilerde, aramada ve dükkân listesinde nasıl sıralanır; Sponsorlu etiketi ne anlama gelir.",
    lead: "Önce neyi göreceğine nasıl karar verdiğimizi ve “Sponsorlu” etiketinin ne demek olduğunu anlatıyoruz.",
    legal: true,
    sections: [
      {
        id: "where",
        heading: "Her liste nasıl sıralanır",
        blocks: [
          {
            t: "table",
            caption: "Sayfaya göre sıralama",
            head: ["Nerede", "Sıralama"],
            rows: [
              ["Ana sayfa, “Öne çıkanlar” sırası", "Önce bugün ücretli Öne çıkanlar tanıtımı süren ürünler. Sonra bizim seçtiklerimiz. Sonra en yeniler."],
              ["Ana sayfa, “Haftanın parçası”", "Bir satıcının tek başına göstermek için ödeme yaptığı tek ürün. Kimse ayırtmadıysa gösterilmez."],
              ["Bir sokak (kategori) sayfası", "Önce bugün ücretli Sokağın başında tanıtımı süren ürünler. Sonra en yeniler."],
              ["Arama sonuçları", "Önce bizim seçtiğimiz ürünler, sonra en yeniler. Ücretli tanıtım arama sonuçlarının sırasını değiştirmez."],
              ["Dükkân listesi", "Önce kurucu dükkânlar, sonra dükkânın açıldığı tarihe göre."],
            ],
          },
          { t: "p", text: "Arama, yazdığın her kelimenin başlıkta, açıklamada ya da dükkân adında geçtiği ürünleri bulur. Büyük/küçük harfi ve Türkçe harf işaretlerini yok sayar; “sandik” araması “sandık”ı bulur." },
          { t: "p", text: "Puanlar ve yorumlar sıralamayı değiştirmez. Dükkânın puanı, kendin karar verebilesin diye ürünlerinin yanında gösterilir." },
        ],
      },
      {
        id: "sponsored",
        heading: "“Sponsorlu” ne demek",
        blocks: [
          { t: "p", text: "Bir satıcı tanıtım için ödeme yapabilir. Paketler ve fiyatlar için [Ücretler](/pricing) sayfasına bak. Ücretli bir paketteki ürünler **Sponsorlu** etiketiyle gösterilir. Ücretli yerleşim yalnızca bir ürünün yukarıdaki listelerde nerede göründüğünü etkiler. Dükkânın yorumlarını ya da puanını değiştirmez; sponsorlu ürünleri diğerlerinden daha fazla kontrol etmeyiz ya da onaylamayız." },
          { t: "p", text: "Kendimizin seçtiği ürünler için ödeme yapılmaz." },
        ],
      },
    ],
  },
};
