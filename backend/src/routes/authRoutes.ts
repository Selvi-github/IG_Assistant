import { Router, Request, Response } from 'express';
import { AuthService } from '../services/authService.js';
import { GoogleAuthService } from '../services/googleAuthService.js';
import { requireAuth, AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { authRateLimiter } from '../middleware/rateLimiter.js';
import { UserModel, toSafeUser } from '../models/userModel.js';
import { config } from '../config/env.js';

export const authRouter = Router();

const COOKIE_NAME = 'ig_token';

const getCookieOptions = () => ({
  httpOnly: true,
  secure: config.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: '/',
});

// 1. User Registration
authRouter.post('/register', authRateLimiter, async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, fullName, brandName, instagramHandle } = req.body;

    const result = await AuthService.register({
      email,
      password,
      fullName,
      brandName,
      instagramHandle,
    });

    if (result.token) {
      res.cookie(COOKIE_NAME, result.token, getCookieOptions());
    }

    res.status(201).json({
      success: true,
      message: 'Registration successful!',
      requiresVerification: false,
      user: result.user,
      token: result.token,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message || 'Registration failed.',
    });
  }
});

// 2. Email Verification (Supports OTP or Token)
authRouter.post('/verify-email', async (req: Request, res: Response): Promise<void> => {
  try {
    const { token, email, otp } = req.body;

    if (!token && (!email || !otp)) {
      res.status(400).json({
        success: false,
        error: 'Please provide either a verification token or your email and 6-digit OTP code.',
      });
      return;
    }

    const result = await AuthService.verifyEmail({ token, email, otp });

    res.json({
      success: true,
      message: 'Email verified successfully! You can now log in to IG Assistant.',
      user: result.user,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message || 'Verification failed.',
    });
  }
});

// 3. Resend Verification Email
authRouter.post('/resend-verification', authRateLimiter, async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;
    if (!email) {
      res.status(400).json({ success: false, error: 'Email address is required.' });
      return;
    }

    const result = await AuthService.resendVerification(email);

    res.json({
      success: true,
      message: 'If an unverified account with this email exists, a fresh verification code has been dispatched.',
      devVerification:
        config.NODE_ENV !== 'production' && result
          ? {
              otp: result.otp,
              token: result.token,
            }
          : undefined,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message || 'Could not resend verification.',
    });
  }
});

// 4. Email & Password Login
authRouter.post('/login', authRateLimiter, async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const result = await AuthService.login({ email, password });

    // Set secure HTTP-only session cookie
    res.cookie(COOKIE_NAME, result.token, getCookieOptions());

    res.json({
      success: true,
      message: 'Login successful.',
      token: result.token,
      user: result.user,
    });
  } catch (error: any) {
    const isUnverified = error.message?.includes('UNVERIFIED:');
    res.status(401).json({
      success: false,
      unverified: isUnverified,
      error: isUnverified ? error.message.replace('UNVERIFIED: ', '') : error.message || 'Invalid credentials.',
    });
  }
});

// 5. Password Recovery - Request Reset
authRouter.post('/forgot-password', authRateLimiter, async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;
    if (!email) {
      res.status(400).json({ success: false, error: 'Email address is required.' });
      return;
    }

    await AuthService.forgotPassword(email);

    res.json({
      success: true,
      message: 'If that email address is in our system, we have sent instructions to reset your password.',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Error processing password reset request.',
    });
  }
});

// 6. Password Recovery - Reset with Token
authRouter.post('/reset-password', async (req: Request, res: Response): Promise<void> => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      res.status(400).json({
        success: false,
        error: 'Please provide both the reset token and your new password.',
      });
      return;
    }

    await AuthService.resetPassword(token, newPassword);

    res.json({
      success: true,
      message: 'Password reset successful. You can now log in with your new password.',
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message || 'Password reset failed.',
    });
  }
});

