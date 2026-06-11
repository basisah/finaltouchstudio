require("dotenv").config();
const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const db = require("./db");
const auth = require("./middleware/auth");
const initializeDatabase = require("./initDb");
const packageRoutes = require("./routes/packageRoutes");
const contactRoutes = require("./routes/contactRoutes");

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Initialize database tables and seed data (skipped in tests — tests call this explicitly)
if (process.env.JEST_WORKER_ID === undefined) {
  initializeDatabase();
}

// Mount routers
app.use("/api/packages", packageRoutes);
app.use("/api/contact", contactRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Admin Login
app.post("/api/auth/login", (req, res) => {
  const { username, password } = req.body;
  
  const adminUsername = process.env.ADMIN_USERNAME || "admin";
  const adminPassword = process.env.ADMIN_PASSWORD || "password";

  if (username === adminUsername && password === adminPassword) {
    const token = jwt.sign({ username }, process.env.JWT_SECRET || "default_dev_secret", {
      expiresIn: "24h"
    });
    return res.json({ token });
  }

  res.status(401).json({ error: "Invalid credentials" });
});

// Verify token
app.get("/api/auth/verify", auth, (req, res) => {
  res.json({ valid: true, user: req.user });
});

// Get all items
app.get("/api/items", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM items ORDER BY categoryId, id");
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

// Create item (Protected)
app.post("/api/items", auth, async (req, res) => {
  const { id, title, categoryId, subCategoryId, description, isAvailable, image } = req.body;
  if (!id || !title || !categoryId) {
    return res.status(400).json({ error: "id, title, and categoryId are required" });
  }
  try {
    await db.query(
      "INSERT INTO items (id, title, categoryId, subCategoryId, description, isAvailable, image) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [id, title, categoryId, subCategoryId || null, description || null, isAvailable !== false, image || "✨"]
    );
    const [rows] = await db.query("SELECT * FROM items WHERE id = ?", [id]);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error("Error creating item:", err);
    res.status(500).json({ error: "Failed to create item" });
  }
});

// Update item (Protected)
app.put("/api/items/:id", auth, async (req, res) => {
  const { title, categoryId, subCategoryId, description, isAvailable, image } = req.body;
  const itemId = req.params.id;
  try {
    await db.query(
      "UPDATE items SET title = ?, categoryId = ?, subCategoryId = ?, description = ?, isAvailable = ?, image = ? WHERE id = ?",
      [title, categoryId, subCategoryId || null, description, isAvailable, image, itemId]
    );
    const [rows] = await db.query("SELECT * FROM items WHERE id = ?", [itemId]);
    if (rows.length === 0) return res.status(404).json({ error: "Item not found" });
    res.json(rows[0]);
  } catch (err) {
    console.error("Error updating item:", err);
    res.status(500).json({ error: "Failed to update item" });
  }
});

// Delete item (Protected)
app.delete("/api/items/:id", auth, async (req, res) => {
  try {
    const [result] = await db.query("DELETE FROM items WHERE id = ?", [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: "Item not found" });
    res.json({ message: "Item deleted successfully" });
  } catch (err) {
    console.error("Error deleting item:", err);
    res.status(500).json({ error: "Failed to delete item" });
  }
});


module.exports = app;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 Backend running on http://localhost:${PORT}`);
    console.log(`📡 API available at http://localhost:${PORT}/api`);
  });
}
