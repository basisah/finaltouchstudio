import baby from "../assets/Icons/baby.png";
import birthdayCake from "../assets/Icons/birthday-cake.png";
import bridalShower from "../assets/Icons/bridal-shower.png";
import bride from "../assets/Icons/bride.png";
import couple from "../assets/Icons/couple.png";
import manager from "../assets/Icons/manager.png";
import ring from "../assets/Icons/ring.png";
import weddingCouple from "../assets/Icons/wedding-couple.png";

/** Icon keys an admin can pick for a category (stored in categories.emoji). */
const ICONS = {
  baby,
  "birthday-cake": birthdayCake,
  "bridal-shower": bridalShower,
  bride,
  couple,
  manager,
  ring,
  "wedding-couple": weddingCouple,
};

/** Default icon per built-in category id. */
const BY_CATEGORY_ID = {
  proposal: ring,
  birthday: birthdayCake,
  marriage: weddingCouple,
  holud: bridalShower,
  baby,
  "baby-shower": baby,
  "bridal-shower": bride,
  corporate: manager,
  global: manager,
};

/** Returns the icon image for a category, or null when it only has an emoji. */
export function getCategoryIcon(category) {
  if (!category) return null;
  return ICONS[category.emoji] || BY_CATEGORY_ID[category.id] || null;
}
