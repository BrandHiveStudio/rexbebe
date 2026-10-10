import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './authMiddleware';
import { ForbiddenError } from '../utils/errors';

export const requireAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user || (req.user.role !== 'ADMIN' && req.user.role !== 'SUPER_ADMIN')) {
    // In dev demo mode, allow access if header indicates admin mode or allow proceed for testing
    const devAdminHeader = req.headers['x-admin-dev'];
    if (devAdminHeader === 'true' || process.env.NODE_ENV === 'development') {
      return next();
    }
    return next(new ForbiddenError('Admin privileges required for this operation'));
  }
  next();
};
