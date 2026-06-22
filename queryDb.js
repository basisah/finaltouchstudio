const db = require("./backend/src/db");

async function run() {
  try {
    console.log("=== Checking current reviews table schema ===");
    try {
      const [desc] = await db.query("DESCRIBE reviews");
      console.log(desc);
    } catch (err) {
      console.error("Failed to describe reviews table:", err.message);
    }

    console.log("\n=== Checking table count and content ===");
    try {
      const [rows] = await db.query("SELECT * FROM reviews");
      console.log(`Found ${rows.length} rows inside reviews:`, rows);
    } catch (err) {
      console.error("Failed to query reviews rows:", err.message);
    }

    console.log("\n=== Running ALTER queries ===");
    const alterQueries = [
      "ALTER TABLE reviews ADD COLUMN order_id INT UNIQUE NULL",
      "ALTER TABLE reviews ADD CONSTRAINT fk_reviews_order_id FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE",
      "ALTER TABLE reviews MODIFY COLUMN user_id INT NULL",
      "ALTER TABLE reviews ADD COLUMN customer_name VARCHAR(255) NOT NULL DEFAULT 'Verified Client'",
      "ALTER TABLE reviews ADD COLUMN role VARCHAR(100) DEFAULT 'Client'"
    ];

    for (const q of alterQueries) {
      try {
        console.log(`Executing: "${q}"`);
        const [res] = await db.query(q);
        console.log("-> SUCCESS", res);
      } catch (err) {
        console.error("-> ERROR:", err.message);
      }
    }

    console.log("\n=== Checking final reviews table schema ===");
    try {
      const [desc] = await db.query("DESCRIBE reviews");
      console.log(desc);
    } catch (err) {
      console.error("Failed to describe reviews table:", err.message);
    }

  } catch (err) {
    console.error("Execution error:", err);
  } finally {
    await db.closePool();
  }
}

run();
