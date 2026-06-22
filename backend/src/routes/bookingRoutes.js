const express = require("express");
const router = express.Router();
const db = require("../db");
const auth = require("../middleware/auth");
const optionalAuth = require("../middleware/optionalAuth");
const { canRentQuantity } = require("../utils/rentalAvailability");
const { sendNotificationEmail } = require("../utils/mailer");
const getPurchaseUserTemplate = require("../emailservices/purchaseUser");
const getPurchaseAdminTemplate = require("../emailservices/purchaseAdmin");
const getEnquiryAdminTemplate = require("../emailservices/enquiryAdmin");

// ==========================================
// 1. COMPATIBILITY ENDPOINT: POST /bookings
// Maps the old bookings structure to new orders/order_items schema
// ==========================================
router.post("/bookings", async (req, res) => {
  const { name, phone, email, pickupDate, returnDate, packageName, price, paymentMethod } = req.body;

  if (!name || !phone || !email || !pickupDate || !returnDate || !packageName || price === undefined || !paymentMethod) {
    return res.status(400).json({ error: "Missing required booking details" });
  }

  try {
    // Check if user exists, otherwise create a guest user
    let [userRows] = await db.query("SELECT id FROM users WHERE email = ?", [email]);
    let userId;
    if (userRows.length === 0) {
      const [insertUser] = await db.query(
        "INSERT INTO users (email, name, role) VALUES (?, ?, 'user')",
        [email, name]
      );
      userId = insertUser.insertId;
    } else {
      userId = userRows[0].id;
    }

    // Insert into orders table
    const [result] = await db.query(
      `INSERT INTO orders (user_id, customer_name, customer_email, customer_phone, event_date, rental_date, fulfillment_type, delivery_fee, venue_address, special_notes, total_amount, status)
       VALUES (?, ?, ?, ?, ?, ?, 'pickup', 0.00, 'Customer Pickup', ?, ?, 'ordered')`,
      [userId, name, email, phone, returnDate, pickupDate, `Legacy endpoint. Payment: ${paymentMethod}`, price]
    );

    const orderId = result.insertId;

    // Find if package exists, otherwise insert empty package relation
    const [pkgRows] = await db.query("SELECT id FROM packages WHERE name = ?", [packageName]);
    const packageId = pkgRows.length > 0 ? pkgRows[0].id : null;

    await db.query(
      "INSERT INTO order_items (order_id, item_id, package_id, quantity, price_at_rent) VALUES (?, NULL, ?, 1, ?)",
      [orderId, packageId, price]
    );

    const itemsList = [{ package_name: packageName, quantity: 1, price: price }];

    // Send Welcome/Receipt Email to Customer
    const customerEmailData = getPurchaseUserTemplate({
      orderId,
      customerName: name,
      totalAmount: price,
      eventDate: returnDate,
      rentalDate: pickupDate,
      fulfillmentType: 'pickup',
      venueAddress: 'Customer Pickup',
      items: itemsList
    });
    await sendNotificationEmail({
      to: email,
      subject: customerEmailData.subject,
      text: customerEmailData.text,
      html: customerEmailData.html
    });

    // Send Admin Notification Email
    const adminEmailData = getPurchaseAdminTemplate({
      orderId,
      customerName: name,
      customerEmail: email,
      customerPhone: phone,
      totalAmount: price,
      eventDate: returnDate,
      rentalDate: pickupDate,
      fulfillmentType: 'pickup',
      deliveryFee: 0.00,
      venueAddress: 'Customer Pickup',
      specialNotes: `Legacy endpoint booking. Payment Method: ${paymentMethod}`,
      items: itemsList
    });
    await sendNotificationEmail({
      subject: adminEmailData.subject,
      text: adminEmailData.text,
      html: adminEmailData.html
    });

    res.status(201).json({ success: true, bookingId: orderId, message: "Booking registered successfully" });
  } catch (err) {
    console.error("Booking creation error:", err);
    res.status(500).json({ error: "Failed to submit booking" });
  }
});

