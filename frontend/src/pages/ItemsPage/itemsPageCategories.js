/** Display categories for the /items browsing experience. */
export const DISPLAY_CATEGORIES = [
  {
    id: "all",
    label: "All",
    emoji: "✨",
    description: "Browse our full luxury rental inventory.",
  },
  {
    id: "accessories-props",
    label: "Accessories & Props",
    emoji: "🧸",
    description:
      "Wedding accessories, birthday props, holud decorations, and event essentials.",
  },
  {
    id: "audio",
    label: "Audio & Speaker",
    emoji: "🔊",
    description: "Premium sound systems and speakers for every celebration.",
  },
  {
    id: "lighting",
    label: "Lighting",
    emoji: "💡",
    description: "Neon signs, fairy lights, uplights, and ambient illumination.",
  },
  {
    id: "furniture",
    label: "Furniture",
    emoji: "🪑",
    description: "Chairs, sofas, tables, pedestals, and statement seating.",
  },
  {
    id: "decor",
    label: "Decor",
    emoji: "🌸",
    description: "Balloons, florals, linens, carpets, and decorative accents.",
  },
  {
    id: "stage-setup",
    label: "Stage Setup",
    emoji: "💒",
    description: "Arches, backdrops, mandaps, pillars, and stage effects.",
  },
  {
    id: "catering",
    label: "Catering",
    emoji: "🍽️",
    description: "Buffet setups, serving pieces, platters, and table service.",
  },
  {
    id: "photography",
    label: "Photography",
    emoji: "📷",
    description: "Photo-ready props, displays, and backdrop essentials.",
  },
];

const PRODUCT_TYPE_TO_DISPLAY = {
  props: "accessories-props",
  accessories: "accessories-props",
  blocks: "accessories-props",
  displays: "photography",
  cushions: "accessories-props",
  audio: "audio",
  light: "lighting",
  lights: "lighting",
  signs: "lighting",
  seating: "furniture",
  chairs: "furniture",
  tables: "furniture",
  plinths: "furniture",
  stands: "stage-setup",
  balloons: "decor",
  backdrops: "stage-setup",
  arches: "stage-setup",
  drapes: "decor",
  linens: "decor",
  runners: "decor",
  mandap: "stage-setup",
  carpets: "decor",
  effects: "stage-setup",
  buffet: "catering",
  dispensers: "catering",
  platters: "catering",
  trays: "catering",
  tableware: "catering",
  dalas: "catering",
};

export function getDisplayCategoryId(productTypeId) {
  return PRODUCT_TYPE_TO_DISPLAY[productTypeId] || "accessories-props";
}

export function getDisplayCategoryById(id) {
  return DISPLAY_CATEGORIES.find((c) => c.id === id);
}

export function groupItemsByDisplayCategory(items) {
  const groups = Object.fromEntries(
    DISPLAY_CATEGORIES.filter((c) => c.id !== "all").map((c) => [c.id, []])
  );

  for (const item of items) {
    const displayId = getDisplayCategoryId(item.categoryId);
    if (groups[displayId]) {
      groups[displayId].push(item);
    }
  }

  return groups;
}

/** Build pill nav from categories returned by the database. */
export function buildPillCategories(dbCategories = []) {
  if (!dbCategories.length) return [];

  const all = DISPLAY_CATEGORIES.find((c) => c.id === "all");
  return all ? [all, ...dbCategories] : dbCategories;
}

/** Group items under their database category id. */
export function groupItemsByCategoryId(items, dbCategories = []) {
  const groups = Object.fromEntries(dbCategories.map((c) => [c.id, []]));

  for (const item of items) {
    if (groups[item.categoryId]) {
      groups[item.categoryId].push(item);
    }
  }

  return groups;
}
