const express = require("express");
const router = express.Router();
const db = require("../../db");
const auth = require("../../middleware/auth");
const { sendNotificationEmail } = require("../../utils/mailer");
const getOrderStatusUserTemplate = require("../../emailservices/orderStatusUser");

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

// GET all orders with their items
router.get("/", async (req, res) => {
  try {
    const [orders] = await db.query(`
      SELECT o.*,
             GROUP_CONCAT(
               CONCAT_WS('||',
                 COALESCE(i.title, p.name, 'Unknown Item'),
                 oi.quantity,
                 oi.price_at_rent,
                 COALESCE(i.image, ''),
                 COALESCE(oi.item_id, ''),
                 COALESCE(oi.package_id, '')
               ) SEPARATOR ';;'
             ) AS items_summary
      FROM orders o
      LEFT JOIN order_items oi ON oi.order_id = o.id
      LEFT JOIN items i ON oi.item_id = i.id
      LEFT JOIN packages p ON oi.package_id = p.id
      GROUP BY o.id
      ORDER BY o.created_at DESC
    `);

    // Parse the items_summary string back into structured arrays
    const parsed = orders.map(order => {
      const rawItems = order.items_summary || "";
      const items = rawItems
        ? rawItems.split(";;").map(entry => {
            const [name, quantity, price, image, item_id, package_id] = entry.split("||");
            return { name, quantity: Number(quantity), price: parseFloat(price), image, item_id, package_id };
          })
        : [];
      const { items_summary, ...rest } = order;
      return { ...rest, items };
    });

    res.json(parsed);
  } catch (err) {
    console.error("Error fetching orders:", err);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

// GET single order details
router.get("/:id", async (req, res) => {
  try {
    const [orders] = await db.query("SELECT * FROM orders WHERE id = ?", [req.params.id]);
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

// PUT update order status
router.put("/:id/status", async (req, res) => {
  const { status } = req.body;
  if (!status || !['pending', 'confirmed', 'cancelled'].includes(status)) {
    return res.status(400).json({ error: "Valid status ('pending', 'confirmed', 'cancelled') is required" });
  }

  try {
    const [result] = await db.query("UPDATE orders SET status = ? WHERE id = ?", [status, req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: "Order not found" });

    // Fetch order to get user details
    const [orders] = await db.query("SELECT * FROM orders WHERE id = ?", [req.params.id]);
    const order = orders[0];

    // Notify customer about status change
    const emailData = getOrderStatusUserTemplate({
      orderId: order.id,
      customerName: order.customer_name,
      status: status,
      eventDate: order.event_date,
      fulfillmentType: order.fulfillment_type
    });

    await sendNotificationEmail({
      to: order.customer_email,
      subject: emailData.subject,
      text: emailData.text,
      html: emailData.html
    });

    res.json({ success: true, message: `Order status updated to ${status}` });
  } catch (err) {
    console.error("Error updating order status:", err);
    res.status(500).json({ error: "Failed to update order status" });
  }
});

module.exports = router;
