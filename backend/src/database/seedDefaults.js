/**
 * Rows the application expects to exist on every database:
 * the five permanent occasion categories and three starter testimonials.
 */

// [id, label, icon key, color, description, display_order]
const PERMANENT_CATEGORIES = [
  ["proposal", "Proposal", "ring", "#8B5CF6", "Fairy lights, romantic floral arches & beautiful signs to make your moment perfect.", 1],
  ["holud", "Holud", "bridal-shower", "#D97706", "Traditional Gaye Holud & Mehndi night stage setups with vibrant colors.", 2],
  ["marriage", "Marriage", "wedding-couple", "#9F507C", "Exquisite wedding, holud & reception stages blending modern and traditional luxury.", 3],
  ["baby", "Baby Shower", "baby", "#A78BFA", "Cute, colorful & magical themes for celebrating your little one.", 4],
  ["birthday", "Birthday", "birthday-cake", "#B8729A", "Bespoke balloon walls, kids themes & customized stage setups for your special day.", 5],
];

// [customer_name, role, rating, comment]
const STARTER_REVIEWS = [
  ["Sarah M.", "Bride", 5, "FinalTouch transformed our reception stage into an absolute fairytale! The floral arch was gorgeous and the team was incredibly professional and detailed."],
  ["David K.", "Groom", 5, "We ordered the proposal package and everything was set up perfectly. The fairy lights, custom signs, and staging made our moment truly unforgettable."],
  ["Aaliyah R.", "Host", 5, "The custom balloon wall and stage setup were a massive hit at my daughter's birthday. The process was stress-free and the design was stunning."],
];

async function seedCategories(db) {
  // One multi-row upsert instead of a query per category.
  await db.query(
    `INSERT INTO categories (id, label, emoji, color, description, display_order)
     VALUES ?
     ON DUPLICATE KEY UPDATE display_order = VALUES(display_order)`,
    [PERMANENT_CATEGORIES]
  );
}

async function seedReviews(db) {
  const [[{ total }]] = await db.query("SELECT COUNT(*) AS total FROM reviews");
  if (Number(total) > 0) return;
  await db.query("INSERT INTO reviews (customer_name, role, rating, comment) VALUES ?", [STARTER_REVIEWS]);
}

async function seedDefaults(db) {
  await seedCategories(db);
  try {
    await seedReviews(db);
  } catch (err) {
    console.error("Failed to seed starter reviews:", err.message);
  }
}

module.exports = { seedDefaults, PERMANENT_CATEGORIES };
