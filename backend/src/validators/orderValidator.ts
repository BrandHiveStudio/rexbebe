import { BadRequestError } from '../utils/errors';

export const validateOrderInput = (data: any) => {
  if (!data.items || !Array.isArray(data.items) || data.items.length === 0) {
    throw new BadRequestError('Order must contain at least one item');
  }
  for (const item of data.items) {
    if (!item.variantId || !item.quantity || item.quantity <= 0) {
      throw new BadRequestError('Each order item must specify a valid variantId and quantity > 0');
    }
  }
  if (!data.shippingAddress || !data.shippingAddress.street || !data.shippingAddress.city) {
    throw new BadRequestError('Complete shipping address (street, city) is required');
  }
};
