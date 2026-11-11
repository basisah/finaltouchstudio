/**
 * Database bootstrap — runs on every backend start.
 *
 * 1. ensureSchema      creates missing tables / columns / indexes (idempotent)
 * 2. migrateLegacyData normalises rows written by older versions
 * 3. seedDefaults      permanent categories + starter testimonials
 * 4. organizeUploads   moves flat upload files into typed folders
 */
const db = require("../db");
const { ensureSchema } = require("./schema");
const { seedDefaults } = require("./seedDefaults");
const { organizeUploads } = require("./organizeUploads");

async function migrateLegacyData() {
  // "pending" / "confirmed" were replaced by a single "ordered" state.
  await db.query("UPDATE orders SET status = 'ordered' WHERE status IN ('pending', 'confirmed')");
}

async function runInitialization() {
  try {
    await ensureSchema(db);
    await migrateLegacyData();
    await seedDefaults(db);
    await organizeUploads(db);
    console.log("Database schema verified.");
  } catch (error) {
    console.error("Database initialization failed:", error);
  }
}

let inFlight = null;

/** Safe to call repeatedly: concurrent callers share one run instead of racing each other's DDL. */
function initializeDatabase() {
  if (!inFlight) {
    inFlight = runInitialization().finally(() => {
      inFlight = null;
    });
  }
  return inFlight;
}

module.exports = initializeDatabase;
