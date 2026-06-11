const db = require("./db");

async function initializeDatabase() {
  console.log("🛠️ Syncing database schemas...");
  try {
    // 1. Create core user profile authentication directory
    await db.query(`CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NULL,
      name VARCHAR(255) NOT NULL,
      google_id VARCHAR(255) UNIQUE NULL,
      avatar_url VARCHAR(255) NULL,
      role VARCHAR(50) DEFAULT 'user',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );`);

    // 2. Create structural navigational categories taxonomy
    await db.query(`CREATE TABLE IF NOT EXISTS categories (
      id VARCHAR(50) PRIMARY KEY,
      label VARCHAR(255) NOT NULL,
      emoji VARCHAR(10) DEFAULT '🎉',
      color VARCHAR(20) DEFAULT '#B8729A',
      description TEXT,
      image_url VARCHAR(255),
      display_order INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );`);

    // 3. Create active rental inventory hardware ledger
    await db.query(`CREATE TABLE IF NOT EXISTS items (
      id VARCHAR(50) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      title VARCHAR(255) NOT NULL,
      categoryId VARCHAR(50) NOT NULL,
      subCategoryId VARCHAR(50) DEFAULT NULL,
      description TEXT,
      isAvailable BOOLEAN DEFAULT TRUE,
      unit_count INT DEFAULT 1,
      image VARCHAR(255) DEFAULT '✨',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );`);

    // 4. Create flat-rate bundled decor tier package models
    await db.query(`CREATE TABLE IF NOT EXISTS packages (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      price DECIMAL(10, 2) NOT NULL,
      category_id VARCHAR(50) NOT NULL UNIQUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );`);

    // 5. Create many-to-many junction relationship map between packages and items
    await db.query(`CREATE TABLE IF NOT EXISTS package_items (
      package_id INT NOT NULL,
      item_id VARCHAR(50) NOT NULL,
      PRIMARY KEY (package_id, item_id),
      FOREIGN KEY (package_id) REFERENCES packages(id) ON DELETE CASCADE,
      FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE
    );`);

    // 6. Create master booking scheduling and logistics fulfillment transaction registry
    await db.query(`CREATE TABLE IF NOT EXISTS orders (
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
      status ENUM('pending', 'confirmed', 'cancelled') NOT NULL DEFAULT 'pending',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );`);

    // 7. Create itemized transaction details sub-breakdown table for order audits
    await db.query(`CREATE TABLE IF NOT EXISTS order_items (
      id INT AUTO_INCREMENT PRIMARY KEY,
      order_id INT NOT NULL,
      item_id VARCHAR(50) NULL,
      package_id INT NULL,
      quantity INT DEFAULT 1,
      price_at_rent DECIMAL(10, 2) NOT NULL,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
      FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE SET NULL,
      FOREIGN KEY (package_id) REFERENCES packages(id) ON DELETE SET NULL
    );`);

    // 8. Create cross-device live shopping cart state caching table
    await db.query(`CREATE TABLE IF NOT EXISTS user_cart (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      item_id VARCHAR(50) NULL,
      package_id INT NULL,
      quantity INT DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY unique_user_item (user_id, item_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE,
      FOREIGN KEY (package_id) REFERENCES packages(id) ON DELETE CASCADE
    );`);

    // 9. Create unauthenticated site-wide customer contact enquiry forms collector
    await db.query(`CREATE TABLE IF NOT EXISTS enquiries (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      occasion VARCHAR(255) NOT NULL,
      message TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );`);

    console.log("🚀 Database schema verification complete!");
  } catch (error) {
    console.error("❌ Database initialization failed:", error);
  }
}

module.exports = initializeDatabase;