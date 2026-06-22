import React, { useState, useEffect } from "react";
import { get, put } from "../../../api/client";
import styles from "./RentsTab.module.css";

const STATUS_COLORS = {
  pending:   { bg: "#FEF9C3", text: "#854D0E", dot: "#EAB308" },
  confirmed: { bg: "#DCFCE7", text: "#166534", dot: "#22C55E" },
  ordered:   { bg: "#EDE4F1", text: "#471A69", dot: "#8157A4" },
  on_hand:   { bg: "#FFFBEB", text: "#B45309", dot: "#F59E0B" },
  returned:  { bg: "#DCFCE7", text: "#166534", dot: "#22C55E" },
  cancelled: { bg: "#FEE2E2", text: "#991B1B", dot: "#EF4444" },
};

function formatDate(d) {
  if (!d) return "—";
  const dt = new Date(d);
  return dt.toLocaleDateString("en-CA", { year: "numeric", month: "short", day: "numeric" });
}

function getStatusLabel(status, fulfillmentType) {
  const s = (status || "ordered").toLowerCase();
  if (s === "on_hand") {
    return fulfillmentType === "delivery" ? "Delivered" : "Picked Up";
  }
  if (s === "ordered") return "Ordered";
  if (s === "returned") return "Returned";
  if (s === "cancelled") return "Cancelled";
  if (s === "confirmed") return "Confirmed";
  if (s === "pending") return "Pending";
  return status.charAt(0).toUpperCase() + status.slice(1);
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
          {getStatusLabel(order.status, order.fulfillment_type)}
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
  const [filter, setFilter] = useState("all"); // all | ordered | on_hand | returned | cancelled
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

  useEffect(() => {
    if (selectedOrder) {
      document.body.classList.add("admin-order-focused");
    } else {
      document.body.classList.remove("admin-order-focused");
    }
    return () => {
      document.body.classList.remove("admin-order-focused");
    };
  }, [selectedOrder]);

  const handleStatusUpdate = async (orderId, newStatus) => {
    setUpdatingStatus(true);
    setStatusMsg(null);
    try {
      await put(`/admin/orders/${orderId}/status`, { status: newStatus });
      setStatusMsg({ type: "success", text: `Order #${orderId} marked as ${newStatus}` });
      
      // Update local state
      setOrders(prev =>
        prev.map(o => {
          if (o.id === orderId) {
            // If marking whole order as returned, update returned_quantity for all items to match quantity
            const updatedItems = newStatus === "returned" 
              ? o.items.map(it => ({ ...it, returned_quantity: it.quantity })) 
              : o.items;
            return { ...o, status: newStatus, items: updatedItems };
          }
          return o;
        })
      );
      setSelectedOrder(prev => {
        if (prev && prev.id === orderId) {
          const updatedItems = newStatus === "returned"
            ? prev.items.map(it => ({ ...it, returned_quantity: it.quantity }))
            : prev.items;
          return { ...prev, status: newStatus, items: updatedItems };
        }
        return prev;
      });
      setTimeout(() => setStatusMsg(null), 3000);
    } catch (err) {
      setStatusMsg({ type: "error", text: "Failed to update status. Please try again." });
      setTimeout(() => setStatusMsg(null), 3000);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleItemReturnChange = async (orderItemId, newQty) => {
    if (!selectedOrder) return;
    setStatusMsg(null);
    try {
      await put(`/admin/orders/${selectedOrder.id}/items/${orderItemId}/return`, {
        returned_quantity: newQty
      });
      setStatusMsg({ type: "success", text: `Updated returned units to ${newQty}` });
      
      // Update local state for immediate feedback
      setOrders(prev =>
        prev.map(o => {
          if (o.id === selectedOrder.id) {
            const updatedItems = o.items.map(it =>
              it.order_item_id === orderItemId ? { ...it, returned_quantity: newQty } : it
            );
            
            // Auto calculate status if all items are fully returned
            const allReturned = updatedItems.every(it => (it.returned_quantity || 0) >= it.quantity);
            const anyReturned = updatedItems.some(it => (it.returned_quantity || 0) > 0);
            let newStatus = o.status;
            
            if (allReturned) {
              newStatus = "returned";
            } else if (anyReturned && (o.status === "ordered" || o.status === "pending" || o.status === "confirmed")) {
              newStatus = "on_hand";
            } else if (!allReturned && o.status === "returned") {
              newStatus = "on_hand";
            }

            return { ...o, status: newStatus, items: updatedItems };
          }
          return o;
        })
      );

      setSelectedOrder(prev => {
        if (!prev) return null;
        const updatedItems = prev.items.map(it =>
          it.order_item_id === orderItemId ? { ...it, returned_quantity: newQty } : it
        );
        
        const allReturned = updatedItems.every(it => (it.returned_quantity || 0) >= it.quantity);
        const anyReturned = updatedItems.some(it => (it.returned_quantity || 0) > 0);
        let newStatus = prev.status;
        
        if (allReturned) {
          newStatus = "returned";
        } else if (anyReturned && (prev.status === "ordered" || prev.status === "pending" || prev.status === "confirmed")) {
          newStatus = "on_hand";
        } else if (!allReturned && prev.status === "returned") {
          newStatus = "on_hand";
        }

        return { ...prev, status: newStatus, items: updatedItems };
      });

      setTimeout(() => setStatusMsg(null), 2500);
    } catch (err) {
      console.error(err);
      setStatusMsg({ type: "error", text: "Failed to update returned units." });
      setTimeout(() => setStatusMsg(null), 3000);
    }
  };

  const filteredOrders = orders.filter(o => {
    if (filter === "all") return true;
    if (filter === "ordered") return o.status === "ordered" || o.status === "pending" || o.status === "confirmed";
    return o.status === filter;
  });

  const counts = {
    all: orders.length,
    ordered: orders.filter(o => o.status === "ordered" || o.status === "pending" || o.status === "confirmed").length,
    on_hand: orders.filter(o => o.status === "on_hand").length,
    returned: orders.filter(o => o.status === "returned").length,
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
          {["all", "ordered", "on_hand", "returned", "cancelled"].map(f => (
            <button
              key={f}
              className={`${styles.filterTab} ${filter === f ? styles.filterTabActive : ""}`}
              onClick={() => setFilter(f)}
            >
              {f === "all" ? "All" : f === "on_hand" ? "On Hand" : f.charAt(0).toUpperCase() + f.slice(1)}
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
                  {getStatusLabel(selectedOrder.status, selectedOrder.fulfillment_type)}
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
                  disabled={["on_hand", "returned", "cancelled"].includes(selectedOrder.status) || updatingStatus}
                  onClick={() => handleStatusUpdate(selectedOrder.id, "on_hand")}
                >
                  {selectedOrder.fulfillment_type === "delivery" ? "🚚 Mark Delivered" : "🏪 Mark Picked Up"}
                </button>
                <button
                  className={`${styles.actionBtn} ${styles.actionBtnPending}`}
                  disabled={["ordered", "pending", "cancelled"].includes(selectedOrder.status) || updatingStatus}
                  onClick={() => handleStatusUpdate(selectedOrder.id, "ordered")}
                >
                  ⏳ Set Ordered
                </button>
                <button
                  className={`${styles.actionBtn} ${styles.actionBtnConfirm}`}
                  disabled={selectedOrder.status === "returned" || selectedOrder.status === "cancelled" || updatingStatus}
                  onClick={() => handleStatusUpdate(selectedOrder.id, "returned")}
                >
                  {selectedOrder.fulfillment_type === "delivery" ? "✅ Mark Picked Up (All)" : "✅ Mark Returned (All)"}
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
                        <div className={styles.qtyContainer}>
                          <span className={styles.itemQty}>Qty: {item.quantity || 1}</span>
                          <span className={styles.itemReturnedInfo}>
                            Returned: {item.returned_quantity || 0} / {item.quantity || 1}
                          </span>
                        </div>
                        {selectedOrder.status !== "cancelled" && (
                          <div className={styles.returnControls}>
                            <button
                              className={styles.qtyControlBtn}
                              disabled={(item.returned_quantity || 0) <= 0}
                              onClick={() => handleItemReturnChange(item.order_item_id, (item.returned_quantity || 0) - 1)}
                              title="Decrement returned units"
                            >
                              −
                            </button>
                            <span className={styles.returnedCountText}>{item.returned_quantity || 0}</span>
                            <button
                              className={styles.qtyControlBtn}
                              disabled={(item.returned_quantity || 0) >= (item.quantity || 1)}
                              onClick={() => handleItemReturnChange(item.order_item_id, (item.returned_quantity || 0) + 1)}
                              title="Increment returned units"
                            >
                              ＋
                            </button>
                          </div>
                        )}
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
