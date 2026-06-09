const mysql = require("mysql2/promise");

let pool;

if (process.env.DATABASE_URL) {
  pool = mysql.createPool({
    uri: process.env.DATABASE_URL,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    // Adds SSL support for URL strings if needed
    ssl: { rejectUnauthorized: false } 
  });
} else {
  pool = mysql.createPool({
    host: process.env.DB_HOST || process.env.MYSQLHOST || "localhost",
    port: process.env.DB_PORT || process.env.MYSQLPORT || 3306,
    database: process.env.DB_NAME || process.env.MYSQLDATABASE || "finaltouchstudio",
    user: process.env.DB_USER || process.env.MYSQLUSER || "appuser",
    password: process.env.DB_PASSWORD || process.env.MYSQLPASSWORD || "apppassword",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    // 🔥 CRITICAL: Turns on SSL encryption ONLY when connecting to Aiven (cloud), 
    // keeping it turned off (false) for your local offline Docker setup.
    ssl: process.env.MYSQLHOST ? { rejectUnauthorized: false } : false
  });
}

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
