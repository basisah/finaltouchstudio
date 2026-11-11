const express = require("express");
const router = express.Router();
const db = require("../db");
const auth = require("../middleware/auth");
const optionalAuth = require("../middleware/optionalAuth");
const { canRentQuantity, formatDateRow } = require("../utils/rentalAvailability");
const { ACTIVE_ORDER_STATUSES } = require("../constants/orderStatus");
const { sendNotificationEmail } = require("../utils/mailer");
const getPurchaseUserTemplate = require("../emailservices/purchaseUser");
const getPurchaseAdminTemplate = require("../emailservices/purchaseAdmin");

const ORDER_COLUMNS =
  "id, user_id, customer_name, customer_email, customer_phone, event_date, rental_date, fulfillment_type, delivery_fee, venue_address, special_notes, total_amount, status, created_at";

const ORDER_ITEM_SELECT = `SELECT oi.order_id, oi.id, oi.quantity, oi.price_at_rent, oi.item_id, oi.package_id,
              i.name AS item_name, i.image AS item_image,
              p.name AS package_name
         FROM order_items oi
         LEFT JOIN items i ON oi.item_id = i.id
         LEFT JOIN packages p ON oi.package_id = p.id`;

/** A validation failure that maps straight to an HTTP response. */
class OrderError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

/** Finds the account for an email, creating a password-less guest account if needed. */
async function findOrCreateUser(conn, email, name) {
  const [rows] = await conn.query("SELECT id FROM users WHERE email = ?", [email]);
  if (rows.length > 0) return rows[0].id;
  const [inserted] = await conn.query("INSERT INTO users (email, name, role) VALUES (?, ?, 'user')", [email, name]);
  return inserted.insertId;
}

/** Sends the customer receipt and the owner notification for a new order. */
async function sendOrderEmails(order, items) {
  try {
    await dispatchOrderEmails(order, items);
  } catch (err) {
    // The order is already committed — a mail problem must not fail the request.
    console.error("Order email dispatch failed:", err);
  }
}

async function dispatchOrderEmails(order, items) {
  const customer = getPurchaseUserTemplate({
    orderId: order.orderId,
    customerName: order.customerName,
    totalAmount: order.totalAmount,
    eventDate: order.eventDate,
    rentalDate: order.rentalDate,
    fulfillmentType: order.fulfillmentType,
    venueAddress: order.venueAddress,
    items,
  });
  await sendNotificationEmail({ to: order.customerEmail, subject: customer.subject, text: customer.text, html: customer.html });

  const admin = getPurchaseAdminTemplate({
    orderId: order.orderId,
    customerName: order.customerName,
    customerEmail: order.customerEmail,
    customerPhone: order.customerPhone,
    totalAmount: order.totalAmount,
    eventDate: order.eventDate,
    rentalDate: order.rentalDate,
    fulfillmentType: order.fulfillmentType,
    deliveryFee: order.deliveryFee,
    venueAddress: order.venueAddress,
    specialNotes: order.specialNotes,
    items,
  });
  await sendNotificationEmail({ subject: admin.subject, text: admin.text, html: admin.html });
}

