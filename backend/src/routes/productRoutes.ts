import { Router } from 'express';
import {
  getProducts,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
  toggleBestSeller,
} from '../controllers/productController';

const router = Router();

router.get('/', getProducts);
router.post('/', createProduct);
router.get('/:slug', getProductBySlug);
router.put('/:id', updateProduct);
router.delete('/:id', deleteProduct);
router.patch('/:id/best-seller', toggleBestSeller);

export default router;
