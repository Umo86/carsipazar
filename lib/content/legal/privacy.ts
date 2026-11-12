import type { Bi, Doc } from "../types";

export const privacy: Bi<Doc> = {
  en: {
    title: "Privacy notice",
    description: "What personal data CarsiPazar collects, why, who sees it, how long we keep it, and how to use your rights under UK data protection law.",
    lead: "This notice explains what we do with your personal data. We collect only what we need to run the marketplace.",
    legal: true,
    sections: [
      {
        id: "who",
        heading: "Who is responsible for your data",
        blocks: [
          { t: "p", text: "{{operator}} is the controller of your personal data. Email: {{email}}. ICO registration number: {{ico_no}}." },
          { t: "p", text: "Shops are separate controllers for the data they receive to fulfil your order (see “Who we share it with”)." },
        ],
      },
      {
        id: "source",
        heading: "Where we get your data",
        blocks: [
          { t: "ul", items: [
            "From you, when you register, order, review, report something or write to us.",
            "From the seller of your order, such as the tracking number.",
            "From our payment provider, such as whether a payment went through, once card payments are live.",
          ] },
          { t: "p", text: "You do not have to give us your data, but without your name, delivery details and a way to pay we cannot complete an order." },
        ],
      },
      {
        id: "data",
        heading: "What we collect and why",
        blocks: [
          {
            t: "table",
            caption: "Personal data, purpose and lawful basis",
            head: ["Data", "Why we use it", "Lawful basis"],
            rows: [
              ["Account: name, email address, password (stored scrambled, never in plain text)", "To create and run your account and log you in", "Contract"],
              ["Saved delivery address and phone number (optional)", "To fill in checkout for you", "Contract"],
              ["Orders: items, amounts, delivery name, address and phone, tracking number, collection code, payment status", "To take, deliver, collect, refund and pay out orders; to handle problems", "Contract"],
              ["Accounting records of orders and fees", "To keep the accounts and tax records the law requires", "Legal obligation"],
              ["Reviews: rating, comment, your name as shown", "To publish reviews and keep them honest", "Contract and legitimate interests"],
              ["Favourites", "To show you the items you saved", "Contract"],
              ["Failed log-in records: the email address and time", "To slow down people guessing passwords", "Legitimate interests (security)"],
              ["Reports you send about an item, a shop or a review, and our notes (see “Reports” below)", "To act on reports and keep the site safe", "Legitimate interests and legal obligation"],
              ["Blocked accounts: the reason we blocked the account (only our administrators see it)", "To keep the site safe and to answer complaints about a block", "Legitimate interests"],
              ["Emails you send us", "To answer you and keep a record", "Legitimate interests"],
              ["Seller details: legal name, company number, address, phone, VAT number, bank account through our payment provider", "To check sellers, run their shops and pay them", "Contract and legal obligation"],
              ["Standard server records (IP address, browser, pages requested) kept by our hosting provider", "To run the site securely and fix faults", "Legitimate interests"],
            ],
          },
          { t: "p", text: "**Reports.** If you report an item, a shop or a review, we keep your report, your email address if you give one, your account if you are logged in, and a one-way scrambled form of your IP address, so we can deal with the report and spot abuse." },
          { t: "p", text: "**Seller details on a shop page.** A shop page publishes the seller's legal name, company number and VAT number, its address, and any phone number, email address, website and Instagram name the seller chooses to show, so that buyers know who they are buying from." },
          { t: "p", text: "We do not use analytics, advertising or tracking tools. We do not send marketing emails. We do not sell your data." },
        ],
      },
      {
        id: "share",
        heading: "Who we share it with",
        blocks: [
          { t: "ul", items: [
            "**The seller of your order.** Your name and delivery address and phone number, or only your name and phone for a collection order, so they can send or hand over your order. The seller is then responsible for that data.",
            "**Delivery carriers**, when you use a CarsiPazar delivery label, so the parcel can be delivered.",
            "**Our hosting and database providers.** Vercel runs the website and Neon stores our database. Both are located in London. They only process data for us.",
            "**Our payment provider**, Stripe, once card payments are live. Stripe handles your card details; we never see or store them.",
            "**Authorities** such as HMRC, the police or courts when the law requires it. For sellers, this includes the information we must report to HMRC about sales on the platform.",
          ] },
        ],
      },
      {
        id: "transfers",
        heading: "Transfers outside the UK",
        blocks: [
          { t: "p", text: "Our database and website servers are in London. Our hosting provider also serves pages from locations around the world through a content delivery network, and our hosting, database and payment providers are US-headquartered companies. This means some data may be processed outside the UK." },
          { t: "p", text: "When that happens we make sure the transfer is protected by a safeguard that UK data protection law accepts, such as an adequacy arrangement or approved standard contract terms. You can ask us for details." },
        ],
      },
      {
        id: "retention",
        heading: "How long we keep it",
        blocks: [
          {
            t: "table",
            caption: "Retention periods",
            head: ["Data", "How long"],
            rows: [
              ["Log-in sessions", "30 days from log-in, or until you log out"],
              ["Failed log-in records", "1 day"],
              ["Password reset links", "24 hours, and removed when used or expired"],
              ["Account details and saved address", "Until you ask us to close your account"],
              ["Orders and accounting records", "6 years after the order, as tax law requires"],
              ["Reviews", "While the shop is on CarsiPazar. If you ask us to close your account or erase your data, we remove your name from your reviews and keep the text."],
              ["Reports and complaints", "6 years after they are closed"],
            ],
          },
          { t: "p", text: "We review what we hold at least once a year and delete what we no longer need." },
        ],
      },
      {
        id: "rights",
        heading: "Your rights",
        blocks: [
          { t: "p", text: "Under UK data protection law you have the right to:" },
          { t: "ul", items: [
            "ask for a copy of your data",
            "have wrong data corrected",
            "have your data deleted, where we do not need to keep it",
            "ask us to limit how we use it",
            "receive the data you gave us in a portable form",
            "object to uses that rely on our legitimate interests",
          ] },
          { t: "p", text: "To use a right, email {{email}} from the address on your account. We will reply within one month and will not charge you. You can also change your name, address and phone in your account page at any time." },
          { t: "p", text: "To close your account or ask us to erase your data, write to {{email}}. We handle these requests by hand within one month. If you wrote a review, we remove your name from it and keep the text." },
        ],
      },
      {
        id: "complaints",
        heading: "Complaints about your data",
        blocks: [
          { t: "p", text: "Please tell us first at {{complaints_email}} and we will try to put it right. We will acknowledge your complaint within 2 working days and aim to give you a full answer within 15 working days. You can also complain to the Information Commissioner's Office (ICO) at [ico.org.uk/make-a-complaint](https://ico.org.uk/make-a-complaint) or on 0303 123 1113. See also [Complaints](/legal/complaints)." },
        ],
      },
      {
        id: "decisions",
        heading: "Automated decisions",
        blocks: [
          { t: "p", text: "We do not make decisions about you that have a legal or similarly significant effect by automated means. The only automatic step is a short pause on log-in after repeated wrong passwords." },
        ],
      },
      {
        id: "children",
        heading: "Children",
        blocks: [
          { t: "p", text: "{{site}} is for people aged 18 or over. We do not knowingly collect data from children. If you think a child has an account, write to {{email}} and we will close it by hand." },
        ],
      },
      {
        id: "cookies",
        heading: "Cookies",
        blocks: [
          { t: "p", text: "We use only two small cookies that the site needs. See [Cookies](/legal/cookies)." },
        ],
      },
      {
        id: "changes",
        heading: "Changes",
        blocks: [
          { t: "p", text: "If we change this notice in a way that matters, we will update the date above and, where we can, tell you." },
        ],
      },
    ],
  },
  tr: {
    title: "Gizlilik bildirimi",
    description: "CarsiPazar hangi kişisel verileri neden toplar, kimlerle paylaşır, ne kadar saklar ve Birleşik Krallık veri koruma hukuku kapsamındaki haklarını nasıl kullanırsın.",
    lead: "Bu bildirim, kişisel verilerinle ne yaptığımızı anlatır. Çarşıyı işletmek için gerekenden fazlasını toplamayız.",
    legal: true,
    sections: [
      {
        id: "who",
        heading: "Verilerinden kim sorumlu",
        blocks: [
          { t: "p", text: "Kişisel verilerinin veri sorumlusu {{operator}}. E-posta: {{email}}. ICO kayıt numarası: {{ico_no}}." },
          { t: "p", text: "Dükkânlar, siparişini yerine getirmek için aldıkları veriler bakımından ayrı veri sorumlularıdır (“Kimlerle paylaşırız” bölümüne bak)." },
        ],
      },
      {
        id: "source",
        heading: "Verileri nereden alıyoruz",
        blocks: [
          { t: "ul", items: [
            "Senden: kayıt olurken, sipariş verirken, yorum yazarken, bir şey bildirirken ya da bize yazarken.",
            "Siparişinin satıcısından; örneğin takip numarası.",
            "Ödeme sağlayıcımızdan; örneğin bir ödemenin tamamlanıp tamamlanmadığı (kartlı ödemeler yayına girdiğinde).",
          ] },
          { t: "p", text: "Bize veri vermek zorunda değilsin; ancak adın, teslimat bilgilerin ve bir ödeme yolu olmadan siparişi tamamlayamayız." },
        ],
      },
      {
        id: "data",
        heading: "Ne topluyoruz, neden",        blocks: [
          {
            t: "table",
            caption: "Kişisel veriler, amaç ve hukuki dayanak",
            head: ["Veri", "Neden kullanıyoruz", "Hukuki dayanak"],
            rows: [
              ["Hesap: ad, e-posta adresi, şifre (düz metin olarak değil, karıştırılmış biçimde saklanır)", "Hesabını açmak, işletmek ve girişini sağlamak", "Sözleşme"],
              ["Kayıtlı teslimat adresi ve telefon numarası (isteğe bağlı)", "Ödeme sayfasını senin için doldurmak", "Sözleşme"],
              ["Siparişler: ürünler, tutarlar, teslimat adı, adresi ve telefonu, takip numarası, teslim kodu, ödeme durumu", "Siparişi almak, teslim etmek, iade etmek, satıcıya ödemek ve sorunları çözmek", "Sözleşme"],
              ["Siparişlerin ve ücretlerin muhasebe kayıtları", "Yasanın istediği muhasebe ve vergi kayıtlarını tutmak", "Yasal yükümlülük"],
              ["Yorumlar: puan, yorum, adın", "Yorumları yayımlamak ve dürüst tutmak", "Sözleşme ve meşru menfaat"],
              ["Favoriler", "Kaydettiğin ürünleri göstermek", "Sözleşme"],
              ["Başarısız giriş kayıtları: e-posta adresi ve saat", "Şifre tahminini yavaşlatmak", "Meşru menfaat (güvenlik)"],
              ["Bir ürün, dükkân ya da yorum hakkında gönderdiğin bildirimler ve notlarımız (aşağıdaki “Bildirimler” bölümüne bak)", "Bildirimleri değerlendirmek ve siteyi güvenli tutmak", "Meşru menfaat ve yasal yükümlülük"],
              ["Engellenen hesaplar: hesabı neden engellediğimiz (yalnızca yöneticilerimiz görür)", "Siteyi güvenli tutmak ve engelle ilgili şikâyetlere cevap vermek", "Meşru menfaat"],
              ["Bize gönderdiğin e-postalar", "Sana cevap vermek ve kayıt tutmak", "Meşru menfaat"],
              ["Satıcı bilgileri: yasal ad, şirket numarası, adres, telefon, KDV numarası, ödeme sağlayıcımız üzerinden banka hesabı", "Satıcıları kontrol etmek, dükkânlarını işletmek ve onlara ödeme yapmak", "Sözleşme ve yasal yükümlülük"],
              ["Barındırma sağlayıcımızın tuttuğu standart sunucu kayıtları (IP adresi, tarayıcı, istenen sayfalar)", "Siteyi güvenle çalıştırmak ve arızaları gidermek", "Meşru menfaat"],
            ],
          },
          { t: "p", text: "**Bildirimler.** Bir ürünü, dükkânı ya da yorumu bildirirsen bildirimini, verdiysen e-posta adresini, giriş yaptıysan hesabını ve kötüye kullanımı fark edebilmek için IP adresinin geri döndürülemez biçimde karıştırılmış halini saklarız." },
          { t: "p", text: "**Dükkân sayfasındaki satıcı bilgileri.** Dükkân sayfası, alıcılar kimden alışveriş yaptığını bilsin diye satıcının yasal adını, şirket numarasını, KDV numarasını, adresini ve satıcının göstermeyi seçtiği telefon, e-posta, web sitesi ve Instagram adını yayımlar." },
          { t: "p", text: "Analiz, reklam ya da izleme araçları kullanmayız. Pazarlama e-postası göndermeyiz. Verilerini satmayız." },
        ],
      },
      {
        id: "share",
        heading: "Kimlerle paylaşırız",
        blocks: [
          { t: "ul", items: [
            "**Siparişinin satıcısı.** Siparişini göndermesi ya da teslim etmesi için adın, teslimat adresin ve telefonun; dükkândan teslim siparişinde yalnızca adın ve telefonun. Sonrasında bu verilerden satıcı sorumludur.",
            "**Kargo firmaları**, CarsiPazar teslimat etiketi kullandığında, paket teslim edilebilsin diye.",
            "**Barındırma ve veritabanı sağlayıcılarımız.** Siteyi Vercel çalıştırır, veritabanını Neon saklar. İkisi de Londra'dadır. Verileri yalnızca bizim adımıza işlerler.",
            "**Ödeme sağlayıcımız** Stripe, kartlı ödemeler yayına girdiğinde. Kart bilgilerini Stripe işler; biz görmeyiz ve saklamayız.",
            "**Yetkili kurumlar**, örneğin yasa gerektirdiğinde HMRC, polis ya da mahkemeler. Satıcılar için bu, platformdaki satışlar hakkında HMRC'ye bildirmemiz gereken bilgileri de içerir.",
          ] },
        ],
      },
      {
        id: "transfers",
        heading: "Birleşik Krallık dışına aktarım",
        blocks: [
          { t: "p", text: "Veritabanımız ve web sitesi sunucularımız Londra'dadır. Barındırma sağlayıcımız sayfaları ayrıca dünyanın çeşitli yerlerindeki bir içerik dağıtım ağı üzerinden sunar; barındırma, veritabanı ve ödeme sağlayıcılarımız ise merkezi ABD'de olan şirketlerdir. Bu nedenle bazı veriler Birleşik Krallık dışında işlenebilir." },
          { t: "p", text: "Böyle bir durumda aktarımın, Birleşik Krallık veri koruma hukukunun kabul ettiği bir güvenceyle, örneğin bir yeterlilik düzenlemesi ya da onaylı standart sözleşme hükümleriyle korunmasını sağlarız. Ayrıntıları bizden isteyebilirsin." },
        ],
      },
      {
        id: "retention",
        heading: "Ne kadar saklarız",
        blocks: [
          {
            t: "table",
            caption: "Saklama süreleri",
            head: ["Veri", "Süre"],
            rows: [
              ["Giriş oturumları", "Girişten itibaren 30 gün ya da çıkış yapana kadar"],
              ["Başarısız giriş kayıtları", "1 gün"],
              ["Şifre sıfırlama bağlantıları", "24 saat; kullanılınca ya da süresi dolunca silinir"],
              ["Hesap bilgileri ve kayıtlı adres", "Hesabını kapatmamızı isteyene kadar"],
              ["Siparişler ve muhasebe kayıtları", "Vergi hukukunun gerektirdiği gibi, siparişten sonra 6 yıl"],
              ["Yorumlar", "Dükkân CarsiPazar'da olduğu sürece. Hesabını kapatmamızı ya da verilerini silmemizi istersen adını yorumlarından kaldırır, yorum metnini tutarız."],
              ["Bildirimler ve şikâyetler", "Kapandıktan sonra 6 yıl"],
            ],
          },
          { t: "p", text: "Elimizdeki verileri en az yılda bir gözden geçirir, artık gerekmeyenleri sileriz." },
        ],
      },
      {
        id: "rights",
        heading: "Hakların",
        blocks: [
          { t: "p", text: "Birleşik Krallık veri koruma hukuku uyarınca şu haklara sahipsin:" },
          { t: "ul", items: [
            "verilerinin bir kopyasını istemek",
            "yanlış verilerin düzeltilmesini istemek",
            "saklamamız gerekmeyen verilerin silinmesini istemek",
            "verilerini nasıl kullandığımızı sınırlamamızı istemek",
            "bize verdiğin verileri taşınabilir biçimde almak",
            "meşru menfaatimize dayanan kullanımlara itiraz etmek",
          ] },
          { t: "p", text: "Bir hakkını kullanmak için hesabındaki adresten {{email}} adresine e-posta gönder. Bir ay içinde cevap veririz ve ücret almayız. Adını, adresini ve telefonunu hesap sayfandan istediğin zaman değiştirebilirsin." },
          { t: "p", text: "Hesabını kapatmak ya da verilerinin silinmesini istemek için {{email}} adresine yaz. Bu talepleri elle ve en geç bir ay içinde yerine getiririz. Bir yorum yazdıysan adını yorumdan kaldırır, yorum metnini tutarız." },
        ],
      },
      {
        id: "complaints",
        heading: "Verilerinle ilgili şikâyetler",
        blocks: [
          { t: "p", text: "Lütfen önce {{complaints_email}} adresinden bize bildir; düzeltmeye çalışırız. Şikâyetini 2 iş günü içinde aldığımızı bildiririz ve 15 iş günü içinde tam bir cevap vermeyi hedefleriz. Ayrıca Information Commissioner's Office'e (ICO) şikâyet edebilirsin: [ico.org.uk/make-a-complaint](https://ico.org.uk/make-a-complaint) ya da 0303 123 1113. [Şikâyetler](/legal/complaints) sayfasına da bak." },
        ],
      },
      {
        id: "decisions",
        heading: "Otomatik kararlar",
        blocks: [
          { t: "p", text: "Senin hakkında hukuki ya da benzer şekilde önemli sonuç doğuran, otomatik yollarla alınmış kararlar vermeyiz. Tek otomatik adım, art arda yanlış şifre girildiğinde girişin kısa süre durdurulmasıdır." },
        ],
      },
      {
        id: "children",
        heading: "Çocuklar",
        blocks: [
          { t: "p", text: "{{site}} 18 yaş ve üstü içindir. Çocuklardan bilerek veri toplamayız. Bir çocuğun hesabı olduğunu düşünürsen {{email}} adresine yaz; hesabı elle kapatırız." },
        ],
      },
      {
        id: "cookies",
        heading: "Çerezler",
        blocks: [
          { t: "p", text: "Yalnızca sitenin ihtiyaç duyduğu iki küçük çerez kullanırız. [Çerezler](/legal/cookies) sayfasına bak." },
        ],
      },
      {
        id: "changes",
        heading: "Değişiklikler",
        blocks: [
          { t: "p", text: "Bu bildirimi önemli bir şekilde değiştirirsek yukarıdaki tarihi güncelleriz ve mümkünse sana haber veririz." },
        ],
      },
    ],
  },
};