// 7. Google OAuth - Get Authorization URL
authRouter.get('/google/url', (req: Request, res: Response): void => {
  const isConfigured = GoogleAuthService.isConfigured();
  if (!isConfigured) {
    res.status(503).json({
      success: false,
      configured: false,
      error:
        'Google OAuth 2.0 credentials are not configured on the backend. Please add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to backend/.env',
    });
    return;
  }

  try {
    const state = (req.query.state as string) || 'google_auth';
    const url = GoogleAuthService.getAuthorizationUrl(state);
    res.json({
      success: true,
      configured: true,
      url,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate Google OAuth URL.',
    });
  }
});

// 8. Google OAuth - Callback Redirect from Google
authRouter.get('/google/callback', async (req: Request, res: Response): Promise<void> => {
  const protocol = req.protocol === 'https' || req.get('x-forwarded-proto') === 'https' ? 'https' : 'http';
  const host = req.get('host');
  const frontendBase = host ? `${protocol}://${host}` : (config.FRONTEND_URLS[0] || 'http://localhost:5174');

  try {
    const { code, error } = req.query;

    if (error) {
      res.redirect(`${frontendBase}/login?error=${encodeURIComponent(String(error))}`);
      return;
    }

    if (!code || typeof code !== 'string') {
      res.redirect(`${frontendBase}/login?error=Invalid+Google+authorization+code`);
      return;
    }

    const profile = await GoogleAuthService.exchangeCodeForProfile(code);
    const result = await AuthService.handleGoogleUser(profile);

    res.cookie(COOKIE_NAME, result.token, getCookieOptions());
    res.redirect(`${frontendBase}/dashboard?auth_success=true&token=${result.token}`);
  } catch (error: any) {
    res.redirect(
      `${frontendBase}/login?error=${encodeURIComponent(error.message || 'Google authentication failed')}`
    );
  }
});

// 9. Google OAuth - Direct ID Token Verification (for Google One Tap / Sign-In Button)
authRouter.post('/google/verify-token', async (req: Request, res: Response): Promise<void> => {
  try {
    const { idToken } = req.body;
    if (!idToken) {
      res.status(400).json({
        success: false,
        error: 'Google ID token is required.',
      });
      return;
    }

    const profile = await GoogleAuthService.verifyIdToken(idToken);
    const result = await AuthService.handleGoogleUser(profile);

    res.cookie(COOKIE_NAME, result.token, getCookieOptions());

    res.json({
      success: true,
      message: 'Google authentication successful.',
      token: result.token,
      user: result.user,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to verify Google token.',
    });
  }
});

// 10. Check Current User Session (/api/auth/me)
authRouter.get('/me', requireAuth, (req: AuthenticatedRequest, res: Response): void => {
  res.json({
    success: true,
    user: toSafeUser(req.user!),
  });
});

// 11. Update User Profile
authRouter.put('/profile', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { fullName, brandName, instagramHandle, avatarUrl } = req.body;
    await UserModel.updateProfile(req.user!.id, {
      fullName,
      brandName,
      instagramHandle,
      avatarUrl,
    });

    const updated = await UserModel.findUserById(req.user!.id);
    if (!updated) {
      res.status(404).json({ success: false, error: 'User not found.' });
      return;
    }
    res.json({
      success: true,
      message: 'Profile updated successfully.',
      user: toSafeUser(updated),
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to update profile.',
    });
  }
});

// 12. User Logout
authRouter.post('/logout', async (req: Request, res: Response): Promise<void> => {
  try {
    const token =
      req.cookies?.[COOKIE_NAME] ||
      (req.headers.authorization?.startsWith('Bearer ')
        ? req.headers.authorization.split(' ')[1]
        : '');

    if (token) {
      await AuthService.logout(token);
    }

    res.clearCookie(COOKIE_NAME, {
      httpOnly: true,
      secure: config.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });

    res.json({
      success: true,
      message: 'Successfully logged out.',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Logout encountered an issue.',
    });
  }
});

