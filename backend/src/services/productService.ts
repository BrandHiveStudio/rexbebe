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
}
