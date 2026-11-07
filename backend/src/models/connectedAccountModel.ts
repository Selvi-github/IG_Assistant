import crypto from 'crypto';
import { query, queryOne, execute } from '../db/index.js';

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
  async getByUserId(userId: string): Promise<ConnectedAccountRecord[]> {
    return query<ConnectedAccountRecord>('SELECT * FROM connected_accounts WHERE user_id = ? AND is_connected = 1', [userId]);
  },

  async getInstagramAccount(userId: string): Promise<ConnectedAccountRecord | null> {
    return queryOne<ConnectedAccountRecord>(
      "SELECT * FROM connected_accounts WHERE user_id = ? AND platform = 'instagram' AND is_connected = 1 LIMIT 1",
      [userId]
    );
  },

  async upsertAccount(
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
  ): Promise<ConnectedAccountRecord> {
    const existing = await queryOne<{ id: string }>(
      'SELECT id FROM connected_accounts WHERE user_id = ? AND platform = ? AND username = ?',
      [userId, data.platform, data.username]
    );

    const now = new Date().toISOString();

    if (existing) {
      await execute(`
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
      `, [
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
      ]);

      const updated = await queryOne<ConnectedAccountRecord>('SELECT * FROM connected_accounts WHERE id = ?', [existing.id]);
      return updated!;
    }

    const id = `acc_${crypto.randomUUID()}`;
    await execute(`
      INSERT INTO connected_accounts (
        id, user_id, platform, account_type, instagram_business_id, facebook_page_id,
        username, account_name, avatar_url, followers_count, access_token, token_expires_at,
        is_connected, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)
    `, [
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
    ]);

    const created = await queryOne<ConnectedAccountRecord>('SELECT * FROM connected_accounts WHERE id = ?', [id]);
    return created!;
  },

  async disconnect(id: string, userId: string): Promise<void> {
    await execute('UPDATE connected_accounts SET is_connected = 0, updated_at = ? WHERE id = ? AND user_id = ?', [new Date().toISOString(), id, userId]);
  },
};
