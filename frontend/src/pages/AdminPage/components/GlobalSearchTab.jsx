import React from "react";
import styles from "../AdminPage.module.css";

const SEARCH_LABELS = {
  items_title: "Items by Title",
  items_serial: "Items by Serial",
  members: "Members",
  enquiries: "Enquiries",
};

export default function GlobalSearchTab({
  searchQuery,
  searchType,
  searchResults,
  setActiveTab,
  setSearchQuery,
  onOpenItem,
}) {
  const contextLabel = SEARCH_LABELS[searchType] || searchType.replace(/_/g, " ");

  return (
    <div className={styles.fullWidthCard}>
      <div className={styles.cardHeader}>
        <h2>Search Results for &ldquo;{searchQuery}&rdquo;</h2>
        <p>
          Searching in: <strong>{contextLabel}</strong>
          {" · "}
          <strong>{searchResults.length}</strong>{" "}
          {searchResults.length === 1 ? "match" : "matches"}
        </p>
      </div>

      {searchResults.length === 0 ? (
        <div className={styles.emptyState}>
          <p>No results found matching your query in this search context.</p>
          <p style={{ marginTop: "8px", fontSize: "0.85rem", opacity: 0.8 }}>
            Try a different keyword or switch the search type in the header dropdown.
          </p>
        </div>
      ) : (
        <div className={styles.tableWrapper}>
          {searchType.startsWith("items") && (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Item Details</th>
                  <th>Availability</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {searchResults.map((item) => {
                  const isAvailable = Boolean(item.isAvailable);
                  const displayName = item.name || item.title || "Untitled item";
                  return (
                    <tr
                      key={item.id}
                      className={styles.clickableRow}
                      onClick={() => onOpenItem(item)}
                      title="Click to edit item"
                    >
                      <td>
                        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                          <div style={{ flexShrink: 0 }}>
                            {item.image && String(item.image).startsWith("/uploads") ? (
                              <img
                                src={item.image}
                                alt=""
                                style={{
                                  width: "40px",
                                  height: "40px",
                                  objectFit: "cover",
                                  borderRadius: "8px",
                                }}
                              />
                            ) : (
                              <span className={styles.itemEmojiPic}>{item.image || "✨"}</span>
                            )}
                          </div>
                          <div>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                              <code
                                style={{
                                  fontSize: "0.72rem",
                                  background: "var(--bg-main)",
                                  padding: "2px 6px",
                                  borderRadius: "4px",
                                  border: "1px solid var(--border-shadow)",
                                  color: "var(--text-main)",
                                  fontWeight: "600",
                                }}
                              >
                                {item.serialNumber || item.id}
                              </code>
                              <strong style={{ fontSize: "0.95rem", color: "var(--text-main)" }}>
                                {displayName}
                              </strong>
                            </div>
                            {item.description && (
                              <p className={styles.tableSmallDesc} style={{ margin: "4px 0 0" }}>
                                {item.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>
                        <span
                          className={`${styles.statusLabel} ${isAvailable ? styles.statusAvailable : styles.statusBooked}`}
                        >
                          {isAvailable ? "Available" : "Unavailable"}
                        </span>
                      </td>
                      <td onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => onOpenItem(item)}
                          className={styles.replyBtn}
                        >
                          Edit Item
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}

          {searchType === "members" && (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Member Details</th>
                  <th>Join Date</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {searchResults.map((mem) => (
                  <tr key={mem.id}>
                    <td>
                      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                          <code
                            style={{
                              fontSize: "0.72rem",
                              background: "var(--bg-main)",
                              padding: "2px 6px",
                              borderRadius: "4px",
                              border: "1px solid var(--border-shadow)",
                              color: "var(--text-main)",
                              fontWeight: "600",
                            }}
                          >
                            {mem.id}
                          </code>
                          <strong style={{ fontSize: "0.95rem", color: "var(--text-main)" }}>{mem.name}</strong>
                        </div>
                        <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", opacity: 0.85 }}>
                          📧 {mem.email}
                        </div>
                      </div>
                    </td>
                    <td>{mem.joinDate}</td>
                    <td>
                      <span
                        className={`${styles.statusLabel} ${mem.status === "Active" ? styles.statusAvailable : styles.statusBooked}`}
                      >
                        {mem.status}
                      </span>
                    </td>
                    <td>
                      <button
                        type="button"
                        className={styles.replyBtn}
                        onClick={() => {
                          setActiveTab("members");
                          setSearchQuery("");
                        }}
                      >
                        View Members
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {searchType === "enquiries" && (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Contact</th>
                  <th>Occasion</th>
                  <th>Message</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {searchResults.map((enq) => (
                  <tr key={enq.id}>
                    <td>
                      <strong style={{ display: "block", color: "var(--text-main)" }}>{enq.name}</strong>
                      <a href={`mailto:${enq.email}`} style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                        {enq.email}
                      </a>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "4px" }}>
                        {enq.date}
                      </div>
                    </td>
                    <td>{enq.occasion || "General Enquiry"}</td>
                    <td className={styles.tableSmallDesc}>{enq.message}</td>
                    <td>
                      <button
                        type="button"
                        className={styles.replyBtn}
                        onClick={() => {
                          setActiveTab("enquiries");
                          setSearchQuery("");
                        }}
                      >
                        View Inbox
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
