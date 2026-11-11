/**
 * Backend entry point — wires middleware, static uploads and the route modules.
 */
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");

const db = require("./db");
const initializeDatabase = require("./database/initDb");
const { getUploadsRoot, ensureDir } = require("./utils/uploadsPath");

// Public / customer routes
const packageRoutes = require("./routes/packageRoutes");
const userAuthRoutes = require("./routes/userAuthRoutes");
const itemRoutes = require("./routes/itemRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const contactRoutes = require("./routes/contactRoutes");

// Admin routes
const adminAuth = require("./routes/admin/auth");
const adminCategories = require("./routes/admin/categories");
const adminItems = require("./routes/admin/items");
const adminPackages = require("./routes/admin/packages");
const adminOrders = require("./routes/admin/orders");

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json({ limit: "1mb" }));

// ── Static files ─────────────────────────────────────────────────────────────
// Uploaded files get a unique, never-reused filename, so browsers may cache
// them for a long time; bundled icons can change with a deploy, so a day.
const staticOptions = { maxAge: "30d", immutable: true };
const bundledUploads = path.join(__dirname, "../uploads");
ensureDir(bundledUploads);
app.use("/uploads/Icons", express.static(path.join(__dirname, "Assets/Icons"), { maxAge: "1d" }));
app.use("/uploads", express.static(bundledUploads, staticOptions));
// On serverless hosts new uploads land in a writable temp folder instead.
if (path.resolve(getUploadsRoot()) !== path.resolve(bundledUploads)) {
  app.use("/uploads", express.static(getUploadsRoot(), staticOptions));
}

// Create / migrate tables, indexes and default rows.
initializeDatabase();

// ── Public / customer API ────────────────────────────────────────────────────
app.use("/api/packages", packageRoutes);
app.use("/api/auth", userAuthRoutes);
app.use("/api/items", itemRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api", bookingRoutes);

// ── Admin API ────────────────────────────────────────────────────────────────
app.use("/api/admin/auth", adminAuth);
app.use("/api/admin/orders", adminOrders);
app.use("/api/categories", adminCategories);
app.use("/api", adminItems); // POST /upload and CRUD on /items
app.use("/api/packages", adminPackages);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Landing-page counters — one round trip instead of three.
app.get("/api/stats", async (req, res) => {
  try {
    const [[row]] = await db.query(
      `SELECT (SELECT COUNT(*) FROM items)  AS totalItems,
              (SELECT COUNT(*) FROM users)  AS totalUsers,
              (SELECT COUNT(*) FROM orders) AS totalOrders`
    );
    res.set("Cache-Control", "public, max-age=300");
    res.json({
      totalItems: Number(row.totalItems) || 0,
      totalUsers: Number(row.totalUsers) || 0,
      totalOrders: Number(row.totalOrders) || 0,
    });
  } catch (err) {
    console.error("Error fetching stats:", err);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

module.exports = app;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Backend running on http://localhost:${PORT}`);
    console.log(`API available at http://localhost:${PORT}/api`);
  });
}
