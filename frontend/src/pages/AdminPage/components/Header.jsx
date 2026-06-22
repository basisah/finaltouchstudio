import React from "react";
import styles from "../AdminPage.module.css";

export default function Header({
  searchQuery,
  setSearchQuery,
  searchType,
  setSearchType,
  unreadEnquiriesCount,
  activeTab,
  setActiveTab,
  handleMarkAllRead,
  toggleSidebar,
}) {
  return (
    <header className={styles.header}>
      <button className={styles.menuToggle} onClick={toggleSidebar} aria-label="Toggle Sidebar">
        ☰
      </button>
      {/* Global Search Tool Container */}
      <div className={styles.searchContainer}>
        <div className={styles.selectWrapper}>
          <select
            value={searchType}
            onChange={(e) => setSearchType(e.target.value)}
            className={styles.searchSelect}
          >
            <option value="items_title">Items by Title</option>
            <option value="items_serial">Items by Serial</option>
            <option value="members">Members</option>
            <option value="enquiries">Enquiries</option>
          </select>
        </div>
        <input
          type="text"
          placeholder="Search globally across studio..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={styles.searchInput}
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery("")}
            className={styles.clearSearchBtn}
            aria-label="Clear search"
          >
            ✕
          </button>
        )}
        <span className={styles.searchIcon}>🔍</span>
      </div>

      {/* Right Header Actions: Messages Icon & Admin Badge */}
      <div className={styles.headerActions}>
        <button
          className={`${styles.enquiriesTrigger} ${activeTab === "enquiries" ? styles.enquiriesTriggerActive : ""}`}
          onClick={() => {
            setActiveTab("enquiries");
            setSearchQuery("");
            handleMarkAllRead();
          }}
          title="View User Enquiries Inbox"
        >
          <span className={styles.messageIconEmoji}>✉️</span>
          {unreadEnquiriesCount > 0 && (
            <span className={styles.messageNotificationBadge}>
              {unreadEnquiriesCount}
            </span>
          )}
        </button>

        <div className={styles.adminBadge}>
          <span className={styles.badgePulse}></span>
          Khaled (Admin)
        </div>
      </div>
    </header>
  );
}
