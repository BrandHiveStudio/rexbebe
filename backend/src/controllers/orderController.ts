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
    const { status, paymentStatus, search, country } = req.query;

    let filtered = orders;
    if (status && status !== 'ALL') {
      filtered = filtered.filter(o => o.status.toUpperCase() === (status as string).toUpperCase());
    }
    if (paymentStatus && paymentStatus !== 'ALL') {
      filtered = filtered.filter(o => o.paymentStatus.toUpperCase() === (paymentStatus as string).toUpperCase());
    }
    if (country && country !== 'ALL') {
      filtered = filtered.filter(o => o.country?.toLowerCase() === (country as string).toLowerCase());
    }
    if (search) {
      const q = (search as string).toLowerCase();
      filtered = filtered.filter(o =>
        o.orderNumber.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.customerEmail.toLowerCase().includes(q) ||
        (o.trackingNumber && o.trackingNumber.toLowerCase().includes(q))
      );
    }

    return sendSuccess(res, filtered, 'Orders retrieved successfully');
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
    const { status, carrier, trackingNumber, note } = req.body;
    const updated = await orderService.updateOrderStatus(id, status, carrier, trackingNumber, note);
    if (!updated) {
      throw new NotFoundError(`Order ${id} not found`);
    }
    return sendSuccess(res, updated, `Order status updated to ${status}`);
  } catch (err) {
    next(err);
  }
};

export const addOrderNote = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { note } = req.body;
    const updated = await orderService.addInternalNote(id, note);
    if (!updated) {
      throw new NotFoundError(`Order ${id} not found`);
    }
    return sendSuccess(res, updated, 'Internal note added');
  } catch (err) {
    next(err);
  }
};

export const refundOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const updated = await orderService.refundOrder(id, reason);
    if (!updated) {
      throw new NotFoundError(`Order ${id} not found`);
    }
    return sendSuccess(res, updated, 'Order refund processed successfully');
  } catch (err) {
    next(err);
  }
};
