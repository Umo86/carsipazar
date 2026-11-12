import type { Bi, Doc } from "../types";

export const delivery: Bi<Doc> = {
  en: {
    title: "Delivery and collection",
    description: "How delivery and collection work on CarsiPazar: who sends your item, delivery prices, the collection code and what to do if an order does not arrive.",
    lead: "Every order is either sent to your address or collected from the shop. This page explains both.",
    sections: [
      {
        id: "who",
        heading: "Who sends your item",
        blocks: [
          { t: "p", text: "The seller sends it. CarsiPazar does not hold or post goods. A seller chooses one of two ways for each item:" },
          {
            t: "ul",
            items: [
              "**Sent by the seller.** The seller sets the postage, posts the parcel with a carrier of their choice and adds the tracking number to your order.",
              "**CarsiPazar delivery.** The seller prints a tracked delivery label from their orders page and hands the parcel over. The tracking number is filled in for you.",
            ],
          },
          { t: "p", text: "Sofas, tables and other large items are usually sent by the seller or collected from the shop." },
        ],
      },
      {
        id: "prices",
        heading: "What delivery costs",
        blocks: [
          { t: "p", text: "The delivery price is shown on the item page (“Postage” or “Free postage”) and again at checkout, before you pay. The price you see plus the item price is the total. We add nothing else." },
          { t: "p", text: "Each shop also writes its own delivery information on its shop page. Read it if you have a question about timing or areas covered." },
        ],
      },
      {
        id: "collection",
        heading: "Collecting from the shop",
        blocks: [
          { t: "p", text: "Some sellers let you collect. If an item offers collection, you choose delivery or collection at checkout. Collection is free and you pay by card. For a collection order we keep only your name and phone number, not an address." },
          { t: "h3", text: "The 6-digit handover code" },
          {
            t: "ol",
            items: [
              "You order and pay. Your payment is held.",
              "The seller marks your order as **Ready to collect**. Only then do you see your handover code on your order page.",
              "Go to the shop at the times it gives on the order page. Check the item.",
              "Give the seller the 6-digit code. Do not share it before you have the item in your hands.",
              "The seller types in the code. The order becomes **Collected** and the payment is released to the seller after {{release_days}} days.",
            ],
          },
          { t: "note", text: "If the seller types in a wrong code {{collection_attempts}} times, the handover locks to protect you. Contact us and we will help complete it." },
        ],
      },
      {
        id: "statuses",
        heading: "What the order statuses mean",
        blocks: [
          {
            t: "table",
            caption: "Order statuses",
            head: ["Status", "Delivery order", "Collection order"],
            rows: [
              ["Awaiting payment", "Your payment has not gone through yet.", "Your payment has not gone through yet."],
              ["Being prepared", "Your payment is received and held. The seller is preparing your order.", "Your payment is received and held. The seller will tell you when it is ready."],
              ["On its way / Ready to collect", "The seller has dispatched it. Confirm below once it arrives.", "Ready to collect. Give the code to the seller when you collect."],
              ["Delivered / Collected", "You confirmed delivery. The seller is paid after {{release_days}} days.", "The seller entered your code. The seller is paid after {{release_days}} days."],
              ["Complete", "The order is finished and the seller has been paid.", "The order is finished and the seller has been paid."],
              ["Refunded or cancelled", "Your payment has been returned, or the order was cancelled.", "Your payment has been returned, or the order was cancelled."],
            ],
          },
          { t: "p", text: "Check the item before you press “I have received it”. Once you confirm, the payment goes to the seller after {{release_days}} days." },
        ],
      },
      {
        id: "late",
        heading: "How long delivery takes",
        blocks: [
          { t: "p", text: "Unless the seller and you agree another date, the seller must deliver within 30 days of your order. If it is late, you can set the seller a new deadline, and if that is missed you can end the contract and get your money back. The goods stay at the seller's risk until you, or someone you name, receive them. For collection, that is when you take the goods." },
        ],
      },
      {
        id: "missing",
        heading: "If your order does not arrive",
        blocks: [
          {
            t: "ol",
            items: [
              "Look at your order page for the tracking number, and check it with the carrier.",
              "Write to the seller. The seller's name and address are on the shop page. If the shop shows no email address, write to us at {{email}} and we will pass it on.",
              "Still nothing, or the item is damaged or not as described? [Contact us](/contact) with your order number. Do not press “I have received it”: your payment stays held until you confirm.",
            ],
          },
          { t: "p", text: "Your rights if goods do not arrive, or arrive faulty, are explained in [Returns, refunds and cancellation](/help/returns)." },
        ],
      },
    ],
  },
  tr: {
    title: "Teslimat ve teslim alma",
    description: "CarsiPazar'da teslimat ve dükkândan teslim alma nasıl çalışır: ürünü kim gönderir, teslimat ücretleri, teslim kodu ve siparişin ulaşmaması hâlinde ne yapmalı.",
    lead: "Her sipariş ya adresine gönderilir ya da dükkândan teslim alınır. Bu sayfa ikisini de anlatır.",
    sections: [
      {
        id: "who",
        heading: "Ürünü kim gönderir",
        blocks: [
          { t: "p", text: "Ürünü satıcı gönderir. CarsiPazar ürünleri elinde bulundurmaz ve göndermez. Satıcı her ürün için iki yoldan birini seçer:" },
          {
            t: "ul",
            items: [
              "**Satıcı gönderir.** Satıcı kargo ücretini belirler, paketi kendi seçtiği kargo firmasıyla gönderir ve takip numarasını siparişine ekler.",
              "**CarsiPazar teslimatı.** Satıcı sipariş sayfasından takipli bir teslimat etiketi basar ve paketi teslim eder. Takip numarası senin için otomatik girilir.",
            ],
          },
          { t: "p", text: "Kanepe, masa gibi büyük ürünleri genellikle satıcı kendisi gönderir ya da alıcı dükkândan alır." },
        ],
      },
      {
        id: "prices",
        heading: "Teslimat ne kadar tutar",
        blocks: [
          { t: "p", text: "Teslimat ücreti ürün sayfasında (“Kargo” ya da “Ücretsiz kargo”) ve ödeme öncesinde yeniden gösterilir. Gördüğün kargo ücreti artı ürün fiyatı toplam tutardır. Başka bir şey eklemeyiz." },
          { t: "p", text: "Her dükkân kendi teslimat bilgilerini dükkân sayfasında da yazar. Süre ya da hizmet verilen bölgeler hakkında sorun varsa oraya bak." },
        ],
      },
      {
        id: "collection",
        heading: "Dükkândan teslim alma",
        blocks: [
          { t: "p", text: "Bazı satıcılar ürünü dükkândan teslim almana izin verir. Bir ürün bunu sunuyorsa ödeme sırasında teslimat ya da dükkândan teslim seçersin. Dükkândan teslim ücretsizdir ve kartla ödersin. Dükkândan teslim siparişlerinde adres değil, yalnızca adın ve telefon numaran saklanır." },
          { t: "h3", text: "6 haneli teslim kodu" },
          {
            t: "ol",
            items: [
              "Sipariş verir ve ödersin. Ödemen bizde bekletilir.",
              "Satıcı siparişi **Teslim almaya hazır** olarak işaretler. Teslim kodunu ancak o zaman sipariş sayfanda görürsün.",
              "Sipariş sayfasında yazan saatlerde dükkâna git. Ürünü kontrol et.",
              "6 haneli kodu satıcıya ver. Ürünü eline almadan kodu kimseyle paylaşma.",
              "Satıcı kodu girer. Sipariş **Teslim alındı** olur ve ödeme {{release_days}} gün sonra satıcıya aktarılır.",
            ],
          },
          { t: "note", text: "Satıcı kodu {{collection_attempts}} kez yanlış girerse teslim, seni korumak için kilitlenir. Bize ulaş, teslimi tamamlamana yardım edelim." },
        ],
      },
      {
        id: "statuses",
        heading: "Sipariş durumları ne demek",
        blocks: [
          {
            t: "table",
            caption: "Sipariş durumları",
            head: ["Durum", "Teslimat siparişi", "Dükkândan teslim siparişi"],
            rows: [
              ["Ödeme bekleniyor", "Ödemen henüz tamamlanmadı.", "Ödemen henüz tamamlanmadı."],
              ["Hazırlanıyor", "Ödemen alındı ve bekletiliyor. Satıcı siparişini hazırlıyor.", "Ödemen alındı ve bekletiliyor. Hazır olduğunda satıcı sana haber verir."],
              ["Kargoda / Teslim almaya hazır", "Satıcı gönderdi. Eline ulaşınca onayla.", "Teslim almaya hazır. Almaya gittiğinde kodu satıcıya ver."],
              ["Teslim edildi / Teslim alındı", "Teslimatı onayladın. Satıcıya {{release_days}} gün sonra ödeme yapılır.", "Satıcı kodunu girdi. Satıcıya {{release_days}} gün sonra ödeme yapılır."],
              ["Tamamlandı", "Sipariş bitti, satıcıya ödeme yapıldı.", "Sipariş bitti, satıcıya ödeme yapıldı."],
              ["İade edildi veya iptal edildi", "Ödemen iade edildi ya da sipariş iptal edildi.", "Ödemen iade edildi ya da sipariş iptal edildi."],
            ],
          },
          { t: "p", text: "“Teslim aldım” düğmesine basmadan önce ürünü kontrol et. Onayladığında ödeme {{release_days}} gün sonra satıcıya geçer." },
        ],
      },
      {
        id: "late",
        heading: "Teslimat ne kadar sürer",
        blocks: [
          { t: "p", text: "Satıcıyla başka bir tarih kararlaştırmadıysanız satıcı siparişten sonra 30 gün içinde teslim etmelidir. Gecikirse satıcıya yeni bir süre verebilirsin; o süre de kaçırılırsa sözleşmeyi sonlandırıp paranı geri alabilirsin. Ürün, sen ya da belirttiğin kişi teslim alana kadar satıcının riskindedir. Dükkândan teslimde bu, ürünü aldığın andır." },
        ],
      },
      {
        id: "missing",
        heading: "Siparişin ulaşmazsa",
        blocks: [
          {
            t: "ol",
            items: [
              "Sipariş sayfandaki takip numarasına bak ve kargo firmasından kontrol et.",
              "Satıcıya yaz. Satıcının adı ve adresi dükkân sayfasında yer alır. Dükkân sayfasında e-posta adresi yoksa {{email}} adresine yaz, biz satıcıya iletiriz.",
              "Hâlâ bir şey yoksa ya da ürün hasarlı veya anlatıldığı gibi değilse sipariş numaranla [bize ulaş](/contact). “Teslim aldım” düğmesine basma: sen onaylayana kadar ödemen bekletilir.",
            ],
          },
          { t: "p", text: "Ürün ulaşmazsa ya da kusurlu gelirse haklarını [İade, geri ödeme ve cayma](/help/returns) sayfasında bulursun." },
        ],
      },
    ],
  },
};
