import { Request, Response, NextFunction } from 'express';

const ipRequestMap = new Map<string, { count: number; resetTime: number }>();
const LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_REQUESTS = 200;

export const rateLimiter = (req: Request, res: Response, next: NextFunction) => {
  const ip = req.ip || req.socket.remoteAddress || '127.0.0.1';
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
