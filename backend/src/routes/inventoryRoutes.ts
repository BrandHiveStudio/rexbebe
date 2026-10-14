import { Router } from 'express';
import { getInventory, updateStock, getAdjustments } from '../controllers/inventoryController';

const router = Router();

router.get('/', getInventory);
router.patch('/stock', updateStock);
router.get('/adjustments', getAdjustments);

export default router;
