import { Router } from 'express';
import {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  addOrderNote,
  refundOrder,
} from '../controllers/orderController';

const router = Router();

router.post('/', createOrder);
router.get('/', getOrders);
router.get('/:id', getOrderById);
router.patch('/:id/status', updateOrderStatus);
router.post('/:id/notes', addOrderNote);
router.post('/:id/refund', refundOrder);

export default router;
