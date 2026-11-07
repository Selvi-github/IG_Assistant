import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { config } from '../config/env.js';
import { SCHEMA_SQL } from './schema.js';

// Ensure the directory for the database exists
const dbDir = path.dirname(config.DB_PATH);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

export const db = new Database(config.DB_PATH);

// Enable WAL mode for high performance and concurrent reads
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Initialize database schema
db.exec(SCHEMA_SQL);

// Auto-seed default demo accounts if empty so live deployment is instantly testable
try {
  const existingUser = db.prepare('SELECT id FROM users LIMIT 1').get();
  if (!existingUser) {
    const defaultHash = '$2b$10$Fr/Yd8iTqU.mp/GuRsxubO8RUtzRxKMt/m.8EiYNbz4W2QP4toflq'; // Password123
    const now = new Date().toISOString();
    const insertStmt = db.prepare(`
      INSERT INTO users (id, email, password_hash, full_name, brand_name, instagram_handle, is_verified, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, 1, 'active', ?, ?)
    `);
    insertStmt.run('usr_demo_creator', 'creator@brand.com', defaultHash, 'Demo Creator', 'My Brand', '@creator', now, now);
    insertStmt.run('usr_demo_admin', 'demo@igassistant.com', defaultHash, 'Demo Admin', 'Studio AI', '@studioai', now, now);

    db.prepare(`
      INSERT INTO brand_profiles (id, user_id, company_name, instagram_handle, bio, target_audience, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run('brand_demo_creator', 'usr_demo_creator', 'My Brand', '@creator', 'AI-powered Instagram studio', 'General audience', now, now);

    console.log('[Database] Seeded initial demo accounts (creator@brand.com / Password123).');
  }
} catch (seedErr: any) {
  console.warn('[Database] Seeding note:', seedErr.message);
}

console.log(`[Database] SQLite database initialized at ${config.DB_PATH} in WAL mode.`);

