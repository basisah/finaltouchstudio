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

// Multer setup for subcategory image uploads
const subcatUploadDir = path.join(__dirname, "../../../uploads/subcategories");
if (!fs.existsSync(subcatUploadDir)) {
  fs.mkdirSync(subcatUploadDir, { recursive: true });
}

const subcatStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, subcatUploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `subcategory-${Date.now()}${ext}`);
  },
});
const subcatUpload = multer({ storage: subcatStorage, limits: { fileSize: 5 * 1024 * 1024 } });

// All routes here are admin-only
router.use(auth, isAdmin);

// POST - Upload category image
router.post("/upload-image", upload.single("image"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });
  const fileUrl = `/uploads/categories/${req.file.filename}`;
  res.status(201).json({ url: fileUrl });
});

// POST - Upload subcategory image
router.post("/upload-subcategory-image", subcatUpload.single("image"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });
  const fileUrl = `/uploads/subcategories/${req.file.filename}`;
  res.status(201).json({ url: fileUrl });
});

// POST - Create category
router.post("/", async (req, res) => {
  const { id, label, emoji, color, description, image_url, display_order, subcategories } = req.body;
  if (!id || !label) return res.status(400).json({ error: "id and label are required" });
  try {
    const subcatVal = subcategories ? (typeof subcategories === "string" ? subcategories : JSON.stringify(subcategories)) : null;
    await db.query(
      "INSERT INTO categories (id, label, emoji, color, description, image_url, display_order, subcategories) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [
        id.toLowerCase().replace(/\s+/g, "-"),
        label,
        emoji || "🎉",
        color || "#B8729A",
        description || null,
        image_url || null,
        display_order || 0,
        subcatVal
      ]
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
  const { label, emoji, color, description, image_url, display_order, subcategories } = req.body;
  if (!label) return res.status(400).json({ error: "label is required" });
  try {
    const subcatVal = subcategories ? (typeof subcategories === "string" ? subcategories : JSON.stringify(subcategories)) : null;

    // Detect deleted subcategories and set matching items' subCategoryId to NULL
    if (subcategories) {
      try {
        const newSubList = typeof subcategories === "string" ? JSON.parse(subcategories) : subcategories;
        const [oldCatRows] = await db.query("SELECT subcategories FROM categories WHERE id = ?", [req.params.id]);
        if (oldCatRows.length > 0 && oldCatRows[0].subcategories) {
          const oldSubList = typeof oldCatRows[0].subcategories === "string" ? JSON.parse(oldCatRows[0].subcategories) : oldCatRows[0].subcategories;
          if (Array.isArray(oldSubList) && Array.isArray(newSubList)) {
            const deletedSubs = oldSubList.filter(oldSub => !newSubList.some(newSub => newSub.id === oldSub.id));
            for (const delSub of deletedSubs) {
              await db.query("UPDATE items SET subCategoryId = NULL WHERE categoryId = ? AND subCategoryId = ?", [req.params.id, delSub.id]);
            }
          }
        }
      } catch (err) {
        console.error("Error cascade updating items subCategoryId:", err);
      }
    }

    await db.query(
      "UPDATE categories SET label = ?, emoji = ?, color = ?, description = ?, image_url = ?, display_order = ?, subcategories = ?, updated_at = NOW() WHERE id = ?",
      [
        label,
        emoji || "🎉",
        color || "#B8729A",
        description || null,
        image_url || null,
        display_order || 0,
        subcatVal,
        req.params.id
      ]
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
  const categoryId = req.params.id;
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // 1. Delete packages referencing the category (cascades to package_items & user_cart)
    await connection.query("DELETE FROM packages WHERE category_id = ?", [categoryId]);

    // 2. Delete items referencing the category (cascades to package_items & user_cart, set null in order_items)
    await connection.query("DELETE FROM items WHERE categoryId = ?", [categoryId]);

    // 3. Delete the category itself
    const [result] = await connection.query("DELETE FROM categories WHERE id = ?", [categoryId]);
    if (result.affectedRows === 0) {
      await connection.rollback();
      return res.status(404).json({ error: "Category not found" });
    }

    await connection.commit();
    res.json({ message: "Category deleted" });
  } catch (err) {
    await connection.rollback();
    console.error("Error deleting category:", err);
    res.status(500).json({ error: "Failed to delete category" });
  } finally {
    connection.release();
  }
});

module.exports = router;
