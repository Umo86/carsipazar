import type { Bi, Doc } from "../types";

export const terms: Bi<Doc> = {
  en: {
    title: "Terms of use and sale",
    description: "The terms for using CarsiPazar and buying from its shops: who we are, how orders and payment protection work, delivery, returns, reviews, complaints and your legal rights.",
    lead: "These terms apply when you use CarsiPazar and when you buy from a shop on it. They do not reduce your legal rights.",
    legal: true,
    print: "Print these terms",
    sections: [
      {
        id: "who",
        heading: "Who we are and what we do",
        blocks: [
          { t: "p", text: "{{site}} is an online marketplace run by {{legal_name}} ({{legal_form}}, company number {{company_no}}), registered office {{registered_address}}. Our full details are on the [company details](/legal/company) page. We are \"we\" and \"us\" in these terms." },
          { t: "p", text: "On {{site}}, independent shops list furniture, clothing and jewellery. **When you buy, your contract for the goods is with the shop, not with us.** The shop is the seller. We run the website, take your payment, hold it safely, pay it to the seller when the order is complete, and help if there is a dispute." },
          { t: "p", text: "We do not own, check or send the goods. Each shop page shows the seller's company details, delivery information and returns policy." },
        ],
      },
      {
        id: "accounts",
        heading: "Your account",
        blocks: [
          { t: "ul", items: [
            "You need an account to buy. Give true details and keep your password private.",
            "You must be 18 or over.",
            "Tell us at once if you think someone else has used your account.",
            "You can ask us to close your account at any time. See [contact](/contact).",
          ] },
        ],
      },
      {
        id: "orders",
        heading: "Placing an order and when the contract is made",
        blocks: [
          { t: "ol", items: [
            "Open an item, choose delivery or collection where the seller offers both, and press Buy now.",
            "Check the item, quantity, delivery details and total at checkout. You can correct mistakes before you pay.",
            "Pay by card. Your order is made when your payment is received and your order appears in My orders as “Being prepared”. That is when the contract between you and the seller starts.",
          ] },
          { t: "p", text: "If an item is no longer available, or a payment does not go through, no contract is made and you are not charged for it." },
          { t: "p", text: "{{site}} is offered in English and Turkish. You can place an order in either. The contract is in the language you used." },
        ],
      },
      {
        id: "prices",
        heading: "Prices and payment",
        blocks: [
          { t: "p", text: "The price shown is for the item. Delivery is shown separately before you pay, and the total at checkout is the full amount. We add no service fee for buyers." },
          { t: "p", text: "Prices include VAT where the seller is VAT registered. A seller's VAT number is shown on its shop page when it has one." },
        ],
      },
      {
        id: "protection",
        heading: "Payment protection",
        blocks: [
          { t: "p", text: "We hold your payment. It is not paid to the seller until your order has been delivered or collected, and then only after {{release_days}} days. You can see the status of your order on your order page." },
          { t: "p", text: "During that time, if something is wrong with your order, you can [contact us](/contact) and we can return your payment. Do not confirm delivery if there is a problem. See [Returns, refunds and cancellation](/help/returns)." },
        ],
      },
      {
        id: "delivery",
        heading: "Delivery and collection",
        blocks: [
          { t: "p", text: "The seller sends the goods or lets you collect them. Unless the seller and you agree otherwise, delivery will be within 30 days of your order. Risk in the goods passes to you when you or someone you name receives them. For how collection and the handover code work, see [Delivery and collection](/help/delivery)." },
        ],
      },
      {
        id: "returns",
        heading: "Cancelling and returns",
        blocks: [
          { t: "p", text: "You have a legal right to cancel most online orders within 14 days of receiving the goods, and legal rights if goods are faulty or not as described. Our returns policy and the model cancellation form are in [Returns, refunds and cancellation](/help/returns). The seller's own returns policy is on its shop page and never reduces these rights." },
        ],
      },
      {
        id: "reviews",
        heading: "Reviews",
        blocks: [
          { t: "p", text: "You can review a seller after you have received an order. Reviews must be honest and about your own order. See [How reviews work](/legal/reviews)." },
        ],
      },
      {
        id: "use",
        heading: "Using the site properly",
        blocks: [
          { t: "p", text: "Please do not:" },
          { t: "ul", items: [
            "give false details or use someone else's account",
            "post unlawful, abusive or misleading content",
            "try to get round our payment protection, for example by asking a seller to take payment elsewhere",
            "interfere with the site or try to get at other people's data",
          ] },
          { t: "p", text: "We may suspend or close an account that breaks these rules. We will tell you why unless the law stops us." },
        ],
      },
      {
        id: "liability",
        heading: "Our responsibility",
        blocks: [
          { t: "p", text: "We are responsible for the services we provide: running the site, taking and holding payment, releasing it and handling disputes. We use reasonable care and skill in doing so. The seller is responsible for the goods, for describing them correctly and for the legal duties of a seller." },
          { t: "p", text: "Nothing in these terms limits our liability for death or personal injury caused by our negligence, for fraud, or for anything else the law does not allow us to limit. Nothing here affects your statutory rights as a consumer. Otherwise, we are responsible for losses that are a foreseeable result of our breaking these terms, but not for losses that were not foreseeable, or for business losses." },
        ],
      },
      {
        id: "complaints",
        heading: "Complaints and disputes",
        blocks: [
          { t: "p", text: "If something goes wrong, contact the seller first, then us. How we handle complaints, and what you can do if you are still unhappy, is in [Complaints](/legal/complaints)." },
        ],
      },
      {
        id: "changes",
        heading: "Changes to these terms",
        blocks: [
          { t: "p", text: "We may update these terms, for example when the law or the service changes. The date at the top shows the latest update. The terms in force when you place an order apply to that order." },
        ],
      },
      {
        id: "law",
        heading: "Governing law",
        blocks: [
          { t: "p", text: "These terms are governed by the law of England and Wales. If you live in Scotland or Northern Ireland, you may also bring a claim in the courts there, and you keep the protection of the mandatory consumer law of the part of the UK where you live." },
        ],
      },
    ],
  },
  tr: {
    title: "Kullanım ve satış koşulları",
    description: "CarsiPazar'ı kullanma ve dükkânlarından alışveriş yapma koşulları: biz kimiz, siparişler ve ödeme koruması nasıl işler, teslimat, iade, yorumlar, şikâyetler ve yasal haklarını.",
    lead: "Bu koşullar CarsiPazar'ı kullandığında ve buradaki bir dükkândan alışveriş yaptığında geçerlidir. Yasal haklarını azaltmaz.",
    legal: true,
    print: "Bu koşulları yazdır",
    sections: [
      {
        id: "who",
        heading: "Biz kimiz, ne yapıyoruz",
        blocks: [
          { t: "p", text: "{{site}}, {{legal_name}} ({{legal_form}}, şirket numarası {{company_no}}, tescilli adres {{registered_address}}) tarafından işletilen bir online çarşıdır. Ayrıntılı bilgilerimiz [şirket bilgileri](/legal/company) sayfasında. Bu koşullarda “biz” bizi ifade eder." },
          { t: "p", text: "{{site}}'da bağımsız dükkânlar mobilya, giyim ve takı satar. **Alışveriş yaptığında mal satış sözleşmen bizimle değil, dükkânla yapılmış olur.** Satıcı dükkândır. Biz web sitesini işletir, ödemeni alır ve güvenle bekletir, sipariş tamamlanınca satıcıya aktarır ve uyuşmazlık olursa yardımcı oluruz." },
          { t: "p", text: "Ürünlerin sahibi biz değiliz; onları kontrol etmeyiz, göndermeyiz. Her dükkân sayfasında satıcının şirket bilgileri, teslimat bilgisi ve iade koşulları yer alır." },
        ],
      },
      {
        id: "accounts",
        heading: "Hesabın",
        blocks: [
          { t: "ul", items: [
            "Alışveriş için hesap gerekir. Doğru bilgi ver, şifreni gizli tut.",
            "18 yaşında ya da daha büyük olmalısın.",
            "Hesabını başkasının kullandığını düşünürsen hemen bize haber ver.",
            "Hesabını istediğin zaman kapattırabilirsin. [İletişim](/contact) sayfasına bak.",
          ] },
        ],
      },
      {
        id: "orders",
        heading: "Sipariş verme ve sözleşmenin kurulması",
        blocks: [
          { t: "ol", items: [
            "Bir ürünü aç, satıcı ikisini de sunuyorsa teslimat ya da dükkândan teslim seç ve Satın al düğmesine bas.",
            "Ödeme sayfasında ürünü, adedi, teslimat bilgilerini ve toplamı kontrol et. Ödemeden önce hataları düzeltebilirsin.",
            "Kartla öde. Siparişin ödemen alındığında ve Siparişlerim sayfasında “Hazırlanıyor” olarak göründüğünde verilmiş olur. Seninle satıcı arasındaki sözleşme o anda başlar.",
          ] },
          { t: "p", text: "Ürün artık satışta değilse ya da ödeme tamamlanmazsa sözleşme kurulmaz ve ücret alınmaz." },
          { t: "p", text: "{{site}} İngilizce ve Türkçe sunulur. Siparişi iki dilde de verebilirsin. Sözleşme, kullandığın dilde yapılmış sayılır." },
        ],
      },
      {
        id: "prices",
        heading: "Fiyatlar ve ödeme",
        blocks: [
          { t: "p", text: "Gösterilen fiyat ürünün fiyatıdır. Teslimat ücreti ödemeden önce ayrıca gösterilir; ödeme sayfasındaki toplam, ödeyeceğin tutarın tamamıdır. Alıcılardan hizmet bedeli almayız." },
          { t: "p", text: "Satıcı KDV mükellefiyse fiyatlara KDV dahildir. KDV numarası varsa dükkân sayfasında gösterilir." },
        ],
      },
      {
        id: "protection",
        heading: "Ödeme koruması",
        blocks: [
          { t: "p", text: "Ödemeni biz bekletiriz. Siparişin teslim edilmesinden ya da teslim alınmasından önce, ondan sonra da {{release_days}} gün geçmeden satıcıya ödenmez. Siparişinin durumunu sipariş sayfanda görürsün." },
          { t: "p", text: "Bu sürede siparişinle ilgili bir sorun olursa [bize ulaşabilirsin](/contact); ödemeni sana iade edebiliriz. Sorun varsa teslimatı onaylama. [İade, geri ödeme ve cayma](/help/returns) sayfasına bak." },
        ],
      },
      {
        id: "delivery",
        heading: "Teslimat ve teslim alma",
        blocks: [
          { t: "p", text: "Ürünü satıcı gönderir ya da dükkânından almana izin verir. Satıcıyla başka bir şey kararlaştırmadıysanız teslimat siparişten sonra 30 gün içinde yapılır. Ürünün riski, sen ya da belirttiğin kişi ürünü teslim aldığında sana geçer. Dükkândan teslimin ve teslim kodunun nasıl işlediği için [Teslimat ve teslim alma](/help/delivery) sayfasına bak." },
        ],
      },
      {
        id: "returns",
        heading: "Cayma ve iade",
        blocks: [
          { t: "p", text: "Çoğu online siparişte ürünü teslim aldıktan sonra 14 gün içinde cayma hakkın vardır. Ürün kusurlu ya da anlatıldığı gibi değilse de yasal haklarına sahipsin. İade koşullarımız ve örnek cayma formu [İade, geri ödeme ve cayma](/help/returns) sayfasında. Satıcının kendi iade koşulları dükkân sayfasındadır ve bu hakları asla azaltmaz." },
        ],
      },
      {
        id: "reviews",
        heading: "Yorumlar",
        blocks: [
          { t: "p", text: "Bir siparişi teslim aldıktan sonra satıcıyı değerlendirebilirsin. Yorumlar dürüst olmalı ve kendi siparişin hakkında olmalıdır. [Yorumlar nasıl çalışır](/legal/reviews) sayfasına bak." },
        ],
      },
      {
        id: "use",
        heading: "Siteyi doğru kullanma",
        blocks: [
          { t: "p", text: "Lütfen şunları yapma:" },
          { t: "ul", items: [
            "yanlış bilgi vermek ya da başkasının hesabını kullanmak",
            "yasa dışı, hakaret içeren ya da yanıltıcı içerik paylaşmak",
            "ödeme korumamızı aşmaya çalışmak; örneğin satıcıdan ödemeyi başka yerden almasını istemek",
            "siteye zarar vermek ya da başkalarının verilerine ulaşmaya çalışmak",
          ] },
          { t: "p", text: "Bu kuralları çiğneyen bir hesabı askıya alabilir veya kapatabiliriz. Yasa engellemiyorsa nedenini sana söyleriz." },
        ],
      },
      {
        id: "liability",
        heading: "Sorumluluğumuz",
        blocks: [
          { t: "p", text: "Sunduğumuz hizmetlerden biz sorumluyuz: siteyi işletmek, ödemeyi almak ve bekletmek, aktarmak ve uyuşmazlıklarla ilgilenmek. Bunları makul özen ve beceriyle yaparız. Ürünlerden, onları doğru anlatmaktan ve satıcının yasal yükümlülüklerinden satıcı sorumludur." },
          { t: "p", text: "Bu koşulların hiçbir maddesi, ihmalimizin yol açtığı ölüm ya da yaralanma, dolandırıcılık veya yasanın sınırlamamıza izin vermediği diğer konulardaki sorumluluğumuzu sınırlamaz. Hiçbir madde tüketici olarak sahip olduğun yasal hakları etkilemez. Bunun dışında, bu koşulları ihlal etmemizin öngörülebilir sonucu olan zararlardan sorumluyuz; öngörülemeyen zararlardan ve ticari zararlardan sorumlu değiliz." },
        ],
      },
      {
        id: "complaints",
        heading: "Şikâyetler ve uyuşmazlıklar",
        blocks: [
          { t: "p", text: "Bir sorun olursa önce satıcıyla, sonra bizimle iletişime geç. Şikâyetleri nasıl ele aldığımız ve yine de memnun kalmazsan neler yapabileceğin [Şikâyetler](/legal/complaints) sayfasında." },
        ],
      },
      {
        id: "changes",
        heading: "Koşullarda değişiklik",
        blocks: [
          { t: "p", text: "Yasa ya da hizmet değiştiğinde bu koşulları güncelleyebiliriz. Üstteki tarih son güncellemeyi gösterir. Sipariş verdiğin sırada yürürlükte olan koşullar o sipariş için geçerlidir." },
        ],
      },
      {
        id: "law",
        heading: "Geçerli hukuk",
        blocks: [
          { t: "p", text: "Bu koşullara İngiltere ve Galler hukuku uygulanır. İskoçya'da ya da Kuzey İrlanda'da yaşıyorsan orada da dava açabilirsin ve yaşadığın bölgenin emredici tüketici hukukunun korumasından yararlanmaya devam edersin." },
        ],
      },
    ],
  },
};
