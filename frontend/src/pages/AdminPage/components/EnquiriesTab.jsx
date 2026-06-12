import React from "react";
import styles from "./EnquiriesTab.module.css";

export default function EnquiriesTab({ enquiries }) {
  const unreadCount = enquiries.filter((e) => !e.read).length;

  return (
    <section className={styles.inbox} aria-labelledby="leads-inbox-title">
      <header className={styles.inboxHeader}>
        <div className={styles.headerText}>
          <h2 id="leads-inbox-title">Received Leads Inbox</h2>
          <p>Visitor inquiries and user-submitted data from your contact form.</p>
        </div>
        <span className={styles.leadCount} aria-label={`${enquiries.length} total leads`}>
          <strong>{enquiries.length}</strong> total
          {unreadCount > 0 && ` · ${unreadCount} new`}
        </span>
      </header>

      <div className={styles.inboxBody}>
        {enquiries.length === 0 ? (
          <div className={styles.emptyState}>
            <strong>No enquiries yet</strong>
            Messages from the contact form will appear here.
          </div>
        ) : (
          <div className={styles.tableScroll}>
            <table className={styles.table}>
              <colgroup>
                <col className={styles.colDate} />
                <col className={styles.colUser} />
                <col className={styles.colOccasion} />
                <col className={styles.colMessage} />
                <col className={styles.colAction} />
              </colgroup>
              <thead>
                <tr>
                  <th className={styles.colDate} scope="col">Date</th>
                  <th className={styles.colUser} scope="col">User Info</th>
                  <th className={styles.colOccasion} scope="col">Requested Occasion</th>
                  <th className={styles.colMessage} scope="col">Message &amp; Vision</th>
                  <th className={`${styles.colAction} ${styles.actionHead}`} scope="col">Action</th>
                </tr>
              </thead>
              <tbody>
                {enquiries.map((enq) => (
                  <tr
                    key={enq.id}
                    className={!enq.read ? styles.rowUnread : undefined}
                  >
                    <td className={styles.colDate} data-label="Date">
                      <time className={styles.dateText} dateTime={enq.date}>
                        {enq.date}
                      </time>
                    </td>
                    <td className={styles.colUser} data-label="User Info">
                      <div className={styles.userInfo}>
                        <span className={styles.userName}>{enq.name}</span>
                        <a href={`mailto:${enq.email}`} className={styles.userEmail}>
                          {enq.email}
                        </a>
                      </div>
                    </td>
                    <td className={styles.colOccasion} data-label="Occasion">
                      <span className={styles.occasionBadge}>
                        {enq.occasion || "General Enquiry"}
                      </span>
                    </td>
                    <td className={styles.colMessage} data-label="Message">
                      <span className={styles.messageText}>{enq.message}</span>
                    </td>
                    <td className={`${styles.colAction} ${styles.actionCell}`} data-label="Action">
                      <button
                        type="button"
                        className={styles.replyBtn}
                        onClick={() => {
                          window.location.href = `mailto:${enq.email}?subject=FinalTouch Studio - Regarding your enquiry`;
                        }}
                      >
                        <span className={styles.replyIcon} aria-hidden="true">✉️</span>
                        Reply
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
