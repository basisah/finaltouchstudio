/**
 * Demo catalogue — placeholder inventory shown until the real products are
 * photographed and entered through the admin dashboard.
 *
 * Every row seeded from this file is flagged `is_demo = 1`, and every item id
 * starts with "demo-", so the data can be removed again in one step:
 *
 *   npm run seed:demo           insert / refresh the demo catalogue
 *   npm run seed:demo:remove    delete it again
 *
 * Photos are free-to-use Unsplash images (https://unsplash.com/license),
 * hot-linked from the Unsplash CDN. Each id below was checked to resolve and
 * to match its product.
 */

/** Builds a CDN URL for an Unsplash photo id. */
const photo = (id, width = 1200) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${width}&q=80`;

/** Occasions that are not part of the five permanent categories. */
const DEMO_CATEGORIES = [
  {
    id: "bridal-shower",
    label: "Bridal Shower",
    emoji: "bride",
    color: "#C77DA3",
    description: "Soft florals, styled dessert tables & elegant place settings for the bride-to-be.",
    display_order: 6,
    image: photo("1767070806009-152054f6edd5"),
  },
  {
    id: "corporate",
    label: "Corporate",
    emoji: "manager",
    color: "#5B4B8A",
    description: "Sound, lounge seating, buffet service & lighting for galas, launches and staff parties.",
    display_order: 7,
    image: photo("1759873148521-c49d9497cf64"),
  },
];

// price = CAD per day · units = stock on hand
const DEMO_ITEMS = [
  // ── Marriage ──────────────────────────────────────────────────────────────
  {
    id: "demo-wed-timber-arch",
    title: "Rustic Timber Ceremony Arch",
    categoryId: "marriage",
    subCategoryId: "arches",
    price: 145,
    units: 2,
    image: "1629744418692-345355518e78",
    gallery: ["1700304096367-dae5ae5e5401", "1641834919507-b0271fe5186b"],
    description:
      "Solid cedar four-post arch measuring 7 ft wide by 7.5 ft tall, supplied with two ivory chiffon drape panels. Breaks down into four pieces that fit in an SUV and assembles in about 20 minutes with the included hardware. Floral swags can be added on request.",
  },
  {
    id: "demo-wed-blush-floral-arch",
    title: "Blush Garden Floral Arch",
    categoryId: "marriage",
    subCategoryId: "arches",
    price: 260,
    units: 1,
    image: "1738025277281-582526f674c4",
    gallery: ["1763560836989-d3636e2f82d8", "1529636798458-92182e662485"],
    description:
      "Curved 8 ft steel arch fully dressed in premium silk roses, peonies and trailing greenery in blush, ivory and deep pink. Arrives pre-florals on weighted base plates, so it is safe on grass, sand or a ballroom floor. Our most requested ceremony piece for summer weddings.",
  },
  {
    id: "demo-wed-moon-gate",
    title: "Greenery Moon Gate Arch",
    categoryId: "marriage",
    subCategoryId: "arches",
    price: 285,
    units: 1,
    image: "1769812343890-4e406a33cfbe",
    gallery: ["1769812344337-ec16a1b7cef8", "1769812344081-92b3e2ac39c0"],
    description:
      "A 7.5 ft circular moon gate wrapped in dense faux boxwood and ruscus, finished with oversized ivory blooms. Includes matching low floral runs for either side of the aisle. Needs a 10 ft wide footprint and two people to set up.",
  },
  {
    id: "demo-wed-rose-wall",
    title: "Ivory Rose Flower Wall",
    categoryId: "marriage",
    subCategoryId: "backdrops",
    price: 220,
    units: 2,
    image: "1532713031318-db2d14e4b3e1",
    gallery: ["1768404768678-1597773abd28", "1581938165093-050aeb5ef218"],
    description:
      "8 ft by 8 ft photo wall made of nine interlocking panels of silk ivory roses and hydrangea. Mounts on a free-standing pipe frame with sandbag weights, both included. A second wall can be joined for a 16 ft head-table backdrop.",
  },
  {
    id: "demo-wed-light-canopy",
    title: "Warm Fairy Light Ceiling Canopy",
    categoryId: "marriage",
    subCategoryId: "lights",
    price: 180,
    units: 2,
    image: "1526092817387-8f07b2904e48",
    gallery: ["1592318072094-2694c98adb73", "1608991969807-3833f043d0ca"],
    description:
      "Twelve 30 ft strands of warm-white LED fairy lights with sheer voile swags, enough to canopy a 20 ft by 30 ft tent or hall ceiling. Runs from a single standard outlet and includes a dimmer. Hanging hardware and a rigging diagram are provided.",
  },
  {
    id: "demo-wed-candelabra",
    title: "Gold Five-Arm Candelabra",
    categoryId: "marriage",
    subCategoryId: "lights",
    price: 28,
    units: 12,
    image: "1624807608383-f2a56171d781",
    gallery: ["1769812343176-8c960e415ab2", "1769812343578-dc0b204191ba"],
    description:
      "Brushed-gold metal candelabra standing 30 in tall with five taper holders. Rented with LED flicker tapers so it is safe for venues that do not allow open flame; real tapers fit as well. Looks best in pairs on head tables and mantels.",
  },
  {
    id: "demo-wed-tall-centerpiece",
    title: "Tall Gold Stand Floral Centrepiece",
    categoryId: "marriage",
    subCategoryId: "tableware",
    price: 65,
    units: 10,
    image: "1676734629381-ecad774073b7",
    gallery: ["1558535284-39fe3f893047"],
    description:
      "A 32 in gold harlow stand topped with a full dome of silk white roses, hydrangea and eucalyptus. Sits above eye level so guests can talk across the table. Priced per centrepiece; sized for 60 in and 72 in round tables.",
  },
  {
    id: "demo-wed-blush-chargers",
    title: "Blush Charger Place Setting (set of 10)",
    categoryId: "marriage",
    subCategoryId: "tableware",
    price: 45,
    units: 8,
    image: "1767050292710-8e5da59ec5d8",
    gallery: ["1710587385270-08f30d66bf31", "1767050302752-e46f3da297ed"],
    description:
      "Ten complete place settings: 13 in blush glass charger, matte gold cutlery (five pieces) and a linen napkin. Delivered in padded crates and returned unwashed, so cleaning is on us. Dinner plates are not included.",
  },
  {
    id: "demo-wed-ivory-linen",
    title: "Ivory Round Tablecloth (120 in)",
    categoryId: "marriage",
    subCategoryId: "linens",
    price: 18,
    units: 30,
    image: "1558535284-3ade92aa58d4",
    gallery: ["1569387006778-d468606c407b"],
    description:
      "Floor-length ivory polyester tablecloth that fully covers a 60 in round table seating eight. Pressed and bagged individually so it arrives crease-free. Wrinkle-resistant fabric with a soft matte finish that photographs well.",
  },
  {
    id: "demo-wed-chiavari-chair",
    title: "Gold Chiavari Chair with Sash",
    categoryId: "marriage",
    subCategoryId: "chairs",
    price: 7.5,
    units: 120,
    image: "1782026456568-b2aaa170487b",
    gallery: ["1723832348105-2e69f948135a"],
    description:
      "Classic gold resin chiavari chair with an ivory cushion and a sheer organza sash tied at the back. Rated for 300 lb and stacks seven high for transport. Priced per chair; minimum order of 20.",
  },
  {
    id: "demo-wed-welcome-sign",
    title: "Greenery Welcome Sign & Easel",
    categoryId: "marriage",
    subCategoryId: "signs",
    price: 40,
    units: 3,
    image: "1770150138358-5b8db4066e03",
    gallery: ["1767824122869-56afa1f58b7a"],
    description:
      "24 in by 36 in stained wood welcome board on a 5 ft easel, framed with eucalyptus and baby's breath. Your names and date are hand-lettered in removable chalk paint, included in the rental. Send us the wording at least five days ahead.",
  },
  {
    id: "demo-wed-lantern-trio",
    title: "Rustic Wooden Lantern Trio",
    categoryId: "marriage",
    subCategoryId: "lights",
    price: 32,
    units: 6,
    image: "1792187760978-391d077a4834",
    gallery: ["1792187761184-b722e9010527"],
    description:
      "One 18 in walnut-stained lantern with six pillar candles on stepped wooden blocks. Styled as a ready-made aisle marker or entrance vignette. LED pillar candles with a six-hour timer are supplied.",
  },
  {
    id: "demo-wed-pampas",
    title: "Pampas Grass Arrangement",
    categoryId: "marriage",
    subCategoryId: "florals",
    price: 38,
    units: 8,
    image: "1645743713154-40248d732695",
    gallery: ["1578500383798-3255e44ab1c3", "1645743713797-63900e027324"],
    description:
      "Full, fluffy natural pampas plumes about 4 ft tall, arranged in a clear glass floor vase. Treated to minimise shedding and suitable for indoor venues. Pairs well with the timber arch for a boho ceremony.",
  },

  // ── Proposal ──────────────────────────────────────────────────────────────
  {
    id: "demo-prop-heart-arch",
    title: "Red Rose Heart Arch",
    categoryId: "proposal",
    subCategoryId: "arches",
    price: 240,
    units: 1,
    image: "1761963503451-e064fea6a2b5",
    gallery: ["1761963501909-eccf7aec5572"],
    description:
      "7 ft heart-shaped arch covered in more than 600 deep-red silk roses, with a warm-white \"Will You Marry Me?\" neon hung in the centre. The neon runs on a rechargeable battery pack for outdoor spots without power. Weighted feet keep it steady in a prairie breeze.",
  },
  {
    id: "demo-prop-marry-me-setup",
    title: "\"Will You Marry Me\" Neon & Drape Frame",
    categoryId: "proposal",
    subCategoryId: "signs",
    price: 160,
    units: 2,
    image: "1763129636465-f4016848a06f",
    gallery: ["1763129636830-dd487ed1b5a8"],
    description:
      "White 7 ft square frame with sheer drapes, corner florals and a hanging warm-white neon script sign. Comes with a small cocktail table for champagne and glasses (drinks not included). Sets up in 25 minutes on sand, grass or a patio.",
  },
  {
    id: "demo-prop-lightbox",
    title: "Cinema Lightbox Message Board",
    categoryId: "proposal",
    subCategoryId: "signs",
    price: 22,
    units: 4,
    image: "1510066323713-e7c16be83f71",
    gallery: ["1517910306750-d49c0fa41fb1"],
    description:
      "A4 retro cinema lightbox with 120 slide-in letters, numbers and symbols so you can spell your own message. Runs on six AA batteries (included) or USB power. A sweet low-key option for at-home and restaurant proposals.",
  },
  {
    id: "demo-prop-marquee-initials",
    title: "Marquee Initials & Heart Backdrop",
    categoryId: "proposal",
    subCategoryId: "backdrops",
    price: 150,
    units: 2,
    image: "1769374077145-cff000d91633",
    gallery: [],
    description:
      "Two 3 ft light-up marquee initials of your choice, flanking a red rose heart backdrop with a neon accent. Includes red heart foil balloons and a rose-petal floor scatter. Tell us the two letters when you book.",
  },
  {
    id: "demo-prop-fairy-curtain",
    title: "Warm White Fairy Light Curtain",
    categoryId: "proposal",
    subCategoryId: "lights",
    price: 35,
    units: 10,
    image: "1551564874-2c247864797e",
    gallery: ["1511461744085-90a4d1c66be3", "1514214460829-5f081763862a"],
    description:
      "10 ft by 10 ft curtain of 300 warm-white micro LEDs on clear wire, with eight glow modes and a remote. Hangs from the included tension rod or any backdrop stand. Indoor and covered-outdoor use.",
  },

  // ── Holud ─────────────────────────────────────────────────────────────────
  {
    id: "demo-holud-stage",
    title: "Holud Stage with Floral Swags",
    categoryId: "holud",
    subCategoryId: "mandap",
    price: 320,
    units: 1,
    image: "1591203281954-23fa2ff8ef18",
    gallery: ["1589463349208-95817c91f971"],
    description:
      "Complete 12 ft stage backdrop with sheer fairy-lit drapes, marigold and rose swags, a low white settee and saffron bolster cushions. Seats the couple plus two guests for photos. Delivery, setup and teardown within Saskatoon are included in the price.",
  },
  {
    id: "demo-holud-draped-mandap",
    title: "Vibrant Draped Mandap",
    categoryId: "holud",
    subCategoryId: "mandap",
    price: 295,
    units: 1,
    image: "1744891471118-f74c0453cd21",
    gallery: [],
    description:
      "Four-post 10 ft by 10 ft mandap frame draped in marigold-yellow and hot-pink chiffon with floral tie-backs. Open on all sides so guests can see in from every angle. Suitable for outdoor use in winds up to 30 km/h.",
  },
  {
    id: "demo-holud-marigold-strings",
    title: "Marigold Garland Strings (set of 12)",
    categoryId: "holud",
    subCategoryId: "accessories",
    price: 48,
    units: 10,
    image: "1789971649652-ae5dfeeaa7b4",
    gallery: ["1789971649660-eefc756ee5dd", "1784103395646-d81480c0c163"],
    description:
      "Twelve 5 ft strings of silk orange marigolds with white jasmine accents and a hanging bell at the end of each. Reusable, colour-fast and far lighter than fresh garlands. One set dresses roughly a 10 ft entrance or backdrop.",
  },
  {
    id: "demo-holud-thali",
    title: "Decorated Holud Thali Tray",
    categoryId: "holud",
    subCategoryId: "trays",
    price: 18,
    units: 12,
    image: "1776581487097-1e40a4c0a15d",
    gallery: [],
    description:
      "14 in round thali wrapped in yellow satin and edged with silk roses and lotus petals, with a matching turmeric bowl. Food-safe liner included so paste can be served directly. Priced per tray.",
  },
  {
    id: "demo-holud-parasol",
    title: "Embroidered Rajasthani Parasol",
    categoryId: "holud",
    subCategoryId: "props",
    price: 15,
    units: 8,
    image: "1780227102646-81bbb1c72235",
    gallery: [],
    description:
      "Hand-embroidered cotton parasol, 30 in across, with mirror work and tassel trim in pink, orange and teal. A favourite for the bride's entrance and for group photos. Decorative only and not rain-proof.",
  },

  // ── Baby shower ───────────────────────────────────────────────────────────
  {
    id: "demo-baby-marquee",
    title: "\"BABY\" Light-Up Marquee Letters",
    categoryId: "baby",
    subCategoryId: "signs",
    price: 140,
    units: 1,
    image: "1768776183122-95c7d3adbf3e",
    gallery: ["1765317270522-1b8f2d88c65b"],
    description:
      "Four 4 ft white marquee letters spelling BABY, lit with warm-white LED bulbs. Free-standing and stable on flat ground, with one power cord for all four letters. Pair with a balloon garland in your theme colours.",
  },
  {
    id: "demo-baby-teddy",
    title: "Giant Plush Teddy Bear (3 ft)",
    categoryId: "baby",
    subCategoryId: "displays",
    price: 25,
    units: 4,
    image: "1602734846297-9299fc2d4703",
    gallery: [],
    description:
      "Soft caramel-brown teddy sitting 3 ft tall with a navy checked bow tie. Steam-cleaned between every rental. A cuddly focal point beside the gift table or the mum-to-be's chair.",
  },
  {
    id: "demo-baby-pastel-garland",
    title: "Pastel Rainbow Balloon Garland",
    categoryId: "baby",
    subCategoryId: "balloons",
    price: 95,
    units: 3,
    image: "1611142288262-3bb8f5fc45d7",
    gallery: [],
    description:
      "10 ft organic balloon garland in pastel pink, peach, yellow, mint and sky blue with foil star accents. Built fresh the morning of your event on a reusable frame, so only the frame is returned. Lasts two to three days indoors.",
  },

  // ── Birthday ──────────────────────────────────────────────────────────────
  {
    id: "demo-bday-balloon-arch",
    title: "Metallic Balloon Arch & Shimmer Curtain",
    categoryId: "birthday",
    subCategoryId: "balloons",
    price: 130,
    units: 2,
    image: "1560128411-79892dd93bf8",
    gallery: [],
    description:
      "8 ft balloon arch in chrome blue, gold, rose and silver over a white fairy-lit sheer curtain. Sized as a backdrop for the cake table or a photo corner. Colours can be swapped to match your theme at no charge.",
  },
  {
    id: "demo-bday-marquee-numbers",
    title: "Light-Up Marquee Numbers (per digit)",
    categoryId: "birthday",
    subCategoryId: "light",
    price: 45,
    units: 10,
    image: "1758870041148-31d28fdf34d9",
    gallery: ["1767070806017-a15f5bd21130"],
    description:
      "4 ft white marquee numbers 0 to 9 with warm-white LED bulbs. Priced per digit, so a \"30\" is two units. The balloon hoop shown in the photo is rented separately.",
  },
  {
    id: "demo-bday-neon",
    title: "\"Happy Birthday\" Neon Sign",
    categoryId: "birthday",
    subCategoryId: "light",
    price: 45,
    units: 3,
    image: "1765947379029-3ee784b877a7",
    gallery: [],
    description:
      "Cool-white LED neon script on a clear acrylic backing, 24 in wide. Hangs from a backdrop or flower wall with the included chain and clips. Low-voltage and cool to the touch, with a dimmer on the cord.",
  },
  {
    id: "demo-bday-pink-backdrop",
    title: "Pink Balloon Ring Cake Backdrop",
    categoryId: "birthday",
    subCategoryId: "backdrops",
    price: 175,
    units: 1,
    image: "1741969494307-55394e3e4071",
    gallery: [],
    description:
      "6.5 ft gold hoop wrapped in a pink, blush and white balloon garland with a matching balloon-skirted cake table. Includes a mini neon sign and gold drape panels behind. Built on site in around 90 minutes.",
  },
  {
    id: "demo-bday-cake-stand",
    title: "Glass Pedestal Cake Stand",
    categoryId: "birthday",
    subCategoryId: "displays",
    price: 12,
    units: 8,
    image: "1586985289906-406988974504",
    gallery: ["1576536041890-c5ade1214670"],
    description:
      "Heavy pressed-glass pedestal stand, 12 in across and 5 in tall, holding up to a 10 in cake. Simple enough to suit any theme. Hand-wash only; returned stands are sanitised before the next rental.",
  },
  {
    id: "demo-bday-plinths",
    title: "White Cylinder Plinth Set (4 pieces)",
    categoryId: "birthday",
    subCategoryId: "plinths",
    price: 60,
    units: 3,
    image: "1620987278429-ab178d6eb547",
    gallery: [],
    description:
      "Four matte-white metal cylinder plinths in graduated heights: 12, 20, 28 and 36 in. They nest inside one another for transport and each holds up to 60 lb. Use them for cakes, florals or balloon clusters.",
  },
  {
    id: "demo-bday-dessert-stands",
    title: "Mirrored Dessert Stand Set (6 pieces)",
    categoryId: "birthday",
    subCategoryId: "displays",
    price: 48,
    units: 4,
    image: "1764380746818-18c01e96df12",
    gallery: ["1508349307373-ab2edc239589"],
    description:
      "Six silver mirrored stands in three heights with crystal-drop trim, enough for a 6 ft dessert table. Carries around 120 cupcakes or mini desserts. Supplied with a silver sequin table runner.",
  },

  // ── Bridal shower ─────────────────────────────────────────────────────────
  {
    id: "demo-bridal-place-setting",
    title: "Garden Party Place Setting (set of 8)",
    categoryId: "bridal-shower",
    subCategoryId: "tableware",
    price: 42,
    units: 6,
    image: "1767070806009-152054f6edd5",
    gallery: ["1767050302752-e46f3da297ed"],
    description:
      "Eight settings of pink scalloped side plates, rattan chargers, blush goblets and gold cutlery. Comes with matching linen napkins and place-card holders. Everything needed to dress a long harvest table for eight.",
  },
  {
    id: "demo-bridal-cake-table",
    title: "Floral Cake Table Styling Kit",
    categoryId: "bridal-shower",
    subCategoryId: "displays",
    price: 85,
    units: 2,
    image: "1755493872657-258e83e22279",
    gallery: ["1774660811169-1174148a4880"],
    description:
      "Scalloped cake pedestal, four bud vases of silk tulips and roses, taper candle holders and a draped cheesecloth runner. Styled to frame a two- or three-tier cake. Cake and candles are not included.",
  },
  {
    id: "demo-bridal-grazing-board",
    title: "Acacia Grazing Board (large)",
    categoryId: "bridal-shower",
    subCategoryId: "platters",
    price: 20,
    units: 6,
    image: "1784901393087-988ae280ea4c",
    gallery: ["1774689338470-e4ae7d63670d", "1773754109448-13d2af138059"],
    description:
      "Oiled acacia wood board, 24 in by 9 in with carved handles, holding a spread for eight to ten guests. Boards are supplied empty and food-safe sealed; the styled photos show serving ideas. Add several to build a full grazing table.",
  },

  // ── Corporate ─────────────────────────────────────────────────────────────
  {
    id: "demo-corp-wireless-mics",
    title: "Wireless Handheld Microphone Kit (set of 4)",
    categoryId: "corporate",
    subCategoryId: "audio",
    price: 55,
    units: 4,
    image: "1555201441-7b166836415d",
    gallery: ["1565140834639-60452b8b0ae5", "1702351002798-6ccc7598494a"],
    description:
      "Four UHF wireless handheld microphones with a four-channel receiver, two table stands and fresh batteries. Reliable up to 200 ft line-of-sight and plugs into any mixer or powered speaker with the supplied XLR cables. Ideal for speeches, MCs and panel Q&A.",
  },
  {
    id: "demo-corp-pa-speakers",
    title: "Line Array PA Speaker Pair",
    categoryId: "corporate",
    subCategoryId: "audio",
    price: 120,
    units: 2,
    image: "1561314105-e6ac04c2984a",
    gallery: ["1563680401337-b77b5e0be9f7"],
    description:
      "Pair of 1000 W powered line-array speakers on stands, covering rooms of up to 250 guests. Includes a four-channel mixer with Bluetooth for background music. We can deliver, sound-check and collect for venues inside Saskatoon.",
  },
  {
    id: "demo-corp-chafing-set",
    title: "Stainless Chafing Dish Buffet Set",
    categoryId: "corporate",
    subCategoryId: "buffet",
    price: 30,
    units: 10,
    image: "1555244162-803834f70033",
    gallery: ["1724218012292-5548214cc2d2"],
    description:
      "8-quart stainless roll-top chafing dish with a full-size food pan, water pan and two fuel holders. Keeps food hot for about two hours per fuel can; two cans are included. Priced per chafer.",
  },
  {
    id: "demo-corp-velvet-sofa",
    title: "Emerald Velvet Lounge Sofa",
    categoryId: "corporate",
    subCategoryId: "seating",
    price: 110,
    units: 2,
    image: "1555041469-a586c61ea9bc",
    gallery: ["1759647020668-648cd90ddce4"],
    description:
      "Mid-century three-seater in emerald velvet on tapered walnut legs, 84 in wide. Creates an instant VIP lounge or photo corner at galas and launches. Delivery by our crew is required; the sofa does not fit in passenger vehicles.",
  },
  {
    id: "demo-corp-festoon-lights",
    title: "Festoon String Lights (50 ft)",
    categoryId: "corporate",
    subCategoryId: "lights",
    price: 40,
    units: 8,
    image: "1464047736614-af63643285bf",
    gallery: ["1592318072094-2694c98adb73"],
    description:
      "50 ft commercial-grade festoon strand with 25 shatterproof warm-white LED bulbs. Weatherproof and linkable end to end, up to ten strands on one outlet. Great over patios, beer gardens and tented dinners.",
  },
];

// One package per occasion — `packages.category_id` is UNIQUE.
const DEMO_PACKAGES = [
  {
    category_id: "proposal",
    name: "Sunset Proposal Package",
    price: 395,
    image: "1763129636830-dd487ed1b5a8",
    description:
      "Everything for a picture-perfect \"yes\": the red rose heart arch with neon, marquee initials, a fairy light curtain and a lightbox for your own message. We set up 45 minutes before you arrive and stay out of sight.",
    itemIds: ["demo-prop-heart-arch", "demo-prop-marquee-initials", "demo-prop-fairy-curtain", "demo-prop-lightbox"],
  },
  {
    category_id: "holud",
    name: "Golden Holud Night Package",
    price: 640,
    image: "1591203281954-23fa2ff8ef18",
    description:
      "A full Gaye Holud setting: the fairy-lit stage with floral swags, marigold garland strings for the entrance, decorated thali trays and embroidered parasols for the bride's walk-in.",
    itemIds: ["demo-holud-stage", "demo-holud-marigold-strings", "demo-holud-thali", "demo-holud-parasol"],
  },
  {
    category_id: "marriage",
    name: "Timeless Wedding Ceremony Package",
    price: 1150,
    image: "1769812344081-92b3e2ac39c0",
    description:
      "Our signature ceremony and reception look: blush floral arch, ivory rose wall, gold candelabras, tall floral centrepieces, chiavari chairs, ivory linens and a hand-lettered welcome sign.",
    itemIds: [
      "demo-wed-blush-floral-arch",
      "demo-wed-rose-wall",
      "demo-wed-candelabra",
      "demo-wed-tall-centerpiece",
      "demo-wed-chiavari-chair",
      "demo-wed-ivory-linen",
      "demo-wed-welcome-sign",
    ],
  },
  {
    category_id: "baby",
    name: "Oh Baby Shower Package",
    price: 235,
    image: "1765317270522-1b8f2d88c65b",
    description:
      "Light-up BABY marquee letters, a pastel balloon garland and a giant teddy bear — a ready-made photo corner for the mum-to-be.",
    itemIds: ["demo-baby-marquee", "demo-baby-pastel-garland", "demo-baby-teddy"],
  },
  {
    category_id: "birthday",
    name: "Milestone Birthday Package",
    price: 380,
    image: "1758870041148-31d28fdf34d9",
    description:
      "Balloon arch with shimmer curtain, two marquee numbers, a Happy Birthday neon, a plinth set and a glass cake stand. Tell us the age and the colours and we do the rest.",
    itemIds: [
      "demo-bday-balloon-arch",
      "demo-bday-marquee-numbers",
      "demo-bday-neon",
      "demo-bday-plinths",
      "demo-bday-cake-stand",
    ],
  },
  {
    category_id: "bridal-shower",
    name: "Garden Bridal Shower Package",
    price: 180,
    image: "1767050302752-e46f3da297ed",
    description:
      "A soft garden-party table for eight: full place settings, the floral cake table styling kit and acacia grazing boards.",
    itemIds: ["demo-bridal-place-setting", "demo-bridal-cake-table", "demo-bridal-grazing-board"],
  },
  {
    category_id: "corporate",
    name: "Corporate Gala Essentials Package",
    price: 320,
    image: "1759873148521-c49d9497cf64",
    description:
      "Speeches, music, food and atmosphere covered: wireless microphones, a line-array PA pair, chafing dishes, a velvet lounge sofa and festoon lighting.",
    itemIds: [
      "demo-corp-wireless-mics",
      "demo-corp-pa-speakers",
      "demo-corp-chafing-set",
      "demo-corp-velvet-sofa",
      "demo-corp-festoon-lights",
    ],
  },
];

module.exports = { photo, DEMO_CATEGORIES, DEMO_ITEMS, DEMO_PACKAGES };
