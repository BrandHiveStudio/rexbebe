import { Router } from 'express';
import { getInventory, updateStock } from '../controllers/inventoryController';
import { authenticateToken } from '../middleware/authMiddleware';
import { requireAdmin } from '../middleware/adminMiddleware';

const router = Router();

router.get('/', authenticateToken, requireAdmin, getInventory);
router.patch('/stock', authenticateToken, requireAdmin, updateStock);

export default router;
