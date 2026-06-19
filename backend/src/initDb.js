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
      description TEXT,
      isAvailable BOOLEAN DEFAULT TRUE,
      unit_count INT DEFAULT 1,
      image VARCHAR(255) DEFAULT '✨',
      price DECIMAL(10, 2) DEFAULT 0.00,
      tutorial_steps TEXT DEFAULT NULL,
      gallery_images TEXT DEFAULT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );`);

    const itemColumnMigrations = [
      "ALTER TABLE items ADD COLUMN name VARCHAR(255) NOT NULL DEFAULT ''",
      "ALTER TABLE items ADD COLUMN title VARCHAR(255) NOT NULL DEFAULT ''",
      "ALTER TABLE items ADD COLUMN unit_count INT DEFAULT 1",
    ];
    for (const sql of itemColumnMigrations) {
      try {
        await db.query(sql);
      } catch {
        // column already exists
      }
    }

    try {
      await db.query("ALTER TABLE items ADD COLUMN price DECIMAL(10, 2) DEFAULT 0.00");
      console.log("Added column 'price' to 'items' table.");
    } catch (err) {
      // Column may already exist
    }

    try {
      await db.query("ALTER TABLE items ADD COLUMN tutorial_steps TEXT DEFAULT NULL");
      console.log("Added column 'tutorial_steps' to 'items' table.");
    } catch (err) {
      // Column may already exist
    }

    try {
      await db.query("ALTER TABLE items ADD COLUMN gallery_images TEXT DEFAULT NULL");
      console.log("Added column 'gallery_images' to 'items' table.");
    } catch (err) {
      // Column may already exist
    }

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

    const orderColumnMigrations = [
      "ALTER TABLE orders ADD COLUMN user_id INT NULL",
      "ALTER TABLE orders ADD COLUMN customer_email VARCHAR(255) NULL",
      "ALTER TABLE orders ADD COLUMN customer_phone VARCHAR(255) NULL",
      "ALTER TABLE orders ADD COLUMN event_date DATE NULL",
      "ALTER TABLE orders ADD COLUMN rental_date DATE NULL",
      "ALTER TABLE orders ADD COLUMN fulfillment_type ENUM('delivery', 'pickup') NOT NULL DEFAULT 'pickup'",
      "ALTER TABLE orders ADD COLUMN delivery_fee DECIMAL(10, 2) DEFAULT 0.00",
      "ALTER TABLE orders ADD COLUMN venue_address TEXT NULL",
      "ALTER TABLE orders ADD COLUMN special_notes TEXT NULL",
      "ALTER TABLE orders ADD COLUMN status ENUM('pending', 'confirmed', 'cancelled') NOT NULL DEFAULT 'pending'",
    ];
    for (const sql of orderColumnMigrations) {
      try {
        await db.query(sql);
      } catch {
        // column already exists
      }
    }

    const orderItemColumnMigrations = [
      "ALTER TABLE order_items ADD COLUMN pickup_date DATE NULL",
      "ALTER TABLE order_items ADD COLUMN return_date DATE NULL",
    ];
    for (const sql of orderItemColumnMigrations) {
      try {
        await db.query(sql);
      } catch {
        // column already exists
      }
    }

    // 8. Create cross-device live shopping cart state caching table
    await db.query(`CREATE TABLE IF NOT EXISTS user_cart (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      item_id VARCHAR(50) NULL,
      package_id INT NULL,
      quantity INT DEFAULT 1,
      pickup_date DATE NULL,
      return_date DATE NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE,
      FOREIGN KEY (package_id) REFERENCES packages(id) ON DELETE CASCADE
    );`);

    const userCartColumnMigrations = [
      "ALTER TABLE user_cart ADD COLUMN pickup_date DATE NULL",
      "ALTER TABLE user_cart ADD COLUMN return_date DATE NULL",
    ];
    for (const sql of userCartColumnMigrations) {
      try {
        await db.query(sql);
      } catch {
        // column already exists
      }
    }

    try {
      await db.query("ALTER TABLE user_cart DROP INDEX unique_user_item");
    } catch {
      // index already removed or never existed
    }
    //9*. Create payments table to track payment attempts and statuses linked to orders  
    await db.query(`CREATE TABLE IF NOT EXISTS payments (
      id             INT AUTO_INCREMENT PRIMARY KEY,
      order_id       INT NOT NULL,
      method         ENUM('etransfer','card','paypal')                 NOT NULL DEFAULT 'etransfer',
      amount_cents   INT                                               NOT NULL,
      type           ENUM('full','deposit','balance')                  NOT NULL DEFAULT 'full',
      status         ENUM('awaiting','received','refunded','failed')   NOT NULL DEFAULT 'awaiting',
      reference_note VARCHAR(255) NULL,
      confirmed_by   INT NULL,
      confirmed_at   TIMESTAMP NULL,
      created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (order_id)     REFERENCES orders(id) ON DELETE CASCADE,
      FOREIGN KEY (confirmed_by) REFERENCES users(id)  ON DELETE SET NULL
    );`);

    try {
      await db.query(`ALTER TABLE orders
        ADD COLUMN payment_status
        ENUM('unpaid','deposit_paid','paid_in_full','refunded')
        NOT NULL DEFAULT 'unpaid'`);
    } catch {
      // column already exists
    }

    // 10. Create unauthenticated site-wide customer contact enquiry forms collector
    await db.query(`CREATE TABLE IF NOT EXISTS enquiries (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      occasion VARCHAR(255) NOT NULL,
      message TEXT NOT NULL,
      is_read BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );`);

    try {
      await db.query(`ALTER TABLE enquiries ADD COLUMN is_read BOOLEAN DEFAULT FALSE`);
    } catch {
      // Column already exists on older databases
    }

    try {
      await db.query("ALTER TABLE items DROP COLUMN subCategoryId");
      console.log("🗑️  Dropped legacy items.subCategoryId column");
    } catch {
      // column already removed or never existed
    }


    // 11. Seed/Upsert permanent categories to guarantee their presence and sorting
    const permanentCats = [
      ["proposal", "Proposal", "💍", "#8B5CF6", "Fairy lights, romantic floral arches & beautiful signs to make your moment perfect.", 1],
      ["holud", "Holud", "🌼", "#D97706", "Traditional Gaye Holud & Mehndi night stage setups with vibrant colors.", 2],
      ["marriage", "Marriage", "💒", "#9F507C", "Exquisite wedding, holud & reception stages blending modern and traditional luxury.", 3],
      ["baby", "Baby Shower", "🍼", "#A78BFA", "Cute, colorful & magical themes for celebrating your little one.", 4],
      ["birthday", "Birthday", "🎂", "#B8729A", "Bespoke balloon walls, kids themes & customized stage setups for your special day.", 5]
    ];

    for (const [id, label, emoji, color, description, display_order] of permanentCats) {
      await db.query(
        "INSERT INTO categories (id, label, emoji, color, description, display_order) VALUES (?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE display_order = ?",
        [id, label, emoji, color, description, display_order, display_order]
      );
    }
    console.log("✅ Seeded/Updated permanent categories display order.");

    console.log("🚀 Database schema verification complete!");
  } catch (error) {
    console.error("❌ Database initialization failed:", error);
  }
}

module.exports = initializeDatabase;