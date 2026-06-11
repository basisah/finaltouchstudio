const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const db = require("../db");
const auth = require("../middleware/auth");

// Configure Multer storage
const uploadDir = path.join(__dirname, "../../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  }
});
const upload = multer({ storage });

// Get all items
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM items ORDER BY categoryId, id");
    res.json(rows);
  } catch (err) {
    console.error("Error fetching items:", err);
    res.status(500).json({ error: "Failed to fetch items" });
  }
});

// Get single item
router.get("/:id", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM items WHERE id = ?", [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: "Item not found" });
    res.json(rows[0]);
  } catch (err) {
    console.error("Error fetching item:", err);
    res.status(500).json({ error: "Failed to fetch item" });
  }
});

// Image Upload Endpoint (Protected)
router.post("/upload", auth, upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }
  const fileUrl = `/uploads/${req.file.filename}`;
  res.status(201).json({ path: fileUrl });
});

// Create item (Protected)
router.post("/", auth, async (req, res) => {
  const { id, name, title, categoryId, subCategoryId, description, isAvailable, unit_count, image } = req.body;
  const finalName = name || title;
  const finalTitle = title || name;
  const finalId = id || "item-" + Date.now();
  const finalUnitCount = parseInt(unit_count, 10) || 1;
  const finalCategoryId = categoryId || "global";

  if (!finalName) {
    return res.status(400).json({ error: "Name is required" });
  }
  try {
    await db.query(
      "INSERT INTO items (id, name, title, categoryId, subCategoryId, description, isAvailable, unit_count, image) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [finalId, finalName, finalTitle, finalCategoryId, subCategoryId || null, description || null, isAvailable !== false, finalUnitCount, image || "✨"]
    );
    const [rows] = await db.query("SELECT * FROM items WHERE id = ?", [finalId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error("Error creating item:", err);
    res.status(500).json({ error: "Failed to create item" });
  }
});

// Update item (Protected)
router.put("/:id", auth, async (req, res) => {
  const { name, title, categoryId, subCategoryId, description, isAvailable, unit_count, image } = req.body;
  const finalName = name || title;
  const finalTitle = title || name;
  const finalUnitCount = parseInt(unit_count, 10) || 1;
  const itemId = req.params.id;

  try {
    await db.query(
      "UPDATE items SET name = ?, title = ?, categoryId = ?, subCategoryId = ?, description = ?, isAvailable = ?, unit_count = ?, image = ? WHERE id = ?",
      [finalName, finalTitle, categoryId, subCategoryId || null, description, isAvailable, finalUnitCount, image, itemId]
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
router.delete("/:id", auth, async (req, res) => {
  try {
    const [result] = await db.query("DELETE FROM items WHERE id = ?", [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: "Item not found" });
    res.json({ message: "Item deleted successfully" });
  } catch (err) {
    console.error("Error deleting item:", err);
    res.status(500).json({ error: "Failed to delete item" });
  }
});

module.exports = router;
