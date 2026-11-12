// Which stock file each sample item uses. `url` is the file on cdn.pixabay.com
// or images.unsplash.com, `source` is its page there (kept as the credit). An
// empty url means "no photo chosen": the drawn pattern stays.
export type MediaRef = { url: string; source: string };

// Keyed by the listing's English title.
export const LISTING_MEDIA: Record<string, MediaRef> = {
  "Walnut nesting tables, set of three": {
    url: "https://images.unsplash.com/photo-1611486212355-d276af4581c0?w=1280&q=80&fm=jpg&fit=max",
    source: "https://unsplash.com/photos/brown-wooden-table-on-white-background-xej3GOtAQ-o",
  },
  "Set of brass-framed wall mirrors": {
    url: "https://images.unsplash.com/photo-1595455967759-5f1356993e53?w=1280&q=80&fm=jpg&fit=max",
    source: "https://unsplash.com/photos/black-framed-wall-mounted-mirror-xnLHz7NJzRA",
  },
  "Solid wood dining table, seats six": {
    url: "https://images.unsplash.com/photo-1758977404039-6e834be8eca8?w=1280&q=80&fm=jpg&fit=max",
    source: "https://unsplash.com/photos/wooden-dining-table-with-six-upholstered-chairs-h_BP6DlGOvo",
  },
  "Wooden chest of drawers with brass fittings": {
    url: "https://cdn.pixabay.com/photo/2017/08/22/20/39/korea-2670391_1280.jpg",
    source: "https://pixabay.com/photos/korea-korean-furniture-history-2670391/",
  },
  "Grey wingback armchair": {
    url: "https://images.unsplash.com/photo-1759722667490-e5fd31b8dbd5?w=1280&q=80&fm=jpg&fit=max",
    source: "https://unsplash.com/photos/a-gray-armchair-with-a-cream-blanket-draped-over-it-Onyw32UMHKg",
  },
  "Pair of wooden stools": {
    url: "https://images.unsplash.com/photo-1540809799-5da9372c3f64?w=1280&q=80&fm=jpg&fit=max",
    source: "https://unsplash.com/photos/two-brown-wooden-stools-0Y1qUg1w2bs",
  },
  "Coffee table with hairpin legs": {
    url: "https://images.unsplash.com/photo-1575501263736-a97adedcf1e6?w=1280&q=80&fm=jpg&fit=max",
    source: "https://unsplash.com/photos/pink-mug-on-table-with-marshmallows--vkrFD2sDsg",
  },
  "Three-seat sofa in forest green": {
    url: "https://images.unsplash.com/photo-1699901524286-41a46a4cd5c8?w=1280&q=80&fm=jpg&fit=max",
    source: "https://unsplash.com/photos/a-living-room-with-two-couches-and-a-coffee-table-ghUf8UzTK8g",
  },
  "Side table with open shelf": {
    url: "https://images.unsplash.com/photo-1532372320572-cda25653a26d?w=1280&q=80&fm=jpg&fit=max",
    source: "https://unsplash.com/photos/books-in-brown-wooden-side-table-beside-white-wall-C_dRtsnBOQA",
  },
  "Cream bentwood chair": {
    url: "https://cdn.pixabay.com/photo/2014/03/31/02/09/chair-301745_1280.jpg",
    source: "https://pixabay.com/photos/chair-white-interior-furniture-sit-301745/",
  },
  "White strapless dress": {
    url: "https://images.unsplash.com/photo-1540459920617-415d62f1f76b?w=1280&q=80&fm=jpg&fit=max",
    source: "https://unsplash.com/photos/white-sweetheart-neckline-dress-pHA6KL_HpoE",
  },
  "Brown leather jacket": {
    url: "https://cdn.pixabay.com/photo/2018/10/22/21/44/fashion-3766441_1280.jpg",
    source: "https://pixabay.com/photos/fashion-jacket-leather-jacket-brown-3766441/",
  },
  "Black blazer": {
    url: "https://cdn.pixabay.com/photo/2017/07/31/22/37/black-and-white-2561703_1280.jpg",
    source: "https://pixabay.com/photos/black-and-white-coat-suit-tuxedo-2561703/",
  },
  "Brown knitted jumper": {
    url: "https://images.unsplash.com/photo-1773747310662-e7cc9e681226?w=1280&q=80&fm=jpg&fit=max",
    source: "https://unsplash.com/photos/a-brown-knitted-sweater-hangs-on-a-white-hanger-g3AwbdZut70",
  },
  "Silk scarf with chain print": {
    url: "https://images.unsplash.com/photo-1551028442-ee84b4d3a50a?w=1280&q=80&fm=jpg&fit=max",
    source: "https://unsplash.com/photos/purple-and-white-textile-JGl6nH5XhMU",
  },
  "Silver pendant necklace": {
    url: "https://images.unsplash.com/photo-1589128777073-263566ae5e4d?w=1280&q=80&fm=jpg&fit=max",
    source: "https://unsplash.com/photos/silver-heart-pendant-necklace-on-white-background-u1Hv_erOQH0",
  },
  "Silver earrings with blue stones": {
    url: "https://cdn.pixabay.com/photo/2017/10/10/16/56/earrings-2837941_1280.jpg",
    source: "https://pixabay.com/photos/earrings-silver-sapphire-wonder-2837941/",
  },
  "Silver solitaire ring": {
    url: "https://images.unsplash.com/photo-1514612497953-05d1e5e171fa?w=1280&q=80&fm=jpg&fit=max",
    source: "https://unsplash.com/photos/silver-colored-clear-gemstone-ring-u91R8WPaKQU",
  },
  "Turquoise bead bracelet": {
    url: "https://images.unsplash.com/photo-1629890731335-52295b8be1d9?w=1280&q=80&fm=jpg&fit=max",
    source: "https://unsplash.com/photos/blue-and-silver-beaded-bracelet-cHcaTsM-Isg",
  },
  "Necklace and earring set": {
    url: "https://images.unsplash.com/photo-1742627032795-1dfb552448ce?w=1280&q=80&fm=jpg&fit=max",
    source: "https://unsplash.com/photos/elegant-necklace-and-earrings-against-a-black-background-SAGRtyL5L_Y",
  },
};

// Keyed by shop slug.
export const COVER_MEDIA: Record<string, MediaRef> = {
  "ceviz-atolye": {
    url: "https://images.unsplash.com/photo-1758977403865-f79e156415b3?w=1280&q=80&fm=jpg&fit=max",
    source: "https://unsplash.com/photos/wooden-dining-table-and-chairs-with-grey-upholstery-T_CYjDSfvkY",
  },
  "hane-mobilya": {
    url: "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=1280&q=80&fm=jpg&fit=max",
    source: "https://unsplash.com/photos/a-living-room-filled-with-furniture-and-a-large-window-OtXADkUh3-I",
  },
  "pera-giyim": {
    url: "https://cdn.pixabay.com/photo/2019/02/10/15/09/clothes-3987460_1280.jpg",
    source: "https://pixabay.com/photos/clothes-hangers-shop-shopping-3987460/",
  },
  "telkari-atolye": {
    url: "https://images.unsplash.com/photo-1719862057229-4dd650b5ccee?w=1280&q=80&fm=jpg&fit=max",
    source: "https://unsplash.com/photos/ornate-pearl-and-diamond-necklace-with-matching-earrings-and-pendant-2BYXjDSVtlc",
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
