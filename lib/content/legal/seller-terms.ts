import type { Bi, Doc } from "../types";

export const sellerTerms: Bi<Doc> = {
  en: {
    title: "Seller terms",
    description: "The terms for selling on CarsiPazar: who can sell, your duties as the trader, fees and payouts, delivery, returns, product rules, ranking, suspension, complaints and tax reporting.",
    lead: "These terms apply to every shop on CarsiPazar. Please read them before you apply.",
    legal: true,
    sections: [
      {
        id: "about",
        heading: "About these terms",
        blocks: [
          { t: "p", text: "{{site}} is run by {{operator}}. Our details are on the [company details](/legal/company) page. These terms are between us and you, the shop. They are separate from the [buyer terms](/legal/terms)." },
          { t: "p", text: "You agree to these terms when you send your application. The terms are available to you at any time on this page, and you can print them." },
        ],
      },
      {
        id: "eligibility",
        heading: "Who can sell and the checks we make",
        blocks: [
          { t: "ul", items: [
            "You must be a UK-based business: a company or a sole trader. {{site}} is not for private sellers.",
            "You must give your legal name, business address, phone number, and your company number and VAT number if you have them. We check these before your shop opens.",
            "If the tax reporting rules in “Tax information” below apply to us, we will also ask for the details those rules require. If you do not give them, we may hold payouts and close your shop.",
            "Keep your details up to date. Tell us when they change.",
          ] },
        ],
      },
      {
        id: "trader",
        heading: "You are the trader",
        blocks: [
          { t: "p", text: "When a buyer buys from your shop, the sale contract is between you and the buyer. You are the trader and responsible for it, including everything consumer law requires of a seller. In particular you must:" },
          { t: "ul", items: [
            "show your business identity, address and contact details on your shop page, and give buyers the information the Consumer Contracts Regulations 2013 require before they buy",
            "show prices including VAT if you are VAT registered",
            "supply goods that are as described, of satisfactory quality and fit for purpose (Consumer Rights Act 2015)",
            "deliver within 30 days unless you agree another date with the buyer",
            "honour the buyer's right to cancel within 14 days and your duties on faulty goods (see “Returns”)",
            "not mislead buyers, including about reviews, urgency, approvals or free items (Digital Markets, Competition and Consumers Act 2024)",
          ] },
          { t: "p", text: "Our role is to provide the platform, take and hold payment and pay you. We do not take on your duties as the seller." },
        ],
      },
      {
        id: "listings",
        heading: "Listings",
        blocks: [
          { t: "ul", items: [
            "Describe each item accurately: size, material, condition and any flaws. Use your own photos, up to five.",
            "Show the total price, including VAT, and the delivery cost clearly.",
            "Only list what you have, and keep the stock up to date.",
            "Do not list prohibited items. See [Prohibited and restricted items](/legal/prohibited-items).",
            "Follow the product rules in “Product law” below.",
          ] },
        ],
      },
      {
        id: "product",
        heading: "Product law",
        blocks: [
          { t: "p", text: "You are responsible for knowing and following the law for what you sell. For example:" },
          { t: "ul", items: [
            "**Furniture.** Upholstered furniture must meet the Furniture and Furnishings (Fire) (Safety) Regulations 1988 as amended, including any fire-resistance labelling that applies. Keep proof.",
            "**Clothing.** Garments must carry the fibre composition label the Textile Products regulations require, and the listing should give the same information.",
            "**Jewellery.** Gold, silver, platinum and palladium articles above the weight limits must be hallmarked, and you must not describe an article as precious metal when it is not. See [Hallmarking](/legal/hallmarking). Jewellery that touches the skin must meet the limits on nickel, lead and cadmium.",
            "**Product safety.** Everything you sell must be safe, and you must act on any recall.",
            "**Counterfeits.** Never list fake or imitation branded goods.",
          ] },
          { t: "p", text: "We may ask you for proof, such as a supplier invoice, a label photo or a hallmark photo. We may remove a listing that you cannot support." },
        ],
      },
      {
        id: "fees",
        heading: "Fees",
        blocks: [
          { t: "p", text: "Opening a shop and listing items is free. We charge commission on sales and, if you choose them, fees for promotion and delivery labels. The current rates are on the [Pricing](/pricing) page and are shown in your seller panel. The standard commission on card sales is {{commission_card}}; founding sellers pay {{commission_founding}}." },
          { t: "p", text: "The commission is taken from each sale before we pay you. It is charged on the item price and on your own postage, but not on the price of a CarsiPazar delivery label. If we need to add VAT to our fees, we will tell you before it applies. We do not pass on the payment provider's charges to you separately." },
        ],
      },
      {
        id: "payouts",
        heading: "Payment hold and payouts",
        blocks: [
          { t: "ul", items: [
            "We hold the buyer's payment until the order is delivered or collected. We pay you {{release_days}} days after the buyer confirms they have received the item, or after a collection is confirmed with the handover code. If a buyer does not confirm, tell us: we check the delivery and can confirm it ourselves. The payout is processed the next time we run payouts, so it can arrive a little after that date.",
            "You are paid into the bank account you connect to our payment provider. You need a connected bank account to be paid.",
            "If we refund an order before we have paid you, you receive nothing for it and pay no commission.",
            "If a buyer wins a refund or a chargeback after we have paid you, you must repay it, and we may take it from your future payouts.",
          ] },
        ],
      },
      {
        id: "delivery",
        heading: "Delivery and collection",
        blocks: [
          { t: "ul", items: [
            "You choose, for each item, whether you send it yourself or use a CarsiPazar delivery label. Packaging and care of the goods are your responsibility, and they stay at your risk until the buyer, or someone they name, receives them.",
            "If you send it yourself, post it with a tracked service you can prove, and enter the carrier and tracking number.",
            "If you use a CarsiPazar label, follow the size and weight limits shown.",
            "For collection, mark the order ready only when it is. Check the buyer's 6-digit code before you hand the goods over, and enter it. {{collection_attempts}} wrong tries lock the handover. Never ask a buyer for the code before they have the item.",
          ] },
        ],
      },
      {
        id: "returns",
        heading: "Returns",
        blocks: [
          { t: "ul", items: [
            "You must accept a cancellation made within 14 days of the buyer receiving the goods, and refund within 14 days of getting the goods back (see [Returns, refunds and cancellation](/help/returns)).",
            "Say on your shop page, before the buyer buys, who pays return postage. For bulky items such as furniture, give an estimate. If you do not, you pay.",
            "If you say an item is made to order, it must really be made to the buyer's specification. A standard item made after the order is not exempt.",
            "You must put right faulty goods under the Consumer Rights Act 2015. Your own returns policy can add to this but never reduce it.",
          ] },
        ],
      },
      {
        id: "reviews",
        heading: "Reviews",
        blocks: [
          { t: "p", text: "Buyers review you after delivery. You may not buy, write, swap for gifts or discounts, or hide reviews, or ask only satisfied buyers to review. You may reply once to each review. See [How reviews work](/legal/reviews). We may hide fake reviews and take action against a shop that tries to manipulate them." },
        ],
      },
      {
        id: "ranking",
        heading: "Ranking and promotion",
        blocks: [
          { t: "p", text: "How we order items and shops is explained in [How results are ordered](/legal/ranking). Payment affects the order only through the paid Sponsored places. Promotion is optional. A promotion you cancel before it starts is refunded in full. Shops that joined as founding shops pay a lower commission (see [Pricing](/pricing)) and are listed first in the shops directory. Apart from that, we do not give any shop better terms than others. We sell no goods ourselves." },
        ],
      },
      {
        id: "suspension",
        heading: "Suspension and ending",
        blocks: [
          { t: "p", text: "We may restrict, suspend or close a shop if, for example, it lists prohibited or unsafe items, does not send orders, gives false information, manipulates reviews, treats buyers or staff badly, or does not give the information we must collect." },
          { t: "ul", items: [
            "If we remove a listing or suspend a shop, you can ask us for the reasons by writing to {{email}}; we reply within 2 working days.",
            "You can answer us by contacting us, and we will review what you say.",
            "If we end the contract we will give at least 30 days' notice, except where there is a serious legal reason or a serious risk to buyers.",
            "You can close your shop at any time. Orders already placed must still be completed.",
          ] },
        ],
      },
      {
        id: "tax",
        heading: "Tax information (HMRC reporting)",
        blocks: [
          { t: "p", text: "Platforms may have to report sellers' income to HMRC under the digital platform reporting rules. If those rules apply to us, we will ask you for the details we need and share them with HMRC. You are responsible for your own tax." },
          { t: "p", text: "That includes VAT and income or corporation tax, whether or not we report anything about you." },
        ],
      },
      {
        id: "data",
        heading: "Buyer data",
        blocks: [
          { t: "p", text: "You will see the details of buyers of your orders, such as name, delivery address and phone, so you can fulfil them. You become responsible for that data. Use it only to complete the order and to meet your legal duties. Do not contact the buyer for marketing, and do not keep it longer than you need. You must follow data protection law and pay the ICO data protection fee if it applies to you." },
        ],
      },
      {
        id: "complaints",
        heading: "Complaints by sellers",
        blocks: [
          { t: "p", text: "If you are unhappy with a decision, such as a suspension or a removed listing, or with how we treat you, write to {{complaints_email}}. We will acknowledge within 2 working days and aim to give a full answer within 15 working days. If we cannot agree, see “If you are still not happy” in [Complaints and reporting](/legal/complaints#adr)." },
        ],
      },
      {
        id: "changes",
        heading: "Changes to these terms",
        blocks: [
          { t: "p", text: "We will give you at least 15 days' notice of a change to these terms, in your seller panel or by another written means. Changes that the law requires can take effect sooner. If you do not agree, you can close your shop before the change takes effect." },
        ],
      },
      {
        id: "liability",
        heading: "Liability and law",
        blocks: [
          { t: "p", text: "Neither of us excludes liability for death or personal injury caused by negligence, for fraud, or for anything the law does not allow us to exclude. Beyond that, our liability to you for losses from our breaking these terms is limited to losses that were foreseeable. We are not liable for lost profit or lost business that we could not foresee. These terms are governed by the law of England and Wales, and the courts of England and Wales can hear disputes about them." },
        ],
      },
    ],
  },
  tr: {
    title: "Satıcı koşulları",
    description: "CarsiPazar'da satış koşulları: kimler satış yapabilir, satıcı olarak yükümlülüklerin, ücretler ve ödemeler, teslimat, iade, ürün kuralları, sıralama, askıya alma, şikâyetler ve vergi bildirimi.",
    lead: "Bu koşullar CarsiPazar'daki her dükkân için geçerlidir. Başvurmadan önce lütfen oku.",
    legal: true,
    sections: [
      {
        id: "about",
        heading: "Bu koşullar hakkında",
        blocks: [
          { t: "p", text: "{{site}}, {{operator}} tarafından işletilir. Bilgilerimiz [şirket bilgileri](/legal/company) sayfasında. Bu koşullar bizimle sen, yani dükkân arasındadır. [Alıcı koşullarından](/legal/terms) ayrıdır." },
          { t: "p", text: "Başvuru gönderdiğinde bu koşulları kabul etmiş olursun. Koşullara her zaman bu sayfadan ulaşabilir ve yazdırabilirsin." },
        ],
      },
      {
        id: "eligibility",
        heading: "Kimler satış yapabilir, hangi kontrolleri yapıyoruz",
        blocks: [
          { t: "ul", items: [
            "Birleşik Krallık'ta yerleşik bir işletme olmalısın: şirket ya da şahıs işletmesi. {{site}} bireysel satıcılar için değildir.",
            "Yasal adını, iş adresini, telefon numaranı; varsa şirket numaranı ve KDV numaranı vermelisin. Bunları dükkânın açılmadan önce kontrol ederiz.",
            "Aşağıdaki “Vergi bilgileri” bölümündeki bildirim kuralları bize uygulanırsa, o kuralların istediği bilgileri de isteyeceğiz. Vermezsen ödemeleri bekletebilir ve dükkânını kapatabiliriz.",
            "Bilgilerini güncel tut. Değişirse bize haber ver.",
          ] },
        ],
      },
      {
        id: "trader",
        heading: "Satıcı sensin",
        blocks: [
          { t: "p", text: "Bir alıcı dükkânından alışveriş yaptığında satış sözleşmesi seninle alıcı arasındadır. Satıcı sensin ve bundan sorumlusun; tüketici hukukunun bir satıcıdan istediği her şey dahil. Özellikle şunları yapmalısın:" },
          { t: "ul", items: [
            "işletme kimliğini, adresini ve iletişim bilgilerini dükkân sayfanda göstermek ve alıcıya satın almadan önce Consumer Contracts Regulations 2013'ün gerektirdiği bilgileri vermek",
            "KDV mükellefiysen fiyatları KDV dahil göstermek",
            "anlatıldığı gibi, yeterli kalitede ve amacına uygun ürün teslim etmek (Consumer Rights Act 2015)",
            "alıcıyla başka bir tarih kararlaştırmadıysan 30 gün içinde teslim etmek",
            "alıcının 14 gün içinde cayma hakkına ve kusurlu ürünlerle ilgili yükümlülüklerine uymak (“İade” bölümüne bak)",
            "alıcıları yanıltmamak; yorumlar, aciliyet, onaylar ya da ücretsiz ürünler dahil (Digital Markets, Competition and Consumers Act 2024)",
          ] },
          { t: "p", text: "Bizim görevimiz platformu sağlamak, ödemeyi almak, bekletmek ve sana aktarmaktır. Satıcı olarak yükümlülüklerini üstlenmeyiz." },
        ],
      },
      {
        id: "listings",
        heading: "İlanlar",
        blocks: [
          { t: "ul", items: [
            "Her ürünü doğru anlat: ölçü, malzeme, durum ve kusurlar. Kendi fotoğraflarını kullan, en fazla beş.",
            "KDV dahil toplam fiyatı ve teslimat ücretini açıkça göster.",
            "Yalnızca elinde olanı listele ve stoğu güncel tut.",
            "Yasaklı ürün listeleme. [Yasaklı ve kısıtlı ürünler](/legal/prohibited-items) sayfasına bak.",
            "Aşağıdaki “Ürün mevzuatı” bölümündeki ürün kurallarına uy.",
          ] },
        ],
      },
      {
        id: "product",
        heading: "Ürün mevzuatı",
        blocks: [
          { t: "p", text: "Sattığın ürünle ilgili yasayı bilmek ve uygulamak senin sorumluluğundur. Örneğin:" },
          { t: "ul", items: [
            "**Mobilya.** Döşemeli mobilya, değişikliklerle birlikte Furniture and Furnishings (Fire) (Safety) Regulations 1988'e uymalıdır; geçerli olan yangına dayanıklılık etiketleri dahil. Belgesini sakla.",
            "**Giyim.** Giysilerde Textile Products yönetmeliklerinin istediği elyaf bileşimi etiketi bulunmalı, ilanda da aynı bilgi verilmelidir.",
            "**Takı.** Ağırlık sınırlarını aşan altın, gümüş, platin ve paladyum ürünler damgalı olmalıdır; kıymetli metal olmayan bir ürünü kıymetli metal olarak tanımlayamazsın. [Damga](/legal/hallmarking) sayfasına bak. Cilde temas eden takılar nikel, kurşun ve kadmiyum sınırlarına uymalıdır.",
            "**Ürün güvenliği.** Sattığın her şey güvenli olmalı, geri çağırmalara uymalısın.",
            "**Sahte ürünler.** Marka taklidi ya da sahte ürün asla listeleme.",
          ] },
          { t: "p", text: "Senden tedarikçi faturası, etiket fotoğrafı ya da damga fotoğrafı gibi kanıt isteyebiliriz. Desteklemediğin bir ilanı kaldırabiliriz." },
        ],
      },
      {
        id: "fees",
        heading: "Ücretler",
        blocks: [
          { t: "p", text: "Dükkân açmak ve ürün listelemek ücretsizdir. Satışlardan komisyon, istersen tanıtım ve teslimat etiketi için ücret alırız. Güncel oranlar [Ücretler](/pricing) sayfasında ve satıcı panelinde. Kartlı satışlarda standart komisyon {{commission_card}}; kurucu satıcılar {{commission_founding}} öder." },
          { t: "p", text: "Komisyon, sana ödeme yapmadan önce her satıştan kesilir. Ürün fiyatı ve kendi belirlediğin kargo ücreti üzerinden alınır; CarsiPazar teslimat etiketinin bedeli üzerinden alınmaz. Ücretlerimize KDV eklememiz gerekirse bunu uygulanmadan önce sana bildiririz. Ödeme sağlayıcısının masraflarını ayrıca sana yansıtmayız." },
        ],
      },
      {
        id: "payouts",
        heading: "Ödemenin bekletilmesi ve ödemeler",
        blocks: [
          { t: "ul", items: [
            "Alıcının ödemesini sipariş teslim edilene ya da teslim alınana kadar tutarız. Alıcı ürünü aldığını onayladıktan, ya da dükkândan teslim, teslim koduyla onaylandıktan {{release_days}} gün sonra ödemeni yaparız. Alıcı onaylamazsa bize haber ver: teslimatı kontrol eder, gerekirse biz onaylarız. Ödeme, bir sonraki ödeme işlemi çalıştırıldığında yapılır; bu yüzden o tarihten biraz sonra hesabına geçebilir.",
            "Ödeme, ödeme sağlayıcımıza bağladığın banka hesabına yapılır. Ödeme alabilmen için bağlı bir banka hesabın olmalıdır.",
            "Sana ödeme yapmadan önce bir siparişi iade edersek o sipariş için bir şey almazsın ve komisyon ödemezsin.",
            "Sana ödeme yaptıktan sonra bir alıcı iade ya da ödeme itirazı (chargeback) kazanırsa tutarı geri ödemelisin; bunu sonraki ödemelerinden kesebiliriz.",
          ] },
        ],
      },
      {
        id: "delivery",
        heading: "Teslimat ve dükkândan teslim",
        blocks: [
          { t: "ul", items: [
            "Her ürün için kendin göndermeyi mi yoksa CarsiPazar teslimat etiketi kullanmayı mı seçeceksin. Ambalaj ve ürünün korunması senin sorumluluğundur; ürün, alıcı ya da belirttiği kişi teslim alana kadar senin riskindedir.",
            "Kendin gönderiyorsan kanıtlayabileceğin takipli bir hizmetle gönder ve kargo firmasını ve takip numarasını gir.",
            "CarsiPazar etiketi kullanıyorsan gösterilen boyut ve ağırlık sınırlarına uy.",
            "Dükkândan teslimde siparişi yalnızca gerçekten hazır olduğunda hazır olarak işaretle. Ürünü vermeden önce alıcının 6 haneli kodunu iste ve gir. {{collection_attempts}} yanlış deneme teslimi kilitler. Alıcı ürünü almadan kodu asla isteme.",
          ] },
        ],
      },
      {
        id: "returns",
        heading: "İade",
        blocks: [
          { t: "ul", items: [
            "Alıcının ürünü teslim almasından sonra 14 gün içinde yaptığı cayma bildirimini kabul etmeli ve ürünü geri aldıktan sonra 14 gün içinde iade yapmalısın ([İade, geri ödeme ve cayma](/help/returns) sayfasına bak).",
            "İade kargosunu kimin ödeyeceğini alıcı satın almadan önce dükkân sayfanda belirt. Mobilya gibi hacimli ürünlerde tahmini bir tutar ver. Belirtmezsen sen ödersin.",
            "Bir ürünün siparişe özel üretildiğini söylersen gerçekten alıcının isteğine göre üretilmiş olmalıdır. Sipariş geldikten sonra ürettiğin standart bir ürün istisna sayılmaz.",
            "Kusurlu ürünleri Consumer Rights Act 2015 uyarınca düzeltmelisin. Kendi iade politikan buna ekleme yapabilir ama onu asla azaltamaz.",
          ] },
        ],
      },
      {
        id: "reviews",
        heading: "Yorumlar",
        blocks: [
          { t: "p", text: "Alıcılar teslimattan sonra seni değerlendirir. Yorum satın alamazsın, kendin yazamazsın, hediye ya da indirimle takas edemezsin, gizleyemezsin ve yalnızca memnun alıcılardan yorum isteyemezsin. Her yoruma bir kez cevap verebilirsin. [Yorumlar nasıl çalışır](/legal/reviews) sayfasına bak. Sahte yorumları gizleyebilir ve yorumları manipüle etmeye çalışan dükkâna yaptırım uygulayabiliriz." },
        ],
      },
      {
        id: "ranking",
        heading: "Sıralama ve tanıtım",
        blocks: [
          { t: "p", text: "Ürünleri ve dükkânları nasıl sıraladığımız [Sonuçlar nasıl sıralanır](/legal/ranking) sayfasında. Ödeme, sıralamayı yalnızca ücretli Sponsorlu yerler aracılığıyla etkiler. Tanıtım isteğe bağlıdır. Başlamadan önce iptal ettiğin tanıtımın ücreti tamamen iade edilir. Kurucu dükkânlar daha düşük komisyon öder ([Ücretler](/pricing) sayfasına bak) ve dükkânlar listesinde en üstte yer alır. Bunun dışında hiçbir dükkâna diğerlerinden daha iyi koşullar tanımayız. Kendimiz ürün satmayız." },
        ],
      },
      {
        id: "suspension",
        heading: "Askıya alma ve sona erdirme",
        blocks: [
          { t: "p", text: "Bir dükkânı; örneğin yasaklı ya da güvensiz ürün listelerse, siparişleri göndermezse, yanlış bilgi verirse, yorumları manipüle ederse, alıcılara ya da çalışanlara kötü davranırsa veya toplamamız gereken bilgileri vermezse kısıtlayabilir, askıya alabilir ya da kapatabiliriz." },
          { t: "ul", items: [
            "Bir ilanı kaldırırsak ya da bir dükkânı askıya alırsak gerekçeyi {{email}} adresine yazarak isteyebilirsin; 2 iş günü içinde yanıt veririz.",
            "Bize ulaşarak cevap verebilirsin; söylediklerini inceleriz.",
            "Sözleşmeyi sonlandırırsak en az 30 gün önceden haber veririz; ciddi bir hukuki neden ya da alıcılar için ciddi bir risk varsa bunun dışında.",
            "Dükkânını istediğin zaman kapatabilirsin. Verilmiş siparişlerin yine de tamamlanması gerekir.",
          ] },
        ],
      },
      {
        id: "tax",
        heading: "Vergi bilgileri (HMRC bildirimi)",
        blocks: [
          { t: "p", text: "Platformlar, dijital platform raporlama kurallarına göre satıcı gelirlerini HMRC'ye bildirmek zorunda olabilir. Bu kurallar bize uygulanırsa gereken bilgileri senden ister ve HMRC ile paylaşırız. Kendi vergin senin sorumluluğundadır." },
          { t: "p", text: "Bu sorumluluk KDV, gelir vergisi ve kurumlar vergisini de kapsar; biz HMRC'ye bir şey bildirsek de bildirmesek de geçerlidir." },
        ],
      },
      {
        id: "data",
        heading: "Alıcı verileri",
        blocks: [
          { t: "p", text: "Siparişlerini yerine getirebilmen için alıcıların adını, teslimat adresini ve telefonunu görürsün. Bu verilerden sonra sen sorumlu olursun. Onları yalnızca siparişi tamamlamak ve yasal yükümlülüklerini yerine getirmek için kullan. Alıcıyla pazarlama amacıyla iletişime geçme ve gerekenden uzun saklama. Veri koruma hukukuna uymalı ve sana uygulanıyorsa ICO veri koruma ücretini ödemelisin." },
        ],
      },
      {
        id: "complaints",
        heading: "Satıcı şikâyetleri",
        blocks: [
          { t: "p", text: "Askıya alma ya da kaldırılan ilan gibi bir karardan veya sana davranış biçimimizden memnun değilsen {{complaints_email}} adresine yaz. 2 iş günü içinde aldığımızı bildiririz ve 15 iş günü içinde tam bir cevap vermeyi hedefleriz. Anlaşamazsak [Şikâyetler ve bildirimler](/legal/complaints#adr) sayfasındaki “Hâlâ memnun değilsen” bölümüne bak." },
        ],
      },
      {
        id: "changes",
        heading: "Koşullarda değişiklik",
        blocks: [
          { t: "p", text: "Bu koşullarda yapılacak değişikliği en az 15 gün önceden satıcı panelinde ya da başka bir yazılı yolla bildiririz. Yasanın gerektirdiği değişiklikler daha önce yürürlüğe girebilir. Kabul etmezsen değişiklik yürürlüğe girmeden dükkânını kapatabilirsin." },
        ],
      },
      {
        id: "liability",
        heading: "Sorumluluk ve hukuk",
        blocks: [
          { t: "p", text: "İkimiz de ihmalin yol açtığı ölüm ya da yaralanma, dolandırıcılık veya yasanın dışlamamıza izin vermediği konulardaki sorumluluğu dışlamayız. Bunun ötesinde, bu koşulları ihlal etmemizden doğan zararlar için sorumluluğumuz öngörülebilir zararlarla sınırlıdır. Öngöremeyeceğimiz kâr ya da iş kaybından sorumlu değiliz. Bu koşullara İngiltere ve Galler hukuku uygulanır; bunlara ilişkin uyuşmazlıklara İngiltere ve Galler mahkemeleri bakabilir." },
        ],
      },
    ],
  },
};
