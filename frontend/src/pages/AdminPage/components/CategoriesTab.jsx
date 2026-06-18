import React, { useState, useRef } from "react";
import styles from "../AdminPage.module.css";
import { compressImage } from "../../../utils/imageCompressor";
import ConfirmModal from "./ConfirmModal";

const BASE_URL = (import.meta.env.VITE_API_URL || "/api").replace(/\/api$/, "");

const CATEGORY_PNG_ICONS = [
  { value: "baby", label: "Baby", src: "/uploads/Icons/Category/baby.png" },
  { value: "birthday-cake", label: "Birthday Cake", src: "/uploads/Icons/Category/birthday-cake.png" },
  { value: "bridal-shower", label: "Bridal Shower", src: "/uploads/Icons/Category/bridal-shower.png" },
  { value: "bride", label: "Bride", src: "/uploads/Icons/Category/bride.png" },
  { value: "couple", label: "Couple", src: "/uploads/Icons/Category/couple.png" },
  { value: "manager", label: "Manager", src: "/uploads/Icons/Category/manager.png" },
  { value: "ring", label: "Ring", src: "/uploads/Icons/Category/ring.png" },
  { value: "wedding-couple", label: "Wedding Couple", src: "/uploads/Icons/Category/wedding-couple.png" },
];

