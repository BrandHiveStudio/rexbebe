import { Request, Response, NextFunction } from 'express';
import { ProductService } from '../services/productService';
import { sendSuccess } from '../utils/response';
import { NotFoundError } from '../utils/errors';

const productService = new ProductService();

export const getProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const products = await productService.getProducts(req.query);
    return sendSuccess(res, products, 'Products retrieved successfully');
  } catch (err) {
    next(err);
  }
};

export const getProductBySlug = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { slug } = req.params;
    const product = await productService.getProductBySlug(slug);
    if (!product) {
      throw new NotFoundError(`Product with slug '${slug}' not found`);
    }
    return sendSuccess(res, product, 'Product details retrieved');
  } catch (err) {
    next(err);
  }
};
