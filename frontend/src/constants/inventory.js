export const INVENTORY_CATEGORIES = [
  {
    id: "birthday",
    label: "Birthday Collection",
    color: "#B8729A", // Light mauve
    imageKey: "birthday",
    subcategories: [
      { id: "light", label: "Lights & Neon", emoji: "💡" },
      { id: "balloons", label: "Balloon Decor", emoji: "🎈" },
      { id: "backdrops", label: "Backdrops & Arches", emoji: "🌸" },
      { id: "linens", label: "Table & Chair Linens", emoji: "🧺" },
      { id: "seating", label: "Chairs & Seating", emoji: "🪑" },
      { id: "plinths", label: "Pedestals & Stands", emoji: "🏛️" },
      { id: "displays", label: "Dessert Displays", emoji: "🧁" },
      { id: "props", label: "Accessories & Props", emoji: "🧸" }
    ],
    items: [
      { id: "b1", title: "Neon Sign", subCategoryId: "light" },
      { id: "b2", title: "Circle Arch", subCategoryId: "backdrops" },
      { id: "b3", title: "Shimmer Wall", subCategoryId: "backdrops" },
      { id: "b4", title: "Cylinder Plinths", subCategoryId: "plinths" },
      { id: "b5", title: "Marquee Numbers", subCategoryId: "light" },
      { id: "b6", title: "Balloon Stand", subCategoryId: "balloons" },
      { id: "b7", title: "Cake Riser", subCategoryId: "displays" },
      { id: "b8", title: "Cupcake Tower", subCategoryId: "displays" },
      { id: "b9", title: "Table Runner", subCategoryId: "linens" },
      { id: "b10", title: "Throne Chair", subCategoryId: "seating" },
      { id: "b11", title: "Activity Bench", subCategoryId: "seating" },
      { id: "b12", title: "Mirror Pedestals", subCategoryId: "plinths" },
      { id: "b13", title: "Teddy Bear", subCategoryId: "props" },
      { id: "b14", title: "Balloon Wall", subCategoryId: "balloons" }
    ]
  },
  {
    id: "marriage",
    label: "Marriage (Wedding & Reception)",
    color: "#9F507C", // Deep mauve
    imageKey: "marriage",
    subcategories: [
      { id: "lights", label: "Lights & Chandeliers", emoji: "💡" },
      { id: "backdrops", label: "Frames & Panelling", emoji: "💒" },
      { id: "arches", label: "Floral Arches", emoji: "🌸" },
      { id: "seating", label: "Sofas & Seating", emoji: "🛋️" },
      { id: "chairs", label: "Guest Chairs", emoji: "🪑" },
      { id: "carpets", label: "Carpets & Aisle", emoji: "🔴" },
      { id: "stands", label: "Pillars & Pedestals", emoji: "🏛️" },
      { id: "tableware", label: "Table Decor", emoji: "🍽️" }
    ],
    items: [
      { id: "m1", title: "Floral Arch", subCategoryId: "arches" },
      { id: "m2", title: "Gold Frame", subCategoryId: "backdrops" },
      { id: "m3", title: "Stage Panel", subCategoryId: "backdrops" },
      { id: "m4", title: "Drape Curtain", subCategoryId: "backdrops" },
      { id: "m5", title: "Wedding Sofa", subCategoryId: "seating" },
      { id: "m6", title: "Throne Chair", subCategoryId: "seating" },
      { id: "m7", title: "Gold Chair", subCategoryId: "chairs" },
      { id: "m8", title: "Clear Chair", subCategoryId: "chairs" },
      { id: "m9", title: "White Chair", subCategoryId: "chairs" },
      { id: "m10", title: "Red Carpet", subCategoryId: "carpets" },
      { id: "m11", title: "White Carpet", subCategoryId: "carpets" },
      { id: "m12", title: "Crystal Pillar", subCategoryId: "stands" },
      { id: "m13", title: "Blossom Tree", subCategoryId: "stands" },
      { id: "m14", title: "Candelabra", subCategoryId: "lights" },
      { id: "m15", title: "Charger Plate", subCategoryId: "tableware" },
      { id: "m16", title: "Flower Runner", subCategoryId: "tableware" },
      { id: "m17", title: "LED Uplights", subCategoryId: "lights" },
      { id: "m18", title: "Chandelier", subCategoryId: "lights" }
    ]
  },
  {
    id: "holud",
    label: "Bridal Holud / Gaye Holud / Mehndi",
    color: "#D97706", // Gold / Amber
    imageKey: "holud",
    subcategories: [
      { id: "mandap", label: "Mandaps & Arches", emoji: "💒" },
      { id: "drapes", label: "Colorful Drapes", emoji: "🏳️" },
      { id: "seating", label: "Seating & Benches", emoji: "🪑" },
      { id: "cushions", label: "Cushion Sets", emoji: "🟩" },
      { id: "dalas", label: "Traditional Dalas", emoji: "🧺" },
      { id: "trays", label: "Trays & Kulas", emoji: "🍱" },
      { id: "props", label: "Traditional Props", emoji: "⛱️" },
      { id: "accessories", label: "Florals & Accessories", emoji: "🌸" }
    ],
    items: [
      { id: "h1", title: "Wooden Mandap", subCategoryId: "mandap" },
      { id: "h2", title: "Color Drapes", subCategoryId: "drapes" },
      { id: "h3", title: "Floor Mattress", subCategoryId: "seating" },
      { id: "h4", title: "Square Cushion", subCategoryId: "cushions" },
      { id: "h5", title: "Round Cushion", subCategoryId: "cushions" },
      { id: "h6", title: "Wooden Bench", subCategoryId: "seating" },
      { id: "h7", title: "Sweet Dala", subCategoryId: "dalas" },
      { id: "h8", title: "Saree Dala", subCategoryId: "dalas" },
      { id: "h9", title: "Sherwani Dala", subCategoryId: "dalas" },
      { id: "h10", title: "Paan Dala", subCategoryId: "dalas" },
      { id: "h11", title: "Mirror Tray", subCategoryId: "trays" },
      { id: "h12", title: "Decorated Kula", subCategoryId: "trays" },
      { id: "h13", title: "Ethnic Umbrella", subCategoryId: "props" },
      { id: "h14", title: "Marigold String", subCategoryId: "accessories" },
      { id: "h15", title: "Brass Bowl", subCategoryId: "accessories" },
      { id: "h16", title: "Jewelry Stand", subCategoryId: "accessories" },
      { id: "h17", title: "Welcome Board", subCategoryId: "accessories" },
      { id: "h18", title: "Mehndi Ring", subCategoryId: "mandap" },
      { id: "h19", title: "Clay Pots", subCategoryId: "props" }
    ]
  },
  {
    id: "baby",
    label: "Baby Shower Props",
    color: "#8B5CF6", // Lavender / Violet
    imageKey: "baby",
    subcategories: [
      { id: "signs", label: "Signs & Neon", emoji: "💡" },
      { id: "backdrops", label: "Greenery Walls", emoji: "🌿" },
      { id: "balloons", label: "Balloon Sculptures", emoji: "🎈" },
      { id: "seating", label: "Chairs & Armchairs", emoji: "🪑" },
      { id: "blocks", label: "Giant Blocks", emoji: "📦" },
      { id: "displays", label: "Character Displays", emoji: "🧸" },
      { id: "platters", label: "Dessert Platters", emoji: "🧁" },
      { id: "effects", label: "Effects & Cannons", emoji: "🎉" }
    ],
    items: [
      { id: "bs1", title: "Oh Baby Sign", subCategoryId: "signs" },
      { id: "bs2", title: "Hedge Wall", subCategoryId: "backdrops" },
      { id: "bs3", title: "Balloon Sculpture", subCategoryId: "balloons" },
      { id: "bs4", title: "Peacock Chair", subCategoryId: "seating" },
      { id: "bs5", title: "Tufted Armchair", subCategoryId: "seating" },
      { id: "bs6", title: "BABY Blocks", subCategoryId: "blocks" },
      { id: "bs7", title: "Teddy Display", subCategoryId: "displays" },
      { id: "bs8", title: "Confetti Cannon", subCategoryId: "effects" },
      { id: "bs9", title: "Dessert Platter", subCategoryId: "platters" },
      { id: "bs10", title: "Candy Jar", subCategoryId: "platters" },
      { id: "bs11", title: "Easel Board", subCategoryId: "signs" },
      { id: "bs12", title: "Cloud Balloon", subCategoryId: "balloons" }
    ]
  },
  {
    id: "global",
    label: "Global Essentials (Shared Inventory)",
    color: "#542141", // Aubergine
    imageKey: "global",
    subcategories: [
      { id: "tables", label: "Tables", emoji: "🪵" },
      { id: "linens", label: "Linens & Tablecloths", emoji: "🧺" },
      { id: "runners", label: "Runners & Napkins", emoji: "🧣" },
      { id: "buffet", label: "Buffet & Chafing", emoji: "🍲" },
      { id: "dispensers", label: "Dispensers & Cutlery", emoji: "🍴" },
      { id: "audio", label: "Audio & Speaker", emoji: "🔊" },
      { id: "lights", label: "Fairy Lights", emoji: "💡" },
      { id: "effects", label: "Stage Effects", emoji: "💨" }
    ],
    items: [
      { id: "g1", title: "Folding Table", subCategoryId: "tables" },
      { id: "g2", title: "Cocktail Table", subCategoryId: "tables" },
      { id: "g3", title: "White Cloth", subCategoryId: "linens" },
      { id: "g4", title: "Black Cloth", subCategoryId: "linens" },
      { id: "g5", title: "Sequin Runner", subCategoryId: "runners" },
      { id: "g6", title: "Velvet Napkin", subCategoryId: "runners" },
      { id: "g7", title: "Chafing Dish", subCategoryId: "buffet" },
      { id: "g8", title: "Beverage Dispenser", subCategoryId: "dispensers" },
      { id: "g9", title: "Cutlery Set", subCategoryId: "dispensers" },
      { id: "g10", title: "Party Speaker", subCategoryId: "audio" },
      { id: "g11", title: "Fairy Lights", subCategoryId: "lights" },
      { id: "g12", title: "Smoke Machine", subCategoryId: "effects" },
      { id: "g13", title: "Background Stand", subCategoryId: "effects" },
      { id: "g14", title: "LED Curtain", subCategoryId: "lights" }
    ]
  }
];
