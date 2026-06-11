const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const db = require("../../db");
const auth = require("../../middleware/auth");

// Helper middleware to verify admin role
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({ error: "Access denied. Admin role required." });
  }
};

// Multer setup for category image uploads
const uploadDir = path.join(__dirname, "../../../uploads/categories");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `category-${Date.now()}${ext}`);
  },
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

// All routes here are admin-only
router.use(auth, isAdmin);

// POST - Upload category image
router.post("/upload-image", upload.single("image"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });
  const fileUrl = `/uploads/categories/${req.file.filename}`;
  res.status(201).json({ url: fileUrl });
});

// POST - Create category
router.post("/", async (req, res) => {
  const { id, label, emoji, color, description, image_url, display_order } = req.body;
  if (!id || !label) return res.status(400).json({ error: "id and label are required" });
  try {
    await db.query(
      "INSERT INTO categories (id, label, emoji, color, description, image_url, display_order) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [id.toLowerCase().replace(/\s+/g, "-"), label, emoji || "🎉", color || "#B8729A", description || null, image_url || null, display_order || 0]
    );
    const [rows] = await db.query("SELECT * FROM categories WHERE id = ?", [id]);
    res.status(201).json(rows[0]);
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") return res.status(400).json({ error: "Category ID already exists" });
    console.error("Error creating category:", err);
    res.status(500).json({ error: "Failed to create category" });
  }
});

// PUT - Update category
router.put("/:id", async (req, res) => {
  const { label, emoji, color, description, image_url, display_order } = req.body;
  if (!label) return res.status(400).json({ error: "label is required" });
  try {
    await db.query(
      "UPDATE categories SET label = ?, emoji = ?, color = ?, description = ?, image_url = ?, display_order = ?, updated_at = NOW() WHERE id = ?",
      [label, emoji || "🎉", color || "#B8729A", description || null, image_url || null, display_order || 0, req.params.id]
    );
    const [rows] = await db.query("SELECT * FROM categories WHERE id = ?", [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: "Category not found" });
    res.json(rows[0]);
  } catch (err) {
    console.error("Error updating category:", err);
    res.status(500).json({ error: "Failed to update category" });
  }
});

// DELETE - Delete category
router.delete("/:id", async (req, res) => {
  try {
    const [result] = await db.query("DELETE FROM categories WHERE id = ?", [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: "Category not found" });
    res.json({ message: "Category deleted" });
  } catch (err) {
    console.error("Error deleting category:", err);
    res.status(500).json({ error: "Failed to delete category" });
  }
});

module.exports = router;
