const express = require("express");
const router = express.Router();
const db = require("../../db");
const auth = require("../../middleware/auth");

// Helper middleware to verify admin role
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({ error: "Access denied. Admin role required." });
  }
};

// All routes here are admin-only
router.use(auth, isAdmin);

// POST create a new package (Protected)
router.post("/", async (req, res) => {
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
    
    // Add package items
    if (itemIds && Array.isArray(itemIds)) {
      for (const itemId of itemIds) {
        await db.query(
          "INSERT INTO package_items (package_id, item_id) VALUES (?, ?)",
          [packageId, itemId]
        );
      }
    }
    
    res.status(201).json({ id: packageId, name, price, category_id, itemIds });
  } catch (err) {
    console.error("Error creating package:", err);
    res.status(500).json({ error: "Failed to create package" });
  }
});

// PUT update a package (Protected)
router.put("/:id", async (req, res) => {
  const { name, price, category_id, itemIds } = req.body;
  const packageId = req.params.id;
  
  if (!name || !price || !category_id) {
    return res.status(400).json({ error: "Name, price, and category_id are required" });
  }
  
  try {
    const [result] = await db.query(
      "UPDATE packages SET name = ?, price = ?, category_id = ?, updated_at = NOW() WHERE id = ?",
      [name, price, category_id, packageId]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Package not found" });
    }
    
    // Refresh items list: delete old and insert new
    await db.query("DELETE FROM package_items WHERE package_id = ?", [packageId]);
    if (itemIds && Array.isArray(itemIds)) {
      for (const itemId of itemIds) {
        await db.query(
          "INSERT INTO package_items (package_id, item_id) VALUES (?, ?)",
          [packageId, itemId]
        );
      }
    }
    
    res.json({ id: packageId, name, price, category_id, itemIds });
  } catch (err) {
    console.error("Error updating package:", err);
    res.status(500).json({ error: "Failed to update package" });
  }
});

// DELETE a package (Protected)
router.delete("/:id", async (req, res) => {
  try {
    const [result] = await db.query("DELETE FROM packages WHERE id = ?", [req.params.id]);
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
