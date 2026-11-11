import Database from 'better-sqlite3';
import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { config } from '../config/env.js';
import { SCHEMA_SQL } from './schema.js';

const { Pool } = pg;

export const isPostgres = Boolean(config.DATABASE_URL);
let sqliteDb: Database.Database | null = null;
let pgPool: pg.Pool | null = null;

if (isPostgres) {
  pgPool = new Pool({
    connectionString: config.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    max: 10,
    idleTimeoutMillis: 30000,
  });
  console.log('[Database] Connected to PostgreSQL (Supabase/Cloud) via connection pooling.');
} else {
  const dbDir = path.dirname(config.DB_PATH);
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }
  sqliteDb = new Database(config.DB_PATH);
  sqliteDb.pragma('journal_mode = WAL');
  sqliteDb.pragma('foreign_keys = ON');
  sqliteDb.exec(SCHEMA_SQL);
  console.log(`[Database] Connected to SQLite at ${config.DB_PATH} in WAL mode.`);
}

/**
 * Converts standard SQLite ? placeholders to PostgreSQL $1, $2, $3 positional parameters.
 */
function toPgSql(sql: string): string {
  let count = 1;
  return sql.replace(/\?/g, () => `$${count++}`);
}

/**
 * Execute a query returning an array of rows.
 */
export async function query<T = any>(sql: string, params: any[] = []): Promise<T[]> {
  if (isPostgres && pgPool) {
    const pgSql = toPgSql(sql);
    const res = await pgPool.query(pgSql, params);
    return res.rows as T[];
  }
  const stmt = sqliteDb!.prepare(sql);
  return stmt.all(...params) as T[];
}

/**
 * Execute a query returning a single row or null.
 */
export async function queryOne<T = any>(sql: string, params: any[] = []): Promise<T | null> {
  if (isPostgres && pgPool) {
    const pgSql = toPgSql(sql);
    const res = await pgPool.query(pgSql, params);
    return (res.rows[0] as T) || null;
  }
  const stmt = sqliteDb!.prepare(sql);
  return (stmt.get(...params) as T) || null;
}

/**
 * Execute an INSERT / UPDATE / DELETE statement.
 */
export async function execute(sql: string, params: any[] | Record<string, any> = []): Promise<void> {
  if (isPostgres && pgPool) {
    if (params && !Array.isArray(params) && typeof params === 'object') {
      const values: any[] = [];
      const pgSql = sql.replace(/@([a-zA-Z0-9_]+)/g, (_, key) => {
        values.push(params[key]);
        return `$${values.length}`;
      });
      await pgPool.query(pgSql, values);
      return;
    }
    const pgSql = toPgSql(sql);
    await pgPool.query(pgSql, params as any[]);
    return;
  }

  const stmt = sqliteDb!.prepare(sql);
  if (params && !Array.isArray(params) && typeof params === 'object') {
    stmt.run(params);
  } else {
    stmt.run(...(params as any[]));
  }
}

// Auto-ensure schema extensions & default demo account
export async function ensureSeeded(): Promise<void> {
  try {
    await execute(`
      CREATE TABLE IF NOT EXISTS media_assets (
        filename TEXT PRIMARY KEY,
        mime_type TEXT NOT NULL,
        data_base64 TEXT NOT NULL,
        created_at TEXT NOT NULL
      )
    `);

    const existing = await queryOne('SELECT id FROM users LIMIT 1');
    if (!existing) {
      const defaultHash = '$2b$10$Fr/Yd8iTqU.mp/GuRsxubO8RUtzRxKMt/m.8EiYNbz4W2QP4toflq'; // Password123
      const now = new Date().toISOString();
      await execute(`
        INSERT INTO users (id, email, password_hash, full_name, brand_name, instagram_handle, is_verified, status, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, 1, 'active', ?, ?)
      `, ['usr_demo_creator', 'creator@brand.com', defaultHash, 'Demo Creator', 'My Brand', '@creator', now, now]);

      await execute(`
        INSERT INTO brand_profiles (id, user_id, company_name, instagram_handle, bio, target_audience, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, ['brand_demo_creator', 'usr_demo_creator', 'My Brand', '@creator', 'AI-powered Instagram studio', 'General audience', now, now]);

      console.log('[Database] Seeded initial demo accounts (creator@brand.com / Password123).');
    }
  } catch (err: any) {
    console.warn('[Database] Seeding note:', err.message);
  }
}

ensureSeeded().catch((err) => console.warn('[Database] Seed check note:', err.message));