// ==========================================
// 1. COMPATIBILITY ENDPOINT: POST /bookings
// Maps the old single-package booking form onto orders / order_items
// ==========================================
router.post("/bookings", async (req, res) => {
  const { name, phone, email, pickupDate, returnDate, packageName, price, paymentMethod } = req.body;

  if (!name || !phone || !email || !pickupDate || !returnDate || !packageName || price === undefined || !paymentMethod) {
    return res.status(400).json({ error: "Missing required booking details" });
  }

  const conn = await db.getConnection();
  let orderId;
  try {
    await conn.beginTransaction();
    const userId = await findOrCreateUser(conn, email, name);

    const [result] = await conn.query(
      `INSERT INTO orders (user_id, customer_name, customer_email, customer_phone, event_date, rental_date, fulfillment_type, delivery_fee, venue_address, special_notes, total_amount, status)
       VALUES (?, ?, ?, ?, ?, ?, 'pickup', 0.00, 'Customer Pickup', ?, ?, 'ordered')`,
      [userId, name, email, phone, returnDate, pickupDate, `Legacy endpoint. Payment: ${paymentMethod}`, price]
    );
    orderId = result.insertId;

    // Link the package when one with this name exists.
    await conn.query(
      `INSERT INTO order_items (order_id, item_id, package_id, quantity, price_at_rent)
       VALUES (?, NULL, (SELECT id FROM packages WHERE name = ? LIMIT 1), 1, ?)`,
      [orderId, packageName, price]
    );
    await conn.commit();
  } catch (err) {
    await conn.rollback();
    console.error("Booking creation error:", err);
    return res.status(500).json({ error: "Failed to submit booking" });
  } finally {
    conn.release();
  }

  await sendOrderEmails(
    {
      orderId,
      customerName: name,
      customerEmail: email,
      customerPhone: phone,
      totalAmount: price,
      eventDate: returnDate,
      rentalDate: pickupDate,
      fulfillmentType: "pickup",
      deliveryFee: 0.0,
      venueAddress: "Customer Pickup",
      specialNotes: `Legacy endpoint booking. Payment Method: ${paymentMethod}`,
    },
    [{ package_name: packageName, quantity: 1, price }]
  );

  res.status(201).json({ success: true, bookingId: orderId, message: "Booking registered successfully" });
});

// ==========================================
// 2. CART ENDPOINTS (authenticated)
// ==========================================

// GET the signed-in customer's saved cart
router.get("/cart", auth, async (req, res) => {
  try {
    const [cartRows] = await db.query(
      `SELECT uc.id, uc.quantity, uc.item_id, uc.package_id,
              uc.pickup_date, uc.return_date,
              i.name AS item_name, i.title AS item_title, i.image AS item_image,
              i.description AS item_description, i.categoryId AS item_categoryId,
              i.price AS item_price,
              p.name AS package_name, p.price AS package_price, p.category_id AS package_category_id
       FROM user_cart uc
       LEFT JOIN items i ON uc.item_id = i.id
       LEFT JOIN packages p ON uc.package_id = p.id
       WHERE uc.user_id = ?
       ORDER BY uc.created_at ASC`,
      [req.user.id]
    );
    res.json(cartRows);
  } catch (err) {
    console.error("Error fetching cart:", err);
    res.status(500).json({ error: "Failed to fetch cart" });
  }
});