// ==========================================
// 2. CONTACT ENQUIRY ENDPOINT: POST /contact
// ==========================================
router.post("/contact", async (req, res) => {
  const { name, email, occasion, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: "Name, email, and message are required" });
  }

  try {
    const [result] = await db.query(
      "INSERT INTO enquiries (name, email, occasion, message) VALUES (?, ?, ?, ?)",
      [name, email, occasion || "Not Specified", message]
    );

    const enquiryId = result.insertId;

    const emailData = getEnquiryAdminTemplate({ enquiryId, name, email, occasion, message });
    await sendNotificationEmail({
      subject: emailData.subject,
      text: emailData.text,
      html: emailData.html
    });

    res.status(201).json({ success: true, enquiryId, message: "Enquiry submitted successfully" });
  } catch (err) {
    console.error("Enquiry submission error:", err);
    res.status(500).json({ error: "Failed to submit enquiry" });
  }
});

// ==========================================
// 3. CART SYSTEM ENDPOINTS (Authenticated)
// ==========================================

// GET user's cart
router.get("/cart", auth, async (req, res) => {
  try {
    const userId = req.user.id;
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
      [userId]
    );
    res.json(cartRows);
  } catch (err) {
    console.error("Error fetching cart:", err);
    res.status(500).json({ error: "Failed to fetch cart" });
  }
});

