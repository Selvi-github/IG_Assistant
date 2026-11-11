import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import fs from 'fs';
import { config } from './config/env.js';
import { queryOne } from './db/index.js';
import { authRouter } from './routes/authRoutes.js';
import { brandRouter } from './routes/brandRoutes.js';
import { postRouter } from './routes/postRoutes.js';
import { aiRouter } from './routes/aiRoutes.js';
import { instagramRouter } from './routes/instagramRoutes.js';
import { GoogleAuthService } from './services/googleAuthService.js';

const app = express();

// Trust reverse proxies (important for secure cookies behind reverse proxies/Vite)
app.set('trust proxy', 1);

// Configure CORS
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, automated test suites)
      if (!origin) return callback(null, true);

      // Check allowed origins (including any .onrender.com deployment automatically)
      const isRender = origin.endsWith('.onrender.com');
      const isAllowed =
        isRender ||
        config.FRONTEND_URLS.some(
          (allowed) => origin === allowed || allowed === '*' || origin.startsWith('http://localhost:')
        );

      const isLocal =
        origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:');
      if (isAllowed || (config.NODE_ENV !== 'production' && isLocal)) {
        callback(null, true);
      } else if (config.NODE_ENV !== 'production') {
        callback(null, true);
      } else {
        callback(new Error('Origin not allowed'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

// Middleware
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logger
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (req.path.startsWith('/api')) {
      console.log(`[HTTP] ${req.method} ${req.path} -> ${res.statusCode} (${duration}ms)`);
    }
  });
  next();
});

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    // Quick DB query check
    const dbCheck = await queryOne('SELECT 1 as alive');
    const userCount = await queryOne<{ count: string | number }>('SELECT COUNT(*) as count FROM users');

    res.json({
      status: 'healthy',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      database: {
        connected: Boolean(dbCheck),
        userCount: Number(userCount?.count || 0),
        type: config.DATABASE_URL ? 'PostgreSQL (Supabase/Cloud)' : 'SQLite (WAL mode)',
        path: config.DATABASE_URL ? 'Cloud Pooler' : config.DB_PATH,
      },
      auth: {
        googleConfigured: GoogleAuthService.isConfigured(),
      },
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'unhealthy',
      error: error.message,
    });
  }
});

// Mount Routes
app.use('/api/auth', authRouter);
app.use('/api/brand', brandRouter);
app.use('/api/posts', postRouter);
app.use('/api/ai', aiRouter);
app.use('/api/instagram', instagramRouter);

// Serve locally generated AI images without external rate limits
const imagesDir = path.join(process.cwd(), 'data', 'generated_images');
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}
app.use('/api/ai/images', express.static(imagesDir));

// Serve locally rendered 9:16 vertical Reel MP4 videos
const videosDir = path.join(process.cwd(), 'data', 'generated_videos');
if (!fs.existsSync(videosDir)) {
  fs.mkdirSync(videosDir, { recursive: true });
}
app.use('/api/ai/videos', express.static(videosDir));

// Root catch-all for unmatched api routes
app.use('/api', (req, res) => {
  res.status(404).json({
    success: false,
    error: `API endpoint ${req.method} ${req.url} not found`,
  });
});

// Serve the built frontend from the same host when frontend/dist exists.
const possibleFrontendPaths = [
  path.resolve(process.cwd(), 'frontend', 'dist'),
  path.resolve(process.cwd(), '..', 'frontend', 'dist'),
];
const frontendDist = possibleFrontendPaths.find((p) => fs.existsSync(p));
if (frontendDist) {
  app.use(express.static(frontendDist));
  app.use((req, res, next) => {
    if (req.method !== 'GET' || req.path.startsWith('/api')) {
      next();
      return;
    }
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
}

// Global error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('[SERVER ERROR]', err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal server error',
  });
});

let server: any = null;

const DEV_JWT = 'ig_assistant_jwt_secret_dev_key_2026_super_secure';

function clientHostChecklist(): string[] {
  const missing: string[] = [];
  if (!config.JWT_SECRET || config.JWT_SECRET === DEV_JWT) missing.push('JWT_SECRET');
  if (!process.env.PUBLIC_BASE_URL) missing.push('PUBLIC_BASE_URL');
  if (!process.env.INSTAGRAM_ACCESS_TOKEN && !process.env.META_ACCESS_TOKEN) missing.push('INSTAGRAM_ACCESS_TOKEN');
  if (!process.env.INSTAGRAM_BUSINESS_ID && !process.env.META_IG_USER_ID) missing.push('INSTAGRAM_BUSINESS_ID');
  if (!config.HF_TOKEN) missing.push('HF_TOKEN');
  return missing;
}

if (config.NODE_ENV === 'production' && (!config.JWT_SECRET || config.JWT_SECRET === DEV_JWT)) {
  console.warn('[SECURITY WARNING] Please set a unique JWT_SECRET in your Render environment variables for production security.');
}

if (process.env.TEST_MODE !== 'true') {
  server = app.listen(config.PORT, () => {
    const missing = clientHostChecklist();
    console.log(`
======================================================
  IG Assistant Backend Authentication Server
  Listening on: http://localhost:${config.PORT}
  Environment:  ${config.NODE_ENV}
  Database:     ${config.DATABASE_URL ? 'PostgreSQL (Supabase/Cloud)' : config.DB_PATH}
  Google Auth:  ${GoogleAuthService.isConfigured() ? 'CONFIGURED' : 'NOT CONFIGURED (Provide GOOGLE_CLIENT_ID & SECRET in backend/.env)'}
  One-client host still needs: ${missing.length ? missing.join(', ') : 'nothing listed'}
======================================================
    `);
  });
}

export { app, server };
