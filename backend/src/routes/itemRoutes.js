const express = require("express");
const router = express.Router();
const db = require("../db");

// Get all items (public, supports categoryId and subCategoryId filtering)
router.get("/", async (req, res) => {
  const { categoryId, subCategoryId, all } = req.query;
  try {
    let query = "SELECT * FROM items";
    const params = [];
    const conditions = [];

    // Filter out unavailable items for public users unless all=true is specified
    if (all !== "true") {
      conditions.push("isAvailable = 1");
    }

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

// Get booked date ranges for a specific item (public) — must come BEFORE /:id
router.get("/:id/booked-dates", async (req, res) => {
  const { id } = req.params;
  try {
    // Fetch the item's total inventory count
    const [itemRows] = await db.query(
      "SELECT unit_count FROM items WHERE id = ?",
      [id]
    );
    const unitCount = itemRows.length > 0 ? (Number(itemRows[0].unit_count) || 1) : 1;

    // Fetch each order's date range + quantity booked for this item
    // Group by order so overlapping orders with different ranges are separate entries
    const [rows] = await db.query(
      `SELECT o.rental_date, o.event_date, SUM(oi.quantity) AS quantity_booked
       FROM orders o
       INNER JOIN order_items oi ON oi.order_id = o.id
       WHERE oi.item_id = ?
         AND o.status IN ('pending', 'confirmed')
       GROUP BY o.id, o.rental_date, o.event_date`,
      [id]
    );

    const bookedRanges = rows.map((r) => ({
      rentalDate: r.rental_date instanceof Date
        ? r.rental_date.toISOString().split("T")[0]
        : String(r.rental_date).split("T")[0],
      eventDate: r.event_date instanceof Date
        ? r.event_date.toISOString().split("T")[0]
        : String(r.event_date).split("T")[0],
      quantityBooked: Number(r.quantity_booked) || 1,
    }));

    res.json({ bookedRanges, unitCount });
  } catch (err) {
    console.error("Error fetching booked dates:", err);
    res.status(500).json({ error: "Failed to fetch booked dates" });
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
