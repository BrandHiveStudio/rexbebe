export interface MockOrder {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  status: string;
  totalAmount: number;
  subtotal: number;
  discount: number;
  shippingFee: number;
  paymentMethod: string;
  paymentStatus: string;
  items: {
    id: string;
    variantId: string;
    title: string;
    price: number;
    quantity: number;
    totalPrice: number;
  }[];
  shippingAddress: {
    recipientName: string;
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  createdAt: string;
}

const MOCK_ORDERS: MockOrder[] = [
  {
    id: 'ord-1001',
    orderNumber: 'RXB-2026-9041',
    customerId: 'cust-1',
    customerName: 'Elena Rostova',
    customerEmail: 'elena@example.com',
    status: 'PROCESSING',
    totalAmount: 43000,
    subtotal: 43000,
    discount: 0,
    shippingFee: 0,
    paymentMethod: 'PAYHERE',
    paymentStatus: 'PAID',
    items: [
      {
        id: 'orditem-1',
        variantId: 'var-1a',
        title: 'Aurelia Organic Cashmere Romper - Oatmeal (0-3M)',
        price: 18500,
        quantity: 1,
        totalPrice: 18500,
      },
      {
        id: 'orditem-2',
        variantId: 'var-2a',
        title: 'Nordic Artisan Wooden Play Gym',
        price: 24500,
        quantity: 1,
        totalPrice: 24500,
      }
    ],
    shippingAddress: {
      recipientName: 'Elena Rostova',
      street: '45 Park Avenue, Suite 12',
      city: 'Colombo',
      state: 'Western',
      postalCode: '00700',
      country: 'Sri Lanka',
    },
    createdAt: new Date().toISOString(),
  }
];

export class OrderRepository {
  private orders: MockOrder[] = [...MOCK_ORDERS];

  async findAll(): Promise<MockOrder[]> {
    return this.orders;
  }

  async findById(id: string): Promise<MockOrder | null> {
    return this.orders.find(o => o.id === id || o.orderNumber === id) || null;
  }

  async create(orderData: Omit<MockOrder, 'id' | 'orderNumber' | 'createdAt'>): Promise<MockOrder> {
    const newOrder: MockOrder = {
      ...orderData,
      id: `ord-${Date.now()}`,
      orderNumber: `RXB-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: new Date().toISOString(),
    };
    this.orders.unshift(newOrder);
    return newOrder;
  }

  async updateStatus(id: string, status: string): Promise<MockOrder | null> {
    const order = await this.findById(id);
    if (order) {
      order.status = status;
    }
    return order;
  }
}
