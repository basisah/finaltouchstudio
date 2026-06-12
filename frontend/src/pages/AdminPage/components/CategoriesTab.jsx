import React, { useState, useRef } from "react";
import styles from "../AdminPage.module.css";
import { compressImage } from "../../../utils/imageCompressor";
import EmojiPicker from "../../../components/EmojiPicker/EmojiPicker";

const COLOR_OPTIONS = ["#B8729A","#9F507C","#D97706","#8B5CF6","#542141","#EC4899","#6366F1","#10B981","#F59E0B","#EF4444","#06B6D4","#84CC16"];

const BASE_URL = (import.meta.env.VITE_API_URL || "/api").replace(/\/api$/, "");

export default function CategoriesTab({ categories, onRefresh }) {
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({});
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newForm, setNewForm] = useState({ id: "", label: "", emoji: "🎉", color: "#B8729A", description: "" });
  const [newImageFile, setNewImageFile] = useState(null);
  const [editImageFile, setEditImageFile] = useState(null);
  const newFileRef = useRef();
  const editFileRef = useRef();

  const token = localStorage.getItem("admin_token");
  const authHeaders = { Authorization: `Bearer ${token}` };

  const uploadImage = async (file) => {
    const compressedFile = await compressImage(file);
    const fd = new FormData();
    fd.append("image", compressedFile);
    const res = await fetch(`${BASE_URL}/api/categories/upload-image`, {
      method: "POST",
      headers: authHeaders,
      body: fd,
    });
    if (!res.ok) throw new Error("Image upload failed");
    const data = await res.json();
    return data.url;
  };

  const startEdit = (cat) => {
    setEditingId(cat.id);
    setForm({ label: cat.label, emoji: cat.emoji, color: cat.color, description: cat.description || "", image_url: cat.image_url || "" });
    setEditImageFile(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm({});
    setEditImageFile(null);
  };

  const handleSaveEdit = async (id) => {
    setSaving(true);
    try {
      let imageUrl = form.image_url;
      if (editImageFile) {
        setUploading(true);
        imageUrl = await uploadImage(editImageFile);
        setUploading(false);
      }

      const res = await fetch(`${BASE_URL}/api/categories/${id}`, {
        method: "PUT",
        headers: { ...authHeaders, "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, image_url: imageUrl }),
      });
      if (!res.ok) throw new Error("Failed to update");
      onRefresh();
      cancelEdit();
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(`Delete category "${id}"? This will not delete its items.`)) return;
    try {
      const res = await fetch(`${BASE_URL}/api/categories/${id}`, {
        method: "DELETE",
        headers: authHeaders,
      });
      if (!res.ok) throw new Error("Failed to delete");
      onRefresh();
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  const handleAddNew = async (e) => {
    e.preventDefault();
    if (!newForm.id || !newForm.label) return alert("ID and Label are required");
    setSaving(true);
    try {
      let imageUrl = null;
      if (newImageFile) {
        setUploading(true);
        imageUrl = await uploadImage(newImageFile);
        setUploading(false);
      }

      const res = await fetch(`${BASE_URL}/api/categories`, {
        method: "POST",
        headers: { ...authHeaders, "Content-Type": "application/json" },
        body: JSON.stringify({ ...newForm, image_url: imageUrl }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to create");
      }
      onRefresh();
      setShowAddForm(false);
      setNewForm({ id: "", label: "", emoji: "🎉", color: "#B8729A", description: "" });
      setNewImageFile(null);
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleCancelAdd = () => {
    setShowAddForm(false);
    setNewForm({ id: "", label: "", emoji: "🎉", color: "#B8729A", description: "" });
    setNewImageFile(null);
  };

  return (
    <div className={styles.tabContent}>
      <div className={styles.tabHeader}>
        <div>
          <h2 className={styles.tabTitle}>🗂️ Categories</h2>
          <p className={styles.tabSubtitle}>Manage event categories shown on landing & items pages. Upload a photo and edit names/colors.</p>
        </div>
        <button
          type="button"
          className={styles.catHeaderAddBtn}
          onClick={() => setShowAddForm(true)}
          disabled={showAddForm}
        >
          ➕ Add Category
        </button>
      </div>

      {/* ── Add New Category Form ── */}
      {showAddForm && (
        <div className={styles.catEditorCard} style={{ marginBottom: "24px", border: "2px dashed var(--border-shadow)" }}>
          <div className={styles.catFormHeader}>
            <h3 className={styles.catFormTitle}>New Category</h3>
            <button
              type="button"
              className={styles.catFormCloseBtn}
              onClick={handleCancelAdd}
              aria-label="Close new category form"
            >
              ✕
            </button>
          </div>
          <form onSubmit={handleAddNew} className={styles.catEditorForm}>
            <div className={styles.catEditorRow}>
              <div className={styles.catEditorField}>
                <label>ID (slug, no spaces)</label>
                <input
                  className={styles.catEditorInput}
                  placeholder="e.g. graduation"
                  value={newForm.id}
                  onChange={e => setNewForm(p => ({ ...p, id: e.target.value.toLowerCase().replace(/\s+/g, "-") }))}
                  required
                />
              </div>
              <div className={styles.catEditorField}>
                <label>Label (display name)</label>
                <input
                  className={styles.catEditorInput}
                  placeholder="e.g. Graduation Party"
                  value={newForm.label}
                  onChange={e => setNewForm(p => ({ ...p, label: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className={styles.catEditorRow}>
              <EmojiPicker
                label="Emoji"
                value={newForm.emoji}
                onChange={(emoji) => setNewForm((p) => ({ ...p, emoji }))}
              />
              <div className={styles.catEditorField}>
                <label>Color</label>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "6px" }}>
                  {COLOR_OPTIONS.map(c => (
                    <div
                      key={c}
                      onClick={() => setNewForm(p => ({ ...p, color: c }))}
                      style={{
                        width: "28px", height: "28px", borderRadius: "50%", background: c, cursor: "pointer",
                        border: newForm.color === c ? "3px solid white" : "2px solid transparent",
                        boxShadow: newForm.color === c ? `0 0 0 2px ${c}` : "none"
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className={styles.catEditorField}>
              <label>Description</label>
              <textarea
                className={styles.catEditorInput}
                rows={2}
                placeholder="Short description shown on landing page..."
                value={newForm.description}
                onChange={e => setNewForm(p => ({ ...p, description: e.target.value }))}
              />
            </div>

            <div className={styles.catEditorField}>
              <label>Category Photo</label>
              <input ref={newFileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={e => setNewImageFile(e.target.files[0])} />
              <button type="button" className={styles.uploadImageBtn} onClick={() => newFileRef.current.click()}>
                {newImageFile ? `📎 ${newImageFile.name}` : "📷 Choose Image"}
              </button>
            </div>

            <div className={styles.catFormActions}>
              <button
                type="button"
                className={styles.catCancelBtn}
                onClick={handleCancelAdd}
                disabled={saving || uploading}
              >
                Cancel
              </button>
              <button type="submit" className={styles.catSubmitBtn} disabled={saving || uploading}>
                {uploading ? "Uploading…" : saving ? "Creating…" : "Create Category"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Existing Categories ── */}
      <div className={styles.catEditorList}>
        {categories.map((cat) => {
          const isEditing = editingId === cat.id;
          return (
            <div key={cat.id} className={styles.catEditorCard}>
              {!isEditing ? (
                /* ── View Mode ── */
                <div className={styles.catViewRow}>
                  <div className={styles.catViewThumb}>
                    {cat.image_url ? (
                      <img src={cat.image_url} alt={cat.label} className={styles.catThumbImg} />
                    ) : (
                      <div className={styles.catThumbPlaceholder} style={{ background: cat.color || "#B8729A" }}>
                        <span style={{ fontSize: "1.8rem" }}>{cat.emoji}</span>
                        <span style={{ fontSize: "0.6rem", color: "rgba(255,255,255,0.7)", marginTop: "4px" }}>[No Photo]</span>
                      </div>
                    )}
                  </div>
                  <div className={styles.catViewInfo}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ fontSize: "1.4rem" }}>{cat.emoji}</span>
                      <strong style={{ color: "var(--admin-text)" }}>{cat.label}</strong>
                      <span style={{ fontSize: "0.72rem", padding: "2px 8px", borderRadius: "99px", background: cat.color || "#B8729A", color: "#fff" }}>{cat.id}</span>
                    </div>
                    <p style={{ fontSize: "0.82rem", color: "var(--admin-muted)", marginTop: "4px" }}>
                      {cat.description || <em>No description</em>}
                    </p>
                    <div style={{ display: "flex", gap: "6px", marginTop: "10px" }}>
                      <button className={styles.editBtn} onClick={() => startEdit(cat)}>✏️ Edit</button>
                      <button className={styles.deleteBtn} onClick={() => handleDelete(cat.id)}>🗑️ Delete</button>
                    </div>
                  </div>
                  <div style={{ width: "20px", height: "20px", borderRadius: "50%", background: cat.color, flexShrink: 0 }} />
                </div>
              ) : (
                /* ── Edit Mode ── */
                <div className={styles.catEditorForm}>
                  <h4 style={{ marginBottom: "12px", fontSize: "0.88rem", color: "var(--admin-muted)" }}>Editing: <strong>{cat.id}</strong></h4>

                  <div className={styles.catEditorRow}>
                    <div className={styles.catEditorField}>
                      <label>Label</label>
                      <input className={styles.catEditorInput} value={form.label} onChange={e => setForm(p => ({ ...p, label: e.target.value }))} />
                    </div>
                    <EmojiPicker
                      label="Emoji"
                      value={form.emoji}
                      onChange={(emoji) => setForm((p) => ({ ...p, emoji }))}
                    />
                  </div>

                  <div className={styles.catEditorField}>
                    <label>Color</label>
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "6px" }}>
                      {COLOR_OPTIONS.map(c => (
                        <div
                          key={c}
                          onClick={() => setForm(p => ({ ...p, color: c }))}
                          style={{
                            width: "28px", height: "28px", borderRadius: "50%", background: c, cursor: "pointer",
                            border: form.color === c ? "3px solid white" : "2px solid transparent",
                            boxShadow: form.color === c ? `0 0 0 2px ${c}` : "none"
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  <div className={styles.catEditorField}>
                    <label>Description</label>
                    <textarea className={styles.catEditorInput} rows={2} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
                  </div>

                  <div className={styles.catEditorField}>
                    <label>Category Photo</label>
                    {(editImageFile ? URL.createObjectURL(editImageFile) : cat.image_url) && (
                      <img
                        src={editImageFile ? URL.createObjectURL(editImageFile) : cat.image_url}
                        alt="preview"
                        style={{ width: "120px", height: "80px", objectFit: "cover", borderRadius: "8px", marginBottom: "8px" }}
                      />
                    )}
                    <input ref={editFileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={e => setEditImageFile(e.target.files[0])} />
                    <button type="button" className={styles.uploadImageBtn} onClick={() => editFileRef.current.click()}>
                      {editImageFile ? `📎 ${editImageFile.name}` : "📷 Change Photo"}
                    </button>
                  </div>

                  <div className={styles.catFormActions}>
                    <button type="button" className={styles.catCancelBtn} onClick={cancelEdit} disabled={saving || uploading}>
                      Cancel
                    </button>
                    <button type="button" className={styles.catSubmitBtn} onClick={() => handleSaveEdit(cat.id)} disabled={saving || uploading}>
                      {uploading ? "Uploading…" : saving ? "Saving…" : "Save Changes"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
