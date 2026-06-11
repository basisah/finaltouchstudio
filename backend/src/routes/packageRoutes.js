const express = require("express");
const router = express.Router();
const db = require("../db");

// GET all packages with items (public)
router.get("/", async (req, res) => {
  try {
    const [packages] = await db.query("SELECT * FROM packages");
    
    // For each package, fetch its items
    const packagesWithItems = await Promise.all(
      packages.map(async (pkg) => {
        const [items] = await db.query(
          `SELECT i.* FROM items i
           JOIN package_items pi ON i.id = pi.item_id
           WHERE pi.package_id = ?`,
          [pkg.id]
        );
        return { ...pkg, items };
      })
    );
    
    res.json(packagesWithItems);
  } catch (err) {
    console.error("Error fetching packages:", err);
    res.status(500).json({ error: "Failed to fetch packages" });
  }
});

// GET single package with items (public)
router.get("/:id", async (req, res) => {
  try {
    const [packages] = await db.query("SELECT * FROM packages WHERE id = ?", [req.params.id]);
    if (packages.length === 0) {
      // Also try to find by category_id (e.g. birthday) to make it easy to find packages by occasion
      const [pkgsByCat] = await db.query("SELECT * FROM packages WHERE category_id = ?", [req.params.id]);
      if (pkgsByCat.length === 0) {
        return res.status(404).json({ error: "Package not found" });
      }
      packages.push(pkgsByCat[0]);
    }
    
    const pkg = packages[0];
    const [items] = await db.query(
      `SELECT i.* FROM items i
       JOIN package_items pi ON i.id = pi.item_id
       WHERE pi.package_id = ?`,
      [pkg.id]
    );
    
    res.json({ ...pkg, items });
  } catch (err) {
    console.error("Error fetching package:", err);
    res.status(500).json({ error: "Failed to fetch package" });
  }
});

module.exports = router;
