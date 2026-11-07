import { db } from '../db/index.js';

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
  createUser(params: {
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
  }): UserRecord {
    const now = new Date().toISOString();
    const stmt = db.prepare(`
      INSERT INTO users (
        id, email, password_hash, full_name, google_id, auth_provider,
        is_verified, verification_token, verification_otp, verification_expires_at,
        avatar_url, brand_name, instagram_handle, status, created_at, updated_at
      ) VALUES (
        @id, @email, @password_hash, @full_name, @google_id, @auth_provider,
        @is_verified, @verification_token, @verification_otp, @verification_expires_at,
        @avatar_url, @brand_name, @instagram_handle, 'active', @created_at, @updated_at
      )
    `);

    stmt.run({
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

    return UserModel.findUserById(params.id)!;
  },

  findUserById(id: string): UserRecord | null {
    const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
    return (stmt.get(id) as UserRecord) || null;
  },

  findUserByEmail(email: string): UserRecord | null {
    const stmt = db.prepare('SELECT * FROM users WHERE LOWER(email) = LOWER(?)');
    return (stmt.get(email.trim()) as UserRecord) || null;
  },

  findUserByGoogleId(googleId: string): UserRecord | null {
    const stmt = db.prepare('SELECT * FROM users WHERE google_id = ?');
    return (stmt.get(googleId) as UserRecord) || null;
  },

  findUserByVerificationToken(token: string): UserRecord | null {
    const stmt = db.prepare('SELECT * FROM users WHERE verification_token = ?');
    return (stmt.get(token) as UserRecord) || null;
  },

  findUserByVerificationOtp(email: string, otp: string): UserRecord | null {
    const stmt = db.prepare('SELECT * FROM users WHERE LOWER(email) = LOWER(?) AND verification_otp = ?');
    return (stmt.get(email.trim(), otp.trim()) as UserRecord) || null;
  },

  findUserByResetToken(token: string): UserRecord | null {
    const stmt = db.prepare('SELECT * FROM users WHERE reset_token = ?');
    return (stmt.get(token) as UserRecord) || null;
  },

  setVerificationToken(id: string, token: string, otp: string, expiresAt: string): void {
    const now = new Date().toISOString();
    const stmt = db.prepare(`
      UPDATE users
      SET verification_token = ?, verification_otp = ?, verification_expires_at = ?, updated_at = ?
      WHERE id = ?
    `);
    stmt.run(token, otp, expiresAt, now, id);
  },

  markUserVerified(id: string): void {
    const now = new Date().toISOString();
    const stmt = db.prepare(`
      UPDATE users
      SET is_verified = 1, verification_token = NULL, verification_otp = NULL, verification_expires_at = NULL, updated_at = ?
      WHERE id = ?
    `);
    stmt.run(now, id);
  },

  setResetToken(id: string, token: string, expiresAt: string): void {
    const now = new Date().toISOString();
    const stmt = db.prepare(`
      UPDATE users
      SET reset_token = ?, reset_expires_at = ?, updated_at = ?
      WHERE id = ?
    `);
    stmt.run(token, expiresAt, now, id);
  },

  updatePassword(id: string, passwordHash: string): void {
    const now = new Date().toISOString();
    const stmt = db.prepare(`
      UPDATE users
      SET password_hash = ?, reset_token = NULL, reset_expires_at = NULL, updated_at = ?
      WHERE id = ?
    `);
    stmt.run(passwordHash, now, id);
  },

  linkGoogleAccount(id: string, googleId: string, avatarUrl?: string | null): void {
    const now = new Date().toISOString();
    const stmt = db.prepare(`
      UPDATE users
      SET google_id = ?, avatar_url = COALESCE(avatar_url, ?), is_verified = 1, updated_at = ?
      WHERE id = ?
    `);
    stmt.run(googleId, avatarUrl || null, now, id);
  },

  updateLastLogin(id: string): void {
    const now = new Date().toISOString();
    const stmt = db.prepare(`
      UPDATE users
      SET last_login_at = ?
      WHERE id = ?
    `);
    stmt.run(now, id);
  },

  updateProfile(id: string, updates: { fullName?: string; brandName?: string; instagramHandle?: string; avatarUrl?: string }): void {
    const now = new Date().toISOString();
    const user = UserModel.findUserById(id);
    if (!user) return;

    const stmt = db.prepare(`
      UPDATE users
      SET full_name = ?, brand_name = ?, instagram_handle = ?, avatar_url = ?, updated_at = ?
      WHERE id = ?
    `);
    stmt.run(
      updates.fullName ?? user.full_name,
      updates.brandName ?? user.brand_name,
      updates.instagramHandle ?? user.instagram_handle,
      updates.avatarUrl ?? user.avatar_url,
      now,
      id
    );
  },

  // Sessions management
  createSession(id: string, userId: string, token: string, expiresAt: string): void {
    const now = new Date().toISOString();
    const stmt = db.prepare(`
      INSERT INTO sessions (id, user_id, token, expires_at, created_at, revoked)
      VALUES (?, ?, ?, ?, ?, 0)
    `);
    stmt.run(id, userId, token, expiresAt, now);
  },

  findSession(token: string): SessionRecord | null {
    const stmt = db.prepare('SELECT * FROM sessions WHERE token = ? AND revoked = 0');
    return (stmt.get(token) as SessionRecord) || null;
  },

  revokeSession(token: string): void {
    const stmt = db.prepare('UPDATE sessions SET revoked = 1 WHERE token = ?');
    stmt.run(token);
  },

  revokeAllUserSessions(userId: string): void {
    const stmt = db.prepare('UPDATE sessions SET revoked = 1 WHERE user_id = ?');
    stmt.run(userId);
  },
};

