import { Router } from 'express';
import {
  getProducts,
  getProductBySlug,
  createProduct,
  updateProduct,
  duplicateProduct,
  deleteProduct,
  toggleBestSeller,
  toggleNewArrival,
  toggleFeatured,
  updateProductStatus,
} from '../controllers/productController';

const router = Router();

router.get('/', getProducts);
router.post('/', createProduct);
router.get('/:slug', getProductBySlug);
router.put('/:id', updateProduct);
router.post('/:id/duplicate', duplicateProduct);
router.delete('/:id', deleteProduct);
router.patch('/:id/best-seller', toggleBestSeller);
router.patch('/:id/toggle-bestseller', toggleBestSeller);
router.patch('/:id/toggle-newarrival', toggleNewArrival);
router.patch('/:id/toggle-featured', toggleFeatured);
router.patch('/:id/status', updateProductStatus);

export default router;
