import React from "react";
import styles from "../AdminPage.module.css";

export default function EnquiriesTab({ enquiries }) {
  return (
    <div className={styles.fullWidthCard}>
      <div className={styles.cardHeader}>
        <h2>Received Leads Inbox</h2>
        <p>Visitor inquiries and user-submitted data</p>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Date</th>
              <th>User Info</th>
              <th>Requested Occasion</th>
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
                <td className={styles.dateCol}>{enq.date}</td>
                <td className={styles.userCol}>
                  <strong>{enq.name}</strong>
                  <a href={`mailto:${enq.email}`} className={styles.userEmail}>
                    {enq.email}
                  </a>
                </td>
                <td className={styles.occasionCol}>
                  <span className={styles.occasionBadge}>{enq.occasion || "General Enquiry"}</span>
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
