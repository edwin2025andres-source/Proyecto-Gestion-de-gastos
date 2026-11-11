const fs = require('node:fs');
const path = require('node:path');
const { DatabaseSync } = require('node:sqlite');

const usePostgres = Boolean(process.env.DATABASE_URL);
let sqlite;
let postgres;

const sqliteSchema = `
CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, email TEXT NOT NULL UNIQUE, password_hash TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS categories (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, name TEXT NOT NULL, type TEXT NOT NULL CHECK(type IN ('expense','income')), icon TEXT NOT NULL DEFAULT '🏷️', color TEXT NOT NULL DEFAULT '#7c6cf2', alerts_enabled INTEGER NOT NULL DEFAULT 1, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, UNIQUE(user_id,name,type), FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE);
CREATE TABLE IF NOT EXISTS movements (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, category_id INTEGER NOT NULL, type TEXT NOT NULL CHECK(type IN ('expense','income')), amount NUMERIC NOT NULL CHECK(amount>0), movement_date TEXT NOT NULL, description TEXT, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE, FOREIGN KEY(category_id) REFERENCES categories(id) ON DELETE RESTRICT);
CREATE INDEX IF NOT EXISTS idx_mov_user_date ON movements(user_id,movement_date);
CREATE TABLE IF NOT EXISTS budgets (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, category_id INTEGER NOT NULL, month TEXT NOT NULL, amount NUMERIC NOT NULL CHECK(amount>0), UNIQUE(user_id,category_id,month), FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE, FOREIGN KEY(category_id) REFERENCES categories(id) ON DELETE CASCADE);
CREATE TABLE IF NOT EXISTS goals (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, name TEXT NOT NULL, target_amount NUMERIC NOT NULL CHECK(target_amount>0), saved_amount NUMERIC NOT NULL DEFAULT 0, deadline TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE);
CREATE TABLE IF NOT EXISTS alerts (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, category_id INTEGER NOT NULL, month TEXT NOT NULL, threshold INTEGER NOT NULL, message TEXT NOT NULL, is_read INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, UNIQUE(user_id,category_id,month,threshold), FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE, FOREIGN KEY(category_id) REFERENCES categories(id) ON DELETE CASCADE);`;

const postgresSchema = `
CREATE TABLE IF NOT EXISTS users (id SERIAL PRIMARY KEY, name TEXT NOT NULL, email TEXT NOT NULL UNIQUE, password_hash TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS categories (id SERIAL PRIMARY KEY, user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE, name TEXT NOT NULL, type TEXT NOT NULL CHECK(type IN ('expense','income')), icon TEXT NOT NULL DEFAULT '🏷️', color TEXT NOT NULL DEFAULT '#7c6cf2', alerts_enabled INTEGER NOT NULL DEFAULT 1, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, UNIQUE(user_id,name,type));
CREATE TABLE IF NOT EXISTS movements (id SERIAL PRIMARY KEY, user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE, category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE RESTRICT, type TEXT NOT NULL CHECK(type IN ('expense','income')), amount NUMERIC NOT NULL CHECK(amount>0), movement_date TEXT NOT NULL, description TEXT, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE INDEX IF NOT EXISTS idx_mov_user_date ON movements(user_id,movement_date);
CREATE TABLE IF NOT EXISTS budgets (id SERIAL PRIMARY KEY, user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE, category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE, month TEXT NOT NULL, amount NUMERIC NOT NULL CHECK(amount>0), UNIQUE(user_id,category_id,month));
CREATE TABLE IF NOT EXISTS goals (id SERIAL PRIMARY KEY, user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE, name TEXT NOT NULL, target_amount NUMERIC NOT NULL CHECK(target_amount>0), saved_amount NUMERIC NOT NULL DEFAULT 0, deadline TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS alerts (id SERIAL PRIMARY KEY, user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE, category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE, month TEXT NOT NULL, threshold INTEGER NOT NULL, message TEXT NOT NULL, is_read INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, UNIQUE(user_id,category_id,month,threshold));`;

