export interface CartSession {
  id: string;
  items: { variantId: string; quantity: number }[];
}

const mockCarts = new Map<string, CartSession>();

export class CartService {
  async getCart(cartId: string): Promise<CartSession> {
    if (!mockCarts.has(cartId)) {
      mockCarts.set(cartId, { id: cartId, items: [] });
    }
    return mockCarts.get(cartId)!;
  }

  async addItem(cartId: string, variantId: string, quantity: number): Promise<CartSession> {
    const cart = await this.getCart(cartId);
    const existing = cart.items.find(i => i.variantId === variantId);
    if (existing) {
      existing.quantity += quantity;
    } else {
      cart.items.push({ variantId, quantity });
    }
    return cart;
  }

  async removeItem(cartId: string, variantId: string): Promise<CartSession> {
    const cart = await this.getCart(cartId);
    cart.items = cart.items.filter(i => i.variantId !== variantId);
    return cart;
  }
}
