import { INVENTORY_CATEGORIES } from "../constants/inventory";

// The 5 permanent categories templates in the requested order
export const PERMANENT_CATEGORIES = [
  {
    id: "proposal",
    label: "Proposal",
    emoji: "💍",
    color: "#8B5CF6",
    description: "Fairy lights, romantic floral arches & beautiful signs to make your moment perfect.",
    subcategories: [
      { id: "general", label: "General Props", emoji: "✨" }
    ]
  },
  {
    id: "holud",
    label: "Holud",
    emoji: "🌼",
    color: "#D97706",
    description: "Traditional Gaye Holud & Mehndi night stage setups with vibrant colors.",
    subcategories: INVENTORY_CATEGORIES.find(c => c.id === "holud")?.subcategories || []
  },
  {
    id: "marriage",
    label: "Marriage",
    emoji: "💒",
    color: "#9F507C",
    description: "Exquisite wedding, holud & reception stages blending modern and traditional luxury.",
    subcategories: INVENTORY_CATEGORIES.find(c => c.id === "marriage")?.subcategories || []
  },
  {
    id: "baby",
    label: "Baby Shower",
    emoji: "🍼",
    color: "#A78BFA",
    description: "Cute, colorful & magical themes for celebrating your little one.",
    subcategories: INVENTORY_CATEGORIES.find(c => c.id === "baby")?.subcategories || []
  },
  {
    id: "birthday",
    label: "Birthday",
    emoji: "🎂",
    color: "#B8729A",
    description: "Bespoke balloon walls, kids themes & customized stage setups for your special day.",
    subcategories: INVENTORY_CATEGORIES.find(c => c.id === "birthday")?.subcategories || []
  }
];

const isSameCategory = (a, b) =>
  a === b || (a === "baby" && b === "baby-shower") || (a === "baby-shower" && b === "baby");

function parseSubcategories(raw) {
  if (!raw) return null;
  try {
    const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

/**
 * Orders the categories returned by the API: the permanent occasions first (in
 * their fixed order, merged with their built-in defaults), then any custom
 * categories by display_order. With no API data the built-in occasions are
 * returned so navigation still renders.
 */
export function getSortedCategories(fetchedCategories = []) {
  if (!fetchedCategories.length) {
    return { landingCategories: PERMANENT_CATEGORIES, allItemsCategories: PERMANENT_CATEGORIES };
  }

  const permanent = [];
  for (const template of PERMANENT_CATEGORIES) {
    const match = fetchedCategories.find((c) => isSameCategory(c.id, template.id));
    if (!match) continue;
    permanent.push({
      ...template,
      label: match.label || template.label,
      emoji: match.emoji || template.emoji,
      color: match.color || template.color,
      description: match.description || template.description,
      image_url: match.image_url || template.image_url,
      subcategories: parseSubcategories(match.subcategories) || template.subcategories,
    });
  }

  const custom = fetchedCategories
    .filter((c) => !PERMANENT_CATEGORIES.some((p) => isSameCategory(p.id, c.id)))
    .map((c) => {
      const defaults = INVENTORY_CATEGORIES.find((s) => s.id === c.id);
      return { ...defaults, ...c, subcategories: parseSubcategories(c.subcategories) || defaults?.subcategories || [] };
    })
    .sort((a, b) => (a.display_order ?? 99) - (b.display_order ?? 99) || a.id.localeCompare(b.id));

  return { landingCategories: permanent, allItemsCategories: [...permanent, ...custom] };
}
