import React from "react";
import styles from "../AdminPage.module.css";
import { INVENTORY_CATEGORIES } from "../../../constants/inventory";

export default function InventoryTab({
  activeCategory,
  activeCategoryItems,
  handleToggleAvailability,
  handleDeleteItem,
  handleAddItem,
  newItemSN,
  setNewItemSN,
  newItemPic,
  setNewItemPic,
  newItemName,
  setNewItemName,
  newItemDesc,
  setNewItemDesc,
  newItemSubCategory,
  setNewItemSubCategory,
  newItemFile,
  setNewItemFile,
  newItemUnitCount,
  setNewItemUnitCount,
}) {
  const currentInventoryCatObj = INVENTORY_CATEGORIES.find(c => c.id === activeCategory.id);
  const subcategories = currentInventoryCatObj?.subcategories || [];
  return (
    <div className={styles.categoryGrid}>
      {/* Task Controls: Inventory List */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h2>
            {activeCategory.emoji} {activeCategory.label} Inventory ({activeCategoryItems.length})
          </h2>
          <p>Review rental items, availability, and serials</p>
        </div>

        {activeCategoryItems.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No items configured in this category. Create one below on the right!</p>
          </div>
        ) : (
          <div className={styles.tableWrapper} style={{ overflowX: "hidden" }}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Item Details</th>
                  <th>Availability Switch</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {activeCategoryItems.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div style={{ display: "flex", gap: "14px", alignItems: "center" }}>
                        {/* Image / Emoji Thumbnail */}
                        <div style={{ flexShrink: 0 }}>
                          {item.image && item.image.startsWith("/uploads") ? (
                            <img 
                              src={item.image} 
                              alt={item.name} 
                              style={{ width: "44px", height: "44px", objectFit: "cover", borderRadius: "8px", display: "block" }} 
                            />
                          ) : (
                            <span className={styles.itemEmojiPic} style={{ width: "44px", height: "44px", borderRadius: "8px" }} title="Item visual thumb">
                              {item.image}
                            </span>
                          )}
                        </div>
                        {/* Text Information Stack */}
                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                            <code style={{ fontSize: "0.72rem", background: "var(--bg-main)", padding: "2px 6px", borderRadius: "4px", border: "1px solid var(--border-shadow)", color: "var(--text-main)", fontWeight: "600" }}>
                              {item.serialNumber || item.id}
                            </code>
                            <strong style={{ fontSize: "0.95rem", color: "var(--text-main)" }}>{item.name || item.title}</strong>
                          </div>
                          <p className={styles.tableSmallDesc} style={{ margin: "4px 0 6px", lineHeight: "1.4" }}>{item.description}</p>
                          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", alignItems: "center" }}>
                            <span className={styles.btnCount} style={{ background: "rgba(165, 110, 189, 0.12)", color: "var(--btn-primary)", fontSize: "10px", fontWeight: "700", padding: "2px 6px", borderRadius: "4px" }}>
                              Stock: {item.unit_count || 1} units
                            </span>
                            <span className={styles.btnCount} style={{ background: "rgba(73, 34, 91, 0.05)", color: "var(--text-muted)", fontSize: "10px", fontWeight: "700", padding: "2px 6px", borderRadius: "4px", border: "1px solid var(--border-shadow)" }}>
                              {subcategories.find(s => s.id === item.subCategoryId)?.label || item.subCategoryId || "General"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className={styles.availabilityToggle}>
                        <span
                          className={`${styles.statusLabel} ${item.isAvailable ? styles.statusAvailable : styles.statusBooked}`}
                        >
                          {item.isAvailable ? "Available" : "Booked"}
                        </span>
                        <label className={styles.switch}>
                          <input
                            type="checkbox"
                            checked={item.isAvailable}
                            onChange={() => handleToggleAvailability(item.id)}
                          />
                          <span className={styles.slider}></span>
                        </label>
                      </div>
                    </td>
                    <td>
                      <button
                        className={styles.deleteItemBtn}
                        onClick={() => handleDeleteItem(item.id)}
                      >
                        🗑️ Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Task Controls: Add New Item Form */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h2>➕ Add to Inventory</h2>
          <p>Configure details for a new product entry</p>
        </div>

        <form onSubmit={handleAddItem} className={styles.itemForm}>
          <div className={styles.inputGroup}>
            <label htmlFor="itemSN">Unique Serial Number</label>
            <input
              id="itemSN"
              type="text"
              placeholder="e.g. SN-BTH-003"
              value={newItemSN}
              onChange={(e) => setNewItemSN(e.target.value)}
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="itemPic">Visual Symbol / Icon</label>
            <select
              id="itemPic"
              value={newItemPic}
              onChange={(e) => setNewItemPic(e.target.value)}
              className={styles.picSelect}
            >
              <option value="✨">✨ sparkle</option>
              <option value="🎂">🎂 cake</option>
              <option value="💍">💍 ring</option>
              <option value="💒">💒 stage</option>
              <option value="🌸">🌸 flower</option>
              <option value="🧸">🧸 teddy</option>
              <option value="🎈">🎈 balloon</option>
              <option value="💡">💡 neon</option>
              <option value="🌹">🌹 rose</option>
            </select>
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="itemSubCategory">Subcategory Grouping</label>
            {subcategories.length > 0 ? (
              <select
                id="itemSubCategory"
                value={newItemSubCategory}
                onChange={(e) => setNewItemSubCategory(e.target.value)}
                className={styles.picSelect}
                required
              >
                <option value="">-- Select Subcategory --</option>
                {subcategories.map(sub => (
                  <option key={sub.id} value={sub.id}>{sub.emoji} {sub.label}</option>
                ))}
              </select>
            ) : (
              <input
                id="itemSubCategory"
                type="text"
                placeholder="e.g. backdrops, lights, props..."
                value={newItemSubCategory}
                onChange={(e) => setNewItemSubCategory(e.target.value)}
                required
              />
            )}
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="itemPhoto">Upload Item Photo (Optional)</label>
            <input
              id="itemPhoto"
              type="file"
              accept="image/*"
              onChange={(e) => setNewItemFile(e.target.files[0])}
              style={{ padding: "6px" }}
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="itemUnitCount">Stock Quantity in Inventory</label>
            <input
              id="itemUnitCount"
              type="number"
              min="1"
              value={newItemUnitCount}
              onChange={(e) => setNewItemUnitCount(parseInt(e.target.value, 10) || 1)}
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="itemName">Item Title</label>
            <input
              id="itemName"
              type="text"
              placeholder="e.g. Classic White Velvet Stage Chair"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="itemDesc">Item Description</label>
            <textarea
              id="itemDesc"
              rows={3}
              placeholder="Rental set specifications, quantity and measurements..."
              value={newItemDesc}
              onChange={(e) => setNewItemDesc(e.target.value)}
            />
          </div>

          <button type="submit" className={styles.addItemBtn}>
            ✦ Add Item to category
          </button>
        </form>
      </div>
    </div>
  );
}