// POST - Add a line to cart (each add creates a new row, matching frontend behaviour)
router.post("/cart", auth, async (req, res) => {
  const userId = req.user.id;
  const { item_id, package_id, quantity, pickup_date, return_date } = req.body;
  const qty = parseInt(quantity, 10) || 1;

  if (!item_id && !package_id) {
    return res.status(400).json({ error: "Either item_id or package_id is required" });
  }

  try {
    const [result] = await db.query(
      `INSERT INTO user_cart (user_id, item_id, package_id, quantity, pickup_date, return_date)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        userId,
        item_id || null,
        package_id || null,
        qty,
        pickup_date || null,
        return_date || null,
      ]
    );
    res.status(201).json({ success: true, id: result.insertId, message: "Cart updated successfully" });
  } catch (err) {
    console.error("Error updating cart:", err);
    res.status(500).json({ error: "Failed to update cart" });
  }
});

// PUT - Update quantity on a cart line
router.put("/cart/line/:id", auth, async (req, res) => {
  const qty = parseInt(req.body.quantity, 10);
  if (!qty || qty < 1) {
    return res.status(400).json({ error: "Valid quantity (>= 1) is required" });
  }

  try {
    const [result] = await db.query(
      "UPDATE user_cart SET quantity = ? WHERE id = ? AND user_id = ?",
      [qty, req.params.id, req.user.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Cart line not found" });
    }
    res.json({ success: true, message: "Cart line updated" });
  } catch (err) {
    console.error("Error updating cart line:", err);
    res.status(500).json({ error: "Failed to update cart line" });
  }
});

// DELETE single cart line by row id
router.delete("/cart/line/:id", auth, async (req, res) => {
  try {
    const [result] = await db.query(
      "DELETE FROM user_cart WHERE id = ? AND user_id = ?",
      [req.params.id, req.user.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Cart line not found" });
    }
    res.json({ success: true, message: "Cart line removed" });
  } catch (err) {
    res.status(500).json({ error: "Failed to remove cart line" });
  }
});

// DELETE single item from cart
router.delete("/cart/item/:itemId", auth, async (req, res) => {
  try {
    await db.query("DELETE FROM user_cart WHERE user_id = ? AND item_id = ?", [req.user.id, req.params.itemId]);
    res.json({ success: true, message: "Item removed from cart" });
  } catch (err) {
    res.status(500).json({ error: "Failed to remove item" });
  }
});

// DELETE single package from cart
router.delete("/cart/package/:packageId", auth, async (req, res) => {
  try {
    await db.query("DELETE FROM user_cart WHERE user_id = ? AND package_id = ?", [req.user.id, req.params.packageId]);
    res.json({ success: true, message: "Package removed from cart" });
  } catch (err) {
    res.status(500).json({ error: "Failed to remove package" });
  }
});

// DELETE - Clear entire cart
router.delete("/cart", auth, async (req, res) => {
  try {
    await db.query("DELETE FROM user_cart WHERE user_id = ?", [req.user.id]);
    res.json({ success: true, message: "Cart cleared" });
  } catch (err) {
    res.status(500).json({ error: "Failed to clear cart" });
  }
});

// ==========================================
// 4. ORDER MANAGEMENT ENDPOINTS (Authenticated)
// ==========================================

async function resolveOrderUserId(req, customer_email, customer_name) {
  if (req.user?.id) {
    return req.user.id;
  }

  const [userRows] = await db.query("SELECT id FROM users WHERE email = ?", [customer_email]);
  if (userRows.length > 0) {
    return userRows[0].id;
  }

  const [insertUser] = await db.query(
    "INSERT INTO users (email, name, role) VALUES (?, ?, 'user')",
    [customer_email, customer_name]
  );
  return insertUser.insertId;
}

// POST - Place a new order (authenticated or guest)
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
    items
  } = req.body;

  if (!customer_name || !customer_email || !customer_phone || !event_date || !rental_date || total_amount === undefined || !items || !Array.isArray(items)) {
    return res.status(400).json({ error: "Missing required order checkout details" });
  }

  try {
    const userId = await resolveOrderUserId(req, customer_email, customer_name);

    // 1. Insert order record
    const [result] = await db.query(
      `INSERT INTO orders (user_id, customer_name, customer_email, customer_phone, event_date, rental_date, fulfillment_type, delivery_fee, venue_address, special_notes, total_amount, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'ordered')`,
      [
        userId,
        customer_name,
        customer_email,
        customer_phone,
        event_date,
        rental_date,
        fulfillment_type || 'pickup',
        delivery_fee || 0.00,
        venue_address || 'Customer Pickup',
        special_notes || null,
        total_amount
      ]
    );

    const orderId = result.insertId;

    // 2. Insert itemized details (with per-item rental dates when provided)
    for (const item of items) {
      const itemPickup = item.pickup_date || rental_date;
      const itemReturn = item.return_date || event_date;

      if (item.item_id) {
        const [stockRows] = await db.query(
          "SELECT unit_count, isAvailable FROM items WHERE id = ?",
          [item.item_id]
        );
        if (stockRows.length === 0) {
          return res.status(400).json({ error: `Item ${item.item_id} not found` });
        }
        const totalStock = Math.max(0, parseInt(stockRows[0].unit_count, 10) || 0);
        if (!stockRows[0].isAvailable || totalStock <= 0) {
          return res.status(400).json({ error: `Item ${item.item_id} is not available for rent` });
        }

        const [existing] = await db.query(
          `SELECT oi.quantity,
                  COALESCE(oi.pickup_date, o.rental_date) AS pickup_date,
                  COALESCE(oi.return_date, o.event_date) AS return_date
           FROM order_items oi
           INNER JOIN orders o ON o.id = oi.order_id
           WHERE oi.item_id = ?
             AND o.status IN ('pending', 'confirmed')`,
          [item.item_id]
        );

        const bookings = existing.map((row) => ({
          pickupDate: String(row.pickup_date).slice(0, 10),
          returnDate: String(row.return_date).slice(0, 10),
          quantity: parseInt(row.quantity, 10) || 0,
        }));

        const qty = parseInt(item.quantity, 10) || 1;
        if (!canRentQuantity(bookings, itemPickup, itemReturn, qty, totalStock)) {
          return res.status(409).json({
            error: `Not enough stock for ${item.item_id} on the selected dates (requested ${qty})`,
          });
        }
      }

      await db.query(
        `INSERT INTO order_items (order_id, item_id, package_id, quantity, price_at_rent, pickup_date, return_date)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          orderId,
          item.item_id || null,
          item.package_id || null,
          item.quantity || 1,
          item.price || 0.0,
          itemPickup,
          itemReturn,
        ]
      );
    }

    // 3. Clear user's cart
    await db.query("DELETE FROM user_cart WHERE user_id = ?", [userId]);

    // Send Welcome/Receipt Email to Customer
    const customerEmailData = getPurchaseUserTemplate({
      orderId,
      customerName: customer_name,
      totalAmount: total_amount,
      eventDate: event_date,
      rentalDate: rental_date,
      fulfillmentType: fulfillment_type || 'pickup',
      venueAddress: venue_address || 'Customer Pickup',
      items
    });
    await sendNotificationEmail({
      to: customer_email,
      subject: customerEmailData.subject,
      text: customerEmailData.text,
      html: customerEmailData.html
    });

    // Send Admin Notification Email
    const adminEmailData = getPurchaseAdminTemplate({
      orderId,
      customerName: customer_name,
      customerEmail: customer_email,
      customerPhone: customer_phone,
      totalAmount: total_amount,
      eventDate: event_date,
      rentalDate: rental_date,
      fulfillmentType: fulfillment_type || 'pickup',
      deliveryFee: delivery_fee || 0.00,
      venueAddress: venue_address || 'Customer Pickup',
      specialNotes: special_notes || null,
      items
    });
    await sendNotificationEmail({
      subject: adminEmailData.subject,
      text: adminEmailData.text,
      html: adminEmailData.html
    });

    res.status(201).json({ success: true, orderId, message: "Order placed successfully" });
  } catch (err) {
    console.error("Error creating order:", err);
    res.status(500).json({ error: "Failed to place order" });
  }
});

