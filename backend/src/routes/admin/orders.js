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
                 COALESCE(oi.package_id, ''),
                 COALESCE(oi.returned_quantity, 0),
                 oi.id
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
            const [name, quantity, price, image, item_id, package_id, returned_quantity, order_item_id] = entry.split("||");
            return {
              name,
              quantity: Number(quantity),
              price: parseFloat(price),
              image,
              item_id,
              package_id,
              returned_quantity: Number(returned_quantity || 0),
              order_item_id: Number(order_item_id)
            };
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
      `SELECT oi.id, oi.id AS order_item_id, oi.quantity, oi.returned_quantity, oi.price_at_rent, oi.item_id, oi.package_id,
              COALESCE(i.title, p.name, 'Unknown Item') AS name,
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
  const allowed = ['pending', 'confirmed', 'ordered', 'on_hand', 'returned', 'cancelled'];
  if (!status || !allowed.includes(status)) {
    return res.status(400).json({ error: `Valid status (${allowed.join(', ')}) is required` });
  }

  try {
    // If status is updated to 'returned', automatically set returned_quantity = quantity for all items
    if (status === 'returned') {
      await db.query("UPDATE order_items SET returned_quantity = quantity WHERE order_id = ?", [req.params.id]);
    }

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

// PUT update returned quantity for a specific order item unit-by-unit
router.put("/:orderId/items/:orderItemId/return", async (req, res) => {
  const { orderId, orderItemId } = req.params;
  const { returned_quantity } = req.body;

  if (returned_quantity === undefined || returned_quantity < 0) {
    return res.status(400).json({ error: "Valid returned_quantity is required" });
  }

  try {
    // 1. Update the returned quantity for the specific order item
    const [result] = await db.query(
      "UPDATE order_items SET returned_quantity = ? WHERE id = ? AND order_id = ?",
      [returned_quantity, orderItemId, orderId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Order item not found" });
    }

    // 2. Fetch all items in the order to check if we should auto-transition status
    const [items] = await db.query(
      "SELECT quantity, returned_quantity FROM order_items WHERE order_id = ?",
      [orderId]
    );

    let allReturned = true;
    let anyReturned = false;
    for (const item of items) {
      if (item.returned_quantity < item.quantity) {
        allReturned = false;
      }
      if (item.returned_quantity > 0) {
        anyReturned = true;
      }
    }

    // Fetch current order status
    const [orders] = await db.query("SELECT status FROM orders WHERE id = ?", [orderId]);
    if (orders.length > 0) {
      const currentStatus = orders[0].status;
      let newStatus = currentStatus;

      if (allReturned) {
        newStatus = "returned";
      } else if (anyReturned && (currentStatus === "ordered" || currentStatus === "pending" || currentStatus === "confirmed")) {
        // If some items are returned and status was 'ordered', update it to 'on_hand'
        newStatus = "on_hand";
      } else if (!allReturned && currentStatus === "returned") {
        // If it was returned but now we decremented returned count, set it back to 'on_hand'
        newStatus = "on_hand";
      }

      if (newStatus !== currentStatus) {
        await db.query("UPDATE orders SET status = ? WHERE id = ?", [newStatus, orderId]);
      }
    }

    res.json({ success: true, message: "Returned quantity updated successfully" });
  } catch (err) {
    console.error("Error updating returned quantity:", err);
    res.status(500).json({ error: "Failed to update returned quantity" });
  }
});

module.exports = router;
