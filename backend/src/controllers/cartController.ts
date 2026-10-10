import { Request, Response, NextFunction } from 'express';
import { CartService } from '../services/cartService';
import { sendSuccess } from '../utils/response';

const cartService = new CartService();

export const getCart = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cartId = (req.query.cartId as string) || 'cart-session-default';
    const cart = await cartService.getCart(cartId);
    return sendSuccess(res, cart, 'Cart retrieved');
  } catch (err) {
    next(err);
  }
};

export const addToCart = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { cartId = 'cart-session-default', variantId, quantity = 1 } = req.body;
    const cart = await cartService.addItem(cartId, variantId, quantity);
    return sendSuccess(res, cart, 'Item added to cart');
  } catch (err) {
    next(err);
  }
};

export const removeFromCart = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id: variantId } = req.params;
    const cartId = (req.query.cartId as string) || 'cart-session-default';
    const cart = await cartService.removeItem(cartId, variantId);
    return sendSuccess(res, cart, 'Item removed from cart');
  } catch (err) {
    next(err);
  }
};
