const db = require("./src/db.js");
const initializeDatabase = require("./src/initDb.js");

async function reset() {
  console.log("⚠️ Dropping all tables for FinalTouch Studio...");
  
  // Turn off foreign key checks temporarily to ensure clean drop
  await db.query("SET FOREIGN_KEY_CHECKS = 0");

  const tables = [
    "user_cart",
    "order_items",
    "orders",
    "package_items",
    "packages",
    "items",
    "categories",
    "users",
    "enquiries"
  ];

  for (const table of tables) {
    try {
      await db.query(`DROP TABLE IF EXISTS ${table}`);
      console.log(`✅ Dropped table: ${table}`);
    } catch (err) {
      console.error(`❌ Error dropping table ${table}:`, err);
    }
  }

  // Restore foreign key checks
  await db.query("SET FOREIGN_KEY_CHECKS = 1");

  console.log("🛠️ Re-initializing database schemas and seeding permanent categories...");
  await initializeDatabase();
  
  console.log("✨ Database successfully reset to clean state!");
  process.exit(0);
}

reset().catch(err => {
  console.error("❌ Reset failed:", err);
  process.exit(1);
});
