const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const db = require("../../db");
const auth = require("../../middleware/auth");
const { getItemUploadDir } = require("../../utils/uploadsPath");

// Helper middleware to verify admin role
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({ error: "Access denied. Admin role required." });
  }
};

// Configure Multer storage
const uploadDir = path.join(__dirname, "../../../uploads/items");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, getItemUploadDir());
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  }
});
const upload = multer({ storage });

// Image Upload Endpoint
router.post("/upload", auth, isAdmin, upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }
  const fileUrl = `/uploads/items/${req.file.filename}`;
  res.status(201).json({ path: fileUrl });
});

// Create item
router.post("/items", auth, isAdmin, async (req, res) => {
  const { id, name, title, categoryId, description, isAvailable, unit_count, image, price, tutorial_steps, gallery_images } = req.body;
  const finalName = name || title;
  const finalTitle = title || name;
  const finalId = id || "item-" + Date.now();
  const parsedUnitCount = parseInt(unit_count, 10);
  const finalUnitCount = Number.isNaN(parsedUnitCount) ? 1 : Math.max(0, parsedUnitCount);
  const finalCategoryId = categoryId || "global";
  const finalPrice = parseFloat(price) || 0.00;
  const finalTutorial = tutorial_steps ? (typeof tutorial_steps === "object" ? JSON.stringify(tutorial_steps) : tutorial_steps) : null;
  const finalGallery = gallery_images ? (typeof gallery_images === "object" ? JSON.stringify(gallery_images) : gallery_images) : null;

  if (!finalName) {
    return res.status(400).json({ error: "Name is required" });
  }
  try {
    await db.query(
      "INSERT INTO items (id, name, title, categoryId, description, isAvailable, unit_count, image, price, tutorial_steps, gallery_images) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [finalId, finalName, finalTitle, finalCategoryId, description || null, isAvailable !== false, finalUnitCount, image || "✨", finalPrice, finalTutorial, finalGallery]
    );
    const [rows] = await db.query("SELECT * FROM items WHERE id = ?", [finalId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error("Error creating item:", err);
    res.status(500).json({ error: "Failed to create item" });
  }
});

// Update item
router.put("/items/:id", auth, isAdmin, async (req, res) => {
  const { name, title, categoryId, description, isAvailable, unit_count, image, price, tutorial_steps, gallery_images } = req.body;
  const finalName = name || title;
  const finalTitle = title || name;
  const parsedUnitCount = parseInt(unit_count, 10);
  const finalUnitCount = Number.isNaN(parsedUnitCount) ? 1 : Math.max(0, parsedUnitCount);
  const finalPrice = parseFloat(price) || 0.00;
  const finalTutorial = tutorial_steps ? (typeof tutorial_steps === "object" ? JSON.stringify(tutorial_steps) : tutorial_steps) : null;
  const finalGallery = gallery_images ? (typeof gallery_images === "object" ? JSON.stringify(gallery_images) : gallery_images) : null;
  const itemId = req.params.id;

  try {
    await db.query(
      "UPDATE items SET name = ?, title = ?, categoryId = ?, description = ?, isAvailable = ?, unit_count = ?, image = ?, price = ?, tutorial_steps = ?, gallery_images = ? WHERE id = ?",
      [finalName, finalTitle, categoryId, description, isAvailable, finalUnitCount, image, finalPrice, finalTutorial, finalGallery, itemId]
    );
    const [rows] = await db.query("SELECT * FROM items WHERE id = ?", [itemId]);
    if (rows.length === 0) return res.status(404).json({ error: "Item not found" });
    res.json(rows[0]);
  } catch (err) {
    console.error("Error updating item:", err);
    res.status(500).json({ error: "Failed to update item" });
  }
});

// Delete item
router.delete("/items/:id", auth, isAdmin, async (req, res) => {
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
