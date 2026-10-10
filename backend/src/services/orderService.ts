import { OrderRepository } from '../repositories/orderRepository';
import { ProductRepository } from '../repositories/productRepository';
import { BadRequestError } from '../utils/errors';

export class OrderService {
  private orderRepo = new OrderRepository();
  private productRepo = new ProductRepository();

  async createOrder(orderPayload: {
    customerId: string;
    customerName: string;
    customerEmail: string;
    items: { variantId: string; quantity: number }[];
    shippingAddress: any;
    paymentMethod: string;
    couponCode?: string;
  }) {
    let subtotal = 0;
    const validatedItems = [];

    const allProducts = await this.productRepo.findAll();

    for (const item of orderPayload.items) {
      let foundVariant: any = null;
      let parentProduct: any = null;

      for (const prod of allProducts) {
        const v = prod.variants.find((v: any) => v.id === item.variantId);
        if (v) {
          foundVariant = v;
          parentProduct = prod;
          break;
        }
      }

      if (!foundVariant) {
        throw new BadRequestError(`Product variant '${item.variantId}' is invalid or out of stock.`);
      }

      if (foundVariant.stockQuantity < item.quantity) {
        throw new BadRequestError(`Insufficient stock for ${parentProduct.name} (${foundVariant.size || foundVariant.color}). Requested: ${item.quantity}, Available: ${foundVariant.stockQuantity}`);
      }

      // STRICT BUSINESS RULE: Always use server verified price, NOT frontend price
      const itemTotal = foundVariant.price * item.quantity;
      subtotal += itemTotal;

      validatedItems.push({
        id: `orditem-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        variantId: foundVariant.id,
        title: `${parentProduct.name} - ${foundVariant.color || ''} ${foundVariant.size || ''}`.trim(),
        price: foundVariant.price,
        quantity: item.quantity,
        totalPrice: itemTotal,
      });

      // Deduct stock in server memory / database
      foundVariant.stockQuantity -= item.quantity;
    }

    let discount = 0;
    if (orderPayload.couponCode === 'REXBEBE10') {
      discount = subtotal * 0.1;
    }

    const shippingFee = subtotal > 50000 ? 0 : 1500;
    const totalAmount = subtotal - discount + shippingFee;

    const createdOrder = await this.orderRepo.create({
      customerId: orderPayload.customerId,
      customerName: orderPayload.customerName,
      customerEmail: orderPayload.customerEmail,
      status: 'PROCESSING',
      totalAmount,
      subtotal,
      discount,
      shippingFee,
      paymentMethod: orderPayload.paymentMethod,
      paymentStatus: 'PAID',
      items: validatedItems,
      shippingAddress: orderPayload.shippingAddress,
    });

    return createdOrder;
  }

  async getAllOrders() {
    return this.orderRepo.findAll();
  }

  async getOrderById(id: string) {
    return this.orderRepo.findById(id);
  }

  async updateOrderStatus(id: string, status: string) {
    return this.orderRepo.updateStatus(id, status);
  }
}
