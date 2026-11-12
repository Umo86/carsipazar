import "server-only";
import { one, pool, q } from "./db";
import { hashPassword } from "./auth";
import { SCHEMA_SQL } from "./schema";
import { ART, PALETTES } from "./art";
import { computeFees } from "./money";
import { DEFAULT_SETTINGS, deliveryPrice, type ParcelSize } from "./config";
import { importSampleMedia } from "./sample-media";

// Creates the tables, the admin account and a set of clearly-labelled demo
// shops so the site can be clicked through. Safe to run more than once.

export type DemoListing = {
  category: string;
  tr: string;
  en: string;
  dtr: string;
  den: string;
  price: number; // pounds
  postage?: number; // pounds; not used when `delivery` is set
  delivery?: ParcelSize; // CarsiPazar delivery in this parcel size; postage is then the setting's price
  stock: number;
  instalments: boolean;
  art: keyof typeof ART;
  palette: keyof typeof PALETTES;
  was?: string | string[]; // English title(s) this item had before, so setup can find and rename it
  featured?: boolean;
};

const DEMO_NOTE_TR = "Bu bir örnek dükkândır; ürünler gerçek değildir.";
const DEMO_NOTE_EN = "This is a sample shop; the items are not real.";

const SAMPLE_DELIVERY_TR = "Örnek metin: Siparişler 2 iş günü içinde takipli kargoyla gönderilir.";
const SAMPLE_DELIVERY_EN = "Sample text: Orders are sent by tracked delivery within 2 working days.";
const SAMPLE_RETURNS_TR = "Örnek metin: Teslimattan sonra 14 gün içinde iade kabul edilir.";
const SAMPLE_RETURNS_EN = "Sample text: Returns are accepted within 14 days of delivery.";

