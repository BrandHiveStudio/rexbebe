import { Router, Request, Response } from 'express';
import { sendSuccess, sendError } from '../utils/response';
import { navigationStorage } from '../services/navigationStorage';

const router = Router();

// Public: Get published active navigation tree
router.get('/', (req: Request, res: Response) => {
  try {
    const publicNav = navigationStorage.getPublic();
    return sendSuccess(res, publicNav, 'Public navigation structure retrieved');
  } catch (err: any) {
    return sendError(res, err.message, 500);
  }
});

// Admin: Get all navigation items including inactive
router.get('/all', (req: Request, res: Response) => {
  try {
    const allNav = navigationStorage.getAll();
    return sendSuccess(res, allNav, 'Complete navigation structure retrieved');
  } catch (err: any) {
    return sendError(res, err.message, 500);
  }
});

// Admin: Update entire navigation configuration
router.put('/', (req: Request, res: Response) => {
  try {
    const updated = navigationStorage.updateAll(req.body);
    return sendSuccess(res, updated, 'Navigation configuration updated successfully');
  } catch (err: any) {
    return sendError(res, err.message, 400);
  }
});

// Admin: Reset navigation to brand default
router.post('/reset', (req: Request, res: Response) => {
  try {
    const reset = navigationStorage.reset();
    return sendSuccess(res, reset, 'Navigation reset to default brand configuration');
  } catch (err: any) {
    return sendError(res, err.message, 500);
  }
});

export default router;
