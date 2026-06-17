import React from "react";
import styles from "../AdminPage.module.css";

export default function GlobalSearchTab({
  searchQuery,
  searchType,
  searchResults,
  categories,
  setActiveTab,
  setSearchQuery,
}) {
  return (
    <div className={styles.fullWidthCard}>
      <div className={styles.cardHeader}>
        <h2>Search Results for: "{searchQuery}"</h2>
        <p>
          Categorized under search context: <strong>{searchType.replace("_", " ")}</strong>
        </p>
      </div>

      {searchResults.length === 0 ? (
        <div className={styles.emptyState}>
          <p>No results found matching your query in this search context.</p>
        </div>
      ) : (
        <div className={styles.tableWrapper}>
          {/* Rendering Item Search Matches */}
          {searchType.startsWith("items") && (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Item Details</th>
                  <th>Availability Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {searchResults.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                        <div style={{ flexShrink: 0 }}>
                          <span className={styles.itemEmojiPic}>{item.image}</span>
                        </div>
                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                            <code style={{ fontSize: "0.72rem", background: "var(--bg-main)", padding: "2px 6px", borderRadius: "4px", border: "1px solid var(--border-shadow)", color: "var(--text-main)", fontWeight: "600" }}>
                              {item.serialNumber || item.id}
                            </code>
                            <strong style={{ fontSize: "0.95rem", color: "var(--text-main)" }}>{item.name}</strong>
                          </div>
                          <p className={styles.tableSmallDesc} style={{ margin: "4px 0 0" }}>{item.description}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span
                        className={`${styles.statusLabel} ${item.isAvailable ? styles.statusAvailable : styles.statusBooked}`}
                      >
                        {item.isAvailable ? "Available" : "Fully Booked"}
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => {
                          const cat = categories.find((c) => c.id === item.categoryId);
                          if (cat) {
                            setActiveTab(cat.id);
                            setSearchQuery("");
                          }
                        }}
                        className={styles.replyBtn}
                      >
                        View Category
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* Rendering Member Search Matches */}
          {searchType === "members" && (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Member Details</th>
                  <th>Join Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {searchResults.map((mem) => (
                  <tr key={mem.id}>
                    <td>
                      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                          <code style={{ fontSize: "0.72rem", background: "var(--bg-main)", padding: "2px 6px", borderRadius: "4px", border: "1px solid var(--border-shadow)", color: "var(--text-main)", fontWeight: "600" }}>
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
