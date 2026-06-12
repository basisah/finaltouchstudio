import React from "react";
import styles from "../AdminPage.module.css";

export default function Sidebar({
  items,
  members,
  payments,
  activeTab,
  setActiveTab,
  setSearchQuery,
  handleLogout,
  isSidebarOpen,
  setIsSidebarOpen,
}) {
  return (
    <aside className={`${styles.sidebar} ${isSidebarOpen ? styles.sidebarOpen : ""}`}>
      <div className={styles.sidebarHeader}>
        <span className={styles.sidebarIcon}>✨</span>
        <div>
          <h3>FinalTouch</h3>
          <p>Admin Workspace</p>
        </div>
      </div>

      <nav className={styles.navigation}>
        <p className={styles.navLabel}>Management Modules</p>
        <ul className={styles.sysList}>
          <li>
            <button
              type="button"
              className={`${styles.navBtn} ${activeTab === "items" ? styles.active : ""}`}
              onClick={() => {
                setActiveTab("items");
                setSearchQuery("");
                if (setIsSidebarOpen) setIsSidebarOpen(false);
              }}
            >
              <span className={styles.btnEmoji}>📋</span>
              <span className={styles.btnLabel}>Items Management</span>
              <span className={styles.btnCount}>{items.length}</span>
            </button>
          </li>
          <li>
            <button
              type="button"
              className={`${styles.navBtn} ${activeTab === "members" ? styles.active : ""}`}
              onClick={() => {
                setActiveTab("members");
                setSearchQuery("");
                if (setIsSidebarOpen) setIsSidebarOpen(false);
              }}
            >
              <span className={styles.btnEmoji}>👥</span>
              <span className={styles.btnLabel}>Members Management</span>
              <span className={styles.btnCount}>{members.length}</span>
            </button>
          </li>
          <li>
            <button
              type="button"
              className={`${styles.navBtn} ${activeTab === "payments" ? styles.active : ""}`}
              onClick={() => {
                setActiveTab("payments");
                setSearchQuery("");
                if (setIsSidebarOpen) setIsSidebarOpen(false);
              }}
            >
              <span className={styles.btnEmoji}>💳</span>
              <span className={styles.btnLabel}>Payments & Invoices</span>
              <span className={styles.btnCount}>{payments.length}</span>
            </button>
          </li>
          <li>
            <button
              type="button"
              className={`${styles.navBtn} ${activeTab === "packages" ? styles.active : ""}`}
              onClick={() => {
                setActiveTab("packages");
                setSearchQuery("");
                if (setIsSidebarOpen) setIsSidebarOpen(false);
              }}
            >
              <span className={styles.btnEmoji}>📦</span>
              <span className={styles.btnLabel}>Decor Packages</span>
            </button>
          </li>
          <li>
            <button
              type="button"
              className={`${styles.navBtn} ${activeTab === "categories" ? styles.active : ""}`}
              onClick={() => {
                setActiveTab("categories");
                setSearchQuery("");
                if (setIsSidebarOpen) setIsSidebarOpen(false);
              }}
            >
              <span className={styles.btnEmoji}>🗂️</span>
              <span className={styles.btnLabel}>Categories Manager</span>
            </button>
          </li>
        </ul>
      </nav>

      <div className={styles.sidebarFooter}>
        <button type="button" onClick={handleLogout} className={styles.logoutBtn}>
          Logout <span>🚪</span>
        </button>
      </div>
    </aside>
  );
}
