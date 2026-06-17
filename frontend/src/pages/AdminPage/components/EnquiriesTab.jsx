import React from "react";
import styles from "../AdminPage.module.css";

export default function EnquiriesTab({ enquiries }) {
  return (
    <div className={styles.fullWidthCard}>
      <div className={styles.cardHeader}>
        <h2>Received Leads Inbox</h2>
        <p>Visitor inquiries and user-submitted data</p>
      </div>

      <div className={styles.tableWrapper} style={{ overflowX: "hidden" }}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Sender & Occasion</th>
              <th>Message & Vision</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {enquiries.map((enq) => (
              <tr
                key={enq.id}
                style={{
                  fontWeight: enq.read ? "normal" : "600",
                  backgroundColor: enq.read ? "transparent" : "rgba(159, 80, 124, 0.04)",
                }}
              >
                <td>
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                      <strong style={{ fontSize: "0.95rem", color: "var(--text-main)" }}>{enq.name}</strong>
                      <span className={styles.occasionBadge} style={{ fontSize: "10px", padding: "1px 6px" }}>
                        {enq.occasion || "General"}
                      </span>
                    </div>
                    <a href={`mailto:${enq.email}`} className={styles.userEmail}>
                      📧 {enq.email}
                    </a>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", opacity: 0.8 }}>
                      📅 {enq.date}
                    </div>
                  </div>
                </td>
                <td className={styles.messageCol}>{enq.message}</td>
                <td>
                  <button
                    className={styles.replyBtn}
                    onClick={() =>
                      (window.location.href = `mailto:${enq.email}?subject=FinalTouch Studio - Regarding your enquiry`)
                    }
                  >
                    ✉️ Reply
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
