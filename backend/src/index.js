require("dotenv").config();
const express = require("express");
const cors = require("cors");
const db = require("./db");

const app = express();
const PORT = process.env.PORT || 4000;

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ── Routes ────────────────────────────────────────────────────────────────────

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Get all items
app.get("/api/items", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM items ORDER BY created_at DESC");
    res.json(rows);
  } catch (err) {
    console.error("Error fetching items:", err);
    res.status(500).json({ error: "Failed to fetch items" });
  }
});

// Get single item
app.get("/api/items/:id", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM items WHERE id = ?", [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: "Item not found" });
    res.json(rows[0]);
  } catch (err) {
    console.error("Error fetching item:", err);
    res.status(500).json({ error: "Failed to fetch item" });
  }
});

// Create item
app.post("/api/items", async (req, res) => {
  const { name, description } = req.body;
  if (!name) return res.status(400).json({ error: "Name is required" });
  try {
    const [result] = await db.query(
      "INSERT INTO items (name, description) VALUES (?, ?)",
      [name, description || null]
    );
    const [rows] = await db.query("SELECT * FROM items WHERE id = ?", [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error("Error creating item:", err);
    res.status(500).json({ error: "Failed to create item" });
  }
});

// Update item
app.put("/api/items/:id", async (req, res) => {
  const { name, description } = req.body;
  try {
    await db.query(
      "UPDATE items SET name = ?, description = ? WHERE id = ?",
      [name, description, req.params.id]
    );
    const [rows] = await db.query("SELECT * FROM items WHERE id = ?", [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: "Item not found" });
    res.json(rows[0]);
  } catch (err) {
    console.error("Error updating item:", err);
    res.status(500).json({ error: "Failed to update item" });
  }
});

// Delete item
app.delete("/api/items/:id", async (req, res) => {
  try {
    const [result] = await db.query("DELETE FROM items WHERE id = ?", [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: "Item not found" });
    res.json({ message: "Item deleted successfully" });
  } catch (err) {
    console.error("Error deleting item:", err);
    res.status(500).json({ error: "Failed to delete item" });
  }
});

// ── Start Server ──────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 Backend running on http://localhost:${PORT}`);
  console.log(`📡 API available at http://localhost:${PORT}/api`);
});
