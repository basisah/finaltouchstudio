const db = require("./db");
async function run() {
  try {
    const [rows] = await db.query("SELECT * FROM categories ORDER BY display_order ASC, id ASC");
    console.log("CATEGORIES IN DB:", JSON.stringify(rows, null, 2));
    const [items] = await db.query("SELECT DISTINCT categoryId FROM items");
    console.log("ITEM CATEGORIES IN DB:", items);
  } catch (err) {
    console.error(err);
  } finally {
    await db.closePool();
  }
}
run();
