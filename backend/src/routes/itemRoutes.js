const express = require("express");
const router = express.Router();
const db = require("../db");
const { toDateKey } = require("../utils/rentalAvailability");

function formatDateRow(value) {
  if (!value) return null;
  if (value instanceof Date) return toDateKey(value);
  return String(value).slice(0, 10);
}

// Get item availability (bookings + stock)
router.get("/:id/availability", async (req, res) => {
  try {
    const itemId = req.params.id;
    const [items] = await db.query("SELECT id, unit_count, isAvailable FROM items WHERE id = ?", [itemId]);
    if (items.length === 0) return res.status(404).json({ error: "Item not found" });

    const item = items[0];
    const totalStock = Math.max(0, parseInt(item.unit_count, 10) || 0);

    const [rows] = await db.query(
      `SELECT oi.quantity,
              oi.pickup_date AS item_pickup,
              oi.return_date AS item_return,
              o.rental_date AS order_pickup,
              o.event_date AS order_return
       FROM order_items oi
       INNER JOIN orders o ON o.id = oi.order_id
       WHERE oi.item_id = ?
         AND o.status IN ('pending', 'confirmed')
         AND oi.quantity > 0`,
      [itemId]
    );

    const bookings = rows
      .map((row) => {
        const pickupDate = formatDateRow(row.item_pickup || row.order_pickup);
        const returnDate = formatDateRow(row.item_return || row.order_return);
        if (!pickupDate || !returnDate) return null;
        return {
          pickupDate,
          returnDate,
          quantity: parseInt(row.quantity, 10) || 0,
        };
      })
      .filter(Boolean);

    res.json({
      itemId,
      totalStock,
      isRentable: totalStock > 0 && Boolean(item.isAvailable),
      bookings,
    });
  } catch (err) {
    console.error("Error fetching item availability:", err);
    res.status(500).json({ error: "Failed to fetch item availability" });
  }
});

// Get all items (public, supports categoryId filtering)
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

    if (conditions.length > 0) {
      query += " WHERE " + conditions.join(" AND ");
    }

    query += " ORDER BY categoryId ASC, id ASC";

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
