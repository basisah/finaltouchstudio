const express = require("express");
const router = express.Router();
const db = require("../../db");
const auth = require("../../middleware/auth");
const isAdmin = require("../../middleware/isAdmin");
const { ORDER_STATUSES } = require("../../constants/orderStatus");
const { sendNotificationEmail } = require("../../utils/mailer");
const getOrderStatusUserTemplate = require("../../emailservices/orderStatusUser");

const MAX_PAGE_SIZE = 500;

// All routes here are admin-only
router.use(auth, isAdmin);

/**
 * GET all orders with their lines, newest first.
 *
 * Two queries regardless of how many orders exist. The previous single-query
 * version packed the lines into GROUP_CONCAT, which MySQL silently truncates
 * at 1024 bytes — large orders lost items.
 *
 * Optional: ?status=… and ?limit=…&offset=… (adds an X-Total-Count header).
 */
router.get("/", async (req, res) => {
  try {
    const conditions = [];
    const params = [];
    if (req.query.status && ORDER_STATUSES.includes(req.query.status)) {
      conditions.push("status = ?");
      params.push(req.query.status);
    }
    const where = conditions.length ? ` WHERE ${conditions.join(" AND ")}` : "";

    let sql = `SELECT * FROM orders${where} ORDER BY created_at DESC, id DESC`;
    const queryParams = [...params];

    const limit = parseInt(req.query.limit, 10);
    if (Number.isInteger(limit) && limit > 0) {
      sql += " LIMIT ? OFFSET ?";
      queryParams.push(Math.min(limit, MAX_PAGE_SIZE), Math.max(0, parseInt(req.query.offset, 10) || 0));
      const [[{ total }]] = await db.query(`SELECT COUNT(*) AS total FROM orders${where}`, params);
      res.set("X-Total-Count", String(total));
      res.set("Access-Control-Expose-Headers", "X-Total-Count");
    }

    const [orders] = await db.query(sql, queryParams);
    if (orders.length === 0) return res.json([]);

    const [lines] = await db.query(
      `SELECT oi.order_id, oi.id AS order_item_id, oi.quantity, oi.price_at_rent,
              oi.item_id, oi.package_id, oi.returned_quantity,
              COALESCE(i.title, p.name, 'Unknown Item') AS name,
              COALESCE(i.image, '') AS image
         FROM order_items oi
         LEFT JOIN items i ON oi.item_id = i.id
         LEFT JOIN packages p ON oi.package_id = p.id
        WHERE oi.order_id IN (?)
        ORDER BY oi.id ASC`,
      [orders.map((order) => order.id)]
    );

    const linesByOrder = new Map(orders.map((order) => [order.id, []]));
    for (const line of lines) {
      linesByOrder.get(line.order_id)?.push({
        name: line.name,
        quantity: Number(line.quantity),
        price: parseFloat(line.price_at_rent),
        image: line.image,
        item_id: line.item_id == null ? "" : String(line.item_id),
        package_id: line.package_id == null ? "" : String(line.package_id),
        returned_quantity: Number(line.returned_quantity || 0),
        order_item_id: Number(line.order_item_id),
      });
    }

    res.json(orders.map((order) => ({ ...order, items: linesByOrder.get(order.id) })));
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
  if (!status || !ORDER_STATUSES.includes(status)) {
    return res.status(400).json({ error: `Valid status (${ORDER_STATUSES.join(", ")}) is required` });
  }

  try {
    // Read the order first: it both proves the order exists and supplies the
    // details for the notification email (previously re-read after the update).
    const [orders] = await db.query(
      "SELECT id, customer_name, customer_email, event_date, fulfillment_type FROM orders WHERE id = ?",
      [req.params.id]
    );
    if (orders.length === 0) return res.status(404).json({ error: "Order not found" });
    const order = orders[0];

    await db.query("UPDATE orders SET status = ? WHERE id = ?", [status, order.id]);
    // A returned order has every unit back.
    if (status === "returned") {
      await db.query("UPDATE order_items SET returned_quantity = quantity WHERE order_id = ?", [order.id]);
    }

    const emailData = getOrderStatusUserTemplate({
      orderId: order.id,
      customerName: order.customer_name,
      status,
      eventDate: order.event_date,
      fulfillmentType: order.fulfillment_type,
    });
    await sendNotificationEmail({
      to: order.customer_email,
      subject: emailData.subject,
      text: emailData.text,
      html: emailData.html,
    });

    res.json({ success: true, message: `Order status updated to ${status}` });
  } catch (err) {
    console.error("Error updating order status:", err);
    res.status(500).json({ error: "Failed to update order status" });
  }
});

// PUT update the returned quantity of one order line
router.put("/:orderId/items/:orderItemId/return", async (req, res) => {
  const { orderId, orderItemId } = req.params;
  const { returned_quantity } = req.body;

  if (returned_quantity === undefined || returned_quantity < 0) {
    return res.status(400).json({ error: "Valid returned_quantity is required" });
  }

  try {
    const [result] = await db.query("UPDATE order_items SET returned_quantity = ? WHERE id = ? AND order_id = ?", [
      returned_quantity,
      orderItemId,
      orderId,
    ]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Order item not found" });
    }

    // Aggregate in SQL: are all units back / is at least one back?
    const [[summary]] = await db.query(
      `SELECT o.status,
              COALESCE(SUM(oi.returned_quantity < oi.quantity), 0) AS outstanding_lines,
              COALESCE(SUM(oi.returned_quantity > 0), 0) AS returned_lines
         FROM orders o
         LEFT JOIN order_items oi ON oi.order_id = o.id
        WHERE o.id = ?
        GROUP BY o.id, o.status`,
      [orderId]
    );

    if (summary) {
      const allReturned = Number(summary.outstanding_lines) === 0;
      const anyReturned = Number(summary.returned_lines) > 0;
      const current = summary.status;
      let next = current;

      if (allReturned) next = "returned";
      else if (anyReturned && ["ordered", "pending", "confirmed"].includes(current)) next = "on_hand";
      else if (current === "returned") next = "on_hand";

      if (next !== current) {
        await db.query("UPDATE orders SET status = ? WHERE id = ?", [next, orderId]);
      }
    }

    res.json({ success: true, message: "Returned quantity updated successfully" });
  } catch (err) {
    console.error("Error updating returned quantity:", err);
    res.status(500).json({ error: "Failed to update returned quantity" });
  }
});

module.exports = router;
