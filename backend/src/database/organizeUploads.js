/**
 * Early versions stored every upload flat in `uploads/`. Files now live in
 * `uploads/items`, `uploads/categories` and `uploads/subcategories`; this
 * moves leftovers and rewrites the paths saved in the database.
 *
 * Only rows that still carry a legacy path are read, so on an already
 * migrated database this costs two small lookups that return no rows.
 */
const fs = require("fs");
const path = require("path");
const { getUploadsRoot, ensureDir } = require("../utils/uploadsPath");

// Legacy flat prefix -> typed folder, per kind of record.
const ITEM_PREFIXES = {
  "/uploads/image-": "/uploads/items/image-",
  "/uploads/category-": "/uploads/categories/category-",
  "/uploads/subcategory-": "/uploads/subcategories/subcategory-",
};
const CATEGORY_PREFIXES = {
  "/uploads/category-": "/uploads/categories/category-",
  "/uploads/image-": "/uploads/categories/image-",
};
const SUBCATEGORY_PREFIXES = {
  "/uploads/subcategory-": "/uploads/subcategories/subcategory-",
  "/uploads/image-": "/uploads/subcategories/image-",
};
const FILE_DESTINATIONS = { "category-": "categories", "subcategory-": "subcategories", "image-": "items" };

function rewritePath(value, prefixes) {
  if (typeof value !== "string") return value;
  for (const [from, to] of Object.entries(prefixes)) {
    if (value.startsWith(from)) return to + value.slice(from.length);
  }
  return value;
}

function parseJsonArray(raw) {
  if (!raw) return null;
  try {
    const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function moveLegacyFiles() {
  const root = getUploadsRoot();
  if (!fs.existsSync(root)) return;
  for (const folder of new Set(Object.values(FILE_DESTINATIONS))) ensureDir(path.join(root, folder));

  for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
    if (!entry.isFile()) continue;
    const prefix = Object.keys(FILE_DESTINATIONS).find((p) => entry.name.startsWith(p));
    if (!prefix) continue;
    try {
      fs.renameSync(path.join(root, entry.name), path.join(root, FILE_DESTINATIONS[prefix], entry.name));
    } catch (err) {
      console.error(`Failed to move upload ${entry.name}:`, err.message);
    }
  }
}

async function migrateItemPaths(db) {
  const [items] = await db.query(
    `SELECT id, image, gallery_images FROM items
      WHERE image LIKE '/uploads/image-%' OR image LIKE '/uploads/category-%'
         OR image LIKE '/uploads/subcategory-%' OR gallery_images LIKE '%"/uploads/image-%'
         OR gallery_images LIKE '%"/uploads/category-%' OR gallery_images LIKE '%"/uploads/subcategory-%'`
  );
  for (const item of items) {
    const gallery = parseJsonArray(item.gallery_images);
    const nextGallery = gallery ? JSON.stringify(gallery.map((img) => rewritePath(img, ITEM_PREFIXES))) : item.gallery_images;
    await db.query("UPDATE items SET image = ?, gallery_images = ? WHERE id = ?", [
      rewritePath(item.image, ITEM_PREFIXES),
      nextGallery,
      item.id,
    ]);
  }
}

async function migrateCategoryPaths(db) {
  const [categories] = await db.query(
    `SELECT id, image_url, subcategories FROM categories
      WHERE image_url LIKE '/uploads/category-%' OR image_url LIKE '/uploads/image-%'
         OR subcategories LIKE '%"/uploads/subcategory-%' OR subcategories LIKE '%"/uploads/image-%'`
  );
  for (const cat of categories) {
    const subs = parseJsonArray(cat.subcategories);
    const nextSubs = subs
      ? JSON.stringify(subs.map((sub) => (sub && sub.image ? { ...sub, image: rewritePath(sub.image, SUBCATEGORY_PREFIXES) } : sub)))
      : cat.subcategories;
    await db.query("UPDATE categories SET image_url = ?, subcategories = ? WHERE id = ?", [
      rewritePath(cat.image_url, CATEGORY_PREFIXES),
      nextSubs,
      cat.id,
    ]);
  }
}

async function organizeUploads(db) {
  try {
    moveLegacyFiles();
    await migrateItemPaths(db);
    await migrateCategoryPaths(db);
  } catch (err) {
    console.error("Failed to organize uploads:", err);
  }
}

module.exports = { organizeUploads, rewritePath };
