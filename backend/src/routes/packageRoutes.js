const express = require("express");
const router = express.Router();
const db = require("../db");

/** Item columns a package card / customiser needs. */
const PACKAGE_ITEM_COLUMNS =
  "i.id, i.name, i.title, i.categoryId, i.subCategoryId, i.description, i.isAvailable, i.unit_count, i.image, i.price";

/**
 * Attaches `items` to every package with a single IN query
 * (previously one query per package).
 */
async function attachItems(packages) {
  if (packages.length === 0) return [];

  const [rows] = await db.query(
    `SELECT pi.package_id, ${PACKAGE_ITEM_COLUMNS}
       FROM package_items pi
       INNER JOIN items i ON i.id = pi.item_id
      WHERE pi.package_id IN (?)
      ORDER BY i.title ASC`,
    [packages.map((p) => p.id)]
  );

  const itemsByPackage = new Map(packages.map((p) => [p.id, []]));
  for (const { package_id, ...item } of rows) {
    itemsByPackage.get(package_id)?.push(item);
  }
  return packages.map((pkg) => ({ ...pkg, items: itemsByPackage.get(pkg.id) }));
}

// GET all packages with their items (public)
router.get("/", async (req, res) => {
  try {
    const [packages] = await db.query("SELECT * FROM packages ORDER BY id ASC");
    res.json(await attachItems(packages));
  } catch (err) {
    console.error("Error fetching packages:", err);
    res.status(500).json({ error: "Failed to fetch packages" });
  }
});

// GET one package by numeric id, or by its occasion (category_id) e.g. /packages/birthday
router.get("/:id", async (req, res) => {
  try {
    const [packages] = await db.query(
      "SELECT * FROM packages WHERE id = ? OR category_id = ? ORDER BY (id = ?) DESC LIMIT 1",
      [req.params.id, req.params.id, req.params.id]
    );
    if (packages.length === 0) return res.status(404).json({ error: "Package not found" });

    const [pkg] = await attachItems(packages);
    res.json(pkg);
  } catch (err) {
    console.error("Error fetching package:", err);
    res.status(500).json({ error: "Failed to fetch package" });
  }
});

module.exports = router;
