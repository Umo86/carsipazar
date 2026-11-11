import "server-only";
import { one, pool, q } from "./db";
import { hashPassword } from "./auth";
import { SCHEMA_SQL } from "./schema";
import { ART, PALETTES } from "./art";
import { computeFees } from "./money";
import { DEFAULT_SETTINGS } from "./config";

// Creates the tables, the admin account and a set of clearly-labelled demo
// shops so the site can be clicked through. Safe to run more than once.

type DemoListing = {
  category: string;
  tr: string;
  en: string;
  dtr: string;
  den: string;
  price: number; // pounds
  postage: number;
  stock: number;
  instalments: boolean;
  art: keyof typeof ART;
  palette: keyof typeof PALETTES;
  featured?: boolean;
};

const DEMO_NOTE_TR = "Bu bir örnek dükkândır; ürünler gerçek değildir.";
const DEMO_NOTE_EN = "This is a sample shop; the items are not real.";

const SHOPS: {
  slug: string;
  name: string;
  type: "business" | "sole_trader";
  founding: boolean;
  city: string;
  bioTr: string;
  bioEn: string;
  listings: DemoListing[];
}[] = [
  {
    slug: "anadolu-kilim",
    name: "Anadolu Kilim",
    type: "sole_trader",
    founding: true,
    city: "London",
    bioTr: `Uşak ve Kayseri'den el dokuması halı ve kilimler. ${DEMO_NOTE_TR}`,
    bioEn: `Hand-woven rugs and kilims from Uşak and Kayseri. ${DEMO_NOTE_EN}`,
    listings: [
      {
        category: "rugs", tr: "Uşak el dokuması halı, 200 × 300 cm", en: "Hand-woven Uşak rug, 200 × 300 cm",
        dtr: "Yün üzerine yün, kök boya. Tek parça; her halı kendi desenini taşır.",
        den: "Wool on wool with natural dyes. A single piece; every rug carries its own pattern.",
        price: 1250, postage: 0, stock: 1, instalments: true, art: "kilim", palette: "madder", featured: true,
      },
      {
        category: "rugs", tr: "Kayseri kilim, 120 × 180 cm", en: "Kayseri kilim, 120 × 180 cm",
        dtr: "Düz dokuma, çift taraflı kullanılabilir.", den: "Flat-woven and reversible.",
        price: 340, postage: 12, stock: 2, instalments: true, art: "kilim", palette: "cobalt",
      },
      {
        category: "rugs", tr: "Yolluk kilim, 80 × 300 cm", en: "Kilim runner, 80 × 300 cm",
        dtr: "Koridor ve mutfak için dar, uzun dokuma.", den: "A long, narrow weave for hallways and kitchens.",
        price: 260, postage: 12, stock: 3, instalments: true, art: "kilim", palette: "night",
      },
    ],
  },
  {
    slug: "lale-ceyiz",
    name: "Lale Çeyiz Evi",
    type: "business",
    founding: true,
    city: "London",
    bioTr: `Çeyiz, nişan ve kına için özenle seçilmiş takımlar. ${DEMO_NOTE_TR}`,
    bioEn: `Carefully chosen sets for çeyiz, engagements and henna nights. ${DEMO_NOTE_EN}`,
    listings: [
      {
        category: "wedding", tr: "El işi bakır kahve seti, 6 kişilik", en: "Hand-worked copper coffee set for six",
        dtr: "Altı fincan, cezve, tepsi ve lokumluk. Kalaylı bakır.", den: "Six cups, a cezve, tray and delight dish. Tinned copper.",
        price: 145, postage: 8, stock: 5, instalments: true, art: "stars", palette: "brass", featured: true,
      },
      {
        category: "wedding", tr: "Kadife nişan bohçası seti", en: "Velvet engagement bohça set",
        dtr: "Dokuz parça, işlemeli kadife. Renk seçeneği için mesaj atın.", den: "Nine pieces in embroidered velvet. Message us for colour options.",
        price: 220, postage: 10, stock: 4, instalments: true, art: "tulips", palette: "night",
      },
      {
        category: "textiles", tr: "Bursa havlu takımı, 6 parça", en: "Bursa towel set, six pieces",
        dtr: "%100 pamuk, 600 gr/m². İki banyo, iki el, iki yüz havlusu.", den: "100% cotton, 600 gsm. Two bath, two hand and two face towels.",
        price: 95, postage: 6, stock: 12, instalments: true, art: "stripes", palette: "sea",
      },
      {
        category: "textiles", tr: "El tezgâhı peştemal, 4'lü", en: "Hand-loomed peştemal, set of four",
        dtr: "Hafif, çabuk kuruyan pamuk dokuma.", den: "Light cotton weave that dries quickly.",
        price: 68, postage: 5, stock: 20, instalments: false, art: "stripes", palette: "cobalt",
      },
    ],
  },
  {
    slug: "ceviz-atolye",
    name: "Ceviz Atölye",
    type: "sole_trader",
    founding: false,
    city: "London",
    bioTr: `Ceviz ağacından el yapımı mobilya ve sedef kakma işleri. ${DEMO_NOTE_TR}`,
    bioEn: `Handmade walnut furniture and mother-of-pearl inlay. ${DEMO_NOTE_EN}`,
    listings: [
      {
        category: "furniture", tr: "Sedef kakmalı ceviz sehpa", en: "Walnut side table with mother-of-pearl inlay",
        dtr: "Sekizgen tabla, 50 cm çap, 55 cm yükseklik.", den: "Octagonal top, 50 cm across and 55 cm high.",
        price: 480, postage: 25, stock: 2, instalments: true, art: "stars", palette: "night", featured: true,
      },
      {
        category: "furniture", tr: "El oyması ayna, 90 cm", en: "Hand-carved mirror, 90 cm",
        dtr: "Kemerli çerçeve, masif ceviz.", den: "Arched frame in solid walnut.",
        price: 310, postage: 20, stock: 3, instalments: true, art: "arches", palette: "brass",
      },
    ],
  },
  {
    slug: "pera-abiye",
    name: "Pera Abiye",
    type: "business",
    founding: false,
    city: "London",
    bioTr: `Nişan, kına ve düğün için abiye ve kaftanlar. ${DEMO_NOTE_TR}`,
    bioEn: `Gowns and kaftans for engagements, henna nights and weddings. ${DEMO_NOTE_EN}`,
    listings: [
      {
        category: "occasion", tr: "Lacivert kadife bindallı kaftan", en: "Bindallı kaftan in navy velvet",
        dtr: "Altın rengi sim işleme. 36-44 beden.", den: "Gold-thread embroidery. UK sizes 8 to 16.",
        price: 390, postage: 9, stock: 6, instalments: true, art: "tulips", palette: "cobalt", featured: true,
      },
      {
        category: "occasion", tr: "Zümrüt yeşili abiye elbise", en: "Evening gown in emerald green",
        dtr: "Saten, uzun kollu, tam boy.", den: "Satin, long-sleeved and full length.",
        price: 275, postage: 9, stock: 4, instalments: true, art: "arches", palette: "emerald",
      },
      {
        category: "wedding", tr: "Kına gecesi tacı ve duvağı", en: "Henna night crown and veil",
        dtr: "Kırmızı tül duvak ve metal taç.", den: "Red tulle veil with a metal crown.",
        price: 85, postage: 5, stock: 8, instalments: true, art: "tulips", palette: "madder",
      },
    ],
  },
];

