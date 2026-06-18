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

export function getSortedCategories(fetchedCategories = []) {
  const orderedList = [];
  const remaining = [];
  
  // Build the permanent list in order
  PERMANENT_CATEGORIES.forEach(tpl => {
    // Find matching fetched category (matching baby-shower to baby)
    const match = fetchedCategories.find(c => 
      c.id === tpl.id || 
      (tpl.id === "baby" && c.id === "baby-shower") || 
      (tpl.id === "baby-shower" && c.id === "baby")
    );
    
    if (match) {
      let parsedSub = null;
      if (match.subcategories) {
        try {
          parsedSub = typeof match.subcategories === "string" ? JSON.parse(match.subcategories) : match.subcategories;
        } catch (e) {
          console.error("Failed to parse subcategories JSON", e);
        }
      }
      orderedList.push({
        ...tpl,
        label: match.label || tpl.label,
        emoji: match.emoji || tpl.emoji,
        color: match.color || tpl.color,
        description: match.description || tpl.description,
        image_url: match.image_url || tpl.image_url,
        subcategories: Array.isArray(parsedSub) ? parsedSub : tpl.subcategories
      });
    }
  });

  // Collect other fetched categories
  fetchedCategories.forEach(c => {
    const isPermanent = PERMANENT_CATEGORIES.some(p => 
      p.id === c.id || 
      (p.id === "baby" && c.id === "baby-shower") || 
      (p.id === "baby-shower" && c.id === "baby")
    );
    if (!isPermanent) {
      const staticConfig = INVENTORY_CATEGORIES.find(s => s.id === c.id);
      let parsedSub = null;
      if (c.subcategories) {
        try {
          parsedSub = typeof c.subcategories === "string" ? JSON.parse(c.subcategories) : c.subcategories;
        } catch (e) {
          console.error("Failed to parse subcategories JSON", e);
        }
      }
      remaining.push({
        ...staticConfig,
        ...c,
        subcategories: Array.isArray(parsedSub) ? parsedSub : (staticConfig?.subcategories || [])
      });
    }
  });

  // Sort other categories
  remaining.sort((a, b) => {
    const orderA = a.display_order ?? 99;
    const orderB = b.display_order ?? 99;
    if (orderA !== orderB) return orderA - orderB;
    return a.id.localeCompare(b.id);
  });

  return {
    landingCategories: orderedList,
    allItemsCategories: [...orderedList, ...remaining]
  };
}
