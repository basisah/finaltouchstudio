import React from "react";
import styles from "../AdminPage.module.css";

export default function PaymentsTab({
  payments,
  members,
  handleTogglePaymentStatus,
  handleRecordPayment,
  newPayMember,
  setNewPayMember,
  newPayAmount,
  setNewPayAmount,
  newPayMethod,
  setNewPayMethod,
}) {
  return (
    <div className={styles.categoryGrid}>
      {/* Payment ledger */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h2>Transaction Log Book ({payments.length})</h2>
          <p>Track rent deposits, final settlements and methods</p>
        </div>

        <div className={styles.tableWrapper} style={{ overflowX: "hidden" }}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Transaction Details</th>
                <th>Date</th>
                <th>Amount Paid</th>
                <th>Status Toggle</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((pay) => (
                <tr key={pay.id}>
                  <td>
                    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                        <code style={{ fontSize: "0.72rem", background: "var(--bg-main)", padding: "2px 6px", borderRadius: "4px", border: "1px solid var(--border-shadow)", color: "var(--text-main)", fontWeight: "600" }}>
                          {pay.id}
                        </code>
                        <strong style={{ fontSize: "0.95rem", color: "var(--text-main)" }}>{pay.memberName}</strong>
                      </div>
                      <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", opacity: 0.85 }}>
                        💳 Method: {pay.method}
                      </div>
                    </div>
                  </td>
                  <td className={styles.dateCol}>{pay.date}</td>
                  <td className={styles.amountCol}>
                    <strong>{pay.amount}</strong>
                  </td>
                  <td>
                    <div className={styles.availabilityToggle}>
                      <span
                        className={`${styles.statusLabel} ${pay.status === "Completed" ? styles.statusAvailable : styles.statusBooked}`}
                      >
                        {pay.status}
                      </span>
                      <label className={styles.switch}>
                        <input
                          type="checkbox"
                          checked={pay.status === "Completed"}
                          onChange={() => handleTogglePaymentStatus(pay.id)}
                        />
                        <span className={styles.slider}></span>
                      </label>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Payment Form */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h2>➕ Record Payment</h2>
          <p>Log a payment deposit for inventory rental</p>
        </div>

        <form onSubmit={handleRecordPayment} className={styles.itemForm}>
          <div className={styles.inputGroup}>
            <label htmlFor="payMember">Client Member Name</label>
            <select
              id="payMember"
              value={newPayMember}
              onChange={(e) => setNewPayMember(e.target.value)}
              required
              className={styles.picSelect}
            >
              <option value="">-- Select Member --</option>
              {members.map((m) => (
                <option key={m.id} value={m.name}>
                  {m.name} ({m.id})
                </option>
              ))}
            </select>
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="payAmount">Payment Amount (CAD)</label>
            <input
              id="payAmount"
              type="number"
              placeholder="e.g. 150"
              value={newPayAmount}
              onChange={(e) => setNewPayAmount(e.target.value)}
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="payMethod">Payment Channel</label>
            <select
              id="payMethod"
              value={newPayMethod}
              onChange={(e) => setNewPayMethod(e.target.value)}
              className={styles.picSelect}
            >
              <option value="Interac e-Transfer">Interac e-Transfer</option>
              <option value="PayPal">PayPal</option>
              <option value="Credit Card">Credit Card</option>
              <option value="Cash">Cash</option>
            </select>
          </div>

          <button type="submit" className={styles.addItemBtn}>
            ✦ Log Transaction Record
          </button>
        </form>
      </div>
    </div>
  );
}
