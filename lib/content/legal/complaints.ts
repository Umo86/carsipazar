import type { Bi, Doc } from "../types";

export const complaints: Bi<Doc> = {
  en: {
    title: "Complaints and reporting",
    description: "How to complain about an order, a seller, CarsiPazar or your personal data, and how to report illegal content, with our timescales and what to do if you are still unhappy.",
    lead: "If something has gone wrong, tell us. This page explains who to contact and what happens next.",
    legal: true,
    sections: [
      {
        id: "order",
        heading: "A problem with an order",
        blocks: [
          { t: "ol", items: [
            "Contact the seller first. The seller's name and address are on the shop page. If the shop shows no email address, write to us at {{complaints_email}} and we will pass it on. Many problems are solved this way.",
            "If the seller does not reply within a few days, or you cannot agree, write to us at {{complaints_email}} with your order number and what happened.",
            "Do not confirm delivery while there is a problem. We hold your payment until you do, or until the seller completes a collection.",
          ] },
          { t: "p", text: "Your rights are explained in [Returns, refunds and cancellation](/help/returns)." },
        ],
      },
      {
        id: "platform",
        heading: "A complaint about CarsiPazar",
        blocks: [
          { t: "p", text: "You can complain about how we run the site, how we handled a report, a decision to remove or keep content, or a suspended account. Write to {{complaints_email}}, or by post to {{legal_name}}, {{postal_address}}. Say what happened and what you would like us to do." },
        ],
      },
      {
        id: "illegal",
        heading: "Reporting illegal content",
        blocks: [
          { t: "p", text: "To report a listing, review or shop that you think is illegal, unsafe, fake or breaks our rules, use the Report link on the page. If you cannot, email {{complaints_email}} with the web address and say what is wrong." },
          { t: "ul", items: [
            "We read every report.",
            "If we believe something is illegal or breaks our rules, we remove it or restrict it as quickly as we can.",
            "If you give an email address when you report, we will write to you with the outcome.",
            "If we remove a listing or suspend a shop, the seller can ask us for the reasons by writing to {{email}}; we reply within 2 working days.",
            "We may pass information to the police or another authority when the law requires it.",
          ] },
          { t: "p", text: "If you disagree with a decision about content or your account, you can complain to us as above and we will have it looked at again." },
        ],
      },
      {
        id: "timescales",
        heading: "How long we take",
        blocks: [
          { t: "table", caption: "Our timescales", head: ["Step", "Target"], rows: [
            ["We acknowledge your complaint", "Within 2 working days"],
            ["We give you a full answer", "Within 15 working days. If it will take longer, we tell you why and when to expect it."],
            ["Reports of illegal content", "We look at them as quickly as we can. Reports of serious harm go first."],
            ["Complaints about personal data", "Acknowledged within 2 working days. A full answer within 15 working days."],
            ["Requests about your personal data, such as a copy of it or erasure", "We answer within one month."],
          ] },
        ],
      },
      {
        id: "data",
        heading: "Complaints about your personal data",
        blocks: [
          { t: "p", text: "Write to {{complaints_email}}. We will acknowledge it within 2 working days, look into it, and tell you the outcome. You can also complain to the Information Commissioner's Office at [ico.org.uk/make-a-complaint](https://ico.org.uk/make-a-complaint) or on 0303 123 1113. More in the [privacy notice](/legal/privacy)." },
        ],
      },
      {
        id: "adr",
        heading: "If you are still not happy",
        blocks: [
          { t: "p", text: "Alternative dispute resolution: {{adr}}" },
          { t: "p", text: "You can also get free advice from Citizens Advice on 0808 223 1133, and you always have the right to go to court. Getting free advice does not stop you from using any of these routes." },
        ],
      },
    ],
  },
  tr: {
    title: "Şikâyetler ve bildirimler",
    description: "Bir sipariş, bir satıcı, CarsiPazar ya da kişisel verilerin hakkında nasıl şikâyet edersin, yasa dışı içerik nasıl bildirilir; sürelerimiz ve yine de memnun kalmazsan neler yapabilirsin.",
    lead: "Bir şey ters gittiyse bize söyle. Bu sayfa kime ulaşacağını ve sonrasında ne olacağını anlatır.",
    legal: true,
    sections: [
      {
        id: "order",
        heading: "Siparişle ilgili sorun",
        blocks: [
          { t: "ol", items: [
            "Önce satıcıyla iletişime geç. Satıcının adı ve adresi dükkân sayfasında yer alır. Dükkân sayfasında e-posta adresi yoksa {{complaints_email}} adresine yaz, biz satıcıya iletiriz. Birçok sorun böyle çözülür.",
            "Satıcı birkaç gün içinde cevap vermezse ya da anlaşamazsanız sipariş numaran ve olanlarla {{complaints_email}} adresine yaz.",
            "Sorun varken teslimatı onaylama. Sen onaylayana ya da satıcı dükkândan teslimi tamamlayana kadar ödemeni bekletiriz.",
          ] },
          { t: "p", text: "Haklarını [İade, geri ödeme ve cayma](/help/returns) sayfasında bulursun." },
        ],
      },
      {
        id: "platform",
        heading: "CarsiPazar hakkında şikâyet",
        blocks: [
          { t: "p", text: "Siteyi nasıl işlettiğimiz, bir bildirimi nasıl ele aldığımız, bir içeriği kaldırma ya da tutma kararımız veya askıya alınmış bir hesap hakkında şikâyet edebilirsin. {{complaints_email}} adresine ya da posta yoluyla {{legal_name}}, {{postal_address}} adresine yaz. Ne olduğunu ve bizden ne yapmamızı istediğini belirt." },
        ],
      },
      {
        id: "illegal",
        heading: "Yasa dışı içerik bildirmek",
        blocks: [
          { t: "p", text: "Yasa dışı, güvensiz, sahte olduğunu ya da kurallarımızı çiğnediğini düşündüğün bir ilanı, yorumu veya dükkânı bildirmek için sayfadaki Bildir bağlantısını kullan. Kullanamazsan web adresiyle birlikte {{complaints_email}} adresine e-posta gönder ve neyin yanlış olduğunu yaz." },
          { t: "ul", items: [
            "Her bildirimi okuruz.",
            "Bir şeyin yasa dışı olduğuna ya da kurallarımızı çiğnediğine inanırsak onu mümkün olan en kısa sürede kaldırır veya kısıtlarız.",
            "Bildirirken bir e-posta adresi verirsen sonucu sana yazarız.",
            "Bir ilanı kaldırırsak ya da bir dükkânı askıya alırsak satıcı gerekçeyi {{email}} adresine yazarak isteyebilir; 2 iş günü içinde yanıt veririz.",
            "Yasa gerektirdiğinde bilgileri polise ya da başka bir yetkili kuruma iletebiliriz.",
          ] },
          { t: "p", text: "İçerik ya da hesabınla ilgili bir karara katılmıyorsan yukarıdaki gibi bize şikâyet edebilirsin; konuyu yeniden inceletiriz." },
        ],
      },
      {
        id: "timescales",
        heading: "Ne kadar sürede cevap veririz",
        blocks: [
          { t: "table", caption: "Sürelerimiz", head: ["Adım", "Hedef"], rows: [
            ["Şikâyetini aldığımızı bildiririz", "2 iş günü içinde"],
            ["Tam bir cevap veririz", "15 iş günü içinde. Daha uzun sürecekse nedenini ve ne zaman cevap bekleyebileceğini söyleriz."],
            ["Yasa dışı içerik bildirimleri", "Mümkün olan en kısa sürede inceleriz. Ciddi zarar bildirimleri öncelikli."],
            ["Kişisel verilerle ilgili şikâyetler", "2 iş günü içinde aldığımızı bildiririz. 15 iş günü içinde tam bir cevap veririz."],
            ["Kişisel verilerinle ilgili talepler; örneğin bir kopya istemek ya da silinmesini istemek", "Bir ay içinde yanıt veririz."],
          ] },
        ],
      },
      {
        id: "data",
        heading: "Kişisel verilerinle ilgili şikâyetler",
        blocks: [
          { t: "p", text: "{{complaints_email}} adresine yaz. 2 iş günü içinde aldığımızı bildirir, inceler ve sonucu sana söyleriz. Ayrıca Information Commissioner's Office'e de şikâyet edebilirsin: [ico.org.uk/make-a-complaint](https://ico.org.uk/make-a-complaint) ya da 0303 123 1113. Daha fazlası [gizlilik bildiriminde](/legal/privacy)." },
        ],
      },
      {
        id: "adr",
        heading: "Hâlâ memnun değilsen",
        blocks: [
          { t: "p", text: "Alternatif uyuşmazlık çözümü: {{adr}}" },
          { t: "p", text: "Citizens Advice'tan 0808 223 1133 numarasından ücretsiz tavsiye de alabilirsin ve mahkemeye başvurma hakkın her zaman saklıdır. Ücretsiz tavsiye almak bu yolların hiçbirini kullanmana engel olmaz." },
        ],
      },
    ],
  },
};
