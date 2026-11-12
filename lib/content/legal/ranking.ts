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
              ["Home page, large picture at the top", "If we have uploaded a video, the video is shown. Otherwise it is the first furniture item in the “Featured” row that is not there through paid promotion (or the first such item if there is no furniture). It never shows a paid item, because the picture carries no label. If there is no such item, no item picture is shown."],
              ["Home page, “Featured” row", "Up to 10 items. Items with paid Featured promotion running today first (labelled Sponsored). Then items we have marked as featured ourselves. Then the newest."],
              ["Home page, “Piece of the week”", "If a seller has booked the Piece of the week for today, it is shown labelled Sponsored. If nobody has booked it, we choose one of our own unpaid picks from the Featured row and show it without a label. An item that is there through paid promotion is never shown without its Sponsored label."],
              ["Home page, “New in” row", "The 8 newest items. Paid promotion does not change this row."],
              ["Home page, the pictures of the streets", "One picture for each street (category): an item we have marked as featured if there is one, otherwise the newest."],
              ["Home page, “The shops”", "The first four shops of the shops directory, in the same order."],
              ["A street (category) page", "Items with paid Top of its street promotion running today first (labelled Sponsored). Then the newest first. The page shows up to 120 items."],
              ["Search results", "Items we have marked as featured first, then the newest first. Up to 120 results. Paid promotion does not change the order of search results, and they carry no Sponsored label."],
              ["Shops directory", "Founding shops first, then by the date the shop opened, earliest first."],
            ],
          },
          { t: "p", text: "Only live items from approved shops are listed anywhere. “Featured” items are chosen by us: an administrator marks them, and nobody pays for that. Shops that joined as founding shops are listed first in the shops directory and pay a lower commission (see [Pricing](/pricing))." },
          { t: "p", text: "Search finds items where every word you type appears in the title, description or shop name. It ignores capital letters and Turkish accents, so “sandik” finds “sandık”." },
          { t: "p", text: "Ratings and reviews do not change the order. A shop's rating is shown beside its items so you can judge for yourself." },
        ],
      },
      {
        id: "sponsored",
        heading: "What “Sponsored” means",
        blocks: [
          { t: "p", text: "A seller can pay for promotion. See [Pricing](/pricing) for the packages and prices. Items in a paid package are shown with a **Sponsored** label. Paid placement affects only where an item appears in the lists above. It does not change a shop's reviews or rating, and we do not check or endorse sponsored items more than others." },
          { t: "p", text: "Items we mark as featured ourselves, and the item we choose for the Piece of the week when nobody has booked it, are not paid for." },
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
              ["Ana sayfa, en üstteki büyük görsel", "Bir video yüklediysek video gösterilir. Yüklemediysek “Öne çıkanlar” sırasında ücretli tanıtım nedeniyle yer almayan ilk mobilya ürünü (mobilya yoksa bu koşula uyan ilk ürün) gösterilir. Görselin etiketi olmadığı için burada ücretli bir ürün hiçbir zaman gösterilmez. Uygun ürün yoksa ürün görseli gösterilmez."],
              ["Ana sayfa, “Öne çıkanlar” sırası", "En fazla 10 ürün. Önce bugün ücretli Öne çıkanlar tanıtımı süren ürünler (Sponsorlu etiketiyle). Sonra bizim öne çıkardıklarımız. Sonra en yeniler."],
              ["Ana sayfa, “Haftanın parçası”", "Haftanın parçasını bugün için bir satıcı ayırtmışsa Sponsorlu etiketiyle gösterilir. Kimse ayırtmamışsa “Öne çıkanlar” sırasından ücretli olmayan kendi seçimlerimizden birini etiketsiz gösteririz. Ücretli tanıtım nedeniyle yer alan bir ürün Sponsorlu etiketi olmadan hiçbir zaman gösterilmez."],
              ["Ana sayfa, “Yeni gelenler” sırası", "En yeni 8 ürün. Ücretli tanıtım bu sırayı değiştirmez."],
              ["Ana sayfa, sokakların görselleri", "Her sokak (kategori) için bir görsel: varsa bizim öne çıkardığımız bir ürün, yoksa en yeni ürün."],
              ["Ana sayfa, “Dükkânlar”", "Dükkân listesinin ilk dört dükkânı, aynı sırayla."],
              ["Bir sokak (kategori) sayfası", "Önce bugün ücretli Sokağın başında tanıtımı süren ürünler (Sponsorlu etiketiyle). Sonra en yeniler. Sayfada en fazla 120 ürün gösterilir."],
              ["Arama sonuçları", "Önce bizim öne çıkardığımız ürünler, sonra en yeniler. En fazla 120 sonuç. Ücretli tanıtım arama sonuçlarının sırasını değiştirmez ve sonuçlarda Sponsorlu etiketi yoktur."],
              ["Dükkân listesi", "Önce kurucu dükkânlar, sonra dükkânın açıldığı tarihe göre; en eski önce."],
            ],
          },
          { t: "p", text: "Her yerde yalnızca onaylı dükkânların yayındaki ürünleri listelenir. “Öne çıkanlar” ürünlerini biz seçeriz: bir yönetici işaretler ve bunun için kimse ödeme yapmaz. Kurucu dükkânlar olarak katılan dükkânlar dükkân listesinde en üstte yer alır ve daha düşük komisyon öder ([Ücretler](/pricing) sayfasına bak)." },
          { t: "p", text: "Arama, yazdığın her kelimenin başlıkta, açıklamada ya da dükkân adında geçtiği ürünleri bulur. Büyük/küçük harfi ve Türkçe harf işaretlerini yok sayar; “sandik” araması “sandık”ı bulur." },
          { t: "p", text: "Puanlar ve yorumlar sıralamayı değiştirmez. Dükkânın puanı, kendin karar verebilesin diye ürünlerinin yanında gösterilir." },
        ],
      },
      {
        id: "sponsored",
        heading: "“Sponsorlu” ne demek",
        blocks: [
          { t: "p", text: "Bir satıcı tanıtım için ödeme yapabilir. Paketler ve fiyatlar için [Ücretler](/pricing) sayfasına bak. Ücretli bir paketteki ürünler **Sponsorlu** etiketiyle gösterilir. Ücretli yerleşim yalnızca bir ürünün yukarıdaki listelerde nerede göründüğünü etkiler. Dükkânın yorumlarını ya da puanını değiştirmez; sponsorlu ürünleri diğerlerinden daha fazla kontrol etmeyiz ya da onaylamayız." },
          { t: "p", text: "Bizim öne çıkardığımız ürünler ve kimse ayırtmadığında Haftanın parçası için seçtiğimiz ürün için ödeme yapılmaz." },
        ],
      },
    ],
  },
};
