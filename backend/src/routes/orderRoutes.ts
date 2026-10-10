import { Router } from 'express';
import { createOrder, getOrders, getOrderById, updateOrderStatus } from '../controllers/orderController';
import { authenticateToken } from '../middleware/authMiddleware';
import { requireAdmin } from '../middleware/adminMiddleware';

const router = Router();

router.post('/', createOrder);
router.get('/', authenticateToken, requireAdmin, getOrders);
router.get('/:id', getOrderById);
router.patch('/:id/status', authenticateToken, requireAdmin, updateOrderStatus);

export default router;
