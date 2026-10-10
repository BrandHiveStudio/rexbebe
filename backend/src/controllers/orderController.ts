import { Request, Response, NextFunction } from 'express';
import { OrderService } from '../services/orderService';
import { validateOrderInput } from '../validators/orderValidator';
import { sendSuccess } from '../utils/response';
import { NotFoundError } from '../utils/errors';

const orderService = new OrderService();

export const createOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    validateOrderInput(req.body);
    const order = await orderService.createOrder(req.body);
    return sendSuccess(res, order, 'Order created successfully', 201);
  } catch (err) {
    next(err);
  }
};

export const getOrders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orders = await orderService.getAllOrders();
    return sendSuccess(res, orders, 'Orders retrieved');
  } catch (err) {
    next(err);
  }
};

export const getOrderById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const order = await orderService.getOrderById(id);
    if (!order) {
      throw new NotFoundError(`Order ${id} not found`);
    }
    return sendSuccess(res, order, 'Order details retrieved');
  } catch (err) {
    next(err);
  }
};

export const updateOrderStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const updated = await orderService.updateOrderStatus(id, status);
    return sendSuccess(res, updated, `Order status updated to ${status}`);
  } catch (err) {
    next(err);
  }
};
