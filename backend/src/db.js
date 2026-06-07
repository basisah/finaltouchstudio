const mysql = require("mysql2/promise");

// Create a connection pool for efficient DB access
const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 3306,
  database: process.env.DB_NAME || "finaltouchstudio",
  user: process.env.DB_USER || "appuser",
  password: process.env.DB_PASSWORD || "apppassword",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Test connection on startup with retries
(async () => {
  let retries = 10;
  while (retries > 0) {
    try {
      const conn = await pool.getConnection();
      console.log("✅ Database connected successfully");
      conn.release();
      break;
    } catch (err) {
      retries--;
      console.log(`⏳ Waiting for database... (${retries} retries left)`);
      await new Promise((r) => setTimeout(r, 3000));
    }
  }
  if (retries === 0) {
    console.error("❌ Could not connect to database after multiple attempts");
  }
})();

module.exports = pool;
