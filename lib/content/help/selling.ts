import type { Bi, Doc } from "../types";

export const selling: Bi<Doc> = {
  en: {
    title: "Seller guide",
    description: "How to open a shop on CarsiPazar: who can sell, listing rules, delivery and collection, getting paid, promotion, reviews and what can get a shop suspended.",
    lead: "Everything a new seller needs, in the order you will need it.",
    sections: [
      {
        id: "who",
        heading: "Who can sell",
        blocks: [
          { t: "p", text: "CarsiPazar is for UK-based businesses and sole traders. Private individuals clearing out their own things cannot sell here. You sell as a trader, which means consumer law applies to your sales (see the [seller terms](/legal/seller-terms))." },
          { t: "p", text: "We check every application before a shop opens: your legal name, company number if you have one, address and phone number." },
        ],
      },
      {
        id: "steps",
        heading: "Open a shop in five steps",
        blocks: [
          {
            t: "ol",
            items: [
              "[Send an application](/sell) with your account and shop details.",
              "We review it. You can add items while you wait; they go live once the shop is approved.",
              "Set up your shop page: logo, cover image, delivery information, returns policy and, if you offer it, collection hours.",
              "Add your items with photos, price and delivery method.",
              "Share your shop link on Instagram and WhatsApp.",
            ],
          },
        ],
      },
      {
        id: "listings",
        heading: "Listing rules and photo tips",
        blocks: [
          {
            t: "ul",
            items: [
              "Write a title in Turkish or English, or both. If one is left empty, buyers see the other.",
              "Describe the item honestly: size, material, condition, flaws.",
              "Add up to five photos. The first is the cover. A plain background works best.",
              "Only list what you really have, and set the stock to match.",
              "Follow the law for what you sell, including labels and safety. See [prohibited items](/legal/prohibited-items).",
            ],
          },
        ],
      },
      {
        id: "delivery",
        heading: "Delivery and collection",
        blocks: [
          { t: "p", text: "For each item you choose to deliver it yourself and set the postage, or to use a tracked CarsiPazar delivery label. You can also let buyers collect from your shop, or offer collection only." },
          { t: "p", text: "Buyers show you a 6-digit code when they collect. You type it in to complete the order. Details are in [Delivery and collection](/help/delivery)." },
        ],
      },
      {
        id: "paid",
        heading: "Getting paid",
        blocks: [
          { t: "p", text: "We hold the buyer's payment until the order is delivered or collected. It is released to you {{release_days}} days afterwards. You connect your bank account in the seller panel." },
          { t: "p", text: "The commission is {{commission_card}} on card sales (founding sellers: {{commission_founding}}). Opening a shop and listing items is free. See [Pricing](/pricing)." },
        ],
      },
      {
        id: "promotion",
        heading: "Promotion",
        blocks: [
          { t: "p", text: "You can pay to put an item on the home page or at the top of its street. It is optional, it is labelled “Sponsored”, and it does not change your reviews. Book it from the Promote tab in the seller panel. Prices are on the [Pricing](/pricing) page." },
        ],
      },
      {
        id: "reviews",
        heading: "Reviews",
        blocks: [
          { t: "p", text: "Only buyers who have received an order can review it. You can reply to a review once. Do not ask for reviews in return for gifts or discounts. See [how reviews work](/legal/reviews)." },
        ],
      },
      {
        id: "suspension",
        heading: "What can get a shop suspended",
        blocks: [
          {
            t: "ul",
            items: [
              "Listing prohibited or unsafe items, or counterfeits",
              "Not sending orders, or sending something different from what was described",
              "False details when applying",
              "Fake or paid-for reviews",
              "Abusive behaviour towards buyers or staff",
            ],
          },
          { t: "p", text: "If a shop is suspended we tell you why and how to put it right. The [seller terms](/legal/seller-terms) explain the process." },
        ],
      },
    ],
  },
  tr: {
    title: "Satıcı rehberi",
    description: "CarsiPazar'da dükkân açma rehberi: kimler satış yapabilir, ürün ekleme kuralları, teslimat ve dükkândan teslim, ödeme alma, tanıtım, yorumlar ve askıya alma nedenleri.",
    lead: "Yeni bir satıcının bilmesi gereken her şey, ihtiyaç duyacağın sırayla.",
    sections: [
      {
        id: "who",
        heading: "Kimler satış yapabilir",
        blocks: [
          { t: "p", text: "CarsiPazar, Birleşik Krallık'ta yerleşik işletmeler ve şahıs işletmeleri içindir. Kendi eşyalarını elden çıkaran bireyler burada satış yapamaz. Satıcı olarak satış yaparsın; bu yüzden satışlarına tüketici hukuku uygulanır ([satıcı koşulları](/legal/seller-terms) sayfasına bak)." },
          { t: "p", text: "Dükkân açılmadan önce her başvuruyu kontrol ederiz: yasal adın, varsa şirket numaran, adresin ve telefon numaran." },
        ],
      },
      {
        id: "steps",
        heading: "Beş adımda dükkân aç",
        blocks: [
          {
            t: "ol",
            items: [
              "Hesap ve dükkân bilgilerinle [başvuru gönder](/sell).",
              "Başvurunu inceleriz. Beklerken ürün ekleyebilirsin; dükkânın onaylanınca yayına girerler.",
              "Dükkân sayfanı hazırla: logo, kapak görseli, teslimat bilgisi, iade koşulların ve sunuyorsan dükkândan teslim saatleri.",
              "Ürünlerini fotoğraf, fiyat ve teslimat yöntemiyle ekle.",
              "Dükkân bağlantını Instagram ve WhatsApp'ta paylaş.",
            ],
          },
        ],
      },
      {
        id: "listings",
        heading: "Ürün ekleme kuralları ve fotoğraf ipuçları",
        blocks: [
          {
            t: "ul",
            items: [
              "Başlığı Türkçe ya da İngilizce, istersen ikisi birden yaz. Biri boş kalırsa alıcı diğerini görür.",
              "Ürünü dürüstçe anlat: ölçü, malzeme, durum, kusurlar.",
              "En fazla beş fotoğraf ekle. İlki kapak olur. Sade bir arka plan en iyisidir.",
              "Yalnızca gerçekten elinde olanı ekle ve stok sayısını buna göre gir.",
              "Sattığın ürünün etiket ve güvenlik kurallarına uy. [Yasaklı ürünler](/legal/prohibited-items) sayfasına bak.",
            ],
          },
        ],
      },
      {
        id: "delivery",
        heading: "Teslimat ve dükkândan teslim",
        blocks: [
          { t: "p", text: "Her ürün için ya kendin gönderir ve kargo ücretini belirlersin ya da takipli CarsiPazar teslimat etiketini kullanırsın. Alıcıların ürünü dükkânından almasına izin verebilir ya da yalnızca dükkândan teslim sunabilirsin." },
          { t: "p", text: "Alıcı teslim alırken sana 6 haneli bir kod gösterir. Siparişi tamamlamak için kodu girersin. Ayrıntılar [Teslimat ve teslim alma](/help/delivery) sayfasında." },
        ],
      },
      {
        id: "paid",
        heading: "Ödeme alma",
        blocks: [
          { t: "p", text: "Alıcının ödemesini sipariş teslim edilene ya da teslim alınana kadar bizde tutarız. Sonrasında {{release_days}} gün içinde sana aktarılır. Banka hesabını satıcı panelinden bağlarsın." },
          { t: "p", text: "Kartlı satışlarda komisyon {{commission_card}} (kurucu satıcılar için {{commission_founding}}). Dükkân açmak ve ürün eklemek ücretsizdir. [Ücretler](/pricing) sayfasına bak." },
        ],
      },
      {
        id: "promotion",
        heading: "Tanıtım",
        blocks: [
          { t: "p", text: "Bir ürünü ana sayfada ya da sokağının başında göstermek için ödeme yapabilirsin. Zorunlu değildir, “Sponsorlu” etiketiyle gösterilir ve yorumlarını değiştirmez. Satıcı panelindeki Tanıtım sekmesinden ayırtırsın. Fiyatlar [Ücretler](/pricing) sayfasında." },
        ],
      },
      {
        id: "reviews",
        heading: "Yorumlar",
        blocks: [
          { t: "p", text: "Yalnızca siparişini teslim almış alıcılar yorum yazabilir. Bir yoruma bir kez cevap verebilirsin. Hediye ya da indirim karşılığında yorum isteme. [Yorumların nasıl işlediğine](/legal/reviews) bak." },
        ],
      },
      {
        id: "suspension",
        heading: "Dükkân hangi durumlarda askıya alınır",
        blocks: [
          {
            t: "ul",
            items: [
              "Yasaklı, güvensiz ya da sahte ürün listelemek",
              "Siparişleri göndermemek ya da anlatılandan farklı ürün göndermek",
              "Başvuruda yanlış bilgi vermek",
              "Sahte ya da karşılığı ödenmiş yorumlar",
              "Alıcılara ya da çalışanlara kötü davranmak",
            ],
          },
          { t: "p", text: "Bir dükkân askıya alınırsa nedenini ve durumu nasıl düzelteceğini sana söyleriz. Süreç [satıcı koşullarında](/legal/seller-terms) anlatılır." },
        ],
      },
    ],
  },
};