const isRead = sql => /^\s*(SELECT|PRAGMA|WITH)\b/i.test(sql);
const normalizeRows = rows => rows.map(row => {
  for (const key of ['amount', 'target_amount', 'saved_amount', 'spent', 'total', 'income', 'expense', 'balance']) {
    if (row[key] !== undefined && row[key] !== null) row[key] = Number(row[key]);
  }
  return row;
});

function pgStatement(sql) {
  let statement = sql.replace(/INSERT\s+OR\s+IGNORE\s+INTO/i, 'INSERT INTO');
  let n = 0;
  statement = statement.replace(/\?/g, () => `$${++n}`);
  if (/^\s*INSERT\b/i.test(statement) && !/\bRETURNING\b/i.test(statement)) statement = `${statement.trim().replace(/;$/, '')} RETURNING id`;
  return statement;
}

async function execute(sql, args = [], client = postgres) {
  if (!usePostgres) {
    const statement = sqlite.prepare(sql);
    if (isRead(sql)) return statement.all(...args);
    const result = statement.run(...args);
    return { insertId: Number(result.lastInsertRowid) || 0, affectedRows: result.changes };
  }
  const result = await client.query(pgStatement(sql), args);
  if (isRead(sql)) return normalizeRows(result.rows);
  return { insertId: Number(result.rows[0]?.id) || 0, affectedRows: result.rowCount || 0 };
}

async function initDatabase() {
  if (usePostgres) {
    const { Pool } = require('pg');
    const databaseHost = new URL(process.env.DATABASE_URL).hostname;
    const ssl = ['localhost', '127.0.0.1', '::1'].includes(databaseHost) ? false : { rejectUnauthorized: true };
    postgres = new Pool({ connectionString: process.env.DATABASE_URL, max: 4, ssl });
    await postgres.query(postgresSchema);
    await postgres.query('SELECT 1');
    return;
  }
  const dataDir = path.join(__dirname, 'data');
  fs.mkdirSync(dataDir, { recursive: true });
  sqlite = new DatabaseSync(path.join(dataDir, 'fincontrol.sqlite'));
  sqlite.exec('PRAGMA journal_mode = DELETE; PRAGMA foreign_keys = ON; PRAGMA busy_timeout = 5000;');
  sqlite.exec(sqliteSchema);
}

async function query(sql, args = []) {
  return execute(sql, args);
}

async function createConnection() {
  if (usePostgres) {
    const client = await postgres.connect();
    return {
      beginTransaction: () => client.query('BEGIN'),
      execute: async (sql, args = []) => [await execute(sql, args, client)],
      commit: () => client.query('COMMIT'),
      rollback: async () => { try { await client.query('ROLLBACK'); } catch {} },
      release: () => client.release(),
    };
  }
  return {
    beginTransaction: () => sqlite.exec('BEGIN IMMEDIATE'),
    execute: async (sql, args = []) => [await execute(sql, args)],
    commit: () => sqlite.exec('COMMIT'),
    rollback: () => { try { sqlite.exec('ROLLBACK'); } catch {} },
    release: () => {},
  };
}

async function backupPostgres() {
  const client = await postgres.connect();
  try {
    await client.query('BEGIN TRANSACTION ISOLATION LEVEL REPEATABLE READ READ ONLY');
    const tables = {};
    for (const table of ['users', 'categories', 'movements', 'budgets', 'goals', 'alerts']) {
      const result = await client.query(`SELECT * FROM ${table} ORDER BY id`);
      tables[table] = normalizeRows(result.rows);
    }
    await client.query('COMMIT');
    return { format: 'fincontrol-postgres-json-v1', created_at: new Date().toISOString(), tables };
  } catch (error) {
    try { await client.query('ROLLBACK'); } catch {}
    throw error;
  } finally {
    client.release();
  }
}

async function closeDatabase() {
  if (postgres) await postgres.end();
  if (sqlite) sqlite.close();
}

module.exports = { initDatabase, query, createConnection, backupPostgres, closeDatabase, databaseKind: usePostgres ? 'PostgreSQL' : 'SQLite' };
