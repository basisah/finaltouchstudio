/**
 * Shared MySQL connection pool.
 *
 * Every module requires this file, so the whole process shares one pool.
 * Use `db.query()` for single statements (a connection is borrowed and
 * returned automatically) and `db.getConnection()` only for transactions.
 */
require("dotenv").config();
const mysql = require("mysql2/promise");

const env = process.env;

const POOL_OPTIONS = {
  waitForConnections: true,
  connectionLimit: Number(env.DB_POOL_SIZE) || 10,
  queueLimit: 0,
  // Give up on an unreachable database after 10s instead of hanging the request.
  connectTimeout: 10000,
  // Keeps idle sockets alive so managed databases don't drop them mid-request.
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,
};

/**
 * Managed MySQL (Aiven / Railway) requires TLS; the local Docker database has
 * none. `DB_SSL=true|false` overrides the automatic choice.
 */
function resolveSsl(defaultOn) {
  if (env.DB_SSL === "true") return { rejectUnauthorized: false };
  if (env.DB_SSL === "false") return false;
  return defaultOn ? { rejectUnauthorized: false } : false;
}

const pool = env.DATABASE_URL
  ? mysql.createPool({ uri: env.DATABASE_URL, ssl: resolveSsl(true), ...POOL_OPTIONS })
  : mysql.createPool({
      host: env.DB_HOST || env.MYSQLHOST || "localhost",
      port: Number(env.DB_PORT || env.MYSQLPORT) || 3306,
      database: env.DB_NAME || env.MYSQLDATABASE || "finaltouchstudio",
      user: env.DB_USER || env.MYSQLUSER || "appuser",
      password: env.DB_PASSWORD || env.MYSQLPASSWORD || "apppassword",
      ssl: resolveSsl(Boolean(env.MYSQLHOST)),
      ...POOL_OPTIONS,
    });

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

if (env.JEST_WORKER_ID === undefined && !env.VERCEL) {
  waitForConnection(10, 3000)
    .then(() => console.log("Database connected successfully"))
    .catch(() => console.error("Could not connect to database after multiple attempts"));
}

async function closePool() {
  await pool.end();
}

module.exports = pool;
module.exports.waitForConnection = waitForConnection;
module.exports.closePool = closePool;
