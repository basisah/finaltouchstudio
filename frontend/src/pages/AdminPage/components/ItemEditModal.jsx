import React, { useEffect, useState } from "react";
import styles from "../AdminPage.module.css";
import { INVENTORY_CATEGORIES } from "../../../constants/inventory";

const EMOJI_OPTIONS = ["✨", "🎂", "💍", "💒", "🌸", "🧸", "🎈", "💡", "🌹", "🖼️", "🍼", "👑"];

const emptyForm = {
  name: "",
  description: "",
  categoryId: "",
  subCategoryId: "",
  unit_count: 1,
  isAvailable: true,
  imageEmoji: "✨",
};

export default function ItemEditModal({ item, categories, onClose, onSave, isSaving }) {
  const [form, setForm] = useState(emptyForm);
  const [imageFile, setImageFile] = useState(null);

  useEffect(() => {
    if (!item) return;
    const hasUpload = item.image && String(item.image).startsWith("/uploads");
    setForm({
      name: item.name || item.title || "",
      description: item.description || "",
      categoryId: item.categoryId || "",
      subCategoryId: item.subCategoryId || "",
      unit_count: item.unit_count || 1,
      isAvailable: Boolean(item.isAvailable),
      imageEmoji: hasUpload ? "✨" : item.image || "✨",
    });
    setImageFile(null);
  }, [item]);

  if (!item) return null;

  const inventoryCat = INVENTORY_CATEGORIES.find((c) => c.id === form.categoryId);
  const subcategories = inventoryCat?.subcategories || [];
  const hasUpload = item.image && String(item.image).startsWith("/uploads");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.categoryId) return;
    onSave({
      id: item.id,
      ...form,
      name: form.name.trim(),
      title: form.name.trim(),
      unit_count: parseInt(form.unit_count, 10) || 1,
      imageFile,
    });
  };

  return (
    <div className={styles.itemModalOverlay} onClick={onClose} role="presentation">
      <div
        className={styles.itemModalCard}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-item-title"
      >
        <div className={styles.itemModalHeader}>
          <div>
            <h2 id="edit-item-title">Edit Item</h2>
            <p className={styles.itemModalSerial}>Serial: {item.id}</p>
          </div>
          <button type="button" className={styles.itemModalClose} onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.itemModalForm}>
          <div className={styles.itemModalPreview}>
            {hasUpload && !imageFile ? (
              <img src={item.image} alt="" className={styles.itemModalPreviewImg} />
            ) : (
              <span className={styles.itemModalPreviewEmoji}>{form.imageEmoji}</span>
            )}
            <span className={styles.itemModalPreviewHint}>
              {imageFile ? "New photo selected" : hasUpload ? "Current photo" : "Icon preview"}
            </span>
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="editItemName">Item Title</label>
            <input
              id="editItemName"
              type="text"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="editItemDesc">Description</label>
            <textarea
              id="editItemDesc"
              rows={3}
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
            />
          </div>

          <div className={styles.itemModalRow}>
            <div className={styles.inputGroup}>
              <label htmlFor="editItemCategory">Product Type</label>
              <select
                id="editItemCategory"
                className={styles.picSelect}
                value={form.categoryId}
                onChange={(e) =>
                  setForm((p) => ({ ...p, categoryId: e.target.value, subCategoryId: "" }))
                }
                required
              >
                <option value="" disabled>
                  Select category
                </option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.emoji} {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="editItemSubCategory" title="Occasion / Collection">
                Occasion
              </label>
              {subcategories.length > 0 ? (
                <select
                  id="editItemSubCategory"
                  className={styles.picSelect}
                  value={form.subCategoryId}
                  onChange={(e) => setForm((p) => ({ ...p, subCategoryId: e.target.value }))}
                  required
                >
                  <option value="">-- Select --</option>
                  {subcategories.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.emoji} {sub.label}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  id="editItemSubCategory"
                  type="text"
                  value={form.subCategoryId}
                  onChange={(e) => setForm((p) => ({ ...p, subCategoryId: e.target.value }))}
                  placeholder="e.g. backdrops"
                  required
                />
              )}
            </div>
          </div>

          <div className={styles.itemModalRow}>
            <div className={styles.inputGroup}>
              <label htmlFor="editItemQty">Stock Quantity</label>
              <input
                id="editItemQty"
                type="number"
                min="1"
                value={form.unit_count}
                onChange={(e) =>
                  setForm((p) => ({ ...p, unit_count: parseInt(e.target.value, 10) || 1 }))
                }
                required
              />
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="editItemIcon">Icon (if no photo)</label>
              <select
                id="editItemIcon"
                className={styles.picSelect}
                value={form.imageEmoji}
                onChange={(e) => setForm((p) => ({ ...p, imageEmoji: e.target.value }))}
              >
                {EMOJI_OPTIONS.map((emoji) => (
                  <option key={emoji} value={emoji}>
                    {emoji}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="editItemPhoto">Replace Photo (optional)</label>
            <input
              id="editItemPhoto"
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files?.[0] || null)}
              style={{ padding: "6px" }}
            />
          </div>

          <label className={styles.itemModalCheckRow}>
            <input
              type="checkbox"
              checked={form.isAvailable}
              onChange={(e) => setForm((p) => ({ ...p, isAvailable: e.target.checked }))}
            />
            <span>Available for rental</span>
          </label>

          <div className={styles.itemModalActions}>
            <button type="button" className={styles.cancelCatBtn} onClick={onClose} disabled={isSaving}>
              Cancel
            </button>
            <button type="submit" className={styles.addItemBtn} disabled={isSaving}>
              {isSaving ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
