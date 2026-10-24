import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './authMiddleware';
import { UnauthorizedError, ForbiddenError } from '../utils/errors';

export const requireAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return next(new UnauthorizedError('Authentication token or administrator credentials required'));
  }

  if (req.user.role !== 'ADMIN' && req.user.role !== 'SUPER_ADMIN') {
    return next(new ForbiddenError('Admin privileges required for this operation'));
  }

  next();
};
