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

async function waitForConnection(maxAttempts = 40, delayMs = 250) {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const conn = await pool.getConnection();
      conn.release();
      return;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
  throw new Error("Could not connect to database");
}

if (process.env.JEST_WORKER_ID === undefined) {
  waitForConnection(10, 3000)
    .then(() => console.log("✅ Database connected successfully"))
    .catch(() => console.error("❌ Could not connect to database after multiple attempts"));
}

async function closePool() {
  await pool.end();
}

module.exports = pool;
module.exports.waitForConnection = waitForConnection;
module.exports.closePool = closePool;