// POST — add a line to the cart
router.post("/cart", auth, async (req, res) => {
  const { item_id, package_id, quantity, pickup_date, return_date } = req.body;
  const qty = parseInt(quantity, 10) || 1;

  if (!item_id && !package_id) {
    return res.status(400).json({ error: "Either item_id or package_id is required" });
  }

  try {
    const [result] = await db.query(
      `INSERT INTO user_cart (user_id, item_id, package_id, quantity, pickup_date, return_date)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [req.user.id, item_id || null, package_id || null, qty, pickup_date || null, return_date || null]
    );
    res.status(201).json({ success: true, id: result.insertId, message: "Cart updated successfully" });
  } catch (err) {
    console.error("Error updating cart:", err);
    res.status(500).json({ error: "Failed to update cart" });
  }
});

// PUT — change the quantity on a cart line
router.put("/cart/line/:id", auth, async (req, res) => {
  const qty = parseInt(req.body.quantity, 10);
  if (!qty || qty < 1) {
    return res.status(400).json({ error: "Valid quantity (>= 1) is required" });
  }

  try {
    const [result] = await db.query("UPDATE user_cart SET quantity = ? WHERE id = ? AND user_id = ?", [
      qty,
      req.params.id,
      req.user.id,
    ]);
    if (result.affectedRows === 0) return res.status(404).json({ error: "Cart line not found" });
    res.json({ success: true, message: "Cart line updated" });
  } catch (err) {
    console.error("Error updating cart line:", err);
    res.status(500).json({ error: "Failed to update cart line" });
  }
});

// DELETE one cart line by row id
router.delete("/cart/line/:id", auth, async (req, res) => {
  try {
    const [result] = await db.query("DELETE FROM user_cart WHERE id = ? AND user_id = ?", [req.params.id, req.user.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: "Cart line not found" });
    res.json({ success: true, message: "Cart line removed" });
  } catch (err) {
    res.status(500).json({ error: "Failed to remove cart line" });
  }
});

// DELETE every line for one item
router.delete("/cart/item/:itemId", auth, async (req, res) => {
  try {
    await db.query("DELETE FROM user_cart WHERE user_id = ? AND item_id = ?", [req.user.id, req.params.itemId]);
    res.json({ success: true, message: "Item removed from cart" });
  } catch (err) {
    res.status(500).json({ error: "Failed to remove item" });
  }
});

// DELETE every line for one package
router.delete("/cart/package/:packageId", auth, async (req, res) => {
  try {
    await db.query("DELETE FROM user_cart WHERE user_id = ? AND package_id = ?", [req.user.id, req.params.packageId]);
    res.json({ success: true, message: "Package removed from cart" });
  } catch (err) {
    res.status(500).json({ error: "Failed to remove package" });
  }
});

// DELETE — clear the whole cart
router.delete("/cart", auth, async (req, res) => {
  try {
    await db.query("DELETE FROM user_cart WHERE user_id = ?", [req.user.id]);
    res.json({ success: true, message: "Cart cleared" });
  } catch (err) {
    res.status(500).json({ error: "Failed to clear cart" });
  }
});

// ==========================================
// 3. ORDER ENDPOINTS
// ==========================================

/**
 * Checks every item line against stock and existing bookings.
 *
 * Two IN queries cover the whole order (previously two queries per line).
 * Lines of the same order are counted against each other as well, so asking
 * for the same item twice cannot overbook it.
 */
async function assertStockAvailable(conn, lines) {
  const itemIds = [...new Set(lines.filter((l) => l.item_id).map((l) => String(l.item_id)))];
  if (itemIds.length === 0) return;

  // FOR UPDATE serialises concurrent checkouts of the same items.
  const [stockRows] = await conn.query("SELECT id, unit_count, isAvailable FROM items WHERE id IN (?) FOR UPDATE", [itemIds]);
  const stockById = new Map(stockRows.map((row) => [String(row.id), row]));

  const [bookingRows] = await conn.query(
    `SELECT oi.item_id, oi.quantity,
            COALESCE(oi.pickup_date, o.rental_date) AS pickup_date,
            COALESCE(oi.return_date, o.event_date)  AS return_date
       FROM order_items oi
       INNER JOIN orders o ON o.id = oi.order_id
      WHERE oi.item_id IN (?) AND o.status IN (?)`,
    [itemIds, ACTIVE_ORDER_STATUSES]
  );

  const bookingsByItem = new Map(itemIds.map((id) => [id, []]));
  for (const row of bookingRows) {
    bookingsByItem.get(String(row.item_id))?.push({
      pickupDate: formatDateRow(row.pickup_date),
      returnDate: formatDateRow(row.return_date),
      quantity: parseInt(row.quantity, 10) || 0,
    });
  }

  for (const line of lines) {
    if (!line.item_id) continue;
    const id = String(line.item_id);
    const stock = stockById.get(id);
    if (!stock) throw new OrderError(400, `Item ${id} not found`);

    const totalStock = Math.max(0, parseInt(stock.unit_count, 10) || 0);
    if (!stock.isAvailable || totalStock <= 0) {
      throw new OrderError(400, `Item ${id} is not available for rent`);
    }

    const bookings = bookingsByItem.get(id);
    if (!canRentQuantity(bookings, line.pickup_date, line.return_date, line.quantity, totalStock)) {
      throw new OrderError(409, `Not enough stock for ${id} on the selected dates (requested ${line.quantity})`);
    }
    bookings.push({ pickupDate: line.pickup_date, returnDate: line.return_date, quantity: line.quantity });
  }
}

// POST — place a new order (signed-in or guest)
router.post("/orders", optionalAuth, async (req, res) => {
  const {
    customer_name,
    customer_email,
    customer_phone,
    event_date,
    rental_date,
    fulfillment_type,
    delivery_fee,
    venue_address,
    special_notes,
    total_amount,
    items,
  } = req.body;

  if (!customer_name || !customer_email || !customer_phone || !event_date || !rental_date || total_amount === undefined || !items || !Array.isArray(items)) {
    return res.status(400).json({ error: "Missing required order checkout details" });
  }

  // Each line falls back to the order-level rental window.
  const lines = items.map((item) => ({
    item_id: item.item_id || null,
    package_id: item.package_id || null,
    quantity: parseInt(item.quantity, 10) || 1,
    price: item.price || 0.0,
    pickup_date: String(item.pickup_date || rental_date).slice(0, 10),
    return_date: String(item.return_date || event_date).slice(0, 10),
  }));

  const conn = await db.getConnection();
  let orderId;
  try {
    // One transaction: a rejected line no longer leaves a half-written order behind.
    await conn.beginTransaction();

    const userId = req.user?.id || (await findOrCreateUser(conn, customer_email, customer_name));
    await assertStockAvailable(conn, lines);

    const [result] = await conn.query(
      `INSERT INTO orders (user_id, customer_name, customer_email, customer_phone, event_date, rental_date, fulfillment_type, delivery_fee, venue_address, special_notes, total_amount, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'ordered')`,
      [
        userId,
        customer_name,
        customer_email,
        customer_phone,
        event_date,
        rental_date,
        fulfillment_type || "pickup",
        delivery_fee || 0.0,
        venue_address || "Customer Pickup",
        special_notes || null,
        total_amount,
      ]
    );
    orderId = result.insertId;

    if (lines.length > 0) {
      // Single multi-row insert instead of one INSERT per line.
      await conn.query(
        "INSERT INTO order_items (order_id, item_id, package_id, quantity, price_at_rent, pickup_date, return_date) VALUES ?",
        [lines.map((l) => [orderId, l.item_id, l.package_id, l.quantity, l.price, l.pickup_date, l.return_date])]
      );
    }

    await conn.query("DELETE FROM user_cart WHERE user_id = ?", [userId]);
    await conn.commit();
  } catch (err) {
    await conn.rollback();
    if (err instanceof OrderError) return res.status(err.status).json({ error: err.message });
    console.error("Error creating order:", err);
    return res.status(500).json({ error: "Failed to place order" });
  } finally {
    conn.release();
  }

  // Emails go out after the commit so a slow SMTP server never holds row locks.
  await sendOrderEmails(
    {
      orderId,
      customerName: customer_name,
      customerEmail: customer_email,
      customerPhone: customer_phone,
      totalAmount: total_amount,
      eventDate: event_date,
      rentalDate: rental_date,
      fulfillmentType: fulfillment_type || "pickup",
      deliveryFee: delivery_fee || 0.0,
      venueAddress: venue_address || "Customer Pickup",
      specialNotes: special_notes || null,
    },
    items
  );

  res.status(201).json({ success: true, orderId, message: "Order placed successfully" });
});

/**
 * GET — the signed-in customer's orders, newest first.
 * `?include=items` embeds each order's lines (one extra IN query in total),
 * so clients no longer need a request per order.
 */
router.get("/orders", auth, async (req, res) => {
  try {
    const [orders] = await db.query(
      `SELECT ${ORDER_COLUMNS} FROM orders WHERE user_id = ? OR customer_email = ? ORDER BY created_at DESC, id DESC`,
      [req.user.id, req.user.email]
    );

    if (req.query.include !== "items" || orders.length === 0) return res.json(orders);

    const [itemRows] = await db.query(`${ORDER_ITEM_SELECT} WHERE oi.order_id IN (?)`, [orders.map((o) => o.id)]);
    const itemsByOrder = new Map(orders.map((o) => [o.id, []]));
    for (const { order_id, ...item } of itemRows) itemsByOrder.get(order_id)?.push(item);

    res.json(orders.map((order) => ({ ...order, items: itemsByOrder.get(order.id) })));
  } catch (err) {
    console.error("Error fetching orders:", err);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

// GET — one of the customer's orders with its lines
router.get("/orders/:id", auth, async (req, res) => {
  try {
    const [orders] = await db.query(
      `SELECT ${ORDER_COLUMNS} FROM orders WHERE id = ? AND (user_id = ? OR customer_email = ?)`,
      [req.params.id, req.user.id, req.user.email]
    );
    if (orders.length === 0) return res.status(404).json({ error: "Order not found" });

    const [itemRows] = await db.query(`${ORDER_ITEM_SELECT} WHERE oi.order_id = ?`, [orders[0].id]);
    res.json({ ...orders[0], items: itemRows.map(({ order_id, ...item }) => item) });
  } catch (err) {
    console.error("Error fetching order details:", err);
    res.status(500).json({ error: "Failed to fetch order details" });
  }
});

// ==========================================
// 4. REVIEWS
// ==========================================

// GET — the three most recent verified reviews (public)
router.get("/reviews", async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT id, order_id, user_id, customer_name, role, rating, comment, created_at FROM reviews WHERE order_id IS NOT NULL ORDER BY created_at DESC LIMIT 3"
    );
    res.json(rows);
  } catch (err) {
    console.error("Error fetching reviews:", err);
    res.status(500).json({ error: "Failed to fetch reviews" });
  }
});

// POST — review a returned order (authenticated)
router.post("/reviews", auth, async (req, res) => {
  const userId = req.user.id;
  const { order_id, rating, comment, role } = req.body;

  if (!order_id || !rating || !comment) {
    return res.status(400).json({ error: "Order ID, rating (1-5), and comment are required" });
  }

  const rate = parseInt(rating, 10);
  if (isNaN(rate) || rate < 1 || rate > 5) {
    return res.status(400).json({ error: "Rating must be an integer between 1 and 5" });
  }

  try {
    // The order must belong to this customer; the LEFT JOIN tells us in the
    // same query whether it has already been reviewed.
    const [orders] = await db.query(
      `SELECT o.status, o.customer_name, r.id AS review_id
         FROM orders o
         LEFT JOIN reviews r ON r.order_id = o.id
        WHERE o.id = ? AND (o.user_id = ? OR o.customer_email = ?)`,
      [order_id, userId, req.user.email]
    );

    if (orders.length === 0) {
      return res.status(404).json({ error: "Order not found or access denied" });
    }

    const order = orders[0];
    if (order.status !== "returned") {
      return res.status(400).json({ error: "You can only write a review after the order is returned" });
    }
    if (order.review_id) {
      return res.status(400).json({ error: "You have already submitted a review for this order" });
    }

    const [result] = await db.query(
      "INSERT INTO reviews (order_id, user_id, customer_name, role, rating, comment) VALUES (?, ?, ?, ?, ?, ?)",
      [order_id, userId, order.customer_name || req.user.name || "Verified Client", role || "Client", rate, comment]
    );

    res.status(201).json({ success: true, reviewId: result.insertId, message: "Review submitted successfully" });
  } catch (err) {
    console.error("Error creating review:", err);
    res.status(500).json({ error: "Failed to submit review" });
  }
});

module.exports = router;
