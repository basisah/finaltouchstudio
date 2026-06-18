const db = require("./db");
const fs = require("fs");
const path = require("path");

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

    // Ensure columns exist in users table (in case the table already existed with an older schema)
    try {
      await db.query("ALTER TABLE users ADD COLUMN google_id VARCHAR(255) UNIQUE NULL");
      console.log("Added column 'google_id' to 'users' table.");
    } catch (err) {
      // Column may already exist
    }

    try {
      await db.query("ALTER TABLE users ADD COLUMN avatar_url VARCHAR(255) NULL");
      console.log("Added column 'avatar_url' to 'users' table.");
    } catch (err) {
      // Column may already exist
    }

    try {
      await db.query("ALTER TABLE users ADD COLUMN role VARCHAR(50) DEFAULT 'user'");
      console.log("Added column 'role' to 'users' table.");
    } catch (err) {
      // Column may already exist
    }

    // 2. Create structural navigational categories taxonomy
    await db.query(`CREATE TABLE IF NOT EXISTS categories (
      id VARCHAR(50) PRIMARY KEY,
      label VARCHAR(255) NOT NULL,
      emoji VARCHAR(100) DEFAULT '🎉',
      color VARCHAR(20) DEFAULT '#B8729A',
      description TEXT,
      image_url VARCHAR(255),
      display_order INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );`);

    // Ensure emoji column can hold longer strings (in case table already exists)
    try {
      await db.query("ALTER TABLE categories MODIFY COLUMN emoji VARCHAR(100) DEFAULT '🎉'");
      console.log("Ensured column 'emoji' in 'categories' is VARCHAR(100).");
    } catch (err) {
      // Log or ignore
    }

    // Ensure subcategories column exists in categories table
    try {
      await db.query("ALTER TABLE categories ADD COLUMN subcategories TEXT DEFAULT NULL");
      console.log("Added column 'subcategories' to 'categories' table.");
    } catch (err) {
      // Column may already exist
    }

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
      price DECIMAL(10, 2) DEFAULT 0.00,
      tutorial_steps TEXT DEFAULT NULL,
      gallery_images TEXT DEFAULT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );`);

    // Ensure columns exist in items table (in case the table already existed with an older schema)
    try {
      await db.query("ALTER TABLE items ADD COLUMN title VARCHAR(255)");
      console.log("Added column 'title' to 'items' table.");
    } catch (err) {
      // Column may already exist
    }

    try {
      await db.query("ALTER TABLE items ADD COLUMN subCategoryId VARCHAR(50) DEFAULT NULL");
      console.log("Added column 'subCategoryId' to 'items' table.");
    } catch (err) {
      // Column may already exist
    }

    try {
      await db.query("ALTER TABLE items ADD COLUMN unit_count INT DEFAULT 1");
      console.log("Added column 'unit_count' to 'items' table.");
    } catch (err) {
      // Column may already exist
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

    // Ensure columns exist in orders table (in case the table already existed with an older schema)
    try {
      await db.query("ALTER TABLE orders ADD COLUMN fulfillment_type ENUM('delivery', 'pickup') NOT NULL DEFAULT 'pickup'");
      console.log("Added column 'fulfillment_type' to 'orders' table.");
    } catch (err) {
      // Column may already exist
    }

    try {
      await db.query("ALTER TABLE orders ADD COLUMN delivery_fee DECIMAL(10, 2) DEFAULT 0.00");
      console.log("Added column 'delivery_fee' to 'orders' table.");
    } catch (err) {
      // Column may already exist
    }

    try {
      await db.query("ALTER TABLE orders ADD COLUMN venue_address TEXT");
      console.log("Added column 'venue_address' to 'orders' table.");
    } catch (err) {
      // Column may already exist
    }

    try {
      await db.query("ALTER TABLE orders ADD COLUMN special_notes TEXT DEFAULT NULL");
      console.log("Added column 'special_notes' to 'orders' table.");
    } catch (err) {
      // Column may already exist
    }

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

    // 10. Seed/Upsert permanent categories to guarantee their presence and sorting
    const permanentCats = [
      ["proposal", "Proposal", "ring", "#8B5CF6", "Fairy lights, romantic floral arches & beautiful signs to make your moment perfect.", 1],
      ["holud", "Holud", "bridal-shower", "#D97706", "Traditional Gaye Holud & Mehndi night stage setups with vibrant colors.", 2],
      ["marriage", "Marriage", "wedding-couple", "#9F507C", "Exquisite wedding, holud & reception stages blending modern and traditional luxury.", 3],
      ["baby", "Baby Shower", "baby", "#A78BFA", "Cute, colorful & magical themes for celebrating your little one.", 4],
      ["birthday", "Birthday", "birthday-cake", "#B8729A", "Bespoke balloon walls, kids themes & customized stage setups for your special day.", 5]
    ];

    for (const [id, label, emoji, color, description, display_order] of permanentCats) {
      await db.query(
        "INSERT INTO categories (id, label, emoji, color, description, display_order) VALUES (?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE display_order = ?",
        [id, label, emoji, color, description, display_order, display_order]
      );
    }
    console.log("✅ Seeded/Updated permanent categories display order.");

    // Organize uploads and database paths
    await organizeUploadsAndDatabase();

    console.log("🚀 Database schema verification complete!");
  } catch (error) {
    console.error("❌ Database initialization failed:", error);
  }
}

async function organizeUploadsAndDatabase() {
  console.log("📂 Organizing uploads directory and migrating database image paths...");
  try {
    const uploadsDir = path.join(__dirname, "../uploads");
    const itemsDir = path.join(uploadsDir, "items");
    const categoriesDir = path.join(uploadsDir, "categories");
    const subcategoriesDir = path.join(uploadsDir, "subcategories");

    // Ensure target directories exist
    if (!fs.existsSync(itemsDir)) fs.mkdirSync(itemsDir, { recursive: true });
    if (!fs.existsSync(categoriesDir)) fs.mkdirSync(categoriesDir, { recursive: true });
    if (!fs.existsSync(subcategoriesDir)) fs.mkdirSync(subcategoriesDir, { recursive: true });

    // 1. Move old files from root uploads/ to specific folders
    if (fs.existsSync(uploadsDir)) {
      const files = fs.readdirSync(uploadsDir);
      for (const file of files) {
        const fullPath = path.join(uploadsDir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isFile()) {
          let destDir = itemsDir;
          if (file.startsWith("category-")) {
            destDir = categoriesDir;
          } else if (file.startsWith("subcategory-")) {
            destDir = subcategoriesDir;
          } else if (file.startsWith("image-")) {
            destDir = itemsDir;
          } else {
            // Keep other files where they are
            continue;
          }
          const destPath = path.join(destDir, file);
          try {
            fs.renameSync(fullPath, destPath);
            console.log(`Moved ${file} to ${destDir}`);
          } catch (renameErr) {
            console.error(`Failed to move file ${file}:`, renameErr);
          }
        }
      }
    }

    // 2. Query items to update their image paths
    const [items] = await db.query("SELECT id, image, gallery_images FROM items");
    for (const item of items) {
      let updated = false;
      let newImage = item.image;
      let newGallery = item.gallery_images;

      // Update main image
      if (item.image && item.image.startsWith("/uploads/image-")) {
        newImage = item.image.replace("/uploads/image-", "/uploads/items/image-");
        updated = true;
      } else if (item.image && item.image.startsWith("/uploads/category-")) {
        newImage = item.image.replace("/uploads/category-", "/uploads/categories/category-");
        updated = true;
      } else if (item.image && item.image.startsWith("/uploads/subcategory-")) {
        newImage = item.image.replace("/uploads/subcategory-", "/uploads/subcategories/subcategory-");
        updated = true;
      }

      // Update gallery images
      if (item.gallery_images) {
        try {
          const gallery = typeof item.gallery_images === "string" ? JSON.parse(item.gallery_images) : item.gallery_images;
          if (Array.isArray(gallery)) {
            const newGalleryArr = gallery.map(img => {
              if (img && img.startsWith("/uploads/image-")) {
                updated = true;
                return img.replace("/uploads/image-", "/uploads/items/image-");
              }
              if (img && img.startsWith("/uploads/category-")) {
                updated = true;
                return img.replace("/uploads/category-", "/uploads/categories/category-");
              }
              if (img && img.startsWith("/uploads/subcategory-")) {
                updated = true;
                return img.replace("/uploads/subcategory-", "/uploads/subcategories/subcategory-");
              }
              return img;
            });
            if (updated) {
              newGallery = JSON.stringify(newGalleryArr);
            }
          }
        } catch (parseErr) {
          console.error(`Failed to parse gallery_images for item ${item.id}:`, parseErr);
        }
      }

      if (updated) {
        await db.query("UPDATE items SET image = ?, gallery_images = ? WHERE id = ?", [newImage, newGallery, item.id]);
        console.log(`Updated paths for item: ${item.id}`);
      }
    }

    // 3. Query categories to update their cover images and subcategory images
    const [categories] = await db.query("SELECT id, image_url, subcategories FROM categories");
    for (const cat of categories) {
      let updated = false;
      let newImageUrl = cat.image_url;
      let newSubcategories = cat.subcategories;

      if (cat.image_url && cat.image_url.startsWith("/uploads/category-")) {
        newImageUrl = cat.image_url.replace("/uploads/category-", "/uploads/categories/category-");
        updated = true;
      } else if (cat.image_url && cat.image_url.startsWith("/uploads/image-")) {
        newImageUrl = cat.image_url.replace("/uploads/image-", "/uploads/categories/image-");
        updated = true;
      }

      if (cat.subcategories) {
        try {
          const subs = typeof cat.subcategories === "string" ? JSON.parse(cat.subcategories) : cat.subcategories;
          if (Array.isArray(subs)) {
            const newSubsArr = subs.map(sub => {
              if (sub.image) {
                if (sub.image.startsWith("/uploads/subcategory-")) {
                  updated = true;
                  return { ...sub, image: sub.image.replace("/uploads/subcategory-", "/uploads/subcategories/subcategory-") };
                }
                if (sub.image.startsWith("/uploads/image-")) {
                  updated = true;
                  return { ...sub, image: sub.image.replace("/uploads/image-", "/uploads/subcategories/image-") };
                }
              }
              return sub;
            });
            if (updated) {
              newSubcategories = JSON.stringify(newSubsArr);
            }
          }
        } catch (parseErr) {
          console.error(`Failed to parse subcategories for category ${cat.id}:`, parseErr);
        }
      }

      if (updated) {
        await db.query("UPDATE categories SET image_url = ?, subcategories = ? WHERE id = ?", [newImageUrl, newSubcategories, cat.id]);
        console.log(`Updated paths for category: ${cat.id}`);
      }
    }

    console.log("✅ Uploads folder and database paths organized successfully!");
  } catch (err) {
    console.error("❌ Failed to organize uploads and database:", err);
  }
}

module.exports = initializeDatabase;