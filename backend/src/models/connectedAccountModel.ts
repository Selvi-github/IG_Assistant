import crypto from 'crypto';
import { db } from '../db/index.js';

export interface ConnectedAccountRecord {
  id: string;
  user_id: string;
  platform: 'instagram' | 'facebook';
  account_type: 'instagram_business' | 'instagram_creator';
  instagram_business_id: string | null;
  facebook_page_id: string | null;
  username: string;
  account_name: string;
  avatar_url: string | null;
  followers_count: number;
  access_token: string | null;
  token_expires_at: string | null;
  is_connected: number; // 1 or 0
  created_at: string;
  updated_at: string;
}

export const ConnectedAccountModel = {
  getByUserId(userId: string): ConnectedAccountRecord[] {
    const stmt = db.prepare('SELECT * FROM connected_accounts WHERE user_id = ? AND is_connected = 1');
    return (stmt.all(userId) as ConnectedAccountRecord[]) || [];
  },

  getInstagramAccount(userId: string): ConnectedAccountRecord | null {
    const stmt = db.prepare(
      "SELECT * FROM connected_accounts WHERE user_id = ? AND platform = 'instagram' AND is_connected = 1 LIMIT 1"
    );
    return (stmt.get(userId) as ConnectedAccountRecord) || null;
  },

  upsertAccount(
    userId: string,
    data: {
      platform: 'instagram' | 'facebook';
      accountType?: 'instagram_business' | 'instagram_creator';
      instagramBusinessId?: string | null;
      facebookPageId?: string | null;
      username: string;
      accountName: string;
      avatarUrl?: string | null;
      followersCount?: number;
      accessToken?: string | null;
      tokenExpiresAt?: string | null;
    }
  ): ConnectedAccountRecord {
    const existing = db
      .prepare('SELECT id FROM connected_accounts WHERE user_id = ? AND platform = ? AND username = ?')
      .get(userId, data.platform, data.username) as { id: string } | undefined;

    const now = new Date().toISOString();

    if (existing) {
      const stmt = db.prepare(`
        UPDATE connected_accounts SET
          account_type = ?,
          instagram_business_id = ?,
          facebook_page_id = ?,
          account_name = ?,
          avatar_url = ?,
          followers_count = ?,
          access_token = ?,
          token_expires_at = ?,
          is_connected = 1,
          updated_at = ?
        WHERE id = ?
      `);

      stmt.run(
        data.accountType || 'instagram_business',
        data.instagramBusinessId || null,
        data.facebookPageId || null,
        data.accountName,
        data.avatarUrl || null,
        data.followersCount || 0,
        data.accessToken || null,
        data.tokenExpiresAt || null,
        now,
        existing.id
      );

      return db.prepare('SELECT * FROM connected_accounts WHERE id = ?').get(existing.id) as ConnectedAccountRecord;
    }

    const id = `acc_${crypto.randomUUID()}`;
    const stmt = db.prepare(`
      INSERT INTO connected_accounts (
        id, user_id, platform, account_type, instagram_business_id, facebook_page_id,
        username, account_name, avatar_url, followers_count, access_token, token_expires_at,
        is_connected, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)
    `);

    stmt.run(
      id,
      userId,
      data.platform,
      data.accountType || 'instagram_business',
      data.instagramBusinessId || null,
      data.facebookPageId || null,
      data.username,
      data.accountName,
      data.avatarUrl || null,
      data.followersCount || 0,
      data.accessToken || null,
      data.tokenExpiresAt || null,
      now,
      now
    );

    return db.prepare('SELECT * FROM connected_accounts WHERE id = ?').get(id) as ConnectedAccountRecord;
  },

  disconnect(id: string, userId: string): void {
    const stmt = db.prepare('UPDATE connected_accounts SET is_connected = 0, updated_at = ? WHERE id = ? AND user_id = ?');
    stmt.run(new Date().toISOString(), id, userId);
  },
};

