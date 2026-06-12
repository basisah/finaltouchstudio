import React, { useState, useEffect } from "react";
import styles from "../AdminPage.module.css";
import { getPackages, getItems } from "../../../api/packages.api";
import { createPackage, updatePackage, deletePackage } from "../../../api/admin/packages.api";
import { INVENTORY_CATEGORIES } from "../../../constants/inventory";
import {
  DISPLAY_CATEGORIES,
  getDisplayCategoryId,
} from "../../ItemsPage/itemsPageCategories";

export default function PackagesTab() {
  const [packages, setPackages] = useState([]);
  const [allItems, setAllItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState(null);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const packageCategories = DISPLAY_CATEGORIES.filter((c) => c.id !== "all");
  const [categoryId, setCategoryId] = useState(packageCategories[0]?.id || "");
  const [selectedItemIds, setSelectedItemIds] = useState([]);

  const categoriesList = packageCategories;

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [pkgsData, itemsData] = await Promise.all([getPackages(), getItems()]);
      setPackages(pkgsData || []);
      setAllItems(itemsData || []);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
      setError("Failed to load packages and items from database.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleOpenCreateModal = () => {
    setEditingPackage(null);
    setName("");
    setPrice("");
    setCategoryId(packageCategories[0]?.id || "");
    setSelectedItemIds([]);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (pkg) => {
    setEditingPackage(pkg);
    setName(pkg.name);
    setPrice(pkg.price);
    setCategoryId(pkg.category_id);
    setSelectedItemIds(pkg.items ? pkg.items.map((item) => item.id) : []);
    setIsModalOpen(true);
  };

  const handleDeletePkg = async (pkgId) => {
    if (window.confirm("Are you sure you want to delete this package?")) {
      try {
        await deletePackage(pkgId);
        fetchDashboardData();
      } catch (err) {
        alert("Failed to delete package: " + err.message);
      }
    }
  };

  const handleToggleItemSelection = (itemId) => {
    setSelectedItemIds((prev) =>
      prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]
    );
  };

  const handleSavePackage = async (e) => {
    e.preventDefault();
    if (!name.trim() || !price || !categoryId) {
      alert("Please fill in all required fields.");
      return;
    }

    const payload = {
      name,
      price: parseFloat(price),
      category_id: categoryId,
      itemIds: selectedItemIds,
    };

    try {
      if (editingPackage) {
        await updatePackage(editingPackage.id, payload);
      } else {
        await createPackage(payload);
      }
      setIsModalOpen(false);
      fetchDashboardData();
    } catch (err) {
      alert("Failed to save package: " + err.message);
    }
  };

  const filteredItemsForCategory = allItems.filter(
    (item) => getDisplayCategoryId(item.categoryId) === categoryId
  );

  const groupedItems = INVENTORY_CATEGORIES.map((productType) => {
    const typeItems = filteredItemsForCategory.filter(
      (item) => item.categoryId === productType.id
    );
    return { sub: productType, items: typeItems };
  }).filter((group) => group.items.length > 0);

  const unassignedItems = filteredItemsForCategory.filter(
    (item) =>
      !INVENTORY_CATEGORIES.some((cat) => cat.id === item.categoryId) &&
      getDisplayCategoryId(item.categoryId) === categoryId
  );

  if (loading) {
    return <div className={styles.emptyState}><p>Loading packages data...</p></div>;
  }

  return (
    <div className={styles.categoryGrid}>
      <div className={styles.card} style={{ gridColumn: "span 2" }}>
        <div className={styles.cardHeader} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h2>📦 Decor Packages</h2>
            <p>Bundle items by inventory category</p>
          </div>
          <button className={styles.addItemBtn} style={{ width: "auto", marginTop: 0 }} onClick={handleOpenCreateModal}>
            ➕ Create Custom Package
          </button>
        </div>

        {error && <div style={{ color: "red", padding: "10px 20px" }}>{error}</div>}

        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Category</th>
                <th>Package Name</th>
                <th>Price (CAD)</th>
                <th>Included Items</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {packages.length === 0 ? (
                <tr>
                  <td colSpan="5" className={styles.emptyState}>No packages configured yet. Click 'Create Custom Package' to start!</td>
                </tr>
              ) : (
                packages.map((pkg) => {
                  const cat = categoriesList.find((c) => c.id === pkg.category_id);
                  return (
                    <tr key={pkg.id}>
                      <td>
                        <strong>{cat ? `${cat.emoji} ${cat.label}` : pkg.category_id}</strong>
                      </td>
                      <td>
                        <strong>{pkg.name}</strong>
                      </td>
                      <td>
                        <code>CAD ${parseFloat(pkg.price).toLocaleString()}</code>
                      </td>
                      <td>
                        <span className={styles.btnCount} style={{ background: "var(--clr-mulberry-mix)", color: "white" }}>
                          {pkg.items ? pkg.items.length : 0} items selected
                        </span>
                        <div style={{ fontSize: "0.8rem", color: "var(--txt-muted)", marginTop: "4px", maxWidth: "400px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {pkg.items && pkg.items.map((i) => i.title).join(", ")}
                        </div>
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: "10px" }}>
                          <button
                            className={styles.addCategoryTrigger}
                            style={{ width: "auto", padding: "6px 12px", background: "rgba(255,255,255,0.1)", border: "1px solid var(--border)" }}
                            onClick={() => handleOpenEditModal(pkg)}
                          >
                            ✏️ Edit
                          </button>
                          <button
                            className={styles.deleteItemBtn}
                            style={{ margin: 0, padding: "6px 12px" }}
                            onClick={() => handleDeletePkg(pkg.id)}
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Premium Edit / Create Modal Pop-up */}
      {isModalOpen && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(34, 12, 27, 0.7)",
          backdropFilter: "blur(8px)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 9999,
        }}>
          <div className={styles.card} style={{ width: "600px", maxWidth: "90%", maxHeight: "85vh", overflowY: "auto", padding: "30px" }}>
            <div className={styles.cardHeader}>
              <h2>{editingPackage ? "✏️ Edit Package" : "➕ Create Custom Package"}</h2>
              <p>Configure items and price for this special celebration package</p>
            </div>

            <form onSubmit={handleSavePackage} className={styles.itemForm} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div className={styles.inputGroup}>
                <label>Package Name</label>
                <input
                  type="text"
                  placeholder="e.g. Birthday Magic Package"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className={styles.inputGroup}>
                <label>Package Category</label>
                <select
                  value={categoryId}
                  onChange={(e) => {
                    setCategoryId(e.target.value);
                    setSelectedItemIds([]); // Clear selection when changing category to avoid mixing category items
                  }}
                  className={styles.picSelect}
                  disabled={!!editingPackage} // Category is locked during edit to maintain single package per category constraint
                >
                  {categoriesList.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.emoji} {c.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.inputGroup}>
                <label>Package Price (CAD)</label>
                <input
                  type="number"
                  placeholder="e.g. 150"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                />
              </div>

              <div className={styles.inputGroup}>
                <label>Select Items to Include ({selectedItemIds.length} selected)</label>
                <div style={{
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-sm)",
                  padding: "12px",
                  maxHeight: "200px",
                  overflowY: "auto",
                  background: "var(--clr-portrait-pink)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                }}>
                  {filteredItemsForCategory.length === 0 ? (
                    <p style={{ color: "var(--txt-muted)", fontSize: "0.85rem" }}>
                      No items found in this category. Add items in Items Management first!
                    </p>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                      {groupedItems.map(({ sub, items: subItems }) => {
                        if (subItems.length === 0) return null;
                        return (
                          <div key={sub.id} style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                            <strong style={{ fontSize: "0.75rem", color: "var(--txt-muted)", textTransform: "uppercase", letterSpacing: "0.5px", display: "flex", alignItems: "center", gap: "6px" }}>
                              <span>{sub.emoji}</span> <span>{sub.label}</span>
                            </strong>
                            <div style={{ display: "flex", flexDirection: "column", gap: "6px", paddingLeft: "8px" }}>
                              {subItems.map((item) => (
                                <label key={item.id} style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", fontSize: "0.9rem" }}>
                                  <input
                                    type="checkbox"
                                    checked={selectedItemIds.includes(item.id)}
                                    onChange={() => handleToggleItemSelection(item.id)}
                                    style={{ cursor: "pointer" }}
                                  />
                                  <span>{item.title}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                      {unassignedItems.length > 0 && (
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                          <strong style={{ fontSize: "0.75rem", color: "var(--txt-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                            Other Items
                          </strong>
                          <div style={{ display: "flex", flexDirection: "column", gap: "6px", paddingLeft: "8px" }}>
                            {unassignedItems.map((item) => (
                              <label key={item.id} style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", fontSize: "0.9rem" }}>
                                <input
                                  type="checkbox"
                                  checked={selectedItemIds.includes(item.id)}
                                  onChange={() => handleToggleItemSelection(item.id)}
                                  style={{ cursor: "pointer" }}
                                />
                                <span>{item.title}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className={styles.cancelCatBtn}
                  style={{ cursor: "pointer" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={styles.addItemBtn}
                  style={{ width: "auto", margin: 0, cursor: "pointer" }}
                >
                  ✦ Save Package
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
