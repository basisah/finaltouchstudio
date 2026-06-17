const express = require("express");
const router = express.Router();
const db = require("../db");
const auth = require("../middleware/auth");
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
       VALUES (?, ?, ?, ?, ?, ?, 'pickup', 0.00, 'Customer Pickup', ?, ?, 'pending')`,
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

router.get("/contact", auth, async (req, res) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ error: "Access denied. Admin role required." });
  }

  try {
    const [rows] = await db.query(`
      SELECT
        id,
        name,
        email,
        occasion,
        message,
        DATE_FORMAT(created_at, '%Y-%m-%d %H:%i') AS date
      FROM enquiries
      ORDER BY created_at DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error("Error fetching enquiries:", err);
    res.status(500).json({ error: "Failed to fetch enquiries" });
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
              i.name AS item_name, i.image AS item_image, i.description AS item_description,
              p.name AS package_name, p.price AS package_price
       FROM user_cart uc
       LEFT JOIN items i ON uc.item_id = i.id
       LEFT JOIN packages p ON uc.package_id = p.id
       WHERE uc.user_id = ?`,
      [userId]
    );
    res.json(cartRows);
  } catch (err) {
    console.error("Error fetching cart:", err);
    res.status(500).json({ error: "Failed to fetch cart" });
  }
});

// POST - Add/update item or package in cart
router.post("/cart", auth, async (req, res) => {
  const userId = req.user.id;
  const { item_id, package_id, quantity } = req.body;
  const qty = parseInt(quantity, 10) || 1;

  if (!item_id && !package_id) {
    return res.status(400).json({ error: "Either item_id or package_id is required" });
  }

  try {
    if (item_id) {
      const [existing] = await db.query("SELECT id, quantity FROM user_cart WHERE user_id = ? AND item_id = ?", [userId, item_id]);
      if (existing.length > 0) {
        const newQty = existing[0].quantity + qty;
        await db.query("UPDATE user_cart SET quantity = ? WHERE id = ?", [newQty, existing[0].id]);
      } else {
        await db.query("INSERT INTO user_cart (user_id, item_id, quantity) VALUES (?, ?, ?)", [userId, item_id, qty]);
      }
    } else {
      const [existing] = await db.query("SELECT id, quantity FROM user_cart WHERE user_id = ? AND package_id = ?", [userId, package_id]);
      if (existing.length > 0) {
        const newQty = existing[0].quantity + qty;
        await db.query("UPDATE user_cart SET quantity = ? WHERE id = ?", [newQty, existing[0].id]);
      } else {
        await db.query("INSERT INTO user_cart (user_id, package_id, quantity) VALUES (?, ?, ?)", [userId, package_id, qty]);
      }
    }
    res.json({ success: true, message: "Cart updated successfully" });
  } catch (err) {
    console.error("Error updating cart:", err);
    res.status(500).json({ error: "Failed to update cart" });
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

// POST - Place a new order
router.post("/orders", auth, async (req, res) => {
  const userId = req.user.id;
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
    // 1. Insert order record
    const [result] = await db.query(
      `INSERT INTO orders (user_id, customer_name, customer_email, customer_phone, event_date, rental_date, fulfillment_type, delivery_fee, venue_address, special_notes, total_amount, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
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

    // 2. Insert itemized details
    for (const item of items) {
      await db.query(
        "INSERT INTO order_items (order_id, item_id, package_id, quantity, price_at_rent) VALUES (?, ?, ?, ?, ?)",
        [orderId, item.item_id || null, item.package_id || null, item.quantity || 1, item.price || 0.00]
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
    const [orders] = await db.query("SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC", [req.user.id]);
    res.json(orders);
  } catch (err) {
    console.error("Error fetching orders:", err);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

// GET - User gets single order details
router.get("/orders/:id", auth, async (req, res) => {
  try {
    const [orders] = await db.query("SELECT * FROM orders WHERE id = ? AND user_id = ?", [req.params.id, req.user.id]);
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

module.exports = router;
