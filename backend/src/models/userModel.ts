import { query, queryOne, execute } from '../db/index.js';

export interface UserRecord {
  id: string;
  email: string;
  password_hash: string | null;
  full_name: string;
  google_id: string | null;
  auth_provider: 'email' | 'google';
  is_verified: number; // 0 or 1
  verification_token: string | null;
  verification_otp: string | null;
  verification_expires_at: string | null;
  reset_token: string | null;
  reset_expires_at: string | null;
  avatar_url: string | null;
  brand_name: string | null;
  instagram_handle: string | null;
  status: 'active' | 'suspended';
  created_at: string;
  updated_at: string;
  last_login_at: string | null;
}

export interface SafeUser {
  id: string;
  email: string;
  fullName: string;
  avatarUrl: string | null;
  brandName: string | null;
  instagramHandle: string | null;
  authProvider: 'email' | 'google';
  isVerified: boolean;
  status: string;
  createdAt: string;
  lastLoginAt: string | null;
}

export interface SessionRecord {
  id: string;
  user_id: string;
  token: string;
  expires_at: string;
  created_at: string;
  revoked: number;
}

export const toSafeUser = (user: UserRecord): SafeUser => {
  return {
    id: user.id,
    email: user.email,
    fullName: user.full_name,
    avatarUrl: user.avatar_url,
    brandName: user.brand_name || 'My Creator Studio',
    instagramHandle: user.instagram_handle || '@creator',
    authProvider: user.auth_provider,
    isVerified: user.is_verified === 1,
    status: user.status,
    createdAt: user.created_at,
    lastLoginAt: user.last_login_at,
  };
};

