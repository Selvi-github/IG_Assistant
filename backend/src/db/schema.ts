export const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT,
  full_name TEXT NOT NULL,
  google_id TEXT UNIQUE,
  auth_provider TEXT NOT NULL DEFAULT 'email',
  is_verified INTEGER NOT NULL DEFAULT 0,
  verification_token TEXT,
  verification_otp TEXT,
  verification_expires_at TEXT,
  reset_token TEXT,
  reset_expires_at TEXT,
  avatar_url TEXT,
  brand_name TEXT,
  instagram_handle TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  last_login_at TEXT
);

CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  token TEXT UNIQUE NOT NULL,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL,
  revoked INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS brand_profiles (
  id TEXT PRIMARY KEY,
  user_id TEXT UNIQUE NOT NULL,
  company_name TEXT NOT NULL,
  instagram_handle TEXT NOT NULL,
  bio TEXT,
  target_audience TEXT,
  logo_url TEXT,
  primary_color TEXT DEFAULT '#fb2175',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS posts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  caption TEXT NOT NULL,
  hashtags TEXT,
  post_type TEXT NOT NULL DEFAULT 'reel',
  status TEXT NOT NULL DEFAULT 'draft',
  scheduled_for TEXT,
  published_at TEXT,
  thumbnail_url TEXT,
  media_urls TEXT,
  instagram_media_id TEXT,
  instagram_permalink TEXT,
  publish_error TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS connected_accounts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  platform TEXT NOT NULL DEFAULT 'instagram', -- 'instagram' | 'facebook'
  account_type TEXT NOT NULL DEFAULT 'instagram_business',
  instagram_business_id TEXT,
  facebook_page_id TEXT,
  username TEXT NOT NULL,
  account_name TEXT NOT NULL,
  avatar_url TEXT,
  followers_count INTEGER DEFAULT 0,
  access_token TEXT,
  token_expires_at TEXT,
  is_connected INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);
CREATE INDEX IF NOT EXISTS idx_users_verification_token ON users(verification_token);
CREATE INDEX IF NOT EXISTS idx_users_reset_token ON users(reset_token);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_brand_profiles_user_id ON brand_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status);
CREATE INDEX IF NOT EXISTS idx_connected_accounts_user_id ON connected_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_connected_accounts_platform ON connected_accounts(platform);
`;
