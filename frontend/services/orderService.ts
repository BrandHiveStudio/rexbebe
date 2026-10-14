import { fetchApi } from './api';

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
  items: {
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
  }[];
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

export const orderService = {
  async createOrder(orderPayload: any): Promise<OrderRecord> {
    return fetchApi<OrderRecord>('/orders', {
      method: 'POST',
      body: JSON.stringify(orderPayload),
    });
  },

  async getOrderById(id: string): Promise<OrderRecord> {
    return fetchApi<OrderRecord>(`/orders/${id}`);
  },

  async getAllOrdersAdmin(params?: { status?: string; paymentStatus?: string; search?: string; country?: string }): Promise<OrderRecord[]> {
    const query = new URLSearchParams();
    if (params?.status) query.set('status', params.status);
    if (params?.paymentStatus) query.set('paymentStatus', params.paymentStatus);
    if (params?.search) query.set('search', params.search);
    if (params?.country) query.set('country', params.country);

    const qs = query.toString() ? `?${query.toString()}` : '';
    return fetchApi<OrderRecord[]>(`/orders${qs}`);
  },

  async updateOrderStatus(
    id: string,
    status: OrderRecord['status'],
    carrier?: string,
    trackingNumber?: string,
    note?: string
  ): Promise<OrderRecord> {
    return fetchApi<OrderRecord>(`/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, carrier, trackingNumber, note }),
    });
  },

  async addOrderNote(id: string, note: string): Promise<OrderRecord> {
    return fetchApi<OrderRecord>(`/orders/${id}/notes`, {
      method: 'POST',
      body: JSON.stringify({ note }),
    });
  },

  async refundOrder(id: string, reason?: string): Promise<OrderRecord> {
    return fetchApi<OrderRecord>(`/orders/${id}/refund`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  },
};
