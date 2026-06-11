const db = require("./db");

const INVENTORY_ITEMS = [
  // Birthday
  { id: "b1", title: "Neon Sign", categoryId: "birthday", subCategoryId: "light", description: "Bright neon sign for birthday parties." },
  { id: "b2", title: "Circle Arch", categoryId: "birthday", subCategoryId: "backdrops", description: "Circular metal arch backdrop." },
  { id: "b3", title: "Shimmer Wall", categoryId: "birthday", subCategoryId: "backdrops", description: "Sparkling shimmer wall backdrop." },
  { id: "b4", title: "Cylinder Plinths", categoryId: "birthday", subCategoryId: "plinths", description: "Set of 3 cylinders for cakes/desserts." },
  { id: "b5", title: "Marquee Numbers", categoryId: "birthday", subCategoryId: "light", description: "LED marquee numbers for age display." },
  { id: "b6", title: "Balloon Stand", categoryId: "birthday", subCategoryId: "balloons", description: "Decorative balloon stand." },
  { id: "b7", title: "Cake Riser", categoryId: "birthday", subCategoryId: "displays", description: "Elegant cake riser stand." },
  { id: "b8", title: "Cupcake Tower", categoryId: "birthday", subCategoryId: "displays", description: "Multi-tier cupcake tower stand." },
  { id: "b9", title: "Table Runner", categoryId: "birthday", subCategoryId: "linens", description: "Premium fabric table runner." },
  { id: "b10", title: "Throne Chair", categoryId: "birthday", subCategoryId: "seating", description: "Royal throne chair for the birthday host." },
  { id: "b11", title: "Activity Bench", categoryId: "birthday", subCategoryId: "seating", description: "Kids activity seating bench." },
  { id: "b12", title: "Mirror Pedestals", categoryId: "birthday", subCategoryId: "plinths", description: "Glossy mirror finished pedestals." },
  { id: "b13", title: "Teddy Bear", categoryId: "birthday", subCategoryId: "props", description: "Giant fluffy teddy bear prop." },
  { id: "b14", title: "Balloon Wall", categoryId: "birthday", subCategoryId: "balloons", description: "Fully customized balloon wall backdrop." },

  // Marriage
  { id: "m1", title: "Floral Arch", categoryId: "marriage", subCategoryId: "arches", description: "Large floral arch decorated with premium roses." },
  { id: "m2", title: "Gold Frame", categoryId: "marriage", subCategoryId: "backdrops", description: "Geometric golden frame backdrop." },
  { id: "m3", title: "Stage Panel", categoryId: "marriage", subCategoryId: "backdrops", description: "Luxurious stage panels backdrop." },
  { id: "m4", title: "Drape Curtain", categoryId: "marriage", subCategoryId: "backdrops", description: "Flowing white drape curtains." },
  { id: "m5", title: "Wedding Sofa", categoryId: "marriage", subCategoryId: "seating", description: "Elegant wedding sofa for bride and groom." },
  { id: "m6", title: "Throne Chair", categoryId: "marriage", subCategoryId: "seating", description: "Premium golden throne chair." },
  { id: "m7", title: "Gold Chair", categoryId: "marriage", subCategoryId: "chairs", description: "Chiavari gold guest chairs." },
  { id: "m8", title: "Clear Chair", categoryId: "marriage", subCategoryId: "chairs", description: "Modern transparent ghost chairs." },
  { id: "m9", title: "White Chair", categoryId: "marriage", subCategoryId: "chairs", description: "Classic white wedding chairs." },
  { id: "m10", title: "Red Carpet", categoryId: "marriage", subCategoryId: "carpets", description: "VIP red carpet runner." },
  { id: "m11", title: "White Carpet", categoryId: "marriage", subCategoryId: "carpets", description: "Clean white carpet runner." },
  { id: "m12", title: "Crystal Pillar", categoryId: "marriage", subCategoryId: "stands", description: "Glistening crystal pillar stands." },
  { id: "m13", title: "Blossom Tree", categoryId: "marriage", subCategoryId: "stands", description: "Beautiful artificial cherry blossom tree." },
  { id: "m14", title: "Candelabra", categoryId: "marriage", subCategoryId: "lights", description: "Vintage gold candelabra table centerpiece." },
  { id: "m15", title: "Charger Plate", categoryId: "marriage", subCategoryId: "tableware", description: "Decorative metallic charger plates." },
  { id: "m16", title: "Flower Runner", categoryId: "marriage", subCategoryId: "tableware", description: "Lush floral table runner." },
  { id: "m17", title: "LED Uplights", categoryId: "marriage", subCategoryId: "lights", description: "Color changing LED stage uplights." },
  { id: "m18", title: "Chandelier", categoryId: "marriage", subCategoryId: "lights", description: "Hanging crystal chandelier." },

  // Proposal
  { id: "p1", title: "Marry Me Light-up Letters", categoryId: "proposal", subCategoryId: "light", description: "Large 4ft marquee letters for proposals." },
  { id: "p2", title: "Red Rose Pathway & LED Candles", categoryId: "proposal", subCategoryId: "carpets", description: "Stunning rose petals and glass candles setup." },
  { id: "p3", title: "Heart Shape Floral Arch", categoryId: "proposal", subCategoryId: "arches", description: "Romantic heart-shaped floral arch backdrop." },
  { id: "p4", title: "Fairy Lights Canopy", categoryId: "proposal", subCategoryId: "lights", description: "Magical warm white fairy lights canopy." },

  // Holud
  { id: "h1", title: "Wooden Mandap", categoryId: "holud", subCategoryId: "mandap", description: "Traditional wooden mandap structure." },
  { id: "h2", title: "Color Drapes", categoryId: "holud", subCategoryId: "drapes", description: "Bright yellow and orange drapes." },
  { id: "h3", title: "Floor Mattress", categoryId: "holud", subCategoryId: "seating", description: "Large floor mattress seating." },
  { id: "h4", title: "Square Cushion", categoryId: "holud", subCategoryId: "cushions", description: "Colorful square cushions." },
  { id: "h5", title: "Round Cushion", categoryId: "holud", subCategoryId: "cushions", description: "Traditional round bolster cushions." },
  { id: "h6", title: "Wooden Bench", categoryId: "holud", subCategoryId: "seating", description: "Rustic wooden seating bench." },
  { id: "h7", title: "Sweet Dala", categoryId: "holud", subCategoryId: "dalas", description: "Decorated sweet tray (dala)." },
  { id: "h8", title: "Saree Dala", categoryId: "holud", subCategoryId: "dalas", description: "Decorated saree packaging tray." },
  { id: "h9", title: "Sherwani Dala", categoryId: "holud", subCategoryId: "dalas", description: "Decorated sherwani packaging tray." },
  { id: "h10", title: "Paan Dala", categoryId: "holud", subCategoryId: "dalas", description: "Decorated paan serving tray." },
  { id: "h11", title: "Mirror Tray", categoryId: "holud", subCategoryId: "trays", description: "Elegant mirror finished trays." },
  { id: "h12", title: "Decorated Kula", categoryId: "holud", subCategoryId: "trays", description: "Traditional hand-painted kula fans." },
  { id: "h13", title: "Ethnic Umbrella", categoryId: "holud", subCategoryId: "props", description: "Brightly colored ethnic umbrellas." },
  { id: "h14", title: "Marigold String", categoryId: "holud", subCategoryId: "accessories", description: "Fresh/artificial marigold flower garlands." },
  { id: "h15", title: "Brass Bowl", categoryId: "holud", subCategoryId: "accessories", description: "Traditional brass bowls for turmeric paste." },
  { id: "h16", title: "Jewelry Stand", categoryId: "holud", subCategoryId: "accessories", description: "Floral jewelry display stands." },
  { id: "h17", title: "Welcome Board", categoryId: "holud", subCategoryId: "accessories", description: "Customizable hand-painted welcome board." },
  { id: "h18", title: "Mehndi Ring", categoryId: "holud", subCategoryId: "mandap", description: "Mehndi night circular ring backdrop." },
  { id: "h19", title: "Clay Pots", categoryId: "holud", subCategoryId: "props", description: "Traditional decorated clay pottery." },

  // Baby Shower
  { id: "bs1", title: "Oh Baby Sign", categoryId: "baby", subCategoryId: "signs", description: "Cute neon sign saying 'Oh Baby'." },
  { id: "bs2", title: "Hedge Wall", categoryId: "baby", subCategoryId: "backdrops", description: "Green grass hedge wall backdrop." },
  { id: "bs3", title: "Balloon Sculpture", categoryId: "baby", subCategoryId: "balloons", description: "Pastel balloon column sculptures." },
  { id: "bs4", title: "Peacock Chair", categoryId: "baby", subCategoryId: "seating", description: "Bohemian wicker peacock chair." },
  { id: "bs5", title: "Tufted Armchair", categoryId: "baby", subCategoryId: "seating", description: "Elegant plush tufted armchair." },
  { id: "bs6", title: "BABY Blocks", categoryId: "baby", subCategoryId: "blocks", description: "Large transparent letter blocks filled with balloons." },
  { id: "bs7", title: "Teddy Display", categoryId: "baby", subCategoryId: "displays", description: "Giant teddy bear display stand." },
  { id: "bs8", title: "Confetti Cannon", categoryId: "baby", subCategoryId: "effects", description: "Gender reveal confetti cannons." },
  { id: "bs9", title: "Dessert Platter", categoryId: "baby", subCategoryId: "platters", description: "Set of white and gold dessert platters." },
  { id: "bs10", title: "Candy Jar", categoryId: "baby", subCategoryId: "platters", description: "Vintage apothecary candy jars." },
  { id: "bs11", title: "Easel Board", categoryId: "baby", subCategoryId: "signs", description: "White welcome easel board." },
  { id: "bs12", title: "Cloud Balloon", categoryId: "baby", subCategoryId: "balloons", description: "Hanging balloon cloud installation." },

  // Global Essentials
  { id: "g1", title: "Folding Table", categoryId: "global", subCategoryId: "tables", description: "Standard 6ft folding banquet table." },
  { id: "g2", title: "Cocktail Table", categoryId: "global", subCategoryId: "tables", description: "Tall cocktail bar tables." },
  { id: "g3", title: "White Cloth", categoryId: "global", subCategoryId: "linens", description: "Premium white polyester table linens." },
  { id: "g4", title: "Black Cloth", categoryId: "global", subCategoryId: "linens", description: "Premium black polyester table linens." },
  { id: "g5", title: "Sequin Runner", categoryId: "global", subCategoryId: "runners", description: "Sparkly gold sequin table runner." },
  { id: "g6", title: "Velvet Napkin", categoryId: "global", subCategoryId: "runners", description: "Soft velvet dinner napkins." },
  { id: "g7", title: "Chafing Dish", categoryId: "global", subCategoryId: "buffet", description: "Stainless steel buffet chafing dish." },
  { id: "g8", title: "Beverage Dispenser", categoryId: "global", subCategoryId: "dispensers", description: "Glass beverage dispenser with stand." },
  { id: "g9", title: "Cutlery Set", categoryId: "global", subCategoryId: "dispensers", description: "Premium gold cutlery sets." },
  { id: "g10", title: "Party Speaker", categoryId: "global", subCategoryId: "audio", description: "High power Bluetooth party speaker." },
  { id: "g11", title: "Fairy Lights", categoryId: "global", subCategoryId: "lights", description: "Warm white fairy light strings." },
  { id: "g12", title: "Smoke Machine", categoryId: "global", subCategoryId: "effects", description: "Low fog smoke machine." },
  { id: "g13", title: "Background Stand", categoryId: "global", subCategoryId: "effects", description: "Adjustable heavy duty backdrop stands." },
  { id: "g14", title: "LED Curtain", categoryId: "global", subCategoryId: "lights", description: "Hanging LED string light curtain." }
];

