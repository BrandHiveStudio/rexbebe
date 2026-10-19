import { OrderRepository } from '../repositories/orderRepository';
import { ProductRepository } from '../repositories/productRepository';
import { InventoryRepository } from '../repositories/inventoryRepository';
import { BadRequestError } from '../utils/errors';

export class OrderService {
  private orderRepo = new OrderRepository();
  private productRepo = new ProductRepository();
  private inventoryRepo = new InventoryRepository();

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
        const v = prod.variants?.find((v: any) => v.id === item.variantId);
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

      const itemTitle = foundVariant.partName
        ? `${parentProduct.name} (${foundVariant.partName}) - ${foundVariant.color || ''} ${foundVariant.size || ''}`.trim()
        : `${parentProduct.name} - ${foundVariant.color || ''} ${foundVariant.size || ''}`.trim();

      validatedItems.push({
        id: `orditem-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        productId: parentProduct.id,
        variantId: foundVariant.id,
        title: itemTitle,
        partName: foundVariant.partName,
        purchaseType: foundVariant.purchaseType || 'complete_set',
        partColors: foundVariant.partColors,
        color: foundVariant.color,
        size: foundVariant.size,
        image: foundVariant.imageUrl || parentProduct.images?.[0]?.url || '/images/products/organic-onesie.jpg',
        price: foundVariant.price,
        quantity: item.quantity,
        totalPrice: itemTotal,
      });
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
      tax: 0,
      paymentMethod: orderPayload.paymentMethod,
      paymentStatus: 'PAID',
      items: validatedItems,
      shippingAddress: orderPayload.shippingAddress,
    });

    // Deduct stock in real inventory and log movements
    for (const item of validatedItems) {
      const currentProducts = await this.productRepo.findAll();
      let currentVariant: any = null;
      for (const p of currentProducts) {
        const v = p.variants?.find((v: any) => v.id === item.variantId);
        if (v) {
          currentVariant = v;
          break;
        }
      }
      if (currentVariant) {
        const newQty = Math.max(0, (currentVariant.stockQuantity ?? 0) - item.quantity);
        await this.inventoryRepo.updateStock(
          item.variantId,
          newQty,
          `Order #${createdOrder.orderNumber} placed by ${orderPayload.customerName}`,
          'Order Processing'
        );
      }
    }

    return createdOrder;
  }

  async getAllOrders() {
    return this.orderRepo.findAll();
  }

  async getOrderById(id: string) {
    return this.orderRepo.findById(id);
  }

  async updateOrderStatus(id: string, status: any, carrier?: string, trackingNumber?: string, note?: string) {
    const existingOrder = await this.orderRepo.findById(id);
    const updated = await this.orderRepo.updateStatus(id, status, carrier, trackingNumber, note);

    // If order was cancelled and was not previously cancelled, restore stock
    if (status === 'CANCELLED' && existingOrder && existingOrder.status !== 'CANCELLED') {
      for (const item of existingOrder.items) {
        const currentProducts = await this.productRepo.findAll();
        let currentVariant: any = null;
        for (const p of currentProducts) {
          const v = p.variants?.find((v: any) => v.id === item.variantId);
          if (v) {
            currentVariant = v;
            break;
          }
        }
        if (currentVariant) {
          const restoredQty = (currentVariant.stockQuantity ?? 0) + item.quantity;
          await this.inventoryRepo.updateStock(
            item.variantId,
            restoredQty,
            `Order #${existingOrder.orderNumber} cancellation restock`,
            'Admin Automation'
          );
        }
      }
    }

    return updated;
  }

  async addInternalNote(id: string, note: string) {
    return this.orderRepo.addInternalNote(id, note);
  }

  async refundOrder(id: string, reason?: string) {
    const existingOrder = await this.orderRepo.findById(id);
    const refunded = await this.orderRepo.refundOrder(id, reason);

    // Restock refunded items if not already cancelled
    if (refunded && existingOrder && existingOrder.status !== 'CANCELLED') {
      for (const item of existingOrder.items) {
        const currentProducts = await this.productRepo.findAll();
        let currentVariant: any = null;
        for (const p of currentProducts) {
          const v = p.variants?.find((v: any) => v.id === item.variantId);
          if (v) {
            currentVariant = v;
            break;
          }
        }
        if (currentVariant) {
          const restoredQty = (currentVariant.stockQuantity ?? 0) + item.quantity;
          await this.inventoryRepo.updateStock(
            item.variantId,
            restoredQty,
            `Order #${existingOrder.orderNumber} refund restock: ${reason || 'Customer refund'}`,
            'Admin Automation'
          );
        }
      }
    }

    return refunded;
  }
}
