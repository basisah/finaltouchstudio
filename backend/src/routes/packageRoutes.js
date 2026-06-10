const express = require("express");
const router = express.Router();
const db = require("../db");
const auth = require("../middleware/auth");

// GET all packages with their item IDs
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

// GET single package with items
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

// POST create a new package (Protected)
router.post("/", auth, async (req, res) => {
  const { name, price, category_id, itemIds } = req.body;
  if (!name || !price || !category_id) {
    return res.status(400).json({ error: "Name, price, and category_id are required" });
  }
  
  try {
    // Check if a package for this category already exists
    const [existing] = await db.query("SELECT id FROM packages WHERE category_id = ?", [category_id]);
    if (existing.length > 0) {
      return res.status(400).json({ error: `A package for category '${category_id}' already exists.` });
    }

    const [result] = await db.query(
      "INSERT INTO packages (name, price, category_id) VALUES (?, ?, ?)",
      [name, price, category_id]
    );
    const packageId = result.insertId;
    
    if (Array.isArray(itemIds) && itemIds.length > 0) {
      for (const itemId of itemIds) {
        await db.query(
          "INSERT INTO package_items (package_id, item_id) VALUES (?, ?)",
          [packageId, itemId]
        );
      }
    }
    
    // Fetch and return the newly created package
    const [newPkg] = await db.query("SELECT * FROM packages WHERE id = ?", [packageId]);
    const [items] = await db.query(
      `SELECT i.* FROM items i
       JOIN package_items pi ON i.id = pi.item_id
       WHERE pi.package_id = ?`,
      [packageId]
    );
    
    res.status(201).json({ ...newPkg[0], items });
  } catch (err) {
    console.error("Error creating package:", err);
    res.status(500).json({ error: "Failed to create package" });
  }
});

// PUT update a package (Protected)
router.put("/:id", auth, async (req, res) => {
  const { name, price, category_id, itemIds } = req.body;
  const pkgId = req.params.id;
  
  try {
    const [existing] = await db.query("SELECT id FROM packages WHERE id = ?", [pkgId]);
    if (existing.length === 0) {
      return res.status(404).json({ error: "Package not found" });
    }
    
    // Update package info
    await db.query(
      "UPDATE packages SET name = ?, price = ?, category_id = ? WHERE id = ?",
      [name, price, category_id, pkgId]
    );
    
    // Sync items: first delete old linkages, then insert new linkages
    await db.query("DELETE FROM package_items WHERE package_id = ?", [pkgId]);
    
    if (Array.isArray(itemIds) && itemIds.length > 0) {
      for (const itemId of itemIds) {
        await db.query(
          "INSERT INTO package_items (package_id, item_id) VALUES (?, ?)",
          [pkgId, itemId]
        );
      }
    }
    
    // Fetch and return updated package
    const [updatedPkg] = await db.query("SELECT * FROM packages WHERE id = ?", [pkgId]);
    const [items] = await db.query(
      `SELECT i.* FROM items i
       JOIN package_items pi ON i.id = pi.item_id
       WHERE pi.package_id = ?`,
      [pkgId]
    );
    
    res.json({ ...updatedPkg[0], items });
  } catch (err) {
    console.error("Error updating package:", err);
    res.status(500).json({ error: "Failed to update package" });
  }
});

// DELETE a package (Protected)
router.delete("/:id", auth, async (req, res) => {
  const pkgId = req.params.id;
  try {
    const [result] = await db.query("DELETE FROM packages WHERE id = ?", [pkgId]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Package not found" });
    }
    res.json({ message: "Package deleted successfully" });
  } catch (err) {
    console.error("Error deleting package:", err);
    res.status(500).json({ error: "Failed to delete package" });
  }
});

module.exports = router;
