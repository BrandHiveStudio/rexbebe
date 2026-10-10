import { fetchApi } from './api';
import { Order } from '../types/order';

export const orderService = {
  async createOrder(orderPayload: any): Promise<Order> {
    return fetchApi<Order>('/orders', {
      method: 'POST',
      body: JSON.stringify(orderPayload),
    });
  },

  async getOrderById(id: string): Promise<Order> {
    return fetchApi<Order>(`/orders/${id}`);
  },

  async getAllOrdersAdmin(): Promise<Order[]> {
    return fetchApi<Order[]>('/orders', {
      headers: {
        'x-admin-dev': 'true',
      },
    });
  },

  async updateOrderStatus(id: string, status: string): Promise<Order> {
    return fetchApi<Order>(`/orders/${id}/status`, {
      method: 'PATCH',
      headers: { 'x-admin-dev': 'true' },
      body: JSON.stringify({ status }),
    });
  }
};