export const UserModel = {
  async createUser(params: {
    id: string;
    email: string;
    passwordHash: string | null;
    fullName: string;
    googleId?: string | null;
    authProvider?: 'email' | 'google';
    isVerified?: boolean;
    verificationToken?: string | null;
    verificationOtp?: string | null;
    verificationExpiresAt?: string | null;
    avatarUrl?: string | null;
    brandName?: string | null;
    instagramHandle?: string | null;
  }): Promise<UserRecord> {
    const now = new Date().toISOString();
    await execute(`
      INSERT INTO users (
        id, email, password_hash, full_name, google_id, auth_provider,
        is_verified, verification_token, verification_otp, verification_expires_at,
        avatar_url, brand_name, instagram_handle, status, created_at, updated_at
      ) VALUES (
        @id, @email, @password_hash, @full_name, @google_id, @auth_provider,
        @is_verified, @verification_token, @verification_otp, @verification_expires_at,
        @avatar_url, @brand_name, @instagram_handle, 'active', @created_at, @updated_at
      )
    `, {
      id: params.id,
      email: params.email.toLowerCase().trim(),
      password_hash: params.passwordHash,
      full_name: params.fullName.trim(),
      google_id: params.googleId || null,
      auth_provider: params.authProvider || 'email',
      is_verified: params.isVerified ? 1 : 0,
      verification_token: params.verificationToken || null,
      verification_otp: params.verificationOtp || null,
      verification_expires_at: params.verificationExpiresAt || null,
      avatar_url: params.avatarUrl || null,
      brand_name: params.brandName || 'My Creator Studio',
      instagram_handle: params.instagramHandle || '@creator',
      created_at: now,
      updated_at: now,
    });

    const created = await UserModel.findUserById(params.id);
    return created!;
  },

  async findUserById(id: string): Promise<UserRecord | null> {
    return queryOne<UserRecord>('SELECT * FROM users WHERE id = ?', [id]);
  },

  async findUserByEmail(email: string): Promise<UserRecord | null> {
    return queryOne<UserRecord>('SELECT * FROM users WHERE LOWER(email) = LOWER(?)', [email.trim()]);
  },

  async findUserByGoogleId(googleId: string): Promise<UserRecord | null> {
    return queryOne<UserRecord>('SELECT * FROM users WHERE google_id = ?', [googleId]);
  },

  async findUserByVerificationToken(token: string): Promise<UserRecord | null> {
    return queryOne<UserRecord>('SELECT * FROM users WHERE verification_token = ?', [token]);
  },

  async findUserByVerificationOtp(email: string, otp: string): Promise<UserRecord | null> {
    return queryOne<UserRecord>('SELECT * FROM users WHERE LOWER(email) = LOWER(?) AND verification_otp = ?', [email.trim(), otp.trim()]);
  },

  async findUserByResetToken(token: string): Promise<UserRecord | null> {
    return queryOne<UserRecord>('SELECT * FROM users WHERE reset_token = ?', [token]);
  },

  async setVerificationToken(id: string, token: string, otp: string, expiresAt: string): Promise<void> {
    const now = new Date().toISOString();
    await execute(`
      UPDATE users
      SET verification_token = ?, verification_otp = ?, verification_expires_at = ?, updated_at = ?
      WHERE id = ?
    `, [token, otp, expiresAt, now, id]);
  },

  async markUserVerified(id: string): Promise<void> {
    const now = new Date().toISOString();
    await execute(`
      UPDATE users
      SET is_verified = 1, verification_token = NULL, verification_otp = NULL, verification_expires_at = NULL, updated_at = ?
      WHERE id = ?
    `, [now, id]);
  },

  async setResetToken(id: string, token: string, expiresAt: string): Promise<void> {
    const now = new Date().toISOString();
    await execute(`
      UPDATE users
      SET reset_token = ?, reset_expires_at = ?, updated_at = ?
      WHERE id = ?
    `, [token, expiresAt, now, id]);
  },

  async updatePassword(id: string, passwordHash: string): Promise<void> {
    const now = new Date().toISOString();
    await execute(`
      UPDATE users
      SET password_hash = ?, reset_token = NULL, reset_expires_at = NULL, updated_at = ?
      WHERE id = ?
    `, [passwordHash, now, id]);
  },

  async linkGoogleAccount(id: string, googleId: string, avatarUrl?: string | null): Promise<void> {
    const now = new Date().toISOString();
    await execute(`
      UPDATE users
      SET google_id = ?, avatar_url = COALESCE(avatar_url, ?), is_verified = 1, updated_at = ?
      WHERE id = ?
    `, [googleId, avatarUrl || null, now, id]);
  },

  async updateLastLogin(id: string): Promise<void> {
    const now = new Date().toISOString();
    await execute(`
      UPDATE users
      SET last_login_at = ?
      WHERE id = ?
    `, [now, id]);
  },

  async updateProfile(id: string, updates: { fullName?: string; brandName?: string; instagramHandle?: string; avatarUrl?: string }): Promise<void> {
    const now = new Date().toISOString();
    const user = await UserModel.findUserById(id);
    if (!user) return;

    await execute(`
      UPDATE users
      SET full_name = ?, brand_name = ?, instagram_handle = ?, avatar_url = ?, updated_at = ?
      WHERE id = ?
    `, [
      updates.fullName ?? user.full_name,
      updates.brandName ?? user.brand_name,
      updates.instagramHandle ?? user.instagram_handle,
      updates.avatarUrl ?? user.avatar_url,
      now,
      id
    ]);
  },

  // Sessions management
  async createSession(id: string, userId: string, token: string, expiresAt: string): Promise<void> {
    const now = new Date().toISOString();
    await execute(`
      INSERT INTO sessions (id, user_id, token, expires_at, created_at, revoked)
      VALUES (?, ?, ?, ?, ?, 0)
    `, [id, userId, token, expiresAt, now]);
  },

  async findSession(token: string): Promise<SessionRecord | null> {
    return queryOne<SessionRecord>('SELECT * FROM sessions WHERE token = ? AND revoked = 0', [token]);
  },

  async revokeSession(token: string): Promise<void> {
    await execute('UPDATE sessions SET revoked = 1 WHERE token = ?', [token]);
  },

  async revokeAllUserSessions(userId: string): Promise<void> {
    await execute('UPDATE sessions SET revoked = 1 WHERE user_id = ?', [userId]);
  },
};
