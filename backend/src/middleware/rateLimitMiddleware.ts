import { Request, Response, NextFunction } from 'express';

const ipRequestMap = new Map<string, { count: number; resetTime: number }>();
const LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_REQUESTS = 200;

export const rateLimiter = (req: Request, res: Response, next: NextFunction) => {
  // In development, or for local IP requests and administrative APIs, bypass rate limit
  const ip = req.ip || req.socket.remoteAddress || '127.0.0.1';
  const isLocal = ip === '127.0.0.1' || ip === '::1' || ip === '::ffff:127.0.0.1' || ip === 'localhost';
  if (process.env.NODE_ENV !== 'production' || isLocal || req.path.startsWith('/api/admin') || req.path.startsWith('/api/categories') || req.path.startsWith('/api/navigation')) {
    return next();
  }

  const now = Date.now();
  const record = ipRequestMap.get(ip);
  if (!record || now > record.resetTime) {
    ipRequestMap.set(ip, { count: 1, resetTime: now + LIMIT_WINDOW_MS });
    return next();
  }

  record.count += 1;
  if (record.count > MAX_REQUESTS) {
    return res.status(429).json({
      success: false,
      message: 'Too many requests from this IP, please try again later.',
    });
  }

  next();
};
