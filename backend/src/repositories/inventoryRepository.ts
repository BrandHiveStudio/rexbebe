export interface MockInventory {
  variantId: string;
  sku: string;
  productName: string;
  quantity: number;
  reserved: number;
  updatedAt: string;
}

const MOCK_INVENTORY: MockInventory[] = [
  { variantId: 'var-1a', sku: 'AUREL-OAT-03M', productName: 'Aurelia Cashmere Romper (Oatmeal 0-3M)', quantity: 25, reserved: 2, updatedAt: new Date().toISOString() },
  { variantId: 'var-1b', sku: 'AUREL-OAT-06M', productName: 'Aurelia Cashmere Romper (Oatmeal 3-6M)', quantity: 18, reserved: 0, updatedAt: new Date().toISOString() },
  { variantId: 'var-2a', sku: 'GYM-WOOD-STD', productName: 'Nordic Artisan Wooden Play Gym', quantity: 14, reserved: 1, updatedAt: new Date().toISOString() },
  { variantId: 'var-3a', sku: 'SWAD-SAGE-SET', productName: 'Maison Luxe Swaddle Set (Sage)', quantity: 30, reserved: 0, updatedAt: new Date().toISOString() },
  { variantId: 'var-4a', sku: 'STR-ONYX-GLD', productName: 'Celeste Stroller (Onyx Black)', quantity: 8, reserved: 1, updatedAt: new Date().toISOString() },
];

export class InventoryRepository {
  private inventory: MockInventory[] = [...MOCK_INVENTORY];

  async findAll(): Promise<MockInventory[]> {
    return this.inventory;
  }

  async findByVariantId(variantId: string): Promise<MockInventory | null> {
    return this.inventory.find(i => i.variantId === variantId) || null;
  }

  async updateStock(variantId: string, quantity: number): Promise<MockInventory | null> {
    const item = await this.findByVariantId(variantId);
    if (item) {
      item.quantity = quantity;
      item.updatedAt = new Date().toISOString();
    }
    return item;
  }
}
