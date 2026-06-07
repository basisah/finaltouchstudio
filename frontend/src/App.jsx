import { useState, useEffect, useCallback } from "react";
import styles from "./App.module.css";

const API = "/api";

// ── Status Dot ────────────────────────────────────────────────────────────────
function StatusDot({ status }) {
  const map = {
    connected: { label: "API Connected", color: "#10b981" },
    disconnected: { label: "API Offline", color: "#ef4444" },
    checking: { label: "Checking...", color: "#f59e0b" },
  };
  const { label, color } = map[status] || map.checking;
  return (
    <span className={styles.statusDot} style={{ "--dot-color": color }}>
      <span className={styles.dot} />
      {label}
    </span>
  );
}

// ── Item Card ─────────────────────────────────────────────────────────────────
function ItemCard({ item, onDelete, onEdit }) {
  return (
    <div className={`${styles.card} animate-in`}>
      <div className={styles.cardHeader}>
        <span className={styles.cardId}>#{item.id}</span>
        <div className={styles.cardActions}>
          <button className={styles.btnIcon} onClick={() => onEdit(item)} title="Edit">
            ✏️
          </button>
          <button className={`${styles.btnIcon} ${styles.danger}`} onClick={() => onDelete(item.id)} title="Delete">
            🗑️
          </button>
        </div>
      </div>
      <h3 className={styles.cardTitle}>{item.name}</h3>
      {item.description && <p className={styles.cardDesc}>{item.description}</p>}
      <span className={styles.cardDate}>
        {new Date(item.created_at).toLocaleDateString("en-US", {
          month: "short", day: "numeric", year: "numeric",
        })}
      </span>
    </div>
  );
}

// ── Modal Form ────────────────────────────────────────────────────────────────
function ItemModal({ item, onSave, onClose }) {
  const [name, setName] = useState(item?.name || "");
  const [description, setDescription] = useState(item?.description || "");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    await onSave({ name, description });
    setSaving(false);
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>{item ? "Edit Item" : "New Item"}</h2>
          <button className={styles.btnClose} onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label htmlFor="item-name">Name *</label>
            <input
              id="item-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter item name"
              required
              autoFocus
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="item-desc">Description</label>
            <textarea
              id="item-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description..."
              rows={3}
            />
          </div>
          <div className={styles.modalFooter}>
            <button type="button" className={styles.btnSecondary} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className={styles.btnPrimary} disabled={saving}>
              {saving ? "Saving..." : item ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────────
export default function App() {
  const [items, setItems] = useState([]);
  const [apiStatus, setApiStatus] = useState("checking");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalItem, setModalItem] = useState(null); // null = closed, false = new, object = edit
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Check API health
  useEffect(() => {
    const check = async () => {
      try {
        const res = await fetch(`${API}/health`);
        setApiStatus(res.ok ? "connected" : "disconnected");
      } catch {
        setApiStatus("disconnected");
      }
    };
    check();
    const interval = setInterval(check, 10000);
    return () => clearInterval(interval);
  }, []);

  // Fetch items
  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API}/items`);
      if (!res.ok) throw new Error("Failed to load items");
      setItems(await res.json());
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const handleSave = async ({ name, description }) => {
    try {
      const url = modalItem ? `${API}/items/${modalItem.id}` : `${API}/items`;
      const method = modalItem ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description }),
      });
      if (!res.ok) throw new Error("Save failed");
      setModalItem(null);
      await fetchItems();
      showToast(modalItem ? "Item updated!" : "Item created!");
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this item?")) return;
    try {
      const res = await fetch(`${API}/items/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      await fetchItems();
      showToast("Item deleted!");
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  return (
    <div className={styles.app}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.brand}>
            <div className={styles.logo}>FTS</div>
            <div>
              <h1 className={styles.brandName}>FinalTouch Studio</h1>
              <p className={styles.brandSub}>React · Node.js · MySQL</p>
            </div>
          </div>
          <div className={styles.headerRight}>
            <StatusDot status={apiStatus} />
            <button
              id="new-item-btn"
              className={styles.btnPrimary}
              onClick={() => setModalItem(false)}
            >
              + New Item
            </button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className={styles.main}>
        {/* Stats bar */}
        <div className={styles.statsBar}>
          <div className={styles.stat}>
            <span className={styles.statValue}>{items.length}</span>
            <span className={styles.statLabel}>Total Items</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statValue} style={{ color: "var(--success)" }}>
              {apiStatus === "connected" ? "●" : "○"}
            </span>
            <span className={styles.statLabel}>Database</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statValue} style={{ color: "var(--accent)" }}>Live</span>
            <span className={styles.statLabel}>Reload</span>
          </div>
        </div>

        {/* Content */}
        {loading && (
          <div className={styles.center}>
            <div className={styles.spinner} />
            <p>Loading items...</p>
          </div>
        )}

        {error && (
          <div className={styles.errorBanner}>
            ⚠️ {error} — <button onClick={fetchItems}>Retry</button>
          </div>
        )}

        {!loading && !error && items.length === 0 && (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>📦</div>
            <h2>No items yet</h2>
            <p>Create your first item to get started</p>
            <button className={styles.btnPrimary} onClick={() => setModalItem(false)}>
              + Create Item
            </button>
          </div>
        )}

        {!loading && items.length > 0 && (
          <div className={styles.grid}>
            {items.map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                onDelete={handleDelete}
                onEdit={(i) => setModalItem(i)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Modal */}
      {modalItem !== null && (
        <ItemModal
          item={modalItem || null}
          onSave={handleSave}
          onClose={() => setModalItem(null)}
        />
      )}

      {/* Toast */}
      {toast && (
        <div className={`${styles.toast} ${styles[toast.type]}`}>
          {toast.type === "success" ? "✅" : "❌"} {toast.msg}
        </div>
      )}
    </div>
  );
}
