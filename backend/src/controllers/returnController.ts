import { Request, Response, NextFunction } from 'express';
import { sendSuccess } from '../utils/response';

const MOCK_RETURNS = [
  {
    id: 'ret-1',
    orderId: 'ord-1001',
    customerName: 'Elena Rostova',
    reason: 'Incorrect size ordered',
    status: 'REQUESTED',
    refundAmount: 18500,
    createdAt: new Date().toISOString()
  }
];

export const getReturns = async (req: Request, res: Response, next: NextFunction) => {
  try {
    return sendSuccess(res, MOCK_RETURNS, 'Return requests retrieved');
  } catch (err) {
    next(err);
  }
};

export const createReturnRequest = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { orderId, reason, refundAmount } = req.body;
    const newReturn = {
      id: `ret-${Date.now()}`,
      orderId,
      customerName: 'Elena Rostova',
      reason,
      status: 'REQUESTED',
      refundAmount: refundAmount || 0,
      createdAt: new Date().toISOString()
    };
    MOCK_RETURNS.unshift(newReturn);
    return sendSuccess(res, newReturn, 'Return request submitted successfully', 201);
  } catch (err) {
    next(err);
  }
};
