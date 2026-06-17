const express = require("express");
const router = express.Router();
const db = require("../db");

// Get all items (public, supports categoryId and subCategoryId filtering)
router.get("/", async (req, res) => {
  const { categoryId, subCategoryId } = req.query;
  try {
    let query = "SELECT * FROM items";
    const params = [];
    const conditions = [];

    if (categoryId) {
      conditions.push("categoryId = ?");
      params.push(categoryId);
    }
    if (subCategoryId) {
      conditions.push("subCategoryId = ?");
      params.push(subCategoryId);
    }

    if (conditions.length > 0) {
      query += " WHERE " + conditions.join(" AND ");
    }

    query += " ORDER BY categoryId, subCategoryId ASC, id ASC";

    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error("Error fetching items:", err);
    res.status(500).json({ error: "Failed to fetch items" });
  }
});

// Get single item (public)
router.get("/:id", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM items WHERE id = ?", [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: "Item not found" });
    res.json(rows[0]);
  } catch (err) {
    console.error("Error fetching item:", err);
    res.status(500).json({ error: "Failed to fetch item" });
  }
});

module.exports = router;
