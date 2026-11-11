const express = require("express");
const router = express.Router();
const db = require("../db");
const { formatDateRow } = require("../utils/rentalAvailability");
const { ACTIVE_ORDER_STATUSES } = require("../constants/orderStatus");

/** Columns a catalogue card needs — the heavy TEXT blobs stay out of list responses. */
const LIST_COLUMNS =
  "id, name, title, categoryId, subCategoryId, description, isAvailable, unit_count, image, price, is_demo";

const MAX_PAGE_SIZE = 200;

/**
 * One query for an item's stock plus every active booking against it.
 * LEFT JOINs keep the item row even when nothing is booked, so "item not
 * found" and "no bookings" stay distinguishable without a second round trip.
 */
async function loadItemBookings(itemId) {
  const [rows] = await db.query(
    `SELECT i.unit_count, i.isAvailable,
            oi.quantity,
            COALESCE(oi.pickup_date, o.rental_date) AS pickup_date,
            COALESCE(oi.return_date, o.event_date)  AS return_date,
            o.id AS order_id
       FROM items i
       LEFT JOIN order_items oi ON oi.item_id = i.id AND oi.quantity > 0
       LEFT JOIN orders o ON o.id = oi.order_id AND o.status IN (?)
      WHERE i.id = ?`,
    [ACTIVE_ORDER_STATUSES, itemId]
  );
  if (rows.length === 0) return null;

  return {
    unitCount: rows[0].unit_count,
    isAvailable: Boolean(rows[0].isAvailable),
    // A row with no matching active order is either "no bookings" or a
    // booking on a returned/cancelled order — neither holds stock.
    bookings: rows
      .filter((row) => row.order_id != null)
      .map((row) => ({
        orderId: row.order_id,
        pickupDate: formatDateRow(row.pickup_date),
        returnDate: formatDateRow(row.return_date),
        quantity: parseInt(row.quantity, 10) || 0,
      }))
      .filter((b) => b.pickupDate && b.returnDate),
  };
}

// Item availability (stock + active bookings)
router.get("/:id/availability", async (req, res) => {
  try {
    const data = await loadItemBookings(req.params.id);
    if (!data) return res.status(404).json({ error: "Item not found" });

    const totalStock = Math.max(0, parseInt(data.unitCount, 10) || 0);
    res.json({
      itemId: req.params.id,
      totalStock,
      isRentable: totalStock > 0 && data.isAvailable,
      bookings: data.bookings.map(({ pickupDate, returnDate, quantity }) => ({ pickupDate, returnDate, quantity })),
    });
  } catch (err) {
    console.error("Error fetching item availability:", err);
    res.status(500).json({ error: "Failed to fetch item availability" });
  }
});

/**
 * List items.
 *   ?categoryId=…&subCategoryId=…   filter
 *   ?q=…                            title / description search
 *   ?all=true                       include unavailable items + full columns (admin)
 *   ?limit=…&offset=…               optional pagination; adds an X-Total-Count header
 */
router.get("/", async (req, res) => {
  const { categoryId, subCategoryId, q, all } = req.query;
  try {
    const conditions = [];
    const params = [];

    if (all !== "true") conditions.push("isAvailable = 1");
    if (categoryId) {
      conditions.push("categoryId = ?");
      params.push(categoryId);
    }
    if (subCategoryId) {
      conditions.push("subCategoryId = ?");
      params.push(subCategoryId);
    }
    if (q && String(q).trim()) {
      const term = `%${String(q).trim()}%`;
      conditions.push("(title LIKE ? OR description LIKE ?)");
      params.push(term, term);
    }

    const where = conditions.length ? ` WHERE ${conditions.join(" AND ")}` : "";
    const columns = all === "true" ? "*" : LIST_COLUMNS;
    let sql = `SELECT ${columns} FROM items${where} ORDER BY categoryId ASC, id ASC`;
    const queryParams = [...params];

    const limit = parseInt(req.query.limit, 10);
    if (Number.isInteger(limit) && limit > 0) {
      const offset = Math.max(0, parseInt(req.query.offset, 10) || 0);
      sql += " LIMIT ? OFFSET ?";
      queryParams.push(Math.min(limit, MAX_PAGE_SIZE), offset);

      const [[{ total }]] = await db.query(`SELECT COUNT(*) AS total FROM items${where}`, params);
      res.set("X-Total-Count", String(total));
      res.set("Access-Control-Expose-Headers", "X-Total-Count");
    }

    const [rows] = await db.query(sql, queryParams);
    res.json(rows);
  } catch (err) {
    console.error("Error fetching items:", err);
    res.status(500).json({ error: "Failed to fetch items" });
  }
});

// Booked date ranges for an item, grouped per order — must come BEFORE /:id
router.get("/:id/booked-dates", async (req, res) => {
  try {
    const data = await loadItemBookings(req.params.id);
    const unitCount = data ? Number(data.unitCount) || 1 : 1;

    const byRange = new Map();
    for (const b of data ? data.bookings : []) {
      const key = `${b.orderId}|${b.pickupDate}|${b.returnDate}`;
      const entry = byRange.get(key) || { rentalDate: b.pickupDate, eventDate: b.returnDate, quantityBooked: 0 };
      entry.quantityBooked += b.quantity;
      byRange.set(key, entry);
    }

    res.json({ bookedRanges: [...byRange.values()], unitCount });
  } catch (err) {
    console.error("Error fetching booked dates:", err);
    res.status(500).json({ error: "Failed to fetch booked dates" });
  }
});

// Single item, with how often it was rented in the last 30 days
router.get("/:id", async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT i.*,
              (SELECT COALESCE(SUM(oi.quantity), 0)
                 FROM order_items oi
                 INNER JOIN orders o ON o.id = oi.order_id
                WHERE oi.item_id = i.id
                  AND o.status <> 'cancelled'
                  AND o.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)) AS rental_count
         FROM items i
        WHERE i.id = ?`,
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: "Item not found" });

    const item = rows[0];
    item.rental_count = Number(item.rental_count) || 0;
    res.json(item);
  } catch (err) {
    console.error("Error fetching item:", err);
    res.status(500).json({ error: "Failed to fetch item" });
  }
});

module.exports = router;
