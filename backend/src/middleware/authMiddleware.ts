import { Request, Response, NextFunction } from 'express';
import { AuthService, TokenPayload } from '../services/authService.js';
import { UserModel, UserRecord, SessionRecord } from '../models/userModel.js';

export interface AuthenticatedRequest extends Request {
  user?: UserRecord;
  sessionRecord?: SessionRecord;
  tokenPayload?: TokenPayload;
  token?: string;
}

export const requireAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let token: string | undefined;

    // 1. Check cookies
    if (req.cookies && (req.cookies.ig_token || req.cookies.token)) {
      token = req.cookies.ig_token || req.cookies.token;
    }

    // 2. Check Authorization header
    const authHeader = req.headers.authorization;
    if (!token && authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }

    if (!token) {
      res.status(401).json({
        success: false,
        error: 'Authentication required. No session or token found.',
      });
      return;
    }

    // Verify JWT
    const payload = AuthService.verifyJwt(token);
    if (!payload) {
      res.status(401).json({
        success: false,
        error: 'Invalid or expired token. Please log in again.',
      });
      return;
    }

    // Check DB session
    const session = await UserModel.findSession(token);
    if (!session) {
      res.status(401).json({
        success: false,
        error: 'Session has been revoked or expired. Please log in again.',
      });
      return;
    }

    // Check user in DB
    const user = await UserModel.findUserById(payload.userId);
    if (!user || user.status !== 'active') {
      res.status(401).json({
        success: false,
        error: 'User account not found or deactivated.',
      });
      return;
    }

    req.user = user;
    req.sessionRecord = session;
    req.tokenPayload = payload;
    req.token = token;

    next();
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: 'Authentication error: ' + (error.message || 'Unknown error'),
    });
  }
};

export const optionalAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let token: string | undefined;

    if (req.cookies && (req.cookies.ig_token || req.cookies.token)) {
      token = req.cookies.ig_token || req.cookies.token;
    }

    const authHeader = req.headers.authorization;
    if (!token && authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }

    if (token) {
      const payload = AuthService.verifyJwt(token);
      if (payload) {
        const user = await UserModel.findUserById(payload.userId);
        if (user && user.status === 'active') {
          req.user = user;
          req.tokenPayload = payload;
          req.token = token;
        }
      }
    }
  } catch {
    // Graceful fallback for optional auth
  }
  next();
};

