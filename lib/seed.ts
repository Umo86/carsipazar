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

const SAMPLE_DELIVERY_TR = "Örnek metin: Siparişler 2 iş günü içinde takipli kargoyla gönderilir.";
const SAMPLE_DELIVERY_EN = "Sample text: Orders are sent by tracked delivery within 2 working days.";
const SAMPLE_RETURNS_TR = "Örnek metin: Teslimattan sonra 14 gün içinde iade kabul edilir.";
const SAMPLE_RETURNS_EN = "Sample text: Returns are accepted within 14 days of delivery.";

const SHOPS: {
  slug: string;
  name: string;
  type: "business" | "sole_trader";
  founding: boolean;
  city: string;
  bioTr: string;
  bioEn: string;
  cover?: { art: keyof typeof ART; palette: keyof typeof PALETTES };
  listings: DemoListing[];
}[] = [
  {
    slug: "ceviz-atolye",
    name: "Ceviz Atölye",
    type: "sole_trader",
    founding: false,
    city: "London",
    bioTr: `Ceviz ağacından el yapımı mobilya ve sedef kakma işleri. ${DEMO_NOTE_TR}`,
    bioEn: `Handmade walnut furniture and mother-of-pearl inlay. ${DEMO_NOTE_EN}`,
    cover: { art: "stars", palette: "night" },
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
      {
        category: "furniture", tr: "Masif ceviz yemek masası, 8 kişilik", en: "Solid walnut dining table, seats eight",
        dtr: "220 × 100 cm. Siparişe göre yapılır, tek parça tabla.", den: "220 × 100 cm. Made to order with a single-piece top.",
        price: 1250, postage: 0, stock: 1, instalments: true, art: "arches", palette: "night",
      },
    ],
  },
  {
    slug: "hane-mobilya",
    name: "Hane Mobilya",
    type: "business",
    founding: true,
    city: "London",
    bioTr: `Oturma odası için koltuk, sehpa ve puf. ${DEMO_NOTE_TR}`,
    bioEn: `Armchairs, tables and pouffes for the living room. ${DEMO_NOTE_EN}`,
    listings: [
      {
        category: "furniture", tr: "Kadife berjer koltuk", en: "Velvet wingback armchair",
        dtr: "Kayın iskelet, petrol mavisi kadife.", den: "Beech frame in petrol-blue velvet.",
        price: 420, postage: 30, stock: 4, instalments: true, art: "stripes", palette: "sea", featured: true,
      },
      {
        category: "furniture", tr: "Kilim desenli puf", en: "Kilim-pattern pouffe",
        dtr: "45 cm çap. Kılıfı çıkarılıp yıkanabilir.", den: "45 cm across. The cover comes off for washing.",
        price: 95, postage: 6, stock: 12, instalments: true, art: "kilim", palette: "madder",
      },
      {
        category: "furniture", tr: "Bakır tepsili orta sehpa", en: "Coffee table with copper tray",
        dtr: "Dövme bakır tepsi, katlanır ahşap ayak.", den: "Hammered copper tray on folding wooden legs.",
        price: 260, postage: 15, stock: 3, instalments: true, art: "stars", palette: "brass",
      },
    ],
  },
  {
    slug: "pera-giyim",
    name: "Pera Giyim",
    type: "business",
    founding: false,
    city: "London",
    bioTr: `Özel gün kıyafetleri, kaban ve aksesuar. ${DEMO_NOTE_TR}`,
    bioEn: `Occasion wear, coats and accessories. ${DEMO_NOTE_EN}`,
    cover: { art: "tulips", palette: "cobalt" },
    listings: [
      {
        category: "clothing", tr: "Lacivert kadife bindallı kaftan", en: "Bindallı kaftan in navy velvet",
        dtr: "Altın rengi sim işleme. 36-44 beden.", den: "Gold-thread embroidery. UK sizes 8 to 16.",
        price: 390, postage: 9, stock: 6, instalments: true, art: "tulips", palette: "cobalt", featured: true,
      },
      {
        category: "clothing", tr: "Zümrüt yeşili abiye elbise", en: "Evening gown in emerald green",
        dtr: "Saten, uzun kollu, tam boy.", den: "Satin, long-sleeved and full length.",
        price: 275, postage: 9, stock: 4, instalments: true, art: "arches", palette: "emerald",
      },
      {
        category: "clothing", tr: "Deve tüyü rengi yün kaban", en: "Wool coat in camel",
        dtr: "%80 yün. Astarlı, diz boyu.", den: "80% wool. Lined and knee length.",
        price: 180, postage: 8, stock: 5, instalments: true, art: "stripes", palette: "brass",
      },
      {
        category: "clothing", tr: "Lale desenli ipek eşarp", en: "Silk scarf with tulip print",
        dtr: "90 × 90 cm, el kesimi kenar.", den: "90 × 90 cm with hand-rolled edges.",
        price: 45, postage: 3, stock: 20, instalments: false, art: "tulips", palette: "madder",
      },
    ],
  },
  {
    slug: "telkari-atolye",
    name: "Telkari Atölye",
    type: "sole_trader",
    founding: true,
    city: "London",
    bioTr: `El işi gümüş telkari takılar. ${DEMO_NOTE_TR}`,
    bioEn: `Hand-made silver filigree jewellery. ${DEMO_NOTE_EN}`,
    listings: [
      {
        category: "jewellery", tr: "Gümüş telkari kolye", en: "Silver filigree necklace",
        dtr: "925 ayar gümüş, 45 cm zincir.", den: "925 silver on a 45 cm chain.",
        price: 120, postage: 4, stock: 6, instalments: true, art: "beads", palette: "night", featured: true,
      },
      {
        category: "jewellery", tr: "Gümüş telkari küpe", en: "Silver filigree earrings",
        dtr: "925 ayar gümüş, 3 cm.", den: "925 silver, 3 cm drop.",
        price: 65, postage: 4, stock: 10, instalments: true, art: "beads", palette: "brass",
      },
      {
        category: "jewellery", tr: "Akik taşlı gümüş yüzük", en: "Silver ring with agate",
        dtr: "Ayarlanabilir ölçü.", den: "Adjustable size.",
        price: 85, postage: 4, stock: 7, instalments: true, art: "stars", palette: "cobalt",
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
                          bio_tr, bio_en, status, founding, delivery_tr, delivery_en, returns_tr, returns_en)
       values ($1,$2,$3,$4,$5,'07000 000000','1 Demo Street',$6,'N1 1AA',$7,$8,'approved',$9,$10,$11,$12,$13)
       returning id`,
      [owner!.id, s.slug, s.name, s.type, `${s.name} (demo)`, s.city, s.bioTr, s.bioEn, s.founding,
       SAMPLE_DELIVERY_TR, SAMPLE_DELIVERY_EN, SAMPLE_RETURNS_TR, SAMPLE_RETURNS_EN],
    );
    if (s.cover) {
      const cover = await one<{ id: string }>(
        "insert into shop_images (shop_id, content_type, data) values ($1, 'image/svg+xml', $2) returning id",
        [shop!.id, Buffer.from(ART[s.cover.art](PALETTES[s.cover.palette]), "utf8")],
      );
      await q("update shops set cover_id = $2 where id = $1", [shop!.id, cover!.id]);
    }
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
