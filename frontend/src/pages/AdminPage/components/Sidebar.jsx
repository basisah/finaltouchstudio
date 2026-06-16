import React from "react";
import styles from "../AdminPage.module.css";

export default function Sidebar({
  categories,
  items,
  members,
  payments,
  activeTab,
  setActiveTab,
  showAddCatForm,
  setShowAddCatForm,
  newCatLabel,
  setNewCatLabel,
  newCatEmoji,
  setNewCatEmoji,
  handleAddCategory,
  handleDeleteCategory,
  setSearchQuery,
  handleLogout,
  isSidebarOpen,
  setIsSidebarOpen,
}) {
  const activeCategory = categories.find((cat) => cat.id === activeTab);

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
        {/* Section 1: Item Categories */}
        <p className={styles.navLabel}>Item Categories</p>
        <ul className={styles.catList}>
          {categories.map((cat) => (
            <li key={cat.id}>
              <button
                className={`${styles.navBtn} ${activeTab === cat.id ? styles.active : ""}`}
                onClick={() => {
                  setActiveTab(cat.id);
                  setShowAddCatForm(false);
                  setSearchQuery(""); // Clear search when navigating
                  if (setIsSidebarOpen) setIsSidebarOpen(false);
                }}
              >
                <span className={styles.btnEmoji}>{cat.emoji}</span>
                <span className={styles.btnLabel}>{cat.label}</span>
                <span className={styles.btnCount}>
                  {items.filter((item) => item.categoryId === cat.id).length}
                </span>
              </button>
            </li>
          ))}
        </ul>

        {/* Add Category Controls */}
        <div className={styles.categoryControls}>
          {!showAddCatForm ? (
            <button
              className={styles.addCategoryTrigger}
              onClick={() => {
                setShowAddCatForm(true);
                setActiveTab("");
                setSearchQuery("");
                if (setIsSidebarOpen) setIsSidebarOpen(false);
              }}
            >
              ➕ Add New Category
            </button>
          ) : (
            <form onSubmit={handleAddCategory} className={styles.addCatForm}>
              <h4>New Category</h4>
              <div className={styles.formRow}>
                <input
                  type="text"
                  placeholder="e.g. Graduation"
                  value={newCatLabel}
                  onChange={(e) => setNewCatLabel(e.target.value)}
                  className={styles.catInput}
                  required
                  autoFocus
                />
                <select
                  value={newCatEmoji}
                  onChange={(e) => setNewCatEmoji(e.target.value)}
                  className={styles.catEmojiSelect}
                >
                  <option value="🎓">🎓</option>
                  <option value="🎂">🎂</option>
                  <option value="💍">💍</option>
                  <option value="💒">💒</option>
                  <option value="🌸">🌸</option>
                  <option value="🍼">🍼</option>
                  <option value="🎈">🎈</option>
                  <option value="🥳">🥳</option>
                  <option value="👔">👔</option>
                </select>
              </div>
              <div className={styles.catFormActions}>
                <button type="submit" className={styles.saveCatBtn}>Save</button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddCatForm(false);
                    if (categories.length > 0) setActiveTab(categories[0].id);
                  }}
                  className={styles.cancelCatBtn}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {activeCategory && !["proposal", "holud", "marriage", "baby", "baby-shower", "birthday"].includes(activeCategory.id) && (
            <button
              className={styles.deleteCategoryBtn}
              onClick={() => handleDeleteCategory(activeCategory.id)}
            >
              🗑️ Delete "{activeCategory.label}"
            </button>
          )}
        </div>

        <div className={styles.divider}></div>

        {/* Section 2: Management Functionalities */}
        <p className={styles.navLabel}>Management Modules</p>
        <ul className={styles.sysList}>
          <li>
            <button
              className={`${styles.navBtn} ${activeTab === "members" ? styles.active : ""}`}
              onClick={() => {
                setActiveTab("members");
                setShowAddCatForm(false);
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
              className={`${styles.navBtn} ${activeTab === "payments" ? styles.active : ""}`}
              onClick={() => {
                setActiveTab("payments");
                setShowAddCatForm(false);
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
              className={`${styles.navBtn} ${activeTab === "packages" ? styles.active : ""}`}
              onClick={() => {
                setActiveTab("packages");
                setShowAddCatForm(false);
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
              className={`${styles.navBtn} ${activeTab === "categories" ? styles.active : ""}`}
              onClick={() => {
                setActiveTab("categories");
                setShowAddCatForm(false);
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
        <button onClick={handleLogout} className={styles.logoutBtn}>
          Logout <span>🚪</span>
        </button>
      </div>
    </aside>
  );
}
