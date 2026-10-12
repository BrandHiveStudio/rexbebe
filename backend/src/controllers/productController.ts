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

export const createProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const product = await productService.createProduct(req.body);
    return sendSuccess(res, product, 'Product created successfully', 201);
  } catch (err) {
    next(err);
  }
};

export const updateProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const product = await productService.updateProduct(id, req.body);
    if (!product) {
      throw new NotFoundError(`Product with id '${id}' not found`);
    }
    return sendSuccess(res, product, 'Product updated successfully');
  } catch (err) {
    next(err);
  }
};

export const deleteProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const success = await productService.deleteProduct(id);
    if (!success) {
      throw new NotFoundError(`Product with id '${id}' not found`);
    }
    return sendSuccess(res, { deleted: true }, 'Product deleted successfully');
  } catch (err) {
    next(err);
  }
};

export const toggleBestSeller = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const product = await productService.toggleBestSeller(id);
    if (!product) {
      throw new NotFoundError(`Product with id '${id}' not found`);
    }
    return sendSuccess(res, product, 'Product Best Seller status updated');
  } catch (err) {
    next(err);
  }
};
