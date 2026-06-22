import React, { useState, useEffect } from "react";
import { get, put } from "../../../api/client";
import styles from "./RentsTab.module.css";

const STATUS_COLORS = {
  pending:   { bg: "#FEF9C3", text: "#854D0E", dot: "#EAB308" },
  confirmed: { bg: "#DCFCE7", text: "#166534", dot: "#22C55E" },
  cancelled: { bg: "#FEE2E2", text: "#991B1B", dot: "#EF4444" },
};

function formatDate(d) {
  if (!d) return "—";
  const dt = new Date(d);
  return dt.toLocaleDateString("en-CA", { year: "numeric", month: "short", day: "numeric" });
}

function formatTime(ts) {
  if (!ts) return "—";
  const dt = new Date(ts);
  return dt.toLocaleTimeString("en-CA", { hour: "2-digit", minute: "2-digit" });
}

function OrderCard({ order, isSelected, onSelect }) {
  const sc = STATUS_COLORS[order.status] || STATUS_COLORS.pending;
  const daysUntil = Math.ceil((new Date(order.event_date) - new Date()) / 86400000);
  const isUrgent = daysUntil >= 0 && daysUntil <= 3;

  return (
    <div
      className={`${styles.orderCard} ${isSelected ? styles.orderCardSelected : ""} ${isUrgent ? styles.orderCardUrgent : ""}`}
      onClick={() => onSelect(order)}
    >
      {isUrgent && <div className={styles.urgentBadge}>⚡ Soon</div>}
      <div className={styles.orderCardTop}>
        <div className={styles.orderIdBadge}>#{order.id}</div>
        <span className={styles.statusPill} style={{ background: sc.bg, color: sc.text }}>
          <span className={styles.statusDot} style={{ background: sc.dot }} />
          {order.status}
        </span>
      </div>
      <div className={styles.orderCardName}>{order.customer_name}</div>
      <div className={styles.orderCardMeta}>
        <span className={styles.metaChip}>
          {order.fulfillment_type === "delivery" ? "🚚 Delivery" : "🏪 Pickup"}
        </span>
        <span className={styles.metaChip}>📅 {formatDate(order.event_date)}</span>
      </div>
      <div className={styles.orderCardFooter}>
        <span className={styles.orderAmount}>${parseFloat(order.total_amount || 0).toFixed(2)} CAD</span>
        <button
          className={styles.viewBtn}
          onClick={(e) => { e.stopPropagation(); onSelect(order); }}
        >
          View →
        </button>
      </div>
    </div>
  );
}

