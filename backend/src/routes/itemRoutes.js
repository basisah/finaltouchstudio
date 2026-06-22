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

    const item = rows[0];

    // Fetch rental count in the past month (30 days)
    const [rentalRows] = await db.query(
      `SELECT COALESCE(SUM(oi.quantity), 0) AS rental_count
       FROM order_items oi
       INNER JOIN orders o ON oi.order_id = o.id
       WHERE oi.item_id = ?
         AND o.status IN ('pending', 'confirmed')
         AND o.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)`,
      [req.params.id]
    );

    item.rental_count = Number(rentalRows[0]?.rental_count) || 0;

    res.json(item);
  } catch (err) {
    console.error("Error fetching item:", err);
    res.status(500).json({ error: "Failed to fetch item" });
  }
});

module.exports = router;