const DEMO_PACKAGES = [
  {
    name: "Classic Birthday Celebration Package",
    price: 150,
    category_id: "birthday",
    itemIds: ["b1", "b2", "b4", "b6", "b7", "b8", "b13"]
  },
  {
    name: "Luxury Proposal Setup Package",
    price: 120,
    category_id: "proposal",
    itemIds: ["p1", "p2", "p4", "g11"]
  },
  {
    name: "Royal Wedding Stage Package",
    price: 450,
    category_id: "marriage",
    itemIds: ["m1", "m3", "m5", "m10", "m12", "m17", "m18", "g11"]
  }
];

async function initializeDatabase() {
  console.log("🛠️ Initializing database tables and schema...");
  try {
    // 1. Drop existing items table if it has auto-increment ID to prevent issues,
    // or if the subCategoryId, name, or unit_count columns are missing.
    const [columns] = await db.query("SHOW COLUMNS FROM items").catch(() => [[]]);
    const isOldSchema = columns.some(col => col.Field === "id" && col.Type.includes("int"));
    const hasSubCategoryId = columns.some(col => col.Field === "subCategoryId");
    const hasName = columns.some(col => col.Field === "name");
    const hasUnitCount = columns.some(col => col.Field === "unit_count");

    if ((isOldSchema || !hasSubCategoryId || !hasName || !hasUnitCount) && process.env.NODE_ENV !== "production") {
      console.log("⚠️ Old items table schema or missing subCategoryId/name/unit_count column detected. Dropping and recreating...");
      await db.query("DROP TABLE IF EXISTS package_items");
      await db.query("DROP TABLE IF EXISTS items");
    }


    // 2. Create items table
    await db.query(`
      CREATE TABLE IF NOT EXISTS items (
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
      )
    `);
    console.log("✅ Table 'items' created/verified.");

    // 3. Create packages table
    await db.query(`
      CREATE TABLE IF NOT EXISTS packages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        category_id VARCHAR(50) NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log("✅ Table 'packages' created/verified.");

    // 4. Create package_items join table
    await db.query(`
      CREATE TABLE IF NOT EXISTS package_items (
        package_id INT NOT NULL,
        item_id VARCHAR(50) NOT NULL,
        PRIMARY KEY (package_id, item_id),
        FOREIGN KEY (package_id) REFERENCES packages(id) ON DELETE CASCADE,
        FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE
      )
    `);
    console.log("✅ Table 'package_items' created/verified.");

    // Create users table
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NULL,
        name VARCHAR(255) NOT NULL,
        google_id VARCHAR(255) UNIQUE NULL,
        avatar_url VARCHAR(255) NULL,
        role VARCHAR(50) DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log("✅ Table 'users' created/verified.");

    // Create bookings table
    await db.query(`
      CREATE TABLE IF NOT EXISTS bookings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        customer_name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(50) NOT NULL,
        pickup_date DATE NOT NULL,
        return_date DATE NOT NULL,
        package_name VARCHAR(255) NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        payment_method VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("✅ Table 'bookings' created/verified.");

    // Create enquiries table
    await db.query(`
      CREATE TABLE IF NOT EXISTS enquiries (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        occasion VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("✅ Table 'enquiries' created/verified.");



    // 5. Seed items if empty
    const [itemRows] = await db.query("SELECT COUNT(*) as count FROM items");
    if (itemRows[0].count === 0) {
      console.log("🌱 Seeding items table with initial inventory...");
      for (const item of INVENTORY_ITEMS) {
        await db.query(
          "INSERT INTO items (id, name, title, categoryId, subCategoryId, description, isAvailable, unit_count, image) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
          [item.id, item.title, item.title, item.categoryId, item.subCategoryId, item.description || null, true, 10, "✨"]
        );
      }
      console.log(`✅ Successfully seeded ${INVENTORY_ITEMS.length} items.`);
    }

    // 6. Seed packages if empty
    const [packageRows] = await db.query("SELECT COUNT(*) as count FROM packages");
    if (packageRows[0].count === 0) {
      console.log("🌱 Seeding packages table with demo packages...");
      for (const pkg of DEMO_PACKAGES) {
        const [result] = await db.query(
          "INSERT INTO packages (name, price, category_id) VALUES (?, ?, ?)",
          [pkg.name, pkg.price, pkg.category_id]
        );
        const packageId = result.insertId;
        
        for (const itemId of pkg.itemIds) {
          await db.query(
            "INSERT INTO package_items (package_id, item_id) VALUES (?, ?)",
            [packageId, itemId]
          );
        }
      }
      console.log(`✅ Successfully seeded ${DEMO_PACKAGES.length} packages.`);
    }

    console.log("🚀 Database initialization complete!");
  } catch (error) {
    console.error("❌ Database initialization error:", error);
  }
}

module.exports = initializeDatabase;
