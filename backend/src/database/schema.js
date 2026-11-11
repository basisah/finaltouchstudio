/**
 * Declarative description of the database: tables, columns added after the
 * first release, and the indexes the API's queries rely on.
 *
 * `ensureSchema` is idempotent — it compares this description with the live
 * schema and applies only the difference.
 */
const { loadSchemaSnapshot, runDdl } = require("./schemaHelpers");
const { ORDER_STATUSES } = require("../constants/orderStatus");

const STATUS_ENUM = `ENUM(${ORDER_STATUSES.map((s) => `'${s}'`).join(", ")})`;

/** Created in order, so referenced tables come first. */
const TABLES = [
  ["users", `CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NULL,
      name VARCHAR(255) NOT NULL,
      google_id VARCHAR(255) UNIQUE NULL,
      avatar_url VARCHAR(255) NULL,
      role VARCHAR(50) DEFAULT 'user',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`],
  ["categories", `CREATE TABLE IF NOT EXISTS categories (
      id VARCHAR(50) PRIMARY KEY,
      label VARCHAR(255) NOT NULL,
      emoji VARCHAR(100) DEFAULT '🎉',
      color VARCHAR(20) DEFAULT '#B8729A',
      description TEXT,
      image_url VARCHAR(255),
      display_order INT DEFAULT 0,
      subcategories TEXT DEFAULT NULL,
      is_demo TINYINT(1) NOT NULL DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`],
  ["items", `CREATE TABLE IF NOT EXISTS items (
      id VARCHAR(50) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      title VARCHAR(255) NOT NULL,
      categoryId VARCHAR(50) NOT NULL,
      subCategoryId VARCHAR(50) DEFAULT NULL,
      description TEXT,
      isAvailable BOOLEAN DEFAULT TRUE,
      unit_count INT DEFAULT 1,
      image VARCHAR(255) DEFAULT '✨',
      price DECIMAL(10, 2) DEFAULT 0.00,
      tutorial_steps TEXT DEFAULT NULL,
      gallery_images TEXT DEFAULT NULL,
      is_demo TINYINT(1) NOT NULL DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`],
  ["packages", `CREATE TABLE IF NOT EXISTS packages (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      price DECIMAL(10, 2) NOT NULL,
      category_id VARCHAR(50) NOT NULL UNIQUE,
      description TEXT DEFAULT NULL,
      image VARCHAR(255) DEFAULT NULL,
      is_demo TINYINT(1) NOT NULL DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`],
  ["package_items", `CREATE TABLE IF NOT EXISTS package_items (
      package_id INT NOT NULL,
      item_id VARCHAR(50) NOT NULL,
      PRIMARY KEY (package_id, item_id),
      FOREIGN KEY (package_id) REFERENCES packages(id) ON DELETE CASCADE,
      FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE
    )`],
  ["orders", `CREATE TABLE IF NOT EXISTS orders (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      customer_name VARCHAR(255) NOT NULL,
      customer_email VARCHAR(255) NOT NULL,
      customer_phone VARCHAR(255) NOT NULL,
      event_date DATE NOT NULL,
      rental_date DATE NOT NULL,
      fulfillment_type ENUM('delivery', 'pickup') NOT NULL DEFAULT 'pickup',
      delivery_fee DECIMAL(10, 2) DEFAULT 0.00,
      venue_address TEXT NOT NULL,
      special_notes TEXT NULL,
      total_amount DECIMAL(10, 2) NOT NULL,
      status ${STATUS_ENUM} NOT NULL DEFAULT 'ordered',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`],
  ["order_items", `CREATE TABLE IF NOT EXISTS order_items (
      id INT AUTO_INCREMENT PRIMARY KEY,
      order_id INT NOT NULL,
      item_id VARCHAR(50) NULL,
      package_id INT NULL,
      quantity INT DEFAULT 1,
      price_at_rent DECIMAL(10, 2) NOT NULL,
      returned_quantity INT DEFAULT 0,
      pickup_date DATE NULL,
      return_date DATE NULL,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
      FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE SET NULL,
      FOREIGN KEY (package_id) REFERENCES packages(id) ON DELETE SET NULL
    )`],
  ["user_cart", `CREATE TABLE IF NOT EXISTS user_cart (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      item_id VARCHAR(50) NULL,
      package_id INT NULL,
      quantity INT DEFAULT 1,
      pickup_date DATE NULL,
      return_date DATE NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY unique_user_item (user_id, item_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE,
      FOREIGN KEY (package_id) REFERENCES packages(id) ON DELETE CASCADE
    )`],
  ["enquiries", `CREATE TABLE IF NOT EXISTS enquiries (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      occasion VARCHAR(255) NOT NULL,
      message TEXT NOT NULL,
      is_read BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`],
  ["reviews", `CREATE TABLE IF NOT EXISTS reviews (
      id INT AUTO_INCREMENT PRIMARY KEY,
      order_id INT UNIQUE NULL,
      user_id INT NULL,
      customer_name VARCHAR(255) NOT NULL,
      role VARCHAR(100) DEFAULT 'Client',
      rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
      comment TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    )`],
];

