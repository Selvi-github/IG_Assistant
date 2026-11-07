import crypto from 'crypto';
import { config } from '../config/env.js';

// In-memory debug storage for automated tests or local inspection
export interface VerificationLog {
  email: string;
  token: string;
  otp: string;
  type: 'verification' | 'password_reset';
  timestamp: string;
}

export const recentEmailLogs: VerificationLog[] = [];

export const EmailService = {
  generateToken(): string {
    return crypto.randomBytes(32).toString('hex');
  },

  generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  },

  async sendVerificationEmail(email: string, token: string, otp: string): Promise<void> {
    const frontendBase = config.FRONTEND_URLS[0] || 'http://localhost:5174';
    const verifyUrl = `${frontendBase}/verify-email?token=${token}&email=${encodeURIComponent(email)}`;

    recentEmailLogs.unshift({
      email,
      token,
      otp,
      type: 'verification',
      timestamp: new Date().toISOString(),
    });
    if (recentEmailLogs.length > 50) recentEmailLogs.pop();

    console.log('\n======================================================');
    console.log('[EMAIL SERVICE] Verification Email Sent');
    console.log(`To: ${email}`);
    console.log(`6-Digit Verification OTP: [ ${otp} ]`);
    console.log(`Verification Link: ${verifyUrl}`);
    console.log('Valid for: 24 hours');
    console.log('======================================================\n');
  },

  async sendPasswordResetEmail(email: string, token: string): Promise<void> {
    const frontendBase = config.FRONTEND_URLS[0] || 'http://localhost:5174';
    const resetUrl = `${frontendBase}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;

    recentEmailLogs.unshift({
      email,
      token,
      otp: '',
      type: 'password_reset',
      timestamp: new Date().toISOString(),
    });
    if (recentEmailLogs.length > 50) recentEmailLogs.pop();

    console.log('\n======================================================');
    console.log('[EMAIL SERVICE] Password Reset Email Sent');
    console.log(`To: ${email}`);
    console.log(`Reset Link: ${resetUrl}`);
    console.log('Valid for: 1 hour');
    console.log('======================================================\n');
  },

  getLatestTokenForEmail(email: string, type: 'verification' | 'password_reset'): VerificationLog | undefined {
    return recentEmailLogs.find(
      (log) => log.email.toLowerCase() === email.toLowerCase() && log.type === type
    );
  },
};

