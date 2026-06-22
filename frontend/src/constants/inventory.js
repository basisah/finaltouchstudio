/** Legacy static taxonomy used to derive product-type categories. */
export const INVENTORY_OCCASIONS = [
  {
    id: "birthday",
    label: "Birthday Collection",
    color: "#B8729A", // Light mauve
    imageKey: "birthday",
    productTypes: [
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
      { id: "b1", title: "Neon Sign", categoryId: "light" },
      { id: "b2", title: "Circle Arch", categoryId: "backdrops" },
      { id: "b3", title: "Shimmer Wall", categoryId: "backdrops" },
      { id: "b4", title: "Cylinder Plinths", categoryId: "plinths" },
      { id: "b5", title: "Marquee Numbers", categoryId: "light" },
      { id: "b6", title: "Balloon Stand", categoryId: "balloons" },
      { id: "b7", title: "Cake Riser", categoryId: "displays" },
      { id: "b8", title: "Cupcake Tower", categoryId: "displays" },
      { id: "b9", title: "Table Runner", categoryId: "linens" },
      { id: "b10", title: "Throne Chair", categoryId: "seating" },
      { id: "b11", title: "Activity Bench", categoryId: "seating" },
      { id: "b12", title: "Mirror Pedestals", categoryId: "plinths" },
      { id: "b13", title: "Teddy Bear", categoryId: "props" },
      { id: "b14", title: "Balloon Wall", categoryId: "balloons" }
    ]
  },
  {
    id: "marriage",
    label: "Marriage (Wedding & Reception)",
    color: "#9F507C", // Deep mauve
    imageKey: "marriage",
    productTypes: [
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
      { id: "m1", title: "Floral Arch", categoryId: "arches" },
      { id: "m2", title: "Gold Frame", categoryId: "backdrops" },
      { id: "m3", title: "Stage Panel", categoryId: "backdrops" },
      { id: "m4", title: "Drape Curtain", categoryId: "backdrops" },
      { id: "m5", title: "Wedding Sofa", categoryId: "seating" },
      { id: "m6", title: "Throne Chair", categoryId: "seating" },
      { id: "m7", title: "Gold Chair", categoryId: "chairs" },
      { id: "m8", title: "Clear Chair", categoryId: "chairs" },
      { id: "m9", title: "White Chair", categoryId: "chairs" },
      { id: "m10", title: "Red Carpet", categoryId: "carpets" },
      { id: "m11", title: "White Carpet", categoryId: "carpets" },
      { id: "m12", title: "Crystal Pillar", categoryId: "stands" },
      { id: "m13", title: "Blossom Tree", categoryId: "stands" },
      { id: "m14", title: "Candelabra", categoryId: "lights" },
      { id: "m15", title: "Charger Plate", categoryId: "tableware" },
      { id: "m16", title: "Flower Runner", categoryId: "tableware" },
      { id: "m17", title: "LED Uplights", categoryId: "lights" },
      { id: "m18", title: "Chandelier", categoryId: "lights" }
    ]
  },
  {
    id: "holud",
    label: "Bridal Holud / Gaye Holud / Mehndi",
    color: "#D97706", // Gold / Amber
    imageKey: "holud",
    productTypes: [
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
      { id: "h1", title: "Wooden Mandap", categoryId: "mandap" },
      { id: "h2", title: "Color Drapes", categoryId: "drapes" },
      { id: "h3", title: "Floor Mattress", categoryId: "seating" },
      { id: "h4", title: "Square Cushion", categoryId: "cushions" },
      { id: "h5", title: "Round Cushion", categoryId: "cushions" },
      { id: "h6", title: "Wooden Bench", categoryId: "seating" },
      { id: "h7", title: "Sweet Dala", categoryId: "dalas" },
      { id: "h8", title: "Saree Dala", categoryId: "dalas" },
      { id: "h9", title: "Sherwani Dala", categoryId: "dalas" },
      { id: "h10", title: "Paan Dala", categoryId: "dalas" },
      { id: "h11", title: "Mirror Tray", categoryId: "trays" },
      { id: "h12", title: "Decorated Kula", categoryId: "trays" },
      { id: "h13", title: "Ethnic Umbrella", categoryId: "props" },
      { id: "h14", title: "Marigold String", categoryId: "accessories" },
      { id: "h15", title: "Brass Bowl", categoryId: "accessories" },
      { id: "h16", title: "Jewelry Stand", categoryId: "accessories" },
      { id: "h17", title: "Welcome Board", categoryId: "accessories" },
      { id: "h18", title: "Mehndi Ring", categoryId: "mandap" },
      { id: "h19", title: "Clay Pots", categoryId: "props" }
    ]
  },
  {
    id: "baby",
    label: "Baby Shower Props",
    color: "#8B5CF6", // Lavender / Violet
    imageKey: "baby",
    productTypes: [
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
      { id: "bs1", title: "Oh Baby Sign", categoryId: "signs" },
      { id: "bs2", title: "Hedge Wall", categoryId: "backdrops" },
      { id: "bs3", title: "Balloon Sculpture", categoryId: "balloons" },
      { id: "bs4", title: "Peacock Chair", categoryId: "seating" },
      { id: "bs5", title: "Tufted Armchair", categoryId: "seating" },
      { id: "bs6", title: "BABY Blocks", categoryId: "blocks" },
      { id: "bs7", title: "Teddy Display", categoryId: "displays" },
      { id: "bs8", title: "Confetti Cannon", categoryId: "effects" },
      { id: "bs9", title: "Dessert Platter", categoryId: "platters" },
      { id: "bs10", title: "Candy Jar", categoryId: "platters" },
      { id: "bs11", title: "Easel Board", categoryId: "signs" },
      { id: "bs12", title: "Cloud Balloon", categoryId: "balloons" }
    ]
  },
  {
    id: "global",
    label: "Global Essentials (Shared Inventory)",
    color: "#542141", // Aubergine
    imageKey: "global",
    productTypes: [
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
      { id: "g1", title: "Folding Table", categoryId: "tables" },
      { id: "g2", title: "Cocktail Table", categoryId: "tables" },
      { id: "g3", title: "White Cloth", categoryId: "linens" },
      { id: "g4", title: "Black Cloth", categoryId: "linens" },
      { id: "g5", title: "Sequin Runner", categoryId: "runners" },
      { id: "g6", title: "Velvet Napkin", categoryId: "runners" },
      { id: "g7", title: "Chafing Dish", categoryId: "buffet" },
      { id: "g8", title: "Beverage Dispenser", categoryId: "dispensers" },
      { id: "g9", title: "Cutlery Set", categoryId: "dispensers" },
      { id: "g10", title: "Party Speaker", categoryId: "audio" },
      { id: "g11", title: "Fairy Lights", categoryId: "lights" },
      { id: "g12", title: "Smoke Machine", categoryId: "effects" },
      { id: "g13", title: "Background Stand", categoryId: "effects" },
      { id: "g14", title: "LED Curtain", categoryId: "lights" }
    ]
  }
];