/** Columns introduced after a table first shipped: [table, column, definition]. */
const COLUMNS = [
  ["users", "google_id", "VARCHAR(255) UNIQUE NULL"],
  ["users", "avatar_url", "VARCHAR(255) NULL"],
  ["users", "role", "VARCHAR(50) DEFAULT 'user'"],

  ["categories", "subcategories", "TEXT DEFAULT NULL"],
  ["categories", "is_demo", "TINYINT(1) NOT NULL DEFAULT 0"],

  ["items", "title", "VARCHAR(255)"],
  ["items", "subCategoryId", "VARCHAR(50) DEFAULT NULL"],
  ["items", "unit_count", "INT DEFAULT 1"],
  ["items", "price", "DECIMAL(10, 2) DEFAULT 0.00"],
  ["items", "tutorial_steps", "TEXT DEFAULT NULL"],
  ["items", "gallery_images", "TEXT DEFAULT NULL"],
  ["items", "is_demo", "TINYINT(1) NOT NULL DEFAULT 0"],

  ["packages", "description", "TEXT DEFAULT NULL"],
  ["packages", "image", "VARCHAR(255) DEFAULT NULL"],
  ["packages", "is_demo", "TINYINT(1) NOT NULL DEFAULT 0"],

  ["orders", "fulfillment_type", "ENUM('delivery', 'pickup') NOT NULL DEFAULT 'pickup'"],
  ["orders", "delivery_fee", "DECIMAL(10, 2) DEFAULT 0.00"],
  ["orders", "venue_address", "TEXT"],
  ["orders", "special_notes", "TEXT DEFAULT NULL"],

  ["order_items", "returned_quantity", "INT DEFAULT 0"],
  // Per-line rental window. The API has always read and written these columns,
  // but nothing created them on a fresh database.
  ["order_items", "pickup_date", "DATE NULL"],
  ["order_items", "return_date", "DATE NULL"],

  ["user_cart", "pickup_date", "DATE NULL"],
  ["user_cart", "return_date", "DATE NULL"],

  ["enquiries", "is_read", "BOOLEAN NOT NULL DEFAULT FALSE"],

  ["reviews", "order_id", "INT UNIQUE NULL"],
  ["reviews", "customer_name", "VARCHAR(255) NOT NULL DEFAULT 'Verified Client'"],
  ["reviews", "role", "VARCHAR(100) DEFAULT 'Client'"],
];

/**
 * Secondary indexes: [table, index name, column list].
 * InnoDB already indexes foreign-key columns, so only the lookups the API
 * performs beyond those are listed here.
 */
