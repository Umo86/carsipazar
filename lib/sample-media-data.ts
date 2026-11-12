// Which Pixabay file each sample item uses. `url` is the file on cdn.pixabay.com,
// `source` is its page on pixabay.com (kept as the credit). An empty url means
// "no photo chosen": the drawn pattern stays.
export type MediaRef = { url: string; source: string };

// Keyed by the listing's English title.
export const LISTING_MEDIA: Record<string, MediaRef> = {
  "Walnut nesting tables, set of three": {
    url: "https://cdn.pixabay.com/photo/2019/03/05/22/47/living-room-table-4037281_1280.jpg",
    source: "https://pixabay.com/photos/living-room-table-living-room-table-4037281/",
  },
  "Set of round convex wall mirrors": {
    url: "https://cdn.pixabay.com/photo/2017/07/07/23/43/mirror-2483172_1280.jpg",
    source: "https://pixabay.com/photos/mirrors-reflection-mirror-image-2483172/",
  },
  "Dining table with steel cross legs": {
    url: "https://cdn.pixabay.com/photo/2017/02/08/21/59/architecture-2050197_1280.jpg",
    source: "https://pixabay.com/photos/architecture-design-interior-design-2050197/",
  },
  "Wooden chest of drawers with brass fittings": {
    url: "https://cdn.pixabay.com/photo/2017/08/22/20/39/korea-2670391_1280.jpg",
    source: "https://pixabay.com/photos/korea-korean-furniture-history-2670391/",
  },
  "Grey wingback armchair": {
    url: "https://cdn.pixabay.com/photo/2021/03/05/14/04/karriezhu-6071378_1280.jpg",
    source: "https://pixabay.com/photos/karriezhu-acrylic-pouring-painting-6071378/",
  },
  "Blush storage pouffe with brass legs": {
    url: "https://cdn.pixabay.com/photo/2024/09/07/11/02/storage-9029561_1280.jpg",
    source: "https://pixabay.com/photos/storage-home-pouf-pouffe-9029561/",
  },
  "Low wooden coffee table": {
    url: "https://cdn.pixabay.com/photo/2020/04/16/20/37/table-5052283_1280.jpg",
    source: "https://pixabay.com/photos/table-wooden-furniture-wood-5052283/",
  },
  "Three-seat sofa in forest green": {
    url: "https://cdn.pixabay.com/photo/2023/05/09/07/28/green-velvet-sofa-7980576_1280.jpg",
    source: "https://pixabay.com/photos/green-velvet-sofa-sofa-factory-7980576/",
  },
  "Side table with open shelf": {
    url: "https://cdn.pixabay.com/photo/2019/09/09/08/52/side-table-4463091_1280.jpg",
    source: "https://pixabay.com/photos/side-table-end-table-4463091/",
  },
  "Cream bentwood chair": {
    url: "https://cdn.pixabay.com/photo/2014/03/31/02/09/chair-301745_1280.jpg",
    source: "https://pixabay.com/photos/chair-white-interior-furniture-sit-301745/",
  },
  "White strapless dress": {
    url: "https://cdn.pixabay.com/photo/2017/02/02/03/04/wedding-dress-2031960_1280.jpg",
    source: "https://pixabay.com/photos/wedding-dress-wedding-shoes-window-2031960/",
  },
  "Brown leather jacket": {
    url: "https://cdn.pixabay.com/photo/2018/10/22/21/44/fashion-3766441_1280.jpg",
    source: "https://pixabay.com/photos/fashion-jacket-leather-jacket-brown-3766441/",
  },
  "Black blazer": {
    url: "https://cdn.pixabay.com/photo/2017/07/31/22/37/black-and-white-2561703_1280.jpg",
    source: "https://pixabay.com/photos/black-and-white-coat-suit-tuxedo-2561703/",
  },
  "Navy striped knitted jumper": {
    url: "https://cdn.pixabay.com/photo/2016/03/27/19/31/fashion-1283863_1280.jpg",
    source: "https://pixabay.com/photos/fashion-sweater-wool-clothing-1283863/",
  },
  "Silk scarf with check print": {
    url: "https://cdn.pixabay.com/photo/2015/09/08/15/42/scarf-930184_1280.jpg",
    source: "https://pixabay.com/photos/scarf-colored-print-handkerchief-930184/",
  },
  "Silver pendant necklace": {
    url: "https://cdn.pixabay.com/photo/2016/07/16/11/50/heart-1521377_1280.jpg",
    source: "https://pixabay.com/photos/heart-love-jewellery-silver-1521377/",
  },
  "Silver earrings with blue stones": {
    url: "https://cdn.pixabay.com/photo/2017/10/10/16/56/earrings-2837941_1280.jpg",
    source: "https://pixabay.com/photos/earrings-silver-sapphire-wonder-2837941/",
  },
  "Silver solitaire ring": {
    url: "https://cdn.pixabay.com/photo/2019/06/17/13/39/ring-4279997_1280.jpg",
    source: "https://pixabay.com/photos/ring-diamond-ring-wedding-ring-4279997/",
  },
  "Turquoise bead bracelet": {
    url: "https://cdn.pixabay.com/photo/2017/06/28/10/23/amanu-2450186_1280.jpg",
    source: "https://pixabay.com/photos/amanu-jewelry-trends-corsican-2450186/",
  },
  "Necklace and earring set": {
    url: "https://cdn.pixabay.com/photo/2020/10/10/22/31/accessories-5644332_1280.jpg",
    source: "https://pixabay.com/photos/accessories-necklace-earrings-5644332/",
  },
};

// Keyed by shop slug.
export const COVER_MEDIA: Record<string, MediaRef> = {
  "ceviz-atolye": {
    url: "https://cdn.pixabay.com/photo/2020/02/24/09/13/japan-4875669_1280.jpg",
    source: "https://pixabay.com/photos/japan-japanese-craftsmanship-wood-4875669/",
  },
  "hane-mobilya": {
    url: "https://cdn.pixabay.com/photo/2017/09/09/18/25/living-room-2732939_1280.jpg",
    source: "https://pixabay.com/photos/living-room-couch-interior-room-2732939/",
  },
  "pera-giyim": {
    url: "https://cdn.pixabay.com/photo/2019/02/10/15/09/clothes-3987460_1280.jpg",
    source: "https://pixabay.com/photos/clothes-hangers-shop-shopping-3987460/",
  },
  "telkari-atolye": {
    url: "https://cdn.pixabay.com/photo/2015/04/08/19/53/beads-713340_1280.jpg",
    source: "https://pixabay.com/photos/pearls-chain-silk-velvet-jewellery-713340/",
  },
};

// The home page banner: a seamstress at a sewing machine, about 11 seconds.
export const HERO_VIDEO: MediaRef = {
  url: "https://cdn.pixabay.com/video/2017/05/29/9398-219552669_small.mp4",
  source: "https://pixabay.com/videos/sewing-machine-seamstress-dressmaker-9398/",
};
export const HERO_POSTER: MediaRef = {
  url: "https://cdn.pixabay.com/video/2017/05/29/9398-219552669_tiny.jpg",
  source: "https://pixabay.com/videos/sewing-machine-seamstress-dressmaker-9398/",
};
