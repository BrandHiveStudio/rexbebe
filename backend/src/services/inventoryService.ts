import { InventoryRepository } from '../repositories/inventoryRepository';

export class InventoryService {
  private repo = new InventoryRepository();

  async getInventoryList() {
    return this.repo.findAll();
  }

  async updateStock(variantId: string, quantity: number) {
    return this.repo.updateStock(variantId, quantity);
  }
}