const EMOJI_OPTIONS = ["🎂","💒","🌼","🍼","✨","🎉","💍","🌸","👰","🥳","🎈","🏮","🎓","❤️","🌺","🎪"];
const COLOR_OPTIONS = ["#B8729A","#9F507C","#D97706","#8B5CF6","#542141","#EC4899","#6366F1","#10B981","#F59E0B","#EF4444","#06B6D4","#84CC16"];

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

  // Confirm Modal States
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteError, setDeleteError] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);

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

  const triggerDelete = (id) => {
    setDeleteId(id);
    setDeleteError("");
    setDeleteLoading(false);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async (password) => {
    setDeleteLoading(true);
    setDeleteError("");
    const id = deleteId;

    try {
      // 1. Decode token to extract admin username
      const token = localStorage.getItem("admin_token");
      let username = "admin"; // Default fallback
      if (token) {
        try {
          const base64Url = token.split(".")[1];
          const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
          const jsonPayload = decodeURIComponent(
            window.atob(base64)
              .split("")
              .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
              .join("")
          );
          const payload = JSON.parse(jsonPayload);
          if (payload && payload.username) {
            username = payload.username;
          }
        } catch (e) {
          console.error("Error decoding token for verification:", e);
        }
      }

      // 2. Call admin auth login to verify the password
      const verifyRes = await fetch(`${BASE_URL}/api/admin/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!verifyRes.ok) {
        setDeleteError("Incorrect admin password.");
        setDeleteLoading(false);
        return;
      }

      // 3. Password verified! Execute delete request
      const res = await fetch(`${BASE_URL}/api/categories/${id}`, {
        method: "DELETE",
        headers: authHeaders,
      });
      if (!res.ok) throw new Error("Failed to delete category");
      
      setDeleteModalOpen(false);
      onRefresh();
    } catch (err) {
      setDeleteError(err.message);
    } finally {
      setDeleteLoading(false);
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

  return (
    <div className={styles.tabContent}>
      <div className={styles.tabHeader}>
        <div>
          <h2 className={styles.tabTitle}>🗂️ Categories</h2>
          <p className={styles.tabSubtitle}>Manage event categories shown on landing & items pages. Upload a photo and edit names/colors.</p>
        </div>
        <button className={styles.addBtn} onClick={() => setShowAddForm(!showAddForm)}>
          {showAddForm ? "✕ Cancel" : "➕ Add Category"}
        </button>
      </div>

      {/* ── Add New Category Form ── */}
      {showAddForm && (
        <div className={styles.catEditorCard} style={{ marginBottom: "24px", border: "2px dashed var(--admin-border)" }}>
          <h3 style={{ marginBottom: "16px", fontSize: "0.95rem", fontWeight: 700 }}>New Category</h3>
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

            <div className={styles.catEditorField} style={{ marginBottom: "16px" }}>
              <label style={{ fontWeight: 600, color: "var(--text-muted)", fontSize: "0.82rem" }}>Select Icon ({newForm.emoji})</label>
              <div style={{ 
                display: "grid", 
                gridTemplateRows: "repeat(2, auto)", 
                gridAutoFlow: "column",
                gap: "8px 12px", 
                overflowX: "auto", 
                paddingBottom: "8px",
                maxWidth: "100%",
                border: "1px solid var(--border-shadow, rgba(0,0,0,0.1))",
                borderRadius: "8px",
                padding: "10px",
                background: "rgba(0,0,0,0.01)"
              }}>
                {/* PNG Icons */}
                {CATEGORY_PNG_ICONS.map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setNewForm(p => ({ ...p, emoji: item.value }))}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "4px",
                      background: newForm.emoji === item.value ? "var(--btn-primary)" : "transparent",
                      border: "none",
                      borderRadius: "6px",
                      cursor: "pointer",
                      padding: "6px 10px",
                      flexShrink: 0,
                      minWidth: "64px"
                    }}
                  >
                    <img 
                      src={item.src} 
                      alt={item.label} 
                      style={{ width: "24px", height: "24px", objectFit: "contain", filter: newForm.emoji === item.value ? "brightness(0) invert(1)" : "none" }} 
                    />
                    <span style={{ 
                      fontSize: "0.6rem", 
                      color: newForm.emoji === item.value ? "white" : "var(--text-muted)",
                      fontWeight: 600,
                      whiteSpace: "nowrap"
                    }}>
                      {item.label}
                    </span>
                  </button>
                ))}

                {/* Standard Emojis */}
                {EMOJI_OPTIONS.map((e) => (
                  <button
                    key={e}
                    type="button"
                    onClick={() => setNewForm(p => ({ ...p, emoji: e }))}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "4px",
                      background: newForm.emoji === e ? "var(--btn-primary)" : "transparent",
                      border: "none",
                      borderRadius: "6px",
                      cursor: "pointer",
                      padding: "6px 10px",
                      flexShrink: 0,
                      minWidth: "64px"
                    }}
                  >
                    <span style={{ fontSize: "1.2rem" }}>{e}</span>
                    <span style={{ 
                      fontSize: "0.6rem", 
                      color: newForm.emoji === e ? "white" : "var(--text-muted)",
                      fontWeight: 600,
                      whiteSpace: "nowrap"
                    }}>
                      Emoji
                    </span>
                  </button>
                ))}
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

            <button type="submit" className={styles.addBtn} disabled={saving}>
              {uploading ? "Uploading..." : saving ? "Saving..." : "✅ Create Category"}
            </button>
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
                      <button className={styles.deleteBtn} onClick={() => triggerDelete(cat.id)}>🗑️ Delete</button>
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
                  </div>

                  <div className={styles.catEditorField} style={{ marginBottom: "16px" }}>
                    <label style={{ fontWeight: 600, color: "var(--text-muted)", fontSize: "0.82rem" }}>Select Icon ({form.emoji})</label>
                    <div style={{ 
                      display: "grid", 
                      gridTemplateRows: "repeat(2, auto)", 
                      gridAutoFlow: "column",
                      gap: "8px 12px", 
                      overflowX: "auto", 
                      paddingBottom: "8px",
                      maxWidth: "100%",
                      border: "1px solid var(--border-shadow, rgba(0,0,0,0.1))",
                      borderRadius: "8px",
                      padding: "10px",
                      background: "rgba(0,0,0,0.01)"
                    }}>
                      {/* PNG Icons */}
                      {CATEGORY_PNG_ICONS.map((item) => (
                        <button
                          key={item.value}
                          type="button"
                          onClick={() => setForm(p => ({ ...p, emoji: item.value }))}
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: "4px",
                            background: form.emoji === item.value ? "var(--btn-primary)" : "transparent",
                            border: "none",
                            borderRadius: "6px",
                            cursor: "pointer",
                            padding: "6px 10px",
                            flexShrink: 0,
                            minWidth: "64px"
                          }}
                        >
                          <img 
                            src={item.src} 
                            alt={item.label} 
                            style={{ width: "24px", height: "24px", objectFit: "contain", filter: form.emoji === item.value ? "brightness(0) invert(1)" : "none" }} 
                          />
                          <span style={{ 
                            fontSize: "0.6rem", 
                            color: form.emoji === item.value ? "white" : "var(--text-muted)",
                            fontWeight: 600,
                            whiteSpace: "nowrap"
                          }}>
                            {item.label}
                          </span>
                        </button>
                      ))}

                      {/* Standard Emojis */}
                      {EMOJI_OPTIONS.map((e) => (
                        <button
                          key={e}
                          type="button"
                          onClick={() => setForm(p => ({ ...p, emoji: e }))}
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: "4px",
                            background: form.emoji === e ? "var(--btn-primary)" : "transparent",
                            border: "none",
                            borderRadius: "6px",
                            cursor: "pointer",
                            padding: "6px 10px",
                            flexShrink: 0,
                            minWidth: "64px"
                          }}
                        >
                          <span style={{ fontSize: "1.2rem" }}>{e}</span>
                          <span style={{ 
                            fontSize: "0.6rem", 
                            color: form.emoji === e ? "white" : "var(--text-muted)",
                            fontWeight: 600,
                            whiteSpace: "nowrap"
                          }}>
                            Emoji
                          </span>
                        </button>
                      ))}
                    </div>
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

                  <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
                    <button className={styles.addBtn} onClick={() => handleSaveEdit(cat.id)} disabled={saving}>
                      {uploading ? "Uploading..." : saving ? "Saving..." : "💾 Save"}
                    </button>
                    <button className={styles.cancelBtn} onClick={cancelEdit}>Cancel</button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="🗑️ Delete Category"
        message={deleteId && ["proposal", "holud", "marriage", "baby", "baby-shower", "birthday"].includes(deleteId)
          ? `WARNING: "${deleteId}" is a system-predefined category. Deleting it may impact layout stability. Proceed? This action requires your admin password.`
          : `Are you sure you want to delete category "${deleteId}"? This action requires your admin password.`}
        requirePassword={true}
        confirmText="Verify & Delete"
        errorMessage={deleteError}
        isLoading={deleteLoading}
      />
    </div>
  );
}
