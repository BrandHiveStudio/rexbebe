import { Router } from 'express';
import { getCart, addToCart, removeFromCart } from '../controllers/cartController';

const router = Router();

router.get('/', getCart);
router.post('/', addToCart);
router.delete('/items/:id', removeFromCart);

export default router;
