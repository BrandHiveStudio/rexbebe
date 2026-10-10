import { Request, Response, NextFunction } from 'express';
import { InventoryService } from '../services/inventoryService';
import { sendSuccess } from '../utils/response';

const inventoryService = new InventoryService();

export const getInventory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const list = await inventoryService.getInventoryList();
    return sendSuccess(res, list, 'Inventory items retrieved');
  } catch (err) {
    next(err);
  }
};

export const updateStock = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { variantId, quantity } = req.body;
    const updated = await inventoryService.updateStock(variantId, quantity);
    return sendSuccess(res, updated, 'Inventory stock updated');
  } catch (err) {
    next(err);
  }
};
