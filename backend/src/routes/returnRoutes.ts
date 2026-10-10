import { Router } from 'express';
import { getReturns, createReturnRequest } from '../controllers/returnController';

const router = Router();

router.get('/', getReturns);
router.post('/', createReturnRequest);

export default router;
