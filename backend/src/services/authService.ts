import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { config } from '../config/env.js';
import { UserModel, UserRecord, SafeUser, toSafeUser } from '../models/userModel.js';
import { EmailService } from './emailService.js';
import { GoogleProfile } from './googleAuthService.js';

export interface TokenPayload {
  userId: string;
  email: string;
  sessionId: string;
}

export const AuthService = {
  // Password hashing
  async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  },

  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  },

  // Password validation
  validatePasswordStrength(password: string): { valid: boolean; message?: string } {
    if (!password || password.length < 6) {
      return { valid: false, message: 'Password must be at least 6 characters long.' };
    }
    return { valid: true };
  },

  // Email format validation
  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
  },

  // JWT Token generation
  generateJwt(payload: TokenPayload): string {
    return jwt.sign(payload, config.JWT_SECRET, {
      expiresIn: config.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
    });
  },

  verifyJwt(token: string): TokenPayload | null {
    try {
      return jwt.verify(token, config.JWT_SECRET) as TokenPayload;
    } catch {
      return null;
    }
  },

  // User Registration
  async register(params: {
    email: string;
    password: string;
    fullName?: string;
    brandName?: string;
    instagramHandle?: string;
  }): Promise<{
    user: SafeUser;
    token: string;
    sessionId: string;
    requiresVerification: boolean;
    verificationToken?: string;
    verificationOtp?: string;
  }> {
    const cleanEmail = params.email.toLowerCase().trim();

    if (!this.validateEmail(cleanEmail)) {
      throw new Error('Please provide a valid email address.');
    }

    const fullName = (params.fullName || cleanEmail.split('@')[0] || 'Creator').trim();
    if (fullName.length < 1) {
      throw new Error('Please enter your name.');
    }

    const passwordCheck = this.validatePasswordStrength(params.password);
    if (!passwordCheck.valid) {
      throw new Error(passwordCheck.message);
    }

    // Check duplicate
    const existing = UserModel.findUserByEmail(cleanEmail);
    if (existing) {
      throw new Error('An account with this email address already exists. Please log in.');
    }

    const userId = `usr_${crypto.randomUUID()}`;
    const passwordHash = await this.hashPassword(params.password);

    // Auto-verify user so they are immediately active in cloud deployment
    const verificationToken = EmailService.generateToken();
    const verificationOtp = EmailService.generateOtp();
    const verificationExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    const user = UserModel.createUser({
      id: userId,
      email: cleanEmail,
      passwordHash,
      fullName,
      brandName: params.brandName || 'My Brand',
      instagramHandle: params.instagramHandle || '@creator',
      isVerified: true,
      verificationToken,
      verificationOtp,
      verificationExpiresAt,
    });

    // Create session and JWT token for instant login
    const sessionId = `ses_${crypto.randomUUID()}`;
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    const token = this.generateJwt({
      userId: user.id,
      email: user.email,
      sessionId,
    });

    UserModel.createSession(sessionId, user.id, token, expiresAt);
    UserModel.updateLastLogin(user.id);

    return {
      user: toSafeUser(user),
      token,
      sessionId,
      requiresVerification: false,
      verificationToken,
      verificationOtp,
    };
  },

  // Verify Email via OTP or Token
  async verifyEmail(params: {
    email?: string;
    token?: string;
    otp?: string;
  }): Promise<{ success: boolean; user: SafeUser }> {
    let user: UserRecord | null = null;

    if (params.token) {
      user = UserModel.findUserByVerificationToken(params.token);
    } else if (params.email && params.otp) {
      user = UserModel.findUserByVerificationOtp(params.email, params.otp);
    }

    if (!user) {
      throw new Error('Invalid or expired verification token / OTP code.');
    }

    if (user.verification_expires_at) {
      const expires = new Date(user.verification_expires_at).getTime();
      if (Date.now() > expires) {
        throw new Error('Verification code has expired. Please request a new one.');
      }
    }

    UserModel.markUserVerified(user.id);
    const updated = UserModel.findUserById(user.id)!;
    return { success: true, user: toSafeUser(updated) };
  },

  // Resend verification
  async resendVerification(email: string): Promise<{ token: string; otp: string } | null> {
    const user = UserModel.findUserByEmail(email);
    if (!user) {
      // Avoid user enumeration
      return null;
    }
    if (user.is_verified === 1) {
      throw new Error('This account is already verified. You can log in directly.');
    }

    const verificationToken = EmailService.generateToken();
    const verificationOtp = EmailService.generateOtp();
    const verificationExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    UserModel.setVerificationToken(user.id, verificationToken, verificationOtp, verificationExpiresAt);
    await EmailService.sendVerificationEmail(user.email, verificationToken, verificationOtp);
    return { token: verificationToken, otp: verificationOtp };
  },

  // Email and Password Login
  async login(params: {
    email: string;
    password: string;
  }): Promise<{
    user: SafeUser;
    token: string;
    sessionId: string;
  }> {
    const cleanEmail = params.email.toLowerCase().trim();
    if (!cleanEmail || !params.password) {
      throw new Error('Please provide both email and password.');
    }

    const user = UserModel.findUserByEmail(cleanEmail);
    if (!user) {
      throw new Error('Invalid email or password.');
    }

    if (!user.password_hash) {
      throw new Error('This account was created with Google Sign-In. Please sign in with Google or reset your password.');
    }

    const isMatch = await this.verifyPassword(params.password, user.password_hash);
    if (!isMatch) {
      throw new Error('Invalid email or password.');
    }

    if (user.status !== 'active') {
      throw new Error('This account has been disabled or suspended. Please contact support.');
    }

    // Auto-verify user so they are never blocked from accessing their account
    if (user.is_verified === 0) {
      UserModel.markUserVerified(user.id);
    }

    // Create session
    const sessionId = `ses_${crypto.randomUUID()}`;
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days
    const token = this.generateJwt({
      userId: user.id,
      email: user.email,
      sessionId,
    });

    UserModel.createSession(sessionId, user.id, token, expiresAt);
    UserModel.updateLastLogin(user.id);

    return {
      user: toSafeUser(user),
      token,
      sessionId,
    };
  },

  // Forgot password
  async forgotPassword(email: string): Promise<void> {
    const cleanEmail = email.toLowerCase().trim();
    const user = UserModel.findUserByEmail(cleanEmail);
    if (!user) {
      // Do not disclose whether email exists
      return;
    }

    const resetToken = EmailService.generateToken();
    const resetExpiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour

    UserModel.setResetToken(user.id, resetToken, resetExpiresAt);
    await EmailService.sendPasswordResetEmail(user.email, resetToken);
  },

  // Reset password
  async resetPassword(token: string, newPassword: string): Promise<void> {
    if (!token) {
      throw new Error('Reset token is required.');
    }

    const passwordCheck = this.validatePasswordStrength(newPassword);
    if (!passwordCheck.valid) {
      throw new Error(passwordCheck.message);
    }

    const user = UserModel.findUserByResetToken(token);
    if (!user) {
      throw new Error('Invalid or expired password reset link. Please request a new one.');
    }

    if (user.reset_expires_at) {
      const expires = new Date(user.reset_expires_at).getTime();
      if (Date.now() > expires) {
        throw new Error('This password reset link has expired. Please request a new one.');
      }
    }

    const passwordHash = await this.hashPassword(newPassword);
    UserModel.updatePassword(user.id, passwordHash);

    // Invalidate existing sessions for security
    UserModel.revokeAllUserSessions(user.id);
  },

  // Google OAuth Account Handler
  async handleGoogleUser(profile: GoogleProfile): Promise<{
    user: SafeUser;
    token: string;
    sessionId: string;
  }> {
    const cleanEmail = profile.email.toLowerCase().trim();

    // 1. Try finding by Google ID
    let user = UserModel.findUserByGoogleId(profile.googleId);

    // 2. Try finding by email (account linking)
    if (!user) {
      user = UserModel.findUserByEmail(cleanEmail);
      if (user) {
        // Link Google ID to existing account
        UserModel.linkGoogleAccount(user.id, profile.googleId, profile.avatarUrl);
        user = UserModel.findUserById(user.id)!;
      }
    }

    // 3. If new user, create account
    if (!user) {
      const userId = `usr_${crypto.randomUUID()}`;
      user = UserModel.createUser({
        id: userId,
        email: cleanEmail,
        passwordHash: null,
        fullName: profile.fullName,
        googleId: profile.googleId,
        authProvider: 'google',
        isVerified: true, // Google accounts come pre-verified
        avatarUrl: profile.avatarUrl,
        brandName: `${profile.fullName.split(' ')[0]}'s Studio`,
        instagramHandle: `@${cleanEmail.split('@')[0]}`,
      });
    }

    if (user.status !== 'active') {
      throw new Error('This account has been suspended.');
    }

    // Create session
    const sessionId = `ses_${crypto.randomUUID()}`;
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    const token = this.generateJwt({
      userId: user.id,
      email: user.email,
      sessionId,
    });

    UserModel.createSession(sessionId, user.id, token, expiresAt);
    UserModel.updateLastLogin(user.id);

    return {
      user: toSafeUser(user),
      token,
      sessionId,
    };
  },

  // Logout
  async logout(token: string): Promise<void> {
    if (!token) return;
    UserModel.revokeSession(token);
  },
};

