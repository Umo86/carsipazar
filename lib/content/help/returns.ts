import type { Bi, Doc } from "../types";

export const returns: Bi<Doc> = {
  en: {
    title: "Returns, refunds and cancellation",
    description: "Your right to cancel an online order within 14 days, your rights if goods are faulty, how to ask for a refund, who pays return postage, and a printable cancellation form.",
    lead: "This page is our returns policy. It explains your legal rights and how to use them on CarsiPazar.",
    legal: true,
    print: "Print this page",
    sections: [
      {
        id: "short",
        heading: "The short version",
        blocks: [
          {
            t: "ul",
            items: [
              "You can usually cancel an online order within 14 days of receiving the goods, without giving a reason.",
              "If goods are faulty, not as described or not what you ordered, you have separate legal rights. They always apply.",
              "The seller is the business you are buying from, so you ask the seller first. If that does not work, contact us.",
              "While we hold your payment, we can return it to you. See [how the hold protects you](#hold).",
            ],
          },
        ],
      },
      {
        id: "cancel",
        heading: "Your right to cancel within 14 days",
        blocks: [
          { t: "p", text: "When you buy from a UK business online, you can cancel the order for any reason. This is your right under the Consumer Contracts (Information, Cancellation and Additional Charges) Regulations 2013." },
          {
            t: "ul",
            items: [
              "You have 14 days. They start the day after you receive the goods, or collect them from the shop. If one order arrives in several parcels, they start the day after the last one.",
              "Tell the seller you are cancelling in that time. A clear email or message is enough. You can also use the [cancellation form](#form) below.",
              "Send the goods back, or hand them back, within 14 days of telling the seller you are cancelling.",
              "Take reasonable care of the goods while you have them. You can open and inspect them as you could in a shop. If you use them more than that, the seller can take money off your refund for the loss in value.",
            ],
          },
        ],
      },
      {
        id: "exceptions",
        heading: "When the right to cancel does not apply",
        blocks: [
          { t: "p", text: "The right to cancel does not cover:" },
          {
            t: "ul",
            items: [
              "goods made to your measurements or specification, or clearly personalised, such as made-to-measure furniture or an engraved piece of jewellery. A standard item that the seller makes after you order it is not covered by this exception",
              "sealed goods that are not suitable for return for health or hygiene reasons, once you have unsealed them. The seller has to say so in the listing and be able to show why",
              "goods that were mixed inseparably with other items after delivery",
              "perishable goods",
            ],
          },
          { t: "p", text: "A shop may offer a longer or wider returns policy. It is shown on the shop page. A shop's policy can add to your rights but can never take away the rights on this page. If a seller never told you about your right to cancel, the 14 days become longer, up to 12 months." },
        ],
      },
      {
        id: "faulty",
        heading: "If the goods are faulty or not as described",
        blocks: [
          { t: "p", text: "Under the Consumer Rights Act 2015, goods must be as described, of satisfactory quality and fit for purpose. If they are not:" },
          {
            t: "ul",
            items: [
              "**Within 30 days** of receiving them you can reject them and get a full refund.",
              "**After 30 days, and up to 6 months,** you can ask for a repair or a replacement. If that does not fix it, you can ask for a refund or a price reduction.",
              "**After 6 months** you can still claim, but you may need to show that the fault was there when the goods arrived. You can claim for up to 6 years in England, Wales and Northern Ireland (5 years in Scotland).",
            ],
          },
          { t: "p", text: "These rights are against the seller. They apply whatever the shop's returns policy says. If the goods are faulty, the seller pays the cost of returning them." },
        ],
      },
      {
        id: "how",
        heading: "How to ask",
        blocks: [
          { t: "p", text: "There is no return button on the order page yet. This is how it works today:" },
          {
            t: "ol",
            items: [
              "Contact the seller. Their contact details are on the shop page. Say which order it is, that you are cancelling or what is wrong, and attach photos if the item is damaged. You may use the [cancellation form](#form).",
              "Keep a copy of what you send, and any reply.",
              "If the seller does not reply within a few days, or you cannot agree, [contact us](/contact) with your order number. We will look into it with the seller.",
            ],
          },
          { t: "p", text: "Do not press “I have received it” on the order page if there is a problem with the order. That tells us you are happy and starts the clock for paying the seller." },
        ],
      },
      {
        id: "postage",
        heading: "Who pays return postage",
        blocks: [
          {
            t: "ul",
            items: [
              "**You cancel because you changed your mind:** you pay the cost of sending the goods back, unless the seller agreed to pay or did not tell you before you bought that you would have to pay.",
              "**Large items** that cannot normally be posted, such as a sofa: the seller must have told you the cost of return before you bought. If they did not, they pay.",
              "**The goods are faulty, damaged or not what you ordered:** the seller pays.",
              "**You collected the item from the shop:** return it to the shop, so there is no postage.",
            ],
          },
        ],
      },
      {
        id: "refund",
        heading: "When you get your money back",
        blocks: [
          {
            t: "ul",
            items: [
              "If you cancel, the seller must refund you within 14 days of getting the goods back, or of you showing proof that you sent them, whichever is earlier. If they have not sent the goods yet, the 14 days start when they get your notice.",
              "The refund includes the standard delivery cost you paid. It does not include extra cost if you chose a faster delivery than the cheapest standard one.",
              "If you reject faulty goods, the refund is due within 14 days of the seller agreeing that you are entitled to it.",
              "The refund goes back to the payment method you used. Your bank may take a few working days to show it.",
            ],
          },
        ],
      },
      {
        id: "hold",
        heading: "How the payment hold protects you",
        blocks: [
          { t: "p", text: "We hold your payment. It is not paid to the seller until your order has been delivered or collected, and then only after {{release_days}} days. During that time, if something is wrong, we can return your payment to you." },
          { t: "p", text: "Once the seller has been paid, a refund comes from the seller. You still have all your legal rights, and you can still ask us to help." },
        ],
      },
      {
        id: "form",
        heading: "Cancellation form",
        blocks: [
          { t: "p", text: "You do not have to use this form. Fill it in and send it to the seller only if you want to cancel. It follows the model form set out in law." },
          {
            t: "form",
            title: "Cancellation form",
            intro: "To: [the seller: name, address and email are on the shop page]. Please also send a copy to us at {{email}}. I/We [*] hereby give notice that I/We [*] cancel my/our [*] contract of sale of the following goods [*]:",
            fields: [
              "Goods (item name and order number)",
              "Ordered on [*] / received on [*]",
              "Name of consumer(s)",
              "Address of consumer(s)",
              "Signature of consumer(s) (only if this form is notified on paper)",
              "Date",
            ],
            outro: "[*] Delete as appropriate.",
          },
        ],
      },
    ],
  },
  tr: {
    title: "İade, geri ödeme ve cayma",
    description: "Online siparişten 14 gün içinde cayma hakkın, ürün kusurluysa haklarının neler olduğu, iade ve geri ödeme nasıl istenir, iade kargosunu kim öder ve yazdırılabilir cayma formu.",
    lead: "Bu sayfa iade koşullarımızdır. Yasal haklarını ve bunları CarsiPazar'da nasıl kullanacağını anlatır.",
    legal: true,
    print: "Bu sayfayı yazdır",
    sections: [
      {
        id: "short",
        heading: "Kısaca",
        blocks: [
          {
            t: "ul",
            items: [
              "Online siparişlerde ürünü teslim aldıktan sonra genellikle 14 gün içinde, gerekçe göstermeden cayabilirsin.",
              "Ürün kusurluysa, anlatıldığı gibi değilse ya da sipariş ettiğin ürün değilse ayrı yasal haklarına sahipsin. Bu haklar her zaman geçerlidir.",
              "Satıcı, alışveriş yaptığın işletmedir; bu yüzden önce satıcıya başvurursun. Olmazsa bize ulaş.",
              "Ödemeni biz bekletirken sana iade edebiliriz. [Bekletmenin seni nasıl koruduğuna](#hold) bak.",
            ],
          },
        ],
      },
      {
        id: "cancel",
        heading: "14 gün içinde cayma hakkın",
        blocks: [
          { t: "p", text: "Birleşik Krallık'taki bir işletmeden online alışveriş yaptığında siparişten herhangi bir nedenle cayabilirsin. Bu hak, Consumer Contracts (Information, Cancellation and Additional Charges) Regulations 2013 yönetmeliğinden gelir." },
          {
            t: "ul",
            items: [
              "14 günün var. Süre, ürünü teslim aldığın ya da dükkândan aldığın günün ertesinde başlar. Sipariş birkaç paket hâlinde gelirse süre son paketin ertesinde başlar.",
              "Bu süre içinde satıcıya cayacağını bildir. Açık bir e-posta ya da mesaj yeterlidir. Aşağıdaki [cayma formunu](#form) da kullanabilirsin.",
              "Satıcıya cayacağını bildirdikten sonra 14 gün içinde ürünü geri gönder ya da geri ver.",
              "Ürün sende dururken makul özeni göster. Bir dükkânda yapabileceğin gibi açıp inceleyebilirsin. Bundan fazla kullanırsan satıcı, değer kaybı kadar tutarı geri ödemenden düşebilir.",
            ],
          },
        ],
      },
      {
        id: "exceptions",
        heading: "Cayma hakkının geçerli olmadığı durumlar",
        blocks: [
          { t: "p", text: "Cayma hakkı şunları kapsamaz:" },
          {
            t: "ul",
            items: [
              "senin ölçülerine ya da isteğine göre yapılan veya açıkça kişiselleştirilen ürünler; örneğin ölçüye göre yapılmış mobilya ya da üzerine yazı işlenmiş bir takı. Satıcının sipariş geldikten sonra ürettiği standart bir ürün bu istisnaya girmez",
              "sağlık veya hijyen nedeniyle iade edilemeyen ve açıldıktan sonra mühürlü olmaktan çıkan ürünler. Satıcının bunu ilanda belirtmesi ve nedenini gösterebilmesi gerekir",
              "teslimattan sonra yapısı gereği başka ürünlerle ayrılamayacak şekilde karışan ürünler",
              "çabuk bozulabilen ürünler",
            ],
          },
          { t: "p", text: "Bir dükkân daha uzun ya da daha geniş bir iade politikası sunabilir. Bu politika dükkân sayfasında yer alır. Dükkânın politikası haklarına ekleme yapabilir ama bu sayfadaki hakları asla kaldıramaz. Satıcı sana cayma hakkından hiç söz etmediyse 14 günlük süre uzar; en fazla 12 ay olur." },
        ],
      },
      {
        id: "faulty",
        heading: "Ürün kusurlu ya da anlatıldığı gibi değilse",
        blocks: [
          { t: "p", text: "Consumer Rights Act 2015 uyarınca ürün anlatıldığı gibi, yeterli kalitede ve amacına uygun olmalıdır. Değilse:" },
          {
            t: "ul",
            items: [
              "Teslim aldıktan sonraki **30 gün içinde** ürünü reddedip ücretin tamamını geri alabilirsin.",
              "**30 gün sonrasında ve 6 aya kadar** onarım ya da değişim isteyebilirsin. Bu sorunu çözmezse geri ödeme ya da fiyat indirimi isteyebilirsin.",
              "**6 aydan sonra** da talepte bulunabilirsin; ancak kusurun ürün sana ulaştığında var olduğunu göstermen gerekebilir. İngiltere, Galler ve Kuzey İrlanda'da 6 yıla kadar talepte bulunabilirsin (İskoçya'da 5 yıl).",
            ],
          },
          { t: "p", text: "Bu haklar satıcıya karşıdır. Dükkânın iade politikası ne diyorsa desin geçerlidir. Ürün kusurluysa geri gönderme masrafını satıcı öder." },
        ],
      },
      {
        id: "how",
        heading: "Nasıl başvurulur",
        blocks: [
          { t: "p", text: "Sipariş sayfasında henüz bir iade düğmesi yok. Bugün şöyle işliyor:" },
          {
            t: "ol",
            items: [
              "Satıcıya ulaş. İletişim bilgileri dükkân sayfasında. Hangi sipariş olduğunu, cayacağını ya da neyin yanlış olduğunu yaz; ürün hasarlıysa fotoğraf ekle. [Cayma formunu](#form) kullanabilirsin.",
              "Gönderdiklerinin ve gelen cevapların bir kopyasını sakla.",
              "Satıcı birkaç gün içinde cevap vermezse ya da anlaşamazsanız sipariş numaranla [bize ulaş](/contact). Konuyu satıcıyla birlikte inceleriz.",
            ],
          },
          { t: "p", text: "Siparişte bir sorun varsa sipariş sayfasındaki “Teslim aldım” düğmesine basma. O düğme memnun olduğunu bildirir ve satıcıya ödeme süresini başlatır." },
        ],
      },
      {
        id: "postage",
        heading: "İade kargosunu kim öder",
        blocks: [
          {
            t: "ul",
            items: [
              "**Fikrini değiştirdiğin için cayarsan:** satıcı ödemeyi kabul etmediyse ya da satın almadan önce ödeyeceğini sana bildirmediyse iade kargo masrafı sana aittir.",
              "**Koltuk gibi postayla gönderilemeyen büyük ürünlerde:** satıcı, satın almadan önce iade masrafını sana bildirmiş olmalıdır. Bildirmediyse masrafı o öder.",
              "**Ürün kusurlu, hasarlı ya da sipariş ettiğin ürün değilse:** masrafı satıcı öder.",
              "**Ürünü dükkândan aldıysan:** dükkâna geri verirsin, kargo masrafı olmaz.",
            ],
          },
        ],
      },
      {
        id: "refund",
        heading: "Paranı ne zaman geri alırsın",
        blocks: [
          {
            t: "ul",
            items: [
              "Cayarsan satıcı, ürünü geri aldıktan ya da gönderdiğine dair kanıt gösterdikten sonra, hangisi önce olursa, 14 gün içinde ödemeni iade etmelidir. Ürün henüz gönderilmediyse 14 gün bildirimin satıcıya ulaşmasıyla başlar.",
              "İade, ödediğin standart teslimat ücretini kapsar. Standart teslimattan daha pahalı bir yöntem seçtiysen aradaki fark iade edilmez.",
              "Kusurlu ürünü reddedersen iade, satıcının hakkın olduğunu kabul etmesinden itibaren 14 gün içinde yapılmalıdır.",
              "İade, ödeme yaptığın yönteme geri döner. Bankanın göstermesi birkaç iş günü sürebilir.",
            ],
          },
        ],
      },
      {
        id: "hold",
        heading: "Ödemenin bekletilmesi seni nasıl korur",
        blocks: [
          { t: "p", text: "Ödemeni biz bekletiriz. Siparişin teslim edilmesinden ya da teslim alınmasından önce, ondan sonra da {{release_days}} gün geçmeden satıcıya ödenmez. Bu sürede bir sorun olursa ödemeni sana iade edebiliriz." },
          { t: "p", text: "Satıcıya ödeme yapıldıktan sonra iade satıcıdan gelir. Tüm yasal haklarına sahip olmaya devam edersin ve yine de bizden yardım isteyebilirsin." },
        ],
      },
      {
        id: "form",
        heading: "Cayma formu",
        blocks: [
          { t: "p", text: "Bu formu kullanmak zorunda değilsin. Yalnızca cayacaksan doldurup satıcıya gönder. Yasada yer alan örnek forma uygundur." },
          {
            t: "form",
            title: "Cayma formu",
            intro: "Kime: [satıcı: ad, adres ve e-posta dükkân sayfasında]. Lütfen bir kopyasını {{email}} adresine de gönder. Aşağıdaki ürünün satışına ilişkin sözleşmeden cayma hakkımı kullandığımı bildiririm [*]:",
            fields: [
              "Ürün (ürün adı ve sipariş numarası)",
              "Sipariş tarihi [*] / teslim alma tarihi [*]",
              "Tüketicinin adı soyadı",
              "Tüketicinin adresi",
              "Tüketicinin imzası (yalnızca form kâğıt üzerinden bildiriliyorsa)",
              "Tarih",
            ],
            outro: "[*] Uygun olmayanı sil.",
          },
        ],
      },
    ],
  },
};
