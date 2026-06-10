import React from "react";
import styles from "../AdminPage.module.css";

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
}) {
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
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Serial No.</th>
                  <th>Image</th>
                  <th>Item Name & Info</th>
                  <th>Availability Switch</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {activeCategoryItems.map((item) => (
                  <tr key={item.id}>
                    <td className={styles.serialNumCol}>
                      <code>{item.serialNumber}</code>
                    </td>
                    <td className={styles.thumbnailCol}>
                      <span className={styles.itemEmojiPic} title="Item visual thumb">
                        {item.image}
                      </span>
                    </td>
                    <td>
                      <strong>{item.name}</strong>
                      <p className={styles.tableSmallDesc}>{item.description}</p>
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
