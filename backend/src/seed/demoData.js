/**
 * Seeds / removes the demo catalogue defined in ./demoCatalog.js.
 *
 *   npm run seed:demo            insert or refresh demo categories, items and packages
 *   npm run seed:demo:remove     delete every row flagged is_demo = 1
 *
 * Idempotent — running the seed twice leaves the same rows. Real data is never
 * touched: demo rows are matched by their `is_demo` flag, and a demo package is
 * skipped when the occasion already has a real package.
 *
 * Setting SEED_DEMO_DATA=true makes the backend seed on start-up, but only
 * while the items table is still empty.
 */
const { photo, DEMO_CATEGORIES, DEMO_ITEMS, DEMO_PACKAGES } = require("./demoCatalog");

async function seedCategories(conn) {
  // Existing categories (real or demo) keep their admin-edited values.
  await conn.query(
    `INSERT INTO categories (id, label, emoji, color, description, image_url, display_order, is_demo)
     VALUES ?
     ON DUPLICATE KEY UPDATE id = id`,
    [DEMO_CATEGORIES.map((c) => [c.id, c.label, c.emoji, c.color, c.description, c.image, c.display_order, 1])]
  );
}

async function seedItems(conn) {
  const rows = DEMO_ITEMS.map((item) => [
    item.id,
    item.title,
    item.title,
    item.categoryId,
    item.subCategoryId,
    item.description,
    1,
    item.units,
    photo(item.image),
    item.price,
    item.gallery.length ? JSON.stringify(item.gallery.map((id) => photo(id))) : null,
    1,
  ]);

  // The IF() guards mean a real item that happens to share an id is left alone.
  const refresh = ["name", "title", "categoryId", "subCategoryId", "description", "unit_count", "image", "price", "gallery_images"]
    .map((col) => `${col} = IF(is_demo = 1, VALUES(${col}), ${col})`)
    .join(", ");

  await conn.query(
    `INSERT INTO items (id, name, title, categoryId, subCategoryId, description, isAvailable, unit_count, image, price, gallery_images, is_demo)
     VALUES ?
     ON DUPLICATE KEY UPDATE ${refresh}`,
    [rows]
  );
}

async function seedPackages(conn) {
  const [existing] = await conn.query("SELECT id, category_id, is_demo FROM packages WHERE category_id IN (?)", [
    DEMO_PACKAGES.map((p) => p.category_id),
  ]);
  const byCategory = new Map(existing.map((row) => [row.category_id, row]));

  let seeded = 0;
  for (const pkg of DEMO_PACKAGES) {
    const current = byCategory.get(pkg.category_id);
    if (current && !current.is_demo) continue; // a real package owns this occasion

    let packageId;
    if (current) {
      packageId = current.id;
      await conn.query("UPDATE packages SET name = ?, price = ?, description = ?, image = ? WHERE id = ?", [
        pkg.name,
        pkg.price,
        pkg.description,
        photo(pkg.image),
        packageId,
      ]);
      await conn.query("DELETE FROM package_items WHERE package_id = ?", [packageId]);
    } else {
      const [result] = await conn.query(
        "INSERT INTO packages (name, price, category_id, description, image, is_demo) VALUES (?, ?, ?, ?, ?, 1)",
        [pkg.name, pkg.price, pkg.category_id, pkg.description, photo(pkg.image)]
      );
      packageId = result.insertId;
    }

    await conn.query("INSERT INTO package_items (package_id, item_id) VALUES ?", [
      pkg.itemIds.map((itemId) => [packageId, itemId]),
    ]);
    seeded++;
  }
  return seeded;
}

/** Inserts or refreshes the demo catalogue inside one transaction. */
async function seedDemoData(db) {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    await seedCategories(conn);
    await seedItems(conn);
    const packages = await seedPackages(conn);
    await conn.commit();
    return { categories: DEMO_CATEGORIES.length, items: DEMO_ITEMS.length, packages };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

/** Deletes every demo row. Orders that referenced demo items keep their totals. */
async function removeDemoData(db) {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const [packages] = await conn.query("DELETE FROM packages WHERE is_demo = 1");
    const [items] = await conn.query("DELETE FROM items WHERE is_demo = 1");
    // A demo category is kept if real items or packages were added to it meanwhile.
    const [categories] = await conn.query(
      `DELETE FROM categories
        WHERE is_demo = 1
          AND id NOT IN (SELECT categoryId FROM (SELECT DISTINCT categoryId FROM items) AS used_items)
          AND id NOT IN (SELECT category_id FROM (SELECT DISTINCT category_id FROM packages) AS used_packages)`
    );
    await conn.commit();
    return { categories: categories.affectedRows, items: items.affectedRows, packages: packages.affectedRows };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

/** Start-up hook: seeds only an empty catalogue, and only when explicitly enabled. */
async function seedDemoDataIfEmpty(db) {
  if (process.env.SEED_DEMO_DATA !== "true") return null;
  const [[{ total }]] = await db.query("SELECT COUNT(*) AS total FROM items");
  if (Number(total) > 0) return null;
  const result = await seedDemoData(db);
  console.log(`Seeded demo catalogue: ${result.items} items, ${result.packages} packages.`);
  return result;
}

module.exports = { seedDemoData, removeDemoData, seedDemoDataIfEmpty };

// ── CLI ──────────────────────────────────────────────────────────────────────
if (require.main === module) {
  const db = require("../db");
  const initializeDatabase = require("../database/initDb");
  const remove = process.argv.includes("--remove");

  (async () => {
    await db.waitForConnection();
    await initializeDatabase(); // makes sure the is_demo columns exist
    const result = remove ? await removeDemoData(db) : await seedDemoData(db);
    console.log(
      `${remove ? "Removed" : "Seeded"} demo data: ${result.categories} categories, ${result.items} items, ${result.packages} packages.`
    );
  })()
    .catch((err) => {
      console.error("Demo data script failed:", err);
      process.exitCode = 1;
    })
    .finally(() => db.closePool());
}
