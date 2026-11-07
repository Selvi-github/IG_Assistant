# IG Assistant - Production Backend Authentication System

A secure, high-performance authentication and session management service built with Node.js, Express, TypeScript, SQLite (`better-sqlite3` in WAL mode), and Google OAuth 2.0.

---

## Architecture Overview

- **Runtime**: Node.js v24 + TypeScript (ESM)
- **Web Framework**: Express 5
- **Database**: SQLite via `better-sqlite3` with Write-Ahead Logging (WAL) enabled
- **Security**:
  - Passwords hashed with `bcryptjs`
  - JWT Access Tokens signed with `jsonwebtoken`
  - HTTP-only, SameSite Cookies with CSRF mitigation
  - Session revocation in SQLite on logout and password reset
  - Brute-force rate limiting via `express-rate-limit`
- **Google OAuth 2.0**: Official OpenID Connect flow via `google-auth-library`

---

## Database Schema

Database file: `backend/data/ig_assistant.db`

### `users` Table
| Column | Type | Description |
|---|---|---|
| `id` | `TEXT PRIMARY KEY` | Unique ID (`usr_<uuid>`) |
| `email` | `TEXT UNIQUE NOT NULL` | Verified creator email |
| `password_hash` | `TEXT` | Bcrypt hashed password (nullable for Google-only) |
| `full_name` | `TEXT NOT NULL` | Creator full name |
| `google_id` | `TEXT UNIQUE` | Google subject identifier (sub) |
| `auth_provider` | `TEXT` | `'email'` or `'google'` |
| `is_verified` | `INTEGER` | `0` = unverified, `1` = verified |
| `verification_token` | `TEXT` | Crypto email verification token |
| `verification_otp` | `TEXT` | 6-digit confirmation code |
| `verification_expires_at` | `TEXT` | ISO expiration timestamp (24h) |
| `reset_token` | `TEXT` | Password recovery token |
| `reset_expires_at` | `TEXT` | Password reset expiration (1h) |
| `avatar_url` | `TEXT` | Profile image URL |
| `brand_name` | `TEXT` | Creator brand kit name |
| `instagram_handle` | `TEXT` | Linked Instagram username |
| `status` | `TEXT` | `'active'` or `'suspended'` |
| `created_at` | `TEXT` | ISO creation timestamp |
| `updated_at` | `TEXT` | ISO update timestamp |
| `last_login_at` | `TEXT` | ISO login timestamp |

### `sessions` Table
| Column | Type | Description |
|---|---|---|
| `id` | `TEXT PRIMARY KEY` | Session ID (`ses_<uuid>`) |
| `user_id` | `TEXT REFERENCES users(id)` | User foreign key |
| `token` | `TEXT UNIQUE NOT NULL` | Active JWT token |
| `expires_at` | `TEXT NOT NULL` | Session expiry |
| `created_at` | `TEXT NOT NULL` | Creation timestamp |
| `revoked` | `INTEGER` | `0` = active, `1` = revoked |

---

## Real Google OAuth 2.0 Setup Guide

To activate real Google Sign-In:

1. Visit the [Google Cloud Console](https://console.cloud.google.com/).
2. Create or select your project (e.g. `IG Assistant`).
3. Navigate to **APIs & Services** > **Credentials**.
4. Click **Create Credentials** > **OAuth client ID**.
5. Select Application type: **Web application**.
6. Set **Authorized JavaScript origins**:
   - `http://localhost:5174`
   - `http://localhost:5000`
7. Set **Authorized redirect URIs**:
   - `http://localhost:5000/api/auth/google/callback`
   - `http://localhost:5174/api/auth/google/callback`
8. Copy the **Client ID** and **Client Secret**.
9. In `backend/.env`, set:
   ```env
   GOOGLE_CLIENT_ID=your_client_id_here.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=your_client_secret_here
   GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
   ```
10. The backend will detect the credentials automatically on reboot and activate the Google OAuth flow.

---

## API Endpoints

### Authentication
- `POST /api/auth/register` - Create new user account and dispatch verification code/token
- `POST /api/auth/verify-email` - Verify email using 6-digit OTP or token
- `POST /api/auth/resend-verification` - Resend email verification code
- `POST /api/auth/login` - Authenticate email & password, returns JWT and sets HTTP-only cookie
- `POST /api/auth/forgot-password` - Request password recovery link
- `POST /api/auth/reset-password` - Set new password with secure token
- `GET  /api/auth/google/url` - Returns official Google OAuth 2.0 authorization URL
- `GET  /api/auth/google/callback` - OAuth callback handler from Google
- `POST /api/auth/google/verify-token` - Direct ID token verification
- `GET  /api/auth/me` - Protected endpoint returning current user profile
- `PUT  /api/auth/profile` - Protected endpoint updating user details
- `POST /api/auth/logout` - Invalidate active session and clear cookies

### Health
- `GET  /api/health` - Server, database, and auth status

