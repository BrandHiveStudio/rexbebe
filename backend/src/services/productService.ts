import { ProductRepository } from '../repositories/productRepository';

export class ProductService {
  private repo = new ProductRepository();

  async getProducts(query?: any) {
    return this.repo.findAll(query);
  }

  async getProductBySlug(slug: string) {
    return this.repo.findBySlug(slug);
  }

  async getProductById(id: string) {
    return this.repo.findById(id);
  }

  async createProduct(data: any) {
    return this.repo.create(data);
  }

  async updateProduct(id: string, data: any) {
    return this.repo.update(id, data);
  }

  async deleteProduct(id: string) {
    return this.repo.delete(id);
  }

  async toggleBestSeller(id: string) {
    return this.repo.toggleBestSeller(id);
  }
}
