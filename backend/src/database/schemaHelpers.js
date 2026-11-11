/**
 * Schema introspection helpers.
 *
 * The previous bootstrap fired ~25 `ALTER TABLE` statements on every start and
 * relied on them failing when the column already existed. On a serverless host
 * that is paid on every cold start. Instead we read the live schema once (three
 * information_schema queries) and only issue DDL for what is actually missing.
 */

async function loadSchemaSnapshot(db) {
  const [columnRows] = await db.query(
    `SELECT TABLE_NAME AS tableName, COLUMN_NAME AS columnName,
            COLUMN_TYPE AS columnType, IS_NULLABLE AS isNullable
       FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()`
  );
  const [indexRows] = await db.query(
    `SELECT DISTINCT TABLE_NAME AS tableName, INDEX_NAME AS indexName
       FROM information_schema.STATISTICS
      WHERE TABLE_SCHEMA = DATABASE()`
  );
  const [fkRows] = await db.query(
    `SELECT TABLE_NAME AS tableName, COLUMN_NAME AS columnName
       FROM information_schema.KEY_COLUMN_USAGE
      WHERE TABLE_SCHEMA = DATABASE() AND REFERENCED_TABLE_NAME IS NOT NULL`
  );

  const key = (...parts) => parts.map((p) => String(p).toLowerCase()).join(".");

  const tables = new Set();
  const columns = new Map();
  for (const row of columnRows) {
    tables.add(key(row.tableName));
    columns.set(key(row.tableName, row.columnName), {
      type: String(row.columnType).toLowerCase(),
      nullable: row.isNullable === "YES",
    });
  }
  const indexes = new Set(indexRows.map((r) => key(r.tableName, r.indexName)));
  const foreignKeys = new Set(fkRows.map((r) => key(r.tableName, r.columnName)));

  return {
    hasTable: (table) => tables.has(key(table)),
    getColumn: (table, column) => columns.get(key(table, column)) || null,
    hasColumn: (table, column) => columns.has(key(table, column)),
    hasIndex: (table, index) => indexes.has(key(table, index)),
    hasForeignKey: (table, column) => foreignKeys.has(key(table, column)),
    /** Record DDL applied during this run so later checks see it. */
    noteTable: (table) => tables.add(key(table)),
    noteColumn: (table, column, meta = { type: "", nullable: true }) =>
      columns.set(key(table, column), meta),
    noteIndex: (table, index) => indexes.add(key(table, index)),
  };
}

const ALREADY_APPLIED = new Set(["ER_DUP_FIELDNAME", "ER_DUP_KEYNAME", "ER_TABLE_EXISTS_ERROR"]);

/** Runs one DDL statement; a failure is logged but never aborts start-up. */
async function runDdl(db, sql, label) {
  try {
    await db.query(sql);
    if (label) console.log(`[schema] ${label}`);
    return true;
  } catch (err) {
    // Another instance applied the same change a moment ago — nothing to do.
    if (ALREADY_APPLIED.has(err.code)) return true;
    console.error(`[schema] FAILED ${label || sql}: ${err.message}`);
    return false;
  }
}

module.exports = { loadSchemaSnapshot, runDdl };