// GET - User gets their own orders
router.get("/orders", auth, async (req, res) => {
  try {
    const [orders] = await db.query(
      "SELECT * FROM orders WHERE user_id = ? OR customer_email = ? ORDER BY created_at DESC",
      [req.user.id, req.user.email]
    );
    res.json(orders);
  } catch (err) {
    console.error("Error fetching orders:", err);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

// GET - User gets single order details
router.get("/orders/:id", auth, async (req, res) => {
  try {
    const [orders] = await db.query(
      "SELECT * FROM orders WHERE id = ? AND (user_id = ? OR customer_email = ?)",
      [req.params.id, req.user.id, req.user.email]
    );
    if (orders.length === 0) return res.status(404).json({ error: "Order not found" });

    const order = orders[0];
    const [items] = await db.query(
      `SELECT oi.id, oi.quantity, oi.price_at_rent, oi.item_id, oi.package_id,
              i.name AS item_name, i.image AS item_image,
              p.name AS package_name
       FROM order_items oi
       LEFT JOIN items i ON oi.item_id = i.id
       LEFT JOIN packages p ON oi.package_id = p.id
       WHERE oi.order_id = ?`,
      [order.id]
    );

    res.json({ ...order, items });
  } catch (err) {
    console.error("Error fetching order details:", err);
    res.status(500).json({ error: "Failed to fetch order details" });
  }
});

// GET - Fetch 3 recent real reviews (public)
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

// POST - Submit review for a returned order (authenticated)
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
    // 1. Verify that the order exists, has status 'returned', and belongs to this user (by user_id or email)
    const [orders] = await db.query(
      "SELECT * FROM orders WHERE id = ? AND (user_id = ? OR customer_email = ?)",
      [order_id, userId, req.user.email]
    );

    if (orders.length === 0) {
      return res.status(404).json({ error: "Order not found or access denied" });
    }

    const order = orders[0];
    if (order.status !== "returned") {
      return res.status(400).json({ error: "You can only write a review after the order is returned" });
    }

    // 2. Check if a review already exists for this order
    const [existing] = await db.query("SELECT id FROM reviews WHERE order_id = ?", [order_id]);
    if (existing.length > 0) {
      return res.status(400).json({ error: "You have already submitted a review for this order" });
    }

    // 3. Insert review
    const customerName = order.customer_name || req.user.name || "Verified Client";
    const clientRole = role || "Client";

    const [result] = await db.query(
      "INSERT INTO reviews (order_id, user_id, customer_name, role, rating, comment) VALUES (?, ?, ?, ?, ?, ?)",
      [order_id, userId, customerName, clientRole, rate, comment]
    );

    res.status(201).json({ success: true, reviewId: result.insertId, message: "Review submitted successfully" });
  } catch (err) {
    console.error("Error creating review:", err);
    res.status(500).json({ error: "Failed to submit review", message: err.message, stack: err.stack });
  }
});

module.exports = router;