export async function runSetup(opts: {
  adminEmail: string;
  adminPassword: string;
  demoPassword: string;
}) {
  await pool().query(SCHEMA_SQL);

  const log: string[] = ["schema ok"];

  const admin = await one("select id from users where role = 'admin' limit 1");
  if (!admin) {
    await q("insert into users (email, password_hash, name, role) values ($1, $2, $3, 'admin')", [
      opts.adminEmail,
      await hashPassword(opts.adminPassword),
      "Admin",
    ]);
    log.push("admin created");
  }

  const anyShop = await one("select id from shops limit 1");
  if (anyShop) {
    log.push("demo data already present");
    return log;
  }

  const demoHash = await hashPassword(opts.demoPassword);
  const buyer = await one<{ id: string }>(
    "insert into users (email, password_hash, name) values ($1, $2, $3) returning id",
    ["buyer@demo.carsipazar.test", demoHash, "Demo Alıcı"],
  );

  let n = 0;
  for (const s of SHOPS) {
    n += 1;
    const owner = await one<{ id: string }>(
      "insert into users (email, password_hash, name, role) values ($1, $2, $3, 'seller') returning id",
      [`seller${n}@demo.carsipazar.test`, demoHash, `${s.name} (demo)`],
    );
    const shop = await one<{ id: string }>(
      `insert into shops (owner_id, slug, name, seller_type, legal_name, phone, address, city, postcode,
                          bio_tr, bio_en, status, founding)
       values ($1,$2,$3,$4,$5,'07000 000000','1 Demo Street',$6,'N1 1AA',$7,$8,'approved',$9) returning id`,
      [owner!.id, s.slug, s.name, s.type, `${s.name} (demo)`, s.city, s.bioTr, s.bioEn, s.founding],
    );
    let first: { id: string; price: number; postage: number; title: string } | null = null;
    for (const l of s.listings) {
      const row = await one<{ id: string }>(
        `insert into listings (shop_id, category, title_tr, title_en, description_tr, description_en,
                               price_pence, postage_pence, stock, instalments, featured)
         values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) returning id`,
        [shop!.id, l.category, l.tr, l.en, l.dtr, l.den, l.price * 100, l.postage * 100, l.stock,
         l.instalments, Boolean(l.featured)],
      );
      const svg = ART[l.art](PALETTES[l.palette]);
      await q(
        "insert into listing_images (listing_id, position, content_type, data) values ($1, 0, 'image/svg+xml', $2)",
        [row!.id, Buffer.from(svg, "utf8")],
      );
      first ??= { id: row!.id, price: l.price * 100, postage: l.postage * 100, title: l.tr };
    }

    // One completed sample order with a review, so ratings are visible.
    if (first && buyer) {
      const total = first.price + first.postage;
      const fees = computeFees({ total, method: "card", founding: s.founding, settings: { ...DEFAULT_SETTINGS } });
      const order = await one<{ id: string }>(
        `insert into orders (buyer_id, shop_id, listing_id, title, quantity, item_pence, postage_pence,
                             total_pence, payment_method, commission_pence, payment_cost_pence,
                             seller_payout_pence, status, ship_name, ship_line1, ship_city, ship_postcode,
                             ship_phone, tracking_carrier, tracking_number, paid_at, dispatched_at,
                             delivered_at, released_at)
         values ($1,$2,$3,$4,1,$5,$6,$7,'card',$8,$9,$10,'released','Demo Alıcı','2 Demo Road','London',
                 'N16 0AA','07000 000001','Royal Mail','DEMO123', now() - interval '9 days',
                 now() - interval '8 days', now() - interval '6 days', now() - interval '4 days')
         returning id`,
        [buyer.id, shop!.id, first.id, first.title, first.price, first.postage, total,
         fees.commission, fees.paymentCost, fees.sellerPayout],
      );
      const samples = [
        { r: 5, c: "Örnek yorum: Fotoğraftaki gibi geldi, paketleme çok özenliydi. Teşekkürler.", reply: "Örnek yanıt: Güle güle kullanın." },
        { r: 5, c: "Sample review: Arrived two days after ordering and exactly as described.", reply: null },
        { r: 4, c: "Örnek yorum: Ürün çok güzel. Kargo bir gün gecikti ama satıcı haber verdi.", reply: "Örnek yanıt: Gecikme için kusura bakmayın, bilgilendirdiğimize sevindik." },
        { r: 5, c: "Sample review: Beautiful work and a very helpful seller. Would order again.", reply: null },
      ];
      const sample = samples[(n - 1) % samples.length];
      await q(
        `insert into reviews (order_id, shop_id, buyer_id, rating, comment, reply, replied_at)
         values ($1,$2,$3,$4,$5,$6, case when $6::text is null then null else now() end)`,
        [order!.id, shop!.id, buyer.id, sample.r, sample.c, sample.reply],
      );
    }
  }
  log.push(`${SHOPS.length} demo shops created`);
  return log;
}
