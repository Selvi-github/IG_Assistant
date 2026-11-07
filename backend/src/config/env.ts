import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const getEnv = (key: string, defaultValue: string = ''): string => {
  return process.env[key] || defaultValue;
};

export const config = {
  PORT: parseInt(getEnv('PORT', '5000'), 10),
  NODE_ENV: getEnv('NODE_ENV', 'development'),
  FRONTEND_URLS: getEnv('FRONTEND_URL', 'http://localhost:5174,http://localhost:5173')
    .split(',')
    .map((url) => url.trim()),
  JWT_SECRET: getEnv('JWT_SECRET', 'ig_assistant_jwt_secret_dev_key_2026_super_secure'),
  JWT_EXPIRES_IN: getEnv('JWT_EXPIRES_IN', '7d'),
  GOOGLE_CLIENT_ID: getEnv('GOOGLE_CLIENT_ID', ''),
  GOOGLE_CLIENT_SECRET: getEnv('GOOGLE_CLIENT_SECRET', ''),
  GOOGLE_CALLBACK_URL: getEnv('GOOGLE_CALLBACK_URL', 'http://localhost:5000/api/auth/google/callback'),
  DB_PATH: path.resolve(process.cwd(), getEnv('DB_PATH', './data/ig_assistant.db')),
  HF_TOKEN: getEnv('HF_TOKEN', '').trim(),
  POLLINATIONS_API_KEY: getEnv('POLLINATIONS_API_KEY', '').trim(),
  COLAB_IMAGE_API_URL: getEnv('COLAB_IMAGE_API_URL', '').trim().replace(/\/$/, ''),
};

