const db = require("./backend/src/db");

async function run() {
  try {
    const [categories] = await db.query("SELECT * FROM categories");
    console.log("=== CATEGORIES ===");
    console.log(categories);

    const [items] = await db.query("SELECT * FROM items");
    console.log("=== ITEMS ===");
    console.log(items);
  } catch (err) {
    console.error(err);
  } finally {
    await db.closePool();
  }
}

run();
