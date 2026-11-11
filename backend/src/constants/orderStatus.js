/** Every value the `orders.status` ENUM accepts. */
const ORDER_STATUSES = ["pending", "confirmed", "ordered", "on_hand", "returned", "cancelled"];

/**
 * Statuses that still hold stock. `returned` and `cancelled` orders free their
 * units again, so they are ignored by every availability calculation.
 */
const ACTIVE_ORDER_STATUSES = ["pending", "confirmed", "ordered", "on_hand"];

module.exports = { ORDER_STATUSES, ACTIVE_ORDER_STATUSES };
