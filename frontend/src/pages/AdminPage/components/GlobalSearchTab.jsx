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
                  <th>Serial No.</th>
                  <th>Image</th>
                  <th>Item Details</th>
                  <th>Availability Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {searchResults.map((item) => (
                  <tr key={item.id}>
                    <td className={styles.serialNumCol}>
                      <code>{item.serialNumber}</code>
                    </td>
                    <td className={styles.thumbnailCol}>
                      <span className={styles.itemEmojiPic}>{item.image}</span>
                    </td>
                    <td>
                      <strong>{item.name}</strong>
                      <p className={styles.tableSmallDesc}>{item.description}</p>
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
                  <th>Member ID</th>
                  <th>Full Name</th>
                  <th>Email Address</th>
                  <th>Join Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {searchResults.map((mem) => (
                  <tr key={mem.id}>
                    <td>
                      <code>{mem.id}</code>
                    </td>
                    <td>
                      <strong>{mem.name}</strong>
                    </td>
                    <td>{mem.email}</td>
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
