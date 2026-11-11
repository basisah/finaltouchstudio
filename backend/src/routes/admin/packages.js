const express = require("express");
const router = express.Router();
const db = require("../../db");
const auth = require("../../middleware/auth");
const isAdmin = require("../../middleware/isAdmin");

// All routes here are admin-only
router.use(auth, isAdmin);

/** Replaces a package's item list with one DELETE and one multi-row INSERT. */
async function replacePackageItems(conn, packageId, itemIds) {
  await conn.query("DELETE FROM package_items WHERE package_id = ?", [packageId]);
  const unique = Array.isArray(itemIds) ? [...new Set(itemIds.filter(Boolean))] : [];
  if (unique.length === 0) return;
  await conn.query("INSERT INTO package_items (package_id, item_id) VALUES ?", [unique.map((itemId) => [packageId, itemId])]);
}

// POST create a new package
router.post("/", async (req, res) => {
  const { name, price, category_id, itemIds, description, image } = req.body;
  if (!name || !price || !category_id) {
    return res.status(400).json({ error: "Name, price, and category_id are required" });
  }

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const [result] = await conn.query(
      "INSERT INTO packages (name, price, category_id, description, image) VALUES (?, ?, ?, ?, ?)",
      [name, price, category_id, description || null, image || null]
    );
    const packageId = result.insertId;
    await replacePackageItems(conn, packageId, itemIds);
    await conn.commit();

    res.status(201).json({ id: packageId, name, price, category_id, itemIds });
  } catch (err) {
    await conn.rollback();
    // category_id is UNIQUE — one package per occasion.
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(400).json({ error: `A package for category '${category_id}' already exists.` });
    }
    console.error("Error creating package:", err);
    res.status(500).json({ error: "Failed to create package" });
  } finally {
    conn.release();
  }
});

// PUT update a package
router.put("/:id", async (req, res) => {
  const { name, price, category_id, itemIds, description, image } = req.body;
  const packageId = req.params.id;

  if (!name || !price || !category_id) {
    return res.status(400).json({ error: "Name, price, and category_id are required" });
  }

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // description / image are optional: only overwrite them when the client sent the field.
    const sets = ["name = ?", "price = ?", "category_id = ?", "updated_at = NOW()"];
    const params = [name, price, category_id];
    if (description !== undefined) {
      sets.push("description = ?");
      params.push(description || null);
    }
    if (image !== undefined) {
      sets.push("image = ?");
      params.push(image || null);
    }

    const [result] = await conn.query(`UPDATE packages SET ${sets.join(", ")} WHERE id = ?`, [...params, packageId]);
    if (result.affectedRows === 0) {
      await conn.rollback();
      return res.status(404).json({ error: "Package not found" });
    }

    await replacePackageItems(conn, packageId, itemIds);
    await conn.commit();

    res.json({ id: packageId, name, price, category_id, itemIds });
  } catch (err) {
    await conn.rollback();
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(400).json({ error: `A package for category '${category_id}' already exists.` });
    }
    console.error("Error updating package:", err);
    res.status(500).json({ error: "Failed to update package" });
  } finally {
    conn.release();
  }
});

// DELETE a package
router.delete("/:id", async (req, res) => {
  try {
    const [result] = await db.query("DELETE FROM packages WHERE id = ?", [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Package not found" });
    }
    res.json({ message: "Package deleted successfully" });
  } catch (err) {
    console.error("Error deleting package:", err);
    res.status(500).json({ error: "Failed to delete package" });
  }
});

module.exports = router;