const INDEXES = [
  // GET /items — WHERE isAvailable = 1 [AND categoryId = ?] ORDER BY categoryId, id
  ["items", "idx_items_available_category", "(isAvailable, categoryId)"],
  // Admin category maintenance — WHERE categoryId = ? [AND subCategoryId = ?]
  ["items", "idx_items_category_subcategory", "(categoryId, subCategoryId)"],
  // Demo seed clean-up — WHERE is_demo = 1
  ["items", "idx_items_is_demo", "(is_demo)"],

  // Profile + order history — WHERE user_id = ? OR customer_email = ?
  ["orders", "idx_orders_customer_email", "(customer_email)"],
  // Availability — WHERE status IN (...) joined on the rental window
  ["orders", "idx_orders_status_dates", "(status, rental_date, event_date)"],
  // Admin dashboard — ORDER BY created_at DESC
  ["orders", "idx_orders_created_at", "(created_at)"],

  // Availability — WHERE item_id = ? over the per-line rental window
  ["order_items", "idx_order_items_item_dates", "(item_id, pickup_date, return_date)"],

  // Admin inbox — ORDER BY created_at DESC, unread counter
  ["enquiries", "idx_enquiries_created_at", "(created_at)"],
  ["enquiries", "idx_enquiries_is_read", "(is_read)"],

  // Landing testimonials — ORDER BY created_at DESC LIMIT 3
  ["reviews", "idx_reviews_created_at", "(created_at)"],

  // GET /categories — ORDER BY display_order
  ["categories", "idx_categories_display_order", "(display_order)"],
];

async function ensureSchema(db) {
  const schema = await loadSchemaSnapshot(db);
  const freshTables = new Set();

  for (const [table, ddl] of TABLES) {
    if (schema.hasTable(table)) continue;
    if (await runDdl(db, ddl, `created table ${table}`)) {
      schema.noteTable(table);
      freshTables.add(table);
      // A freshly created table already has every column listed in COLUMNS.
      for (const [t, column] of COLUMNS) if (t === table) schema.noteColumn(table, column);
    }
  }

  for (const [table, column, definition] of COLUMNS) {
    if (!schema.hasTable(table) || schema.hasColumn(table, column)) continue;
    const sql = `ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`;
    if (await runDdl(db, sql, `added ${table}.${column}`)) {
      schema.noteColumn(table, column);
    }
  }

  await applyLegacyFixes(db, schema, freshTables);

  for (const [table, name, columns] of INDEXES) {
    if (!schema.hasTable(table) || schema.hasIndex(table, name)) continue;
    if (await runDdl(db, `CREATE INDEX ${name} ON ${table} ${columns}`, `created index ${name}`)) {
      schema.noteIndex(table, name);
    }
  }
}

/** One-off repairs for databases created by older versions of the app. */
async function applyLegacyFixes(db, schema, freshTables) {
  const emoji = schema.getColumn("categories", "emoji");
  if (emoji && emoji.type && emoji.type !== "varchar(100)") {
    await runDdl(
      db,
      "ALTER TABLE categories MODIFY COLUMN emoji VARCHAR(100) DEFAULT '🎉'",
      "widened categories.emoji"
    );
  }

  const status = schema.getColumn("orders", "status");
  if (status && status.type && !ORDER_STATUSES.every((s) => status.type.includes(`'${s}'`))) {
    await runDdl(
      db,
      `ALTER TABLE orders MODIFY COLUMN status ${STATUS_ENUM} NOT NULL DEFAULT 'ordered'`,
      "updated orders.status ENUM"
    );
  }

  const reviewItem = schema.getColumn("reviews", "item_id");
  if (reviewItem && reviewItem.type && !reviewItem.nullable) {
    await runDdl(db, "ALTER TABLE reviews MODIFY COLUMN item_id VARCHAR(50) NULL", "made reviews.item_id nullable");
  }

  const reviewUser = schema.getColumn("reviews", "user_id");
  if (reviewUser && reviewUser.type && !reviewUser.nullable) {
    await runDdl(db, "ALTER TABLE reviews MODIFY COLUMN user_id INT NULL", "made reviews.user_id nullable");
  }

  if (!freshTables.has("reviews") && schema.hasColumn("reviews", "order_id") && !schema.hasForeignKey("reviews", "order_id")) {
    await runDdl(
      db,
      "ALTER TABLE reviews ADD CONSTRAINT fk_reviews_order_id FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE",
      "added reviews.order_id foreign key"
    );
  }
}

module.exports = { ensureSchema, TABLES, COLUMNS, INDEXES };
