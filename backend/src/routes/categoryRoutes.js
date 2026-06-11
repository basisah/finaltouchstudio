const express = require("express");
const router = express.Router();
const db = require("../db");

// GET all categories (public)
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM categories ORDER BY display_order ASC, id ASC");
    res.json(rows);
  } catch (err) {
    console.error("Error fetching categories:", err);
    res.status(500).json({ error: "Failed to fetch categories" });
  }
});

// GET single category (public)
router.get("/:id", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM categories WHERE id = ?", [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: "Category not found" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch category" });
  }
});

module.exports = router;
