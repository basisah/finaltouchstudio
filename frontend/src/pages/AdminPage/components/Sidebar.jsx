import React from "react";
import styles from "../AdminPage.module.css";

import babyIcon from "../../../assets/Icons/baby.png";
import birthdayIcon from "../../../assets/Icons/birthday-cake.png";
import bridalIcon from "../../../assets/Icons/bridal-shower.png";
import brideIcon from "../../../assets/Icons/bride.png";
import coupleIcon from "../../../assets/Icons/couple.png";
import managerIcon from "../../../assets/Icons/manager.png";
import proposalIcon from "../../../assets/Icons/ring.png";
import marriageIcon from "../../../assets/Icons/wedding-couple.png";

const categoryIcons = {
  baby: babyIcon,
  "birthday-cake": birthdayIcon,
  "bridal-shower": bridalIcon,
  bride: brideIcon,
  couple: coupleIcon,
  manager: managerIcon,
  ring: proposalIcon,
  "wedding-couple": marriageIcon,
  proposal: proposalIcon,
  birthday: birthdayIcon,
  marriage: marriageIcon,
  holud: bridalIcon,
  global: managerIcon,
};

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
<<<<<<< HEAD
        {/* Categories Header & Controls */}
        <div className={styles.sectionHeaderRow}>
          <p className={styles.navLabel}>Categories</p>
          <button
            type="button"
            className={styles.addCategoryHeaderBtn}
            onClick={() => {
              onTriggerAddCategory();
              setSearchQuery("");
              if (setIsSidebarOpen) setIsSidebarOpen(false);
            }}
            title="Add New Category"
          >
            ➕
          </button>
        </div>

        <ul className={styles.catList}>
          {visibleCategories.map((cat) => (
            <li key={cat.id}>
              <button
                className={`${styles.navBtn} ${activeTab === cat.id ? styles.active : ""}`}
                onClick={() => {
                  setActiveTab(cat.id);
                  setSearchQuery(""); // Clear search when navigating
                  if (setIsSidebarOpen) setIsSidebarOpen(false);
                }}
              >
                <span className={styles.btnEmoji} style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "20px", height: "20px" }}>
                  {categoryIcons[cat.emoji] || categoryIcons[cat.id] ? (
                    <img 
                      src={categoryIcons[cat.emoji] || categoryIcons[cat.id]} 
                      alt="" 
                      style={{ width: "20px", height: "20px", objectFit: "contain", filter: activeTab === cat.id ? "brightness(0) invert(1)" : "none" }} 
                    />
                  ) : (
                    cat.emoji
                  )}
                </span>
                <span className={styles.btnLabel}>{cat.label}</span>
                <span className={styles.btnCount}>
                  {items.filter((item) => item.categoryId === cat.id).length}
                </span>
              </button>
            </li>
          ))}
        </ul>

        {/* Overflow Logic Arrow */}
        {categories.length > 10 && (
          <button
            type="button"
            className={styles.expandCategoriesBtn}
            onClick={() => setIsCatExpanded(!isCatExpanded)}
          >
            {isCatExpanded ? "↑ Collapse List" : "↓ Expand List"}
          </button>
        )}

        <div className={styles.divider}></div>

        {/* Middle Section: Settings & Modules */}
        <p className={styles.navLabel}>Settings</p>
        <ul className={styles.sysList}>
          <li>
            <button
              className={`${styles.navBtn} ${activeTab === "general_settings" ? styles.active : ""}`}
              onClick={() => {
                setActiveTab("general_settings");
                setSearchQuery("");
                if (setIsSidebarOpen) setIsSidebarOpen(false);
              }}
            >
              <span className={styles.btnEmoji}>⚙️</span>
              <span className={styles.btnLabel}>General Settings</span>
            </button>
          </li>
          <li>
            <button
              className={`${styles.navBtn} ${activeTab === "analytics" ? styles.active : ""}`}
              onClick={() => {
                setActiveTab("analytics");
                setSearchQuery("");
                if (setIsSidebarOpen) setIsSidebarOpen(false);
              }}
            >
              <span className={styles.btnEmoji}>📊</span>
              <span className={styles.btnLabel}>Analytics</span>
            </button>
          </li>
          <li>
            <button
              className={`${styles.navBtn} ${activeTab === "user_management" ? styles.active : ""}`}
              onClick={() => {
                setActiveTab("user_management");
                setSearchQuery("");
                if (setIsSidebarOpen) setIsSidebarOpen(false);
              }}
            >
              <span className={styles.btnEmoji}>👤</span>
              <span className={styles.btnLabel}>User Management</span>
            </button>
          </li>
        </ul>

        <div className={styles.divider}></div>

=======
>>>>>>> b345ecb6cec937d07c74eeb5ff7cdb60018e1842
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
