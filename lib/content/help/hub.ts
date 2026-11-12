import type { Bi, Doc } from "../types";

export const hub: Bi<Doc> = {
  en: {
    title: "Help centre",
    description: "Short answers about buying, payment protection, delivery, returns, reviews, selling and your account on CarsiPazar.",
    lead: "Short answers to the questions we hear most. Each section links to the full page.",
    sections: [
      {
        id: "buying",
        heading: "Buying",
        blocks: [
          {
            t: "qa",
            items: [
              { q: "How do I buy something?", a: "Open an item, press Buy now, choose delivery or collection where the seller offers it, then press Pay and pay by one of the payment methods shown at checkout. You need an account." },
              { q: "Is there a fee for buyers?", a: "No. The price you see plus delivery is what you pay. We add no service fee." },
              { q: "Who am I buying from?", a: "From the shop that lists the item. Each shop page shows the seller's company details, delivery information and returns policy. Our own details are on the [company details](/legal/company) page." },
            ],
          },
        ],
      },
      {
        id: "protection",
        heading: "Payment protection",
        blocks: [
          {
            t: "qa",
            items: [
              { q: "When does the seller get my money?", a: "Not until your order has been delivered or collected. We hold your payment. After you confirm, or after the seller completes a collection, it is released to the seller {{release_days}} days later." },
              { q: "What if something goes wrong?", a: "Do not confirm delivery. [Contact us](/contact) with your order number. While the payment is held, we can return it to you." },
            ],
          },
          { t: "p", text: "More in [Returns, refunds and cancellation](/help/returns)." },
        ],
      },
      {
        id: "delivery",
        heading: "Delivery and collection",
        blocks: [
          {
            t: "qa",
            items: [
              { q: "Who sends my order?", a: "The seller, either themselves or with a tracked CarsiPazar delivery label." },
              { q: "How does collection work?", a: "When your order is ready, you see a 6-digit code on your order page. You give it to the seller when you collect. Do not share it before you have the item." },
            ],
          },
          { t: "p", text: "More in [Delivery and collection](/help/delivery)." },
        ],
      },
      {
        id: "returns",
        heading: "Returns and refunds",
        blocks: [
          {
            t: "qa",
            items: [
              { q: "Can I change my mind?", a: "Usually yes. For most online purchases you have 14 days from receiving the goods to cancel, with some exceptions such as made-to-order items." },
              { q: "What if the item is faulty?", a: "You have legal rights to a repair, replacement or refund. They do not depend on the seller's returns policy." },
            ],
          },
          { t: "p", text: "More, including the cancellation form, in [Returns, refunds and cancellation](/help/returns)." },
        ],
      },
      {
        id: "reviews",
        heading: "Reviews",
        blocks: [
          {
            t: "qa",
            items: [
              { q: "Who can write a review?", a: "Only a buyer who has received the order, once per order." },
              { q: "Can a shop remove a bad review?", a: "No. A seller can reply once. We only remove reviews that break our rules." },
            ],
          },
          { t: "p", text: "More in [How reviews work](/legal/reviews)." },
        ],
      },
      {
        id: "selling",
        heading: "Selling",
        blocks: [
          {
            t: "qa",
            items: [
              { q: "What does it cost to sell?", a: "Opening a shop and listing items is free. Commission is {{commission_card}} on card sales, charged only when you sell." },
              { q: "Who can open a shop?", a: "UK-based businesses and sole traders. We check every application." },
            ],
          },
          { t: "p", text: "More in the [Seller guide](/help/selling) and on the [Pricing](/pricing) page." },
        ],
      },
      {
        id: "account",
        heading: "Account",
        blocks: [
          {
            t: "qa",
            items: [
              { q: "I forgot my password.", a: "Write to {{email}}. We check it is you and give you a reset link that works for 24 hours." },
              { q: "I entered the wrong password too often.", a: "Log-in is paused for 15 minutes. Then you can try again." },
              { q: "How do I see or delete my data?", a: "See our [privacy notice](/legal/privacy) for your rights and how to use them, or [contact us](/contact)." },
            ],
          },
        ],
      },
    ],
  },
  tr: {
    title: "Yardım merkezi",
    description: "CarsiPazar'da alışveriş, ödeme koruması, teslimat, iade, yorumlar, satış ve hesabınla ilgili kısa cevaplar.",
    lead: "En sık sorulan sorulara kısa cevaplar. Her bölümden ayrıntılı sayfaya geçebilirsin.",
    sections: [
      {
        id: "buying",
        heading: "Alışveriş",
        blocks: [
          {
            t: "qa",
            items: [
              { q: "Nasıl alışveriş yaparım?", a: "Bir ürünü aç, Satın al düğmesine bas, satıcı sunuyorsa teslimat ya da dükkândan teslim seç, sonra Öde düğmesine basıp ödeme sayfasında gösterilen yöntemlerle öde. Bir hesabın olması gerekir." },
              { q: "Alıcılardan ücret alınıyor mu?", a: "Hayır. Gördüğün fiyat artı teslimat, ödeyeceğin tutardır. Hizmet bedeli eklemeyiz." },
              { q: "Kimden alışveriş yapıyorum?", a: "Ürünü listeleyen dükkândan. Her dükkân sayfasında satıcının şirket bilgileri, teslimat bilgisi ve iade koşulları yer alır. Bizim kendi bilgilerimiz [şirket bilgileri](/legal/company) sayfasında." },
            ],
          },
        ],
      },
      {
        id: "protection",
        heading: "Ödeme koruması",
        blocks: [
          {
            t: "qa",
            items: [
              { q: "Satıcı parayı ne zaman alır?", a: "Siparişin teslim edilmesinden ya da teslim alınmasından önce almaz. Ödemeni biz tutarız. Sen onayladıktan ya da satıcı dükkândan teslimi tamamladıktan {{release_days}} gün sonra satıcıya aktarılır." },
              { q: "Bir sorun çıkarsa ne olur?", a: "Teslimatı onaylama. Sipariş numaranla [bize ulaş](/contact). Ödeme bekletilirken sana iade edebiliriz." },
            ],
          },
          { t: "p", text: "Daha fazlası [İade, geri ödeme ve cayma](/help/returns) sayfasında." },
        ],
      },
      {
        id: "delivery",
        heading: "Teslimat ve teslim alma",
        blocks: [
          {
            t: "qa",
            items: [
              { q: "Siparişimi kim gönderir?", a: "Satıcı; ya kendisi ya da takipli bir CarsiPazar teslimat etiketiyle." },
              { q: "Dükkândan teslim nasıl işler?", a: "Siparişin hazır olunca sipariş sayfanda 6 haneli bir kod görürsün. Almaya gittiğinde kodu satıcıya verirsin. Ürünü eline almadan kodu paylaşma." },
            ],
          },
          { t: "p", text: "Daha fazlası [Teslimat ve teslim alma](/help/delivery) sayfasında." },
        ],
      },
      {
        id: "returns",
        heading: "İade ve geri ödeme",
        blocks: [
          {
            t: "qa",
            items: [
              { q: "Fikrimi değiştirebilir miyim?", a: "Genellikle evet. Çoğu online alışverişte ürünü teslim aldıktan sonra 14 gün içinde cayabilirsin. Siparişe özel üretilen ürünler gibi istisnalar vardır." },
              { q: "Ürün kusurluysa?", a: "Onarım, değişim ya da geri ödeme isteme hakkın var. Bu haklar satıcının iade koşullarına bağlı değildir." },
            ],
          },
          { t: "p", text: "Cayma formu dahil ayrıntılar [İade, geri ödeme ve cayma](/help/returns) sayfasında." },
        ],
      },
      {
        id: "reviews",
        heading: "Yorumlar",
        blocks: [
          {
            t: "qa",
            items: [
              { q: "Kimler yorum yazabilir?", a: "Yalnızca siparişini teslim almış alıcılar, sipariş başına bir kez." },
              { q: "Bir dükkân kötü yorumu sildirebilir mi?", a: "Hayır. Satıcı bir kez cevap verebilir. Biz yalnızca kurallarımıza aykırı yorumları kaldırırız." },
            ],
          },
          { t: "p", text: "Daha fazlası [Yorumlar nasıl çalışır](/legal/reviews) sayfasında." },
        ],
      },
      {
        id: "selling",
        heading: "Satış",
        blocks: [
          {
            t: "qa",
            items: [
              { q: "Satış yapmak ne kadar tutar?", a: "Dükkân açmak ve ürün eklemek ücretsiz. Kartlı satışlarda komisyon {{commission_card}}; yalnızca sattığında ödersin." },
              { q: "Dükkânı kimler açabilir?", a: "Birleşik Krallık'ta yerleşik işletmeler ve şahıs işletmeleri. Her başvuruyu kontrol ederiz." },
            ],
          },
          { t: "p", text: "Daha fazlası [Satıcı rehberi](/help/selling) ve [Ücretler](/pricing) sayfasında." },
        ],
      },
      {
        id: "account",
        heading: "Hesap",
        blocks: [
          {
            t: "qa",
            items: [
              { q: "Şifremi unuttum.", a: "{{email}} adresine yaz. Senin olduğunu doğrular, 24 saat geçerli bir sıfırlama bağlantısı veririz." },
              { q: "Şifreyi çok fazla yanlış girdim.", a: "Giriş 15 dakika durdurulur. Sonra yeniden deneyebilirsin." },
              { q: "Verilerimi nasıl görür ya da sildirebilirim?", a: "Haklarını ve nasıl kullanacağını [gizlilik bildiriminde](/legal/privacy) bulursun ya da [bize ulaş](/contact)." },
            ],
          },
        ],
      },
    ],
  },
};
