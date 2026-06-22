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
const { getUploadsRoot, ensureDir } = require("./utils/uploadsPath");

// Routes
const packageRoutes = require("./routes/packageRoutes");
const userAuthRoutes = require("./routes/userAuthRoutes");  // User registration, login, google OAuth logins
const itemRoutes = require("./routes/itemRoutes");          // Rental inventory (public GET)
const bookingRoutes = require("./routes/bookingRoutes");    // checkout, cart, orders (public/user)
const contactRoutes = require("./routes/contactRoutes");    // contact form + admin inbox
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
const API = "/api";

// Middleware to suport frontend
app.use(cors());
// Handle incoming JSON payloads
app.use(express.json());

const uploadDir = getUploadsRoot();
ensureDir(uploadDir);
app.use("/uploads", express.static(uploadDir));

// Expose static assets/icons folder
const iconsDir = path.join(__dirname, "Assets/Icons");
app.use("/uploads/Icons", express.static(iconsDir));

// Initialize database tables and seed data
initializeDatabase();

// Mount Public/User Routes
app.use(`${API}/packages`, packageRoutes);
app.use(`${API}/auth`, userAuthRoutes);
app.use(`${API}/items`, itemRoutes);
app.use(`${API}/categories`, categoryRoutes);
app.use(API, bookingRoutes);
app.use(`${API}/contact`, contactRoutes);

// Mount Admin Routes
app.use(`${API}/admin/auth`, adminAuth);
app.use(`${API}/admin/orders`, adminOrders);
app.use(`${API}/categories`, adminCategories);
app.use(API, adminItems); // handles POST /upload, and CRUD on /items
app.use(`${API}/packages`, adminPackages);

// Health check
app.get(`${API}/health`, (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

module.exports = app;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Backend running on http://localhost:${PORT}`);
    console.log(`API available at http://localhost:${PORT}/api`);
  });
}