function buildProductTypeCategories(occasions) {
  const topMap = new Map();

  for (const occasion of occasions) {
    for (const sub of occasion.productTypes || []) {
      if (!topMap.has(sub.id)) {
        topMap.set(sub.id, {
          id: sub.id,
          label: sub.label,
          emoji: sub.emoji,
          color: occasion.color,
          imageKey: sub.id,
          items: [],
        });
      }
    }

    for (const item of occasion.items || []) {
      const top = topMap.get(item.categoryId);
      if (top) {
        top.items.push({ ...item });
      }
    }
  }

  return Array.from(topMap.values()).sort((a, b) => a.label.localeCompare(b.label));
}

/** Product-type categories (Lights, Balloons, Backdrops, etc.). */
export const INVENTORY_CATEGORIES = buildProductTypeCategories(INVENTORY_OCCASIONS);

/** Merge DB rows with static product-type categories for admin filters. */
export function resolveInventoryCategories(dbCategories = []) {
  const dbById = Object.fromEntries(
    (Array.isArray(dbCategories) ? dbCategories : []).map((c) => [c.id, c])
  );

  return INVENTORY_CATEGORIES.map((inv) => {
    const db = dbById[inv.id];
    if (db) return db;

    return {
      id: inv.id,
      label: inv.label,
      emoji: inv.emoji || "📦",
      color: inv.color,
    };
  });
}

export function getProductTypeLabel(productTypeId) {
  return INVENTORY_CATEGORIES.find((c) => c.id === productTypeId)?.label || productTypeId;
}
