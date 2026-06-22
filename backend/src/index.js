/**
 * Backend entry point
 * 
 * Purpose:
 * Initializes ecosystem environment variables, provisions middleware hooks (CORS, JSON Parser), 
 * guarantees structural system directories (upload item photo stores), boots and patches database schemas, 
 * and handles modular routing paths for the runtime application state.
 */
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const initializeDatabase = require("./initDb");  // Database setup script initDb.js
const db = require("./db");

// Routes
const packageRoutes = require("./routes/packageRoutes");
const userAuthRoutes = require("./routes/userAuthRoutes");  // User registration, login, google OAuth logins
const itemRoutes = require("./routes/itemRoutes");          // Rental inventory (public GET)
const bookingRoutes = require("./routes/bookingRoutes");    // checkout, cart, orders (public/user)
const categoryRoutes = require("./routes/categoryRoutes");    // categories (public GET)

// Admin Routes
const adminAuth = require("./routes/admin/auth");
const adminCategories = require("./routes/admin/categories");
const adminItems = require("./routes/admin/items");
const adminPackages = require("./routes/admin/packages");
const adminOrders = require("./routes/admin/orders");

// Server configuration
const app = express();
const PORT = process.env.PORT || 4000;

// Middleware to suport frontend
app.use(cors());
// Handle incoming JSON payloads
app.use(express.json());

// Expose static uploads folder
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
app.use("/uploads", express.static(uploadDir));

// Expose static assets/icons folder
const iconsDir = path.join(__dirname, "Assets/Icons");
app.use("/uploads/Icons", express.static(iconsDir));

// Initialize database tables and seed data
initializeDatabase();

// Mount Public/User Routes
app.use("/api/packages", packageRoutes);
app.use("/api/auth", userAuthRoutes);
app.use("/api/items", itemRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api", bookingRoutes);

// Mount Admin Routes
app.use("/api/admin/auth", adminAuth);
app.use("/api/admin/orders", adminOrders);
app.use("/api/categories", adminCategories);
app.use("/api", adminItems); // handles POST /upload, and CRUD on /items
app.use("/api/packages", adminPackages);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});



// Stats API
app.get("/api/stats", async (req, res) => {
  try {
    const [itemRows] = await db.query("SELECT COUNT(*) AS totalItems FROM items");
    const [userRows] = await db.query("SELECT COUNT(*) AS totalUsers FROM users");
    const [orderRows] = await db.query("SELECT COUNT(*) AS totalOrders FROM orders");
    
    const totalItems = itemRows[0] ? itemRows[0].totalItems : 0;
    const totalUsers = userRows[0] ? userRows[0].totalUsers : 0;
    const totalOrders = orderRows[0] ? orderRows[0].totalOrders : 0;

    res.json({
      totalItems: Number(totalItems),
      totalUsers: Number(totalUsers),
      totalOrders: Number(totalOrders),
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
