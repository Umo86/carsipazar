import type { Bi, Doc } from "../types";

export const contact: Bi<Doc> = {
  en: {
    title: "Contact us",
    description: "How to contact CarsiPazar: email, postal address, what to include, how fast we reply and where to report an item, review or shop.",
    lead: "We are a small team. Email is the best way to reach us.",
    sections: [
      {
        id: "details",
        heading: "How to reach us",
        blocks: [
          { t: "ul", items: ["**Email:** {{email}}", "**Post:** {{legal_name}}, {{postal_address}}"] },
          { t: "p", text: "We do not have a phone line or live chat. Please do not send payment details or passwords by email: we will never ask for them." },
        ],
      },
      {
        id: "include",
        heading: "What to include",
        blocks: [
          {
            t: "ul",
            items: [
              "The email address on your account",
              "Your order number, if it is about an order",
              "The shop and item name",
              "What happened and what you would like us to do",
              "Photos, if an item is damaged or not as described",
            ],
          },
        ],
      },
      {
        id: "reply",
        heading: "How quickly we reply",
        blocks: [
          { t: "p", text: "We aim to reply within 2 working days. If your message is about an order that has not arrived, say so in the subject line and we will look at it first." },
        ],
      },
      {
        id: "report",
        heading: "Reporting something",
        blocks: [
          { t: "p", text: "To report an item, review or shop, use the Report link on that item, review or shop page. If you cannot, email us with the web address of the page and say what is wrong." },
          { t: "p", text: "Seller details, delivery information and returns policy for a particular order are on the shop page. Contact the seller first about an order, and us if it is not resolved." },
        ],
      },
      {
        id: "complaints",
        heading: "Complaints",
        blocks: [
          { t: "p", text: "If you are not happy with how we or a seller handled something, see [how to complain](/legal/complaints). Complaints about personal data go to the same address and are explained in the [privacy notice](/legal/privacy)." },
        ],
      },
    ],
  },
  tr: {
    title: "İletişim",
    description: "CarsiPazar'a nasıl ulaşırsın: e-posta, posta adresi, mesajına neleri yazmalısın, ne kadar sürede cevap veririz ve bir ürünü, yorumu ya da dükkânı nereden bildirirsin.",
    lead: "Küçük bir ekibiz. Bize ulaşmanın en iyi yolu e-postadır.",
    sections: [
      {
        id: "details",
        heading: "Bize nasıl ulaşırsın",
        blocks: [
          { t: "ul", items: ["**E-posta:** {{email}}", "**Posta:** {{legal_name}}, {{postal_address}}"] },
          { t: "p", text: "Telefon hattımız ya da canlı sohbetimiz yok. Lütfen ödeme bilgilerini ya da şifreni e-postayla gönderme: bunları asla istemeyiz." },
        ],
      },
      {
        id: "include",
        heading: "Mesajında neler olsun",
        blocks: [
          {
            t: "ul",
            items: [
              "Hesabındaki e-posta adresi",
              "Sipariş hakkındaysa sipariş numaran",
              "Dükkânın ve ürünün adı",
              "Ne olduğu ve bizden ne yapmamızı istediğin",
              "Ürün hasarlı ya da anlatıldığı gibi değilse fotoğraflar",
            ],
          },
        ],
      },
      {
        id: "reply",
        heading: "Ne kadar sürede cevap veririz",
        blocks: [
          { t: "p", text: "2 iş günü içinde cevap vermeyi hedefleriz. Mesajın ulaşmayan bir siparişle ilgiliyse konu satırına yaz, önce onu inceleriz." },
        ],
      },
      {
        id: "report",
        heading: "Bir şeyi bildirmek",
        blocks: [
          { t: "p", text: "Bir ürünü, yorumu ya da dükkânı bildirmek için o ürün, yorum veya dükkân sayfasındaki Bildir bağlantısını kullan. Kullanamazsan sayfanın web adresiyle birlikte bize e-posta gönder ve neyin yanlış olduğunu yaz." },
          { t: "p", text: "Belirli bir siparişle ilgili satıcı bilgileri, teslimat bilgisi ve iade koşulları dükkân sayfasındadır. Sipariş için önce satıcıya yaz; çözülmezse bize ulaş." },
        ],
      },
      {
        id: "complaints",
        heading: "Şikâyetler",
        blocks: [
          { t: "p", text: "Bizim ya da bir satıcının bir konuyu ele alış biçiminden memnun kalmadıysan [şikâyet nasıl yapılır](/legal/complaints) sayfasına bak. Kişisel verilerle ilgili şikâyetler aynı adrese gönderilir; [gizlilik bildiriminde](/legal/privacy) anlatılır." },
        ],
      },
    ],
  },
};
