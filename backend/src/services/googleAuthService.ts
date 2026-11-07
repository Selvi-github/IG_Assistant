import { OAuth2Client } from 'google-auth-library';
import { config } from '../config/env.js';

export const isGoogleAuthConfigured = (): boolean => {
  return Boolean(
    config.GOOGLE_CLIENT_ID &&
    config.GOOGLE_CLIENT_ID.trim().length > 5 &&
    config.GOOGLE_CLIENT_SECRET &&
    config.GOOGLE_CLIENT_SECRET.trim().length > 5
  );
};

export const getGoogleOAuthClient = (): OAuth2Client => {
  return new OAuth2Client(
    config.GOOGLE_CLIENT_ID,
    config.GOOGLE_CLIENT_SECRET,
    config.GOOGLE_CALLBACK_URL
  );
};

export interface GoogleProfile {
  googleId: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  isEmailVerified: boolean;
}

export const GoogleAuthService = {
  isConfigured(): boolean {
    return isGoogleAuthConfigured();
  },

  getAuthorizationUrl(state: string = 'auth'): string {
    if (!isGoogleAuthConfigured()) {
      throw new Error(
        'Google OAuth 2.0 credentials are not configured. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in backend/.env'
      );
    }
    const client = getGoogleOAuthClient();
    return client.generateAuthUrl({
      access_type: 'offline',
      prompt: 'consent',
      scope: [
        'openid',
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email',
      ],
      state,
    });
  },

  async exchangeCodeForProfile(code: string): Promise<GoogleProfile> {
    if (!isGoogleAuthConfigured()) {
      throw new Error('Google OAuth credentials not configured.');
    }
    const client = getGoogleOAuthClient();
    const { tokens } = await client.getToken(code);
    client.setCredentials(tokens);

    if (!tokens.id_token) {
      throw new Error('Google did not return an id_token.');
    }

    return this.verifyIdToken(tokens.id_token);
  },

  async verifyIdToken(idToken: string): Promise<GoogleProfile> {
    if (!isGoogleAuthConfigured()) {
      throw new Error('Google OAuth credentials not configured.');
    }
    const client = getGoogleOAuthClient();
    const ticket = await client.verifyIdToken({
      idToken,
      audience: config.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload) {
      throw new Error('Unable to extract Google account payload from verified token.');
    }

    if (!payload.email) {
      throw new Error('No email address associated with this Google account.');
    }

    return {
      googleId: payload.sub,
      email: payload.email,
      fullName: payload.name || payload.email.split('@')[0],
      avatarUrl: payload.picture,
      isEmailVerified: Boolean(payload.email_verified),
    };
  },
};