export default function RentsTab() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [filter, setFilter] = useState("all"); // all | pending | confirmed | cancelled
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [statusMsg, setStatusMsg] = useState(null);

  const fetchOrders = () => {
    setLoading(true);
    get("/admin/orders")
      .then((data) => {
        setOrders(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load orders:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusUpdate = async (orderId, newStatus) => {
    setUpdatingStatus(true);
    setStatusMsg(null);
    try {
      await put(`/admin/orders/${orderId}/status`, { status: newStatus });
      setStatusMsg({ type: "success", text: `Order #${orderId} marked as ${newStatus}` });
      // Update local state
      setOrders(prev =>
        prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o)
      );
      setSelectedOrder(prev => prev && prev.id === orderId ? { ...prev, status: newStatus } : prev);
      setTimeout(() => setStatusMsg(null), 3000);
    } catch (err) {
      setStatusMsg({ type: "error", text: "Failed to update status. Please try again." });
      setTimeout(() => setStatusMsg(null), 3000);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const filteredOrders = orders.filter(o =>
    filter === "all" ? true : o.status === filter
  );

  const counts = {
    all: orders.length,
    pending: orders.filter(o => o.status === "pending").length,
    confirmed: orders.filter(o => o.status === "confirmed").length,
    cancelled: orders.filter(o => o.status === "cancelled").length,
  };

  return (
    <div className={styles.rentsLayout}>
      {/* ─── LEFT PANEL: Order List ─────────────────────────────── */}
      <aside className={styles.orderListPanel}>
        <div className={styles.panelHeader}>
          <h2 className={styles.panelTitle}>
            <span className={styles.panelTitleIcon}>🧾</span>
            Rents
          </h2>
          <button className={styles.refreshBtn} onClick={fetchOrders} title="Refresh orders">↺</button>
        </div>

        {/* Filter Tabs */}
        <div className={styles.filterTabs}>
          {["all", "pending", "confirmed", "cancelled"].map(f => (
            <button
              key={f}
              className={`${styles.filterTab} ${filter === f ? styles.filterTabActive : ""}`}
              onClick={() => setFilter(f)}
            >
              {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
              <span className={styles.filterCount}>{counts[f]}</span>
            </button>
          ))}
        </div>

        {/* Order Cards */}
        <div className={styles.orderList}>
          {loading ? (
            <div className={styles.loadingState}>
              <div className={styles.spinner} />
              <p>Loading orders…</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className={styles.emptyState}>
              <span className={styles.emptyIcon}>📭</span>
              <p>No {filter !== "all" ? filter : ""} orders found</p>
            </div>
          ) : (
            filteredOrders.map(order => (
              <OrderCard
                key={order.id}
                order={order}
                isSelected={selectedOrder?.id === order.id}
                onSelect={setSelectedOrder}
              />
            ))
          )}
        </div>
      </aside>

      {/* ─── RIGHT PANEL: Information Desk ──────────────────────── */}
      <section className={styles.infoDesk}>
        {!selectedOrder ? (
          /* Empty state */
          <div className={styles.deskEmpty}>
            <div className={styles.deskEmptyIcon}>🗂️</div>
            <h3>Select an order to view details</h3>
            <p>Click any order card on the left to open the full customer service desk.</p>
          </div>
        ) : (
          <div className={styles.deskContent}>
            {/* ── Status Message Banner ── */}
            {statusMsg && (
              <div className={`${styles.statusBanner} ${statusMsg.type === "error" ? styles.statusBannerError : styles.statusBannerSuccess}`}>
                {statusMsg.type === "success" ? "✅" : "❌"} {statusMsg.text}
              </div>
            )}

            {/* ── Top Row: Order # + Status Controls ── */}
            <div className={styles.deskTopRow}>
              <div className={styles.deskOrderId}>
                <span className={styles.deskOrderLabel}>Order</span>
                <h2 className={styles.deskOrderNumber}>#{selectedOrder.id}</h2>
                <span
                  className={styles.deskStatusPill}
                  style={{
                    background: STATUS_COLORS[selectedOrder.status]?.bg,
                    color: STATUS_COLORS[selectedOrder.status]?.text,
                  }}
                >
                  <span className={styles.statusDot} style={{ background: STATUS_COLORS[selectedOrder.status]?.dot }} />
                  {selectedOrder.status}
                </span>
              </div>
              <div className={styles.deskTimestamp}>
                <span>📅 Placed: {formatDate(selectedOrder.created_at)} at {formatTime(selectedOrder.created_at)}</span>
              </div>
            </div>

            {/* ── Action Bar: Status Change ── */}
            <div className={styles.actionBar}>
              <span className={styles.actionBarLabel}>Update Status:</span>
              <div className={styles.actionBtns}>
                <button
                  className={`${styles.actionBtn} ${styles.actionBtnConfirm}`}
                  disabled={selectedOrder.status === "confirmed" || updatingStatus}
                  onClick={() => handleStatusUpdate(selectedOrder.id, "confirmed")}
                >
                  ✅ Confirm Order
                </button>
                <button
                  className={`${styles.actionBtn} ${styles.actionBtnPending}`}
                  disabled={selectedOrder.status === "pending" || updatingStatus}
                  onClick={() => handleStatusUpdate(selectedOrder.id, "pending")}
                >
                  ⏳ Set Pending
                </button>
                <button
                  className={`${styles.actionBtn} ${styles.actionBtnCancel}`}
                  disabled={selectedOrder.status === "cancelled" || updatingStatus}
                  onClick={() => handleStatusUpdate(selectedOrder.id, "cancelled")}
                >
                  ✖ Cancel Order
                </button>
              </div>
            </div>

            {/* ── Main Info Grid ── */}
            <div className={styles.infoGrid}>

              {/* Customer Card */}
              <div className={styles.infoCard}>
                <div className={styles.infoCardHeader}>
                  <span className={styles.infoCardIcon}>👤</span>
                  <h3>Customer Details</h3>
                </div>
                <div className={styles.infoCardBody}>
                  <div className={styles.infoRow}>
                    <span className={styles.infoLabel}>Name</span>
                    <span className={styles.infoValue}>{selectedOrder.customer_name}</span>
                  </div>
                  <div className={styles.infoRow}>
                    <span className={styles.infoLabel}>Email</span>
                    <a href={`mailto:${selectedOrder.customer_email}`} className={styles.infoLink}>
                      {selectedOrder.customer_email}
                    </a>
                  </div>
                  <div className={styles.infoRow}>
                    <span className={styles.infoLabel}>Phone</span>
                    <a href={`tel:${selectedOrder.customer_phone}`} className={styles.infoLink}>
                      {selectedOrder.customer_phone}
                    </a>
                  </div>
                </div>
              </div>

              {/* Fulfillment Card */}
              <div className={styles.infoCard}>
                <div className={styles.infoCardHeader}>
                  <span className={styles.infoCardIcon}>
                    {selectedOrder.fulfillment_type === "delivery" ? "🚚" : "🏪"}
                  </span>
                  <h3>{selectedOrder.fulfillment_type === "delivery" ? "Delivery" : "Pickup"} Details</h3>
                </div>
                <div className={styles.infoCardBody}>
                  <div className={styles.infoRow}>
                    <span className={styles.infoLabel}>Type</span>
                    <span className={`${styles.infoValue} ${styles.fulfillmentBadge} ${selectedOrder.fulfillment_type === "delivery" ? styles.deliveryBadge : styles.pickupBadge}`}>
                      {selectedOrder.fulfillment_type === "delivery" ? "🚚 Delivery" : "🏪 Pickup"}
                    </span>
                  </div>
                  {selectedOrder.fulfillment_type === "delivery" && (
                    <div className={styles.infoRow}>
                      <span className={styles.infoLabel}>Delivery Fee</span>
                      <span className={styles.infoValue}>${parseFloat(selectedOrder.delivery_fee || 0).toFixed(2)} CAD</span>
                    </div>
                  )}
                  <div className={styles.infoRow}>
                    <span className={styles.infoLabel}>Venue / Address</span>
                    <span className={styles.infoValue}>{selectedOrder.venue_address || "—"}</span>
                  </div>
                  {selectedOrder.special_notes && (
                    <div className={styles.infoRow}>
                      <span className={styles.infoLabel}>Notes</span>
                      <span className={styles.infoValueNote}>{selectedOrder.special_notes}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Dates & Payment Card */}
              <div className={styles.infoCard}>
                <div className={styles.infoCardHeader}>
                  <span className={styles.infoCardIcon}>📆</span>
                  <h3>Schedule & Payment</h3>
                </div>
                <div className={styles.infoCardBody}>
                  <div className={styles.infoRow}>
                    <span className={styles.infoLabel}>Pickup / Rental Date</span>
                    <span className={styles.infoValueHighlight}>{formatDate(selectedOrder.rental_date)}</span>
                  </div>
                  <div className={styles.infoRow}>
                    <span className={styles.infoLabel}>Event Date</span>
                    <span className={styles.infoValueHighlight}>{formatDate(selectedOrder.event_date)}</span>
                  </div>
                  <div className={styles.divider} />
                  <div className={styles.infoRow}>
                    <span className={styles.infoLabel}>Amount Paid</span>
                    <span className={styles.amountPaid}>${parseFloat(selectedOrder.total_amount || 0).toFixed(2)} CAD</span>
                  </div>
                </div>
              </div>

            </div>

            {/* ── Rented Items ── */}
            <div className={styles.itemsSection}>
              <div className={styles.itemsSectionHeader}>
                <span className={styles.infoCardIcon}>📦</span>
                <h3>Rented Items</h3>
              </div>
              {(!selectedOrder.items || selectedOrder.items.length === 0) ? (
                <div className={styles.noItems}>No itemized details available for this order.</div>
              ) : (
                <div className={styles.itemsList}>
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className={styles.itemRow}>
                      <div className={styles.itemImageWrap}>
                        {item.image && item.image.startsWith("/uploads") ? (
                          <img src={item.image} alt={item.name} className={styles.itemImage} />
                        ) : (
                          <div className={styles.itemImagePlaceholder}>📦</div>
                        )}
                      </div>
                      <div className={styles.itemInfo}>
                        <span className={styles.itemName}>{item.name || "Unknown Item"}</span>
                        <span className={styles.itemQty}>Qty: {item.quantity || 1}</span>
                      </div>
                      <div className={styles.itemPrice}>
                        ${parseFloat(item.price || 0).toFixed(2)} CAD
                      </div>
                    </div>
                  ))}
                  <div className={styles.itemsTotalRow}>
                    <span>Total Charged</span>
                    <strong>${parseFloat(selectedOrder.total_amount || 0).toFixed(2)} CAD</strong>
                  </div>
                </div>
              )}
            </div>

          </div>
        )}
      </section>
    </div>
  );
}
