import type { Bi, Doc } from "../types";

export const cookies: Bi<Doc> = {
  en: {
    title: "Cookies",
    description: "The cookies CarsiPazar uses: a log-in cookie and a language cookie. No analytics or advertising cookies, so no cookie banner.",
    lead: "CarsiPazar uses two small cookies, both to make the site work. We use no analytics or advertising cookies, so there is no cookie banner to click.",
    legal: true,
    sections: [
      {
        id: "list",
        heading: "The cookies we use",
        blocks: [
          {
            t: "table",
            caption: "Cookies set by CarsiPazar",
            head: ["Cookie", "What it does", "How long it lasts", "Details"],
            rows: [
              ["cp_session", "Keeps you logged in. It holds a random code that matches your log-in on our server.", "30 days from log-in. Removed when you log out.", "First party. HttpOnly (scripts cannot read it). SameSite=Lax. Secure (sent only over HTTPS). Set only when you log in or register."],
              ["cp_lang", "Remembers whether you chose English or Turkish.", "1 year", "First party. SameSite=Lax. Set only when you use the language switch."],
            ],
          },
          { t: "p", text: "**cp_session** is strictly necessary: without it you cannot stay logged in, so UK law lets us set it without asking you. **cp_lang** only remembers a choice you made. We tell you about it here, and you can turn it off at any time by deleting it. We do not use local storage or similar tools either." },
        ],
      },
      {
        id: "none",
        heading: "What we do not use",
        blocks: [
          { t: "ul", items: [
            "no analytics or statistics cookies",
            "no advertising or tracking cookies",
            "no social media buttons that set cookies",
          ] },
          { t: "p", text: "When card payments go live, you will be sent to our payment provider's secure page to pay. That page belongs to the provider and may set its own cookies. Their cookie notice explains them. If we ever add any other cookie, we will update this page first and ask for your consent where the law requires it." },
        ],
      },
      {
        id: "delete",
        heading: "How to delete or block cookies",
        blocks: [
          { t: "p", text: "You can delete cookies, or block them, in your browser settings. Your browser's help pages explain how. Searching for “delete cookies” and the name of your browser will find them." },
          { t: "p", text: "If you block **cp_session**, you cannot log in, buy or sell, but you can still browse. If you block **cp_lang**, the site shows in the language your browser asks for, and you may need to pick a language again on each visit." },
        ],
      },
    ],
  },
  tr: {
    title: "Çerezler",
    description: "CarsiPazar'ın kullandığı çerezler: bir giriş çerezi ve bir dil çerezi. Analiz ya da reklam çerezi yok, bu yüzden çerez bildirimi de yok.",
    lead: "CarsiPazar iki küçük çerez kullanır; ikisi de sitenin çalışması için. Analiz ya da reklam çerezi kullanmayız, bu yüzden tıklayacağın bir çerez bildirimi yoktur.",
    legal: true,
    sections: [
      {
        id: "list",
        heading: "Kullandığımız çerezler",
        blocks: [
          {
            t: "table",
            caption: "CarsiPazar'ın bıraktığı çerezler",
            head: ["Çerez", "Ne işe yarar", "Ne kadar kalır", "Ayrıntılar"],
            rows: [
              ["cp_session", "Giriş yapmış kalmanı sağlar. Sunucumuzdaki girişinle eşleşen rastgele bir kod taşır.", "Girişten itibaren 30 gün. Çıkış yapınca silinir.", "Birinci taraf çerezi. HttpOnly (komut dosyaları okuyamaz). SameSite=Lax. Secure (yalnızca HTTPS üzerinden gönderilir). Yalnızca giriş yaptığında ya da kayıt olduğunda bırakılır."],
              ["cp_lang", "İngilizce mi Türkçe mi seçtiğini hatırlar.", "1 yıl", "Birinci taraf çerezi. SameSite=Lax. Yalnızca dil değiştirme düğmesini kullandığında bırakılır."],
            ],
          },
          { t: "p", text: "**cp_session** zorunludur: o olmadan giriş yapmış kalamazsın; bu yüzden Birleşik Krallık hukuku onu sana sormadan bırakmamıza izin verir. **cp_lang** yalnızca yaptığın bir seçimi hatırlar. Burada sana bildiriyoruz ve istediğin zaman silerek kapatabilirsin. Yerel depolama gibi benzer araçlar da kullanmayız." },
        ],
      },
      {
        id: "none",
        heading: "Kullanmadıklarımız",
        blocks: [
          { t: "ul", items: [
            "analiz ya da istatistik çerezi yok",
            "reklam ya da izleme çerezi yok",
            "çerez bırakan sosyal medya düğmeleri yok",
          ] },
          { t: "p", text: "Kartlı ödemeler yayına girdiğinde ödeme için ödeme sağlayıcımızın güvenli sayfasına yönlendirileceksin. O sayfa sağlayıcıya aittir ve kendi çerezlerini bırakabilir. Bunlar sağlayıcının çerez bildiriminde açıklanır. Başka bir çerez eklersek önce bu sayfayı güncelleriz ve yasa gerektiriyorsa onayını isteriz." },
        ],
      },
      {
        id: "delete",
        heading: "Çerezleri silmek ya da engellemek",
        blocks: [
          { t: "p", text: "Çerezleri tarayıcı ayarlarından silebilir ya da engelleyebilirsin. Nasıl yapılacağını tarayıcının yardım sayfaları anlatır. Tarayıcının adıyla birlikte “çerezleri sil” diye aratırsan bulursun." },
          { t: "p", text: "**cp_session** çerezini engellersen giriş yapamaz, alışveriş ya da satış yapamazsın; ama siteye göz atabilirsin. **cp_lang** çerezini engellersen site tarayıcının istediği dilde açılır ve her ziyarette dili yeniden seçmen gerekebilir." },
        ],
      },
    ],
  },
};
