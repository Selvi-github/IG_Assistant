import crypto from 'crypto';
import { db } from '../db/index.js';

export interface BrandProfileRecord {
  id: string;
  user_id: string;
  company_name: string;
  instagram_handle: string;
  bio: string | null;
  target_audience: string | null;
  logo_url: string | null;
  primary_color: string;
  created_at: string;
  updated_at: string;
}

export const BrandModel = {
  getByUserId(userId: string): BrandProfileRecord | null {
    const stmt = db.prepare('SELECT * FROM brand_profiles WHERE user_id = ?');
    return (stmt.get(userId) as BrandProfileRecord) || null;
  },

  upsert(userId: string, data: {
    companyName: string;
    instagramHandle: string;
    bio?: string | null;
    targetAudience?: string | null;
    logoUrl?: string | null;
    primaryColor?: string;
  }): BrandProfileRecord {
    const now = new Date().toISOString();
    const existing = this.getByUserId(userId);

    // Format handle to ensure it has leading @
    const rawHandle = data.instagramHandle.trim().replace(/^@+/, '');
    const cleanHandle = rawHandle ? `@${rawHandle}` : '@creator';
    const cleanCompanyName = data.companyName.trim() || 'My Brand';

    if (existing) {
      const stmt = db.prepare(`
        UPDATE brand_profiles
        SET company_name = ?,
            instagram_handle = ?,
            bio = ?,
            target_audience = ?,
            logo_url = ?,
            primary_color = ?,
            updated_at = ?
        WHERE user_id = ?
      `);
      stmt.run(
        cleanCompanyName,
        cleanHandle,
        data.bio ?? existing.bio,
        data.targetAudience ?? existing.target_audience,
        data.logoUrl !== undefined ? data.logoUrl : existing.logo_url,
        data.primaryColor ?? existing.primary_color,
        now,
        userId
      );
    } else {
      const id = `brd_${crypto.randomUUID()}`;
      const stmt = db.prepare(`
        INSERT INTO brand_profiles (
          id, user_id, company_name, instagram_handle, bio, target_audience,
          logo_url, primary_color, created_at, updated_at
        ) VALUES (
          ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
        )
      `);
      stmt.run(
        id,
        userId,
        cleanCompanyName,
        cleanHandle,
        data.bio || null,
        data.targetAudience || 'Followers & Customers',
        data.logoUrl || null,
        data.primaryColor || '#fb2175',
        now,
        now
      );
    }

    // Also synchronize to the users table
    const updateUserStmt = db.prepare(`
      UPDATE users
      SET brand_name = ?,
          instagram_handle = ?,
          avatar_url = COALESCE(?, avatar_url),
          updated_at = ?
      WHERE id = ?
    `);
    updateUserStmt.run(cleanCompanyName, cleanHandle, data.logoUrl || null, now, userId);

    return this.getByUserId(userId)!;
  },
};

