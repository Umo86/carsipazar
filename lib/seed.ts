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
  photo: string; // Unsplash photo id, used unless DEMO_IMAGES=art
  featured?: boolean;
};

// Sample photos come from Unsplash (free licence) and are loaded from its
// servers. Set DEMO_IMAGES=art to use the drawn patterns instead, for
// example when working offline.
const withPhotos = () => process.env.DEMO_IMAGES !== "art";
const unsplash = (id: string) => `https://images.unsplash.com/photo-${id}`;

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
  cover: { art: keyof typeof ART; palette: keyof typeof PALETTES; photo: string };
  listings: DemoListing[];
}[] = [
  {
    slug: "ceviz-atolye",
    name: "Ceviz Atölye",
    type: "sole_trader",
    founding: false,
    city: "London",
    bioTr: `Ceviz ağacından el yapımı mobilya. ${DEMO_NOTE_TR}`,
    bioEn: `Handmade furniture in walnut. ${DEMO_NOTE_EN}`,
    cover: { art: "stars", palette: "night", photo: "1758977403865-f79e156415b3" },
    listings: [
      {
        category: "furniture", tr: "Ceviz zigon sehpa, 3'lü", en: "Walnut nesting tables, set of three",
        dtr: "Masif ceviz, yağlı cila. En büyüğü 55 × 40 cm.", den: "Solid walnut with an oiled finish. The largest is 55 × 40 cm.",
        price: 480, postage: 25, stock: 2, instalments: true, art: "stars", palette: "night",
        photo: "1611486212355-d276af4581c0", featured: true,
      },
      {
        category: "furniture", tr: "Pirinç çerçeveli duvar aynası seti", en: "Set of brass-framed wall mirrors",
        dtr: "Dokuz parça, farklı boy ve biçimlerde.", den: "Nine pieces in mixed sizes and shapes.",
        price: 310, postage: 20, stock: 3, instalments: true, art: "arches", palette: "brass",
        photo: "1595455967759-5f1356993e53",
      },
      {
        category: "furniture", tr: "Masif yemek masası, 6 kişilik", en: "Solid wood dining table, seats six",
        dtr: "180 × 90 cm. Siparişe göre yapılır.", den: "180 × 90 cm. Made to order.",
        price: 1250, postage: 0, stock: 1, instalments: true, art: "arches", palette: "night",
        photo: "1758977404039-6e834be8eca8",
      },
      {
        category: "furniture", tr: "El oyması çekmeceli şifonyer", en: "Hand-carved chest of drawers",
        dtr: "Üç çekmece, döküm kulplar.", den: "Three drawers with cast handles.",
        price: 690, postage: 40, stock: 2, instalments: true, art: "stars", palette: "brass",
        photo: "1544691560-fc2053d97726",
      },
    ],
  },
  {
    slug: "hane-mobilya",
    name: "Hane Mobilya",
    type: "business",
    founding: true,
    city: "London",
    bioTr: `Oturma odası için koltuk, sehpa ve tabure. ${DEMO_NOTE_TR}`,
    bioEn: `Armchairs, tables and stools for the living room. ${DEMO_NOTE_EN}`,
    cover: { art: "stripes", palette: "sea", photo: "1583847268964-b28dc8f51f92" },
    listings: [
      {
        category: "furniture", tr: "Gri berjer koltuk", en: "Grey wingback armchair",
        dtr: "Kayın ayak, keten karışımlı kumaş.", den: "Beech legs and a linen-blend fabric.",
        price: 420, postage: 30, stock: 4, instalments: true, art: "stripes", palette: "sea",
        photo: "1759722667490-e5fd31b8dbd5", featured: true,
      },
      {
        category: "furniture", tr: "Ahşap tabure, 2'li", en: "Pair of wooden stools",
        dtr: "45 cm yükseklik, masif ahşap.", den: "45 cm high in solid wood.",
        price: 95, postage: 6, stock: 12, instalments: true, art: "kilim", palette: "madder",
        photo: "1540809799-5da9372c3f64",
      },
      {
        category: "furniture", tr: "Metal ayaklı orta sehpa", en: "Coffee table with hairpin legs",
        dtr: "Masif tabla, siyah metal ayak.", den: "A solid top on black metal legs.",
        price: 260, postage: 15, stock: 3, instalments: true, art: "stars", palette: "brass",
        photo: "1581428982868-e410dd047a90",
      },
      {
        category: "furniture", tr: "Koyu yeşil üçlü kanepe", en: "Three-seat sofa in forest green",
        dtr: "Dokulu kumaş, iki kırlent dahil.", den: "Textured fabric, with two cushions included.",
        price: 890, postage: 0, stock: 2, instalments: true, art: "stripes", palette: "emerald",
        photo: "1590251024078-8a6d9f90b02d",
      },
      {
        category: "furniture", tr: "Raflı yan sehpa", en: "Side table with open shelf",
        dtr: "Kitap ve dergi için açık raf.", den: "An open shelf for books and magazines.",
        price: 140, postage: 10, stock: 6, instalments: true, art: "arches", palette: "brass",
        photo: "1532372320572-cda25653a26d",
      },
      {
        category: "furniture", tr: "Bükme ahşap dinlenme koltuğu", en: "Bentwood lounge chair",
        dtr: "Esnek ahşap iskelet, siyah minder.", den: "A sprung wooden frame with a black cushion.",
        price: 340, postage: 25, stock: 3, instalments: true, art: "arches", palette: "night",
        photo: "1617364852223-75f57e78dc96",
      },
    ],
  },
  {
    slug: "pera-giyim",
    name: "Pera Giyim",
    type: "business",
    founding: false,
    city: "London",
    bioTr: `Özel gün kıyafetleri, ceket ve aksesuar. ${DEMO_NOTE_TR}`,
    bioEn: `Occasion wear, jackets and accessories. ${DEMO_NOTE_EN}`,
    cover: { art: "tulips", palette: "cobalt", photo: "1605450081927-6b40c11c661f" },
    listings: [
      {
        category: "clothing", tr: "Beyaz straplez elbise", en: "White strapless dress",
        dtr: "Astarlı, kalp yaka. 36-42 beden.", den: "Lined, with a sweetheart neckline. UK sizes 8 to 14.",
        price: 275, postage: 9, stock: 4, instalments: true, art: "tulips", palette: "cobalt",
        photo: "1540459920617-415d62f1f76b", featured: true,
      },
      {
        category: "clothing", tr: "Kahverengi deri ceket", en: "Brown leather jacket",
        dtr: "Hakiki deri, saten astar.", den: "Real leather with a satin lining.",
        price: 390, postage: 9, stock: 5, instalments: true, art: "arches", palette: "emerald",
        photo: "1623854156816-4c4fc355ffc7",
      },
      {
        category: "clothing", tr: "Siyah blazer ceket", en: "Black blazer",
        dtr: "Yün karışımlı, tek düğme.", den: "A wool blend with a single button.",
        price: 180, postage: 8, stock: 6, instalments: true, art: "stripes", palette: "brass",
        photo: "1592343516109-362f7bd871aa",
      },
      {
        category: "clothing", tr: "Kahverengi örgü kazak", en: "Brown knitted jumper",
        dtr: "El örgüsü, yün karışımlı.", den: "Hand-knitted in a wool blend.",
        price: 85, postage: 6, stock: 8, instalments: true, art: "kilim", palette: "madder",
        photo: "1773747310662-e7cc9e681226",
      },
      {
        category: "clothing", tr: "Zincir desenli ipek eşarp", en: "Silk scarf with chain print",
        dtr: "90 × 90 cm, kenarları elde rulo dikilmiş.", den: "90 × 90 cm with hand-rolled edges.",
        price: 45, postage: 3, stock: 20, instalments: false, art: "tulips", palette: "madder",
        photo: "1551028442-ee84b4d3a50a",
      },
    ],
  },
  {
    slug: "telkari-atolye",
    name: "Telkari Atölye",
    type: "sole_trader",
    founding: true,
    city: "London",
    bioTr: `El işi gümüş takılar. ${DEMO_NOTE_TR}`,
    bioEn: `Hand-made silver jewellery. ${DEMO_NOTE_EN}`,
    cover: { art: "beads", palette: "night", photo: "1585053736987-f817dc225fc5" },
    listings: [
      {
        category: "jewellery", tr: "Taşlı gümüş kolye", en: "Silver pendant necklace",
        dtr: "925 ayar gümüş, 45 cm zincir.", den: "925 silver on a 45 cm chain.",
        price: 120, postage: 4, stock: 6, instalments: true, art: "beads", palette: "night",
        photo: "1589128777073-263566ae5e4d", featured: true,
      },
      {
        category: "jewellery", tr: "Mavi taşlı gümüş küpe", en: "Silver earrings with blue stones",
        dtr: "925 ayar gümüş, 3 cm.", den: "925 silver, 3 cm drop.",
        price: 65, postage: 4, stock: 10, instalments: true, art: "beads", palette: "brass",
        photo: "1535632066927-ab7c9ab60908",
      },
      {
        category: "jewellery", tr: "Tek taş gümüş yüzük", en: "Silver solitaire ring",
        dtr: "Ayarlanabilir ölçü, kutusuyla.", den: "Adjustable size, in its box.",
        price: 85, postage: 4, stock: 7, instalments: true, art: "stars", palette: "cobalt",
        photo: "1549487027-8c93657755e0",
      },
      {
        category: "jewellery", tr: "Turkuaz boncuklu bileklik", en: "Turquoise bead bracelet",
        dtr: "Gümüş zincir, ayarlanabilir kilit.", den: "A silver chain with an adjustable clasp.",
        price: 55, postage: 4, stock: 9, instalments: true, art: "beads", palette: "sea",
        photo: "1629890731335-52295b8be1d9",
      },
      {
        category: "jewellery", tr: "Kolye ve küpe takımı", en: "Necklace and earring set",
        dtr: "Yeşil ve pembe taşlı, özel gün için.", den: "Green and pink stones, for special occasions.",
        price: 240, postage: 6, stock: 3, instalments: true, art: "beads", palette: "emerald",
        photo: "1742627032795-1dfb552448ce",
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
    const cover = withPhotos()
      ? await one<{ id: string }>(
          "insert into shop_images (shop_id, content_type, data, url) values ($1, 'remote', ''::bytea, $2) returning id",
          [shop!.id, unsplash(s.cover.photo)],
        )
      : await one<{ id: string }>(
          "insert into shop_images (shop_id, content_type, data) values ($1, 'image/svg+xml', $2) returning id",
          [shop!.id, Buffer.from(ART[s.cover.art](PALETTES[s.cover.palette]), "utf8")],
        );
    await q("update shops set cover_id = $2 where id = $1", [shop!.id, cover!.id]);
    let first: { id: string; price: number; postage: number; title: string } | null = null;
    for (const l of s.listings) {
      const row = await one<{ id: string }>(
        `insert into listings (shop_id, category, title_tr, title_en, description_tr, description_en,
                               price_pence, postage_pence, stock, instalments, featured)
         values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) returning id`,
        [shop!.id, l.category, l.tr, l.en, l.dtr, l.den, l.price * 100, l.postage * 100, l.stock,
         l.instalments, Boolean(l.featured)],
      );
      if (withPhotos()) {
        await q(
          "insert into listing_images (listing_id, position, content_type, data, url) values ($1, 0, 'remote', ''::bytea, $2)",
          [row!.id, unsplash(l.photo)],
        );
      } else {
        await q(
          "insert into listing_images (listing_id, position, content_type, data) values ($1, 0, 'image/svg+xml', $2)",
          [row!.id, Buffer.from(ART[l.art](PALETTES[l.palette]), "utf8")],
        );
      }
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
