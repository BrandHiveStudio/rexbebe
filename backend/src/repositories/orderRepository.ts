import fs from 'fs';
import path from 'path';

export interface OrderItemRecord {
  id: string;
  productId?: string;
  variantId: string;
  title: string;
  color?: string;
  size?: string;
  image?: string;
  price: number;
  quantity: number;
  totalPrice: number;
}

export interface OrderRecord {
  id: string;
  orderNumber: string;
  customerId?: string;
  customerName: string;
  customerEmail: string;
  phone?: string;
  country?: string;
  countryFlag?: string;
  status: 'NEW' | 'PROCESSING' | 'PACKED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  paymentStatus: 'PAID' | 'PENDING' | 'REFUNDED' | 'FAILED';
  paymentMethod: string;
  paymentReference?: string;
  subtotal: number;
  discount: number;
  shippingFee: number;
  tax: number;
  totalAmount: number;
  carrier?: string;
  trackingNumber?: string;
  internalNotes?: string;
  timeline?: { status: string; time: string; note: string }[];
  items: OrderItemRecord[];
  shippingAddress: {
    recipientName: string;
    street: string;
    city: string;
    state?: string;
    postalCode: string;
    country: string;
  };
  createdAt: string;
  updatedAt?: string;
}

export class OrderRepository {
  private filePath = path.join(__dirname, '../../data/orders.json');

  private readFromDisk(): OrderRecord[] {
    try {
      if (fs.existsSync(this.filePath)) {
        const raw = fs.readFileSync(this.filePath, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (err) {
      console.error('[OrderRepository] Error reading orders from disk:', err);
    }
    return [];
  }

  private writeToDisk(orders: OrderRecord[]): void {
    try {
      const dir = path.dirname(this.filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(this.filePath, JSON.stringify(orders, null, 2), 'utf-8');
    } catch (err) {
      console.error('[OrderRepository] Error writing orders to disk:', err);
    }
  }

  async findAll(): Promise<OrderRecord[]> {
    return this.readFromDisk();
  }

  async findById(id: string): Promise<OrderRecord | null> {
    const orders = this.readFromDisk();
    return orders.find(o => o.id === id || o.orderNumber === id) || null;
  }

  async create(orderData: Omit<OrderRecord, 'id' | 'orderNumber' | 'createdAt'>): Promise<OrderRecord> {
    const orders = this.readFromDisk();
    const newOrder: OrderRecord = {
      ...orderData,
      id: `ord-${Date.now()}`,
      orderNumber: `RXB-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    orders.unshift(newOrder);
    this.writeToDisk(orders);
    return newOrder;
  }

  async updateStatus(
    id: string,
    status: OrderRecord['status'],
    carrier?: string,
    trackingNumber?: string,
    note?: string
  ): Promise<OrderRecord | null> {
    const orders = this.readFromDisk();
    const order = orders.find(o => o.id === id || o.orderNumber === id);
    if (!order) return null;

    order.status = status;
    order.updatedAt = new Date().toISOString();
    if (carrier) order.carrier = carrier;
    if (trackingNumber) order.trackingNumber = trackingNumber;

    if (!order.timeline) order.timeline = [];
    order.timeline.push({
      status,
      time: new Date().toISOString(),
      note: note || `Order status updated to ${status}`,
    });

    this.writeToDisk(orders);
    return order;
  }

  async addInternalNote(id: string, note: string): Promise<OrderRecord | null> {
    const orders = this.readFromDisk();
    const order = orders.find(o => o.id === id || o.orderNumber === id);
    if (!order) return null;

    order.internalNotes = order.internalNotes ? `${order.internalNotes}\n[${new Date().toISOString().slice(0, 10)}] ${note}` : `[${new Date().toISOString().slice(0, 10)}] ${note}`;
    order.updatedAt = new Date().toISOString();
    this.writeToDisk(orders);
    return order;
  }

  async refundOrder(id: string, reason?: string): Promise<OrderRecord | null> {
    const orders = this.readFromDisk();
    const order = orders.find(o => o.id === id || o.orderNumber === id);
    if (!order) return null;

    order.paymentStatus = 'REFUNDED';
    order.status = 'CANCELLED';
    order.updatedAt = new Date().toISOString();
    if (!order.timeline) order.timeline = [];
    order.timeline.push({
      status: 'REFUNDED',
      time: new Date().toISOString(),
      note: reason ? `Refund processed: ${reason}` : 'Full refund issued via payment gateway',
    });

    this.writeToDisk(orders);
    return order;
  }
}