export const SHOPS: {
  slug: string;
  name: string;
  type: "business" | "sole_trader";
  founding: boolean;
  city: string;
  bioTr: string;
  bioEn: string;
  cover: { art: keyof typeof ART; palette: keyof typeof PALETTES };
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
    cover: { art: "stars", palette: "night" },
    listings: [
      {
        category: "furniture", tr: "Ceviz zigon sehpa, 3'lü", en: "Walnut nesting tables, set of three",
        dtr: "Masif ceviz, yağlı cila. En büyüğü 55 × 40 cm.", den: "Solid walnut with an oiled finish. The largest is 55 × 40 cm.",
        price: 480, postage: 25, stock: 2, instalments: true, art: "stars", palette: "night",
        featured: true,
      },
      {
        category: "furniture", tr: "Pirinç çerçeveli duvar aynası seti", en: "Set of brass-framed wall mirrors",
        dtr: "Dokuz parça, farklı boy ve biçimlerde.", den: "Nine pieces in mixed sizes and shapes.",
        was: ["Set of round convex wall mirrors"],
        price: 310, postage: 20, stock: 3, instalments: true, art: "arches", palette: "brass",
      },
      {
        category: "furniture", tr: "Masif yemek masası, 6 kişilik", en: "Solid wood dining table, seats six",
        dtr: "180 × 90 cm. Siparişe göre yapılır.", den: "180 × 90 cm. Made to order.",
        was: ["Dining table with steel cross legs"],
        price: 1250, postage: 0, stock: 1, instalments: true, art: "arches", palette: "night",
      },
      {
        category: "furniture", tr: "Pirinç tutacaklı ahşap şifonyer", en: "Wooden chest of drawers with brass fittings",
        dtr: "Pirinç tutacaklı, alt kenarı kıvrımlı, sıcak tonlu ahşap şifonyer.", den: "A warm-toned wooden chest of drawers with brass handles and a shaped lower edge.",
        was: "Hand-carved chest of drawers",
        price: 690, postage: 40, stock: 2, instalments: true, art: "stars", palette: "brass",
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
    cover: { art: "stripes", palette: "sea" },
    listings: [
      {
        category: "furniture", tr: "Gri berjer koltuk", en: "Grey wingback armchair",
        dtr: "Kayın ayak, keten karışımlı kumaş.", den: "Beech legs and a linen-blend fabric.",
        price: 420, postage: 30, stock: 4, instalments: true, art: "stripes", palette: "sea",
        featured: true,
      },
      {
        category: "furniture", tr: "Ahşap tabure, 2'li", en: "Pair of wooden stools",
        dtr: "45 cm yükseklik, masif ahşap.", den: "45 cm high in solid wood.",
        was: ["Blush storage pouffe with brass legs"],
        price: 95, postage: 6, stock: 12, instalments: true, art: "kilim", palette: "madder",
      },
      {
        category: "furniture", tr: "Metal ayaklı orta sehpa", en: "Coffee table with hairpin legs",
        dtr: "Masif tabla, siyah metal ayak.", den: "A solid top on black metal legs.",
        was: ["Low wooden coffee table"],
        price: 260, postage: 15, stock: 3, instalments: true, art: "stars", palette: "brass",
      },
      {
        category: "furniture", tr: "Koyu yeşil üçlü kanepe", en: "Three-seat sofa in forest green",
        dtr: "Dokulu kumaş, iki kırlent dahil.", den: "Textured fabric, with two cushions included.",
        price: 890, postage: 0, stock: 2, instalments: true, art: "stripes", palette: "emerald",
      },
      {
        category: "furniture", tr: "Raflı yan sehpa", en: "Side table with open shelf",
        dtr: "Kitap ve dergi için açık raf.", den: "An open shelf for books and magazines.",
        price: 140, postage: 10, stock: 6, instalments: true, art: "arches", palette: "brass",
      },
      {
        category: "furniture", tr: "Krem rengi bükme ahşap sandalye", en: "Cream bentwood chair",
        dtr: "Kavisli sırtlığı ve yuvarlak oturağıyla klasik bükme ahşap sandalye, yumuşak krem rengi.", den: "A classic bentwood chair with a curved back and round seat, finished in soft cream.",
        was: "Bentwood lounge chair",
        price: 340, postage: 25, stock: 3, instalments: true, art: "arches", palette: "night",
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
    cover: { art: "tulips", palette: "cobalt" },
    listings: [
      {
        category: "clothing", tr: "Beyaz straplez elbise", en: "White strapless dress",
        dtr: "Astarlı, kalp yaka. 36-42 beden.", den: "Lined, with a sweetheart neckline. UK sizes 8 to 14.",
        price: 275, postage: 9, stock: 4, instalments: true, art: "tulips", palette: "cobalt",
        featured: true,
      },
      {
        category: "clothing", tr: "Kahverengi deri ceket", en: "Brown leather jacket",
        dtr: "Hakiki deri, saten astar.", den: "Real leather with a satin lining.",
        price: 390, postage: 9, stock: 5, instalments: true, art: "arches", palette: "emerald",
      },
      {
        category: "clothing", tr: "Siyah blazer ceket", en: "Black blazer",
        dtr: "Yün karışımlı, tek düğme.", den: "A wool blend with a single button.",
        price: 180, postage: 8, stock: 6, instalments: true, art: "stripes", palette: "brass",
      },
      {
        category: "clothing", tr: "Kahverengi örgü kazak", en: "Brown knitted jumper",
        dtr: "El örgüsü, yün karışımlı.", den: "Hand-knitted in a wool blend.",
        was: ["Navy striped knitted jumper"],
        price: 85, postage: 6, stock: 8, instalments: true, art: "kilim", palette: "madder",
      },
      {
        category: "clothing", tr: "Zincir desenli ipek eşarp", en: "Silk scarf with chain print",
        dtr: "90 × 90 cm, kenarları elde rulo dikilmiş.", den: "90 × 90 cm with hand-rolled edges.",
        was: ["Silk scarf with check print"],
        price: 45, delivery: "small", stock: 20, instalments: false, art: "tulips", palette: "madder",
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
    cover: { art: "beads", palette: "night" },
    listings: [
      {
        category: "jewellery", tr: "Taşlı gümüş kolye", en: "Silver pendant necklace",
        dtr: "925 ayar gümüş, 45 cm zincir.", den: "925 silver on a 45 cm chain.",
        price: 120, postage: 4, stock: 6, instalments: true, art: "beads", palette: "night",
        featured: true,
      },
      {
        category: "jewellery", tr: "Mavi taşlı gümüş küpe", en: "Silver earrings with blue stones",
        dtr: "925 ayar gümüş, 3 cm.", den: "925 silver, 3 cm drop.",
        price: 65, delivery: "small", stock: 10, instalments: true, art: "beads", palette: "brass",
      },
      {
        category: "jewellery", tr: "Tek taş gümüş yüzük", en: "Silver solitaire ring",
        dtr: "Ayarlanabilir ölçü, kutusuyla.", den: "Adjustable size, in its box.",
        price: 85, postage: 4, stock: 7, instalments: true, art: "stars", palette: "cobalt",
      },
      {
        category: "jewellery", tr: "Turkuaz boncuklu bileklik", en: "Turquoise bead bracelet",
        dtr: "Gümüş zincir, ayarlanabilir kilit.", den: "A silver chain with an adjustable clasp.",
        price: 55, delivery: "small", stock: 9, instalments: true, art: "beads", palette: "sea",
      },
      {
        category: "jewellery", tr: "Kolye ve küpe takımı", en: "Necklace and earring set",
        dtr: "Yeşil ve pembe taşlı, özel gün için.", den: "Green and pink stones, for special occasions.",
        price: 240, postage: 6, stock: 3, instalments: true, art: "beads", palette: "emerald",
      },
    ],
  },
];

// Postage in pence: the delivery price for a CarsiPazar delivery item, otherwise the seller's own.
const samplePostage = (l: DemoListing) =>
  l.delivery ? deliveryPrice(l.delivery, { ...DEFAULT_SETTINGS }) : (l.postage ?? 0) * 100;

// Moves the sample items that use CarsiPazar delivery onto it in a database that
// already exists. Matched by shop slug and English title; only an item that is
// still 'seller' is changed, so a seller's own choice is kept and running it
// again changes nothing.
export async function upgradeSampleDelivery(): Promise<string[]> {
  let n = 0;
  for (const s of SHOPS) {
    for (const l of s.listings) {
      if (!l.delivery) continue;
      const rows = await q(
        `update listings set delivery_method = 'platform', parcel_size = $3, postage_pence = $4
          where delivery_method = 'seller' and title_en = $2
            and shop_id = (select id from shops where slug = $1)
          returning id`,
        [s.slug, l.en, l.delivery, samplePostage(l)],
      );
      n += rows.length;
    }
  }
  return [`sample items moved to CarsiPazar delivery: ${n}`];
}

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
    log.push(...(await importSampleMedia())); // may rename old sample items, so it runs first
    log.push(...(await upgradeSampleDelivery()));
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
    // Drawn patterns first; importSampleMedia swaps in the downloaded photos.
    const cover = await one<{ id: string }>(
      "insert into shop_images (shop_id, content_type, data) values ($1, 'image/svg+xml', $2) returning id",
      [shop!.id, Buffer.from(ART[s.cover.art](PALETTES[s.cover.palette]), "utf8")],
    );
    await q("update shops set cover_id = $2 where id = $1", [shop!.id, cover!.id]);
    let first: { id: string; price: number; postage: number; title: string } | null = null;
    for (const l of s.listings) {
      const row = await one<{ id: string }>(
        `insert into listings (shop_id, category, title_tr, title_en, description_tr, description_en,
                               price_pence, postage_pence, stock, instalments, featured,
                               delivery_method, parcel_size)
         values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) returning id`,
        [shop!.id, l.category, l.tr, l.en, l.dtr, l.den, l.price * 100, samplePostage(l), l.stock,
         l.instalments, Boolean(l.featured), l.delivery ? "platform" : "seller", l.delivery ?? null],
      );
      await q(
        "insert into listing_images (listing_id, position, content_type, data) values ($1, 0, 'image/svg+xml', $2)",
        [row!.id, Buffer.from(ART[l.art](PALETTES[l.palette]), "utf8")],
      );
      first ??= { id: row!.id, price: l.price * 100, postage: samplePostage(l), title: l.tr };
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
  log.push(...(await importSampleMedia()));
  return log;
}
