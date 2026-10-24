import { Router } from 'express';
import {
  getCategories,
  getCategoryTree,
  getCategoryById,
  getCategoryDescendants,
  getCategoryAncestors,
  createCategory,
  updateCategory,
  updateCategoryStatus,
  deleteCategory,
} from '../controllers/categoryController';

const router = Router();

router.get('/', getCategories);
router.get('/tree', getCategoryTree);
router.get('/slug/:id', getCategoryById);
router.get('/:id/descendants', getCategoryDescendants);
router.get('/:id/ancestors', getCategoryAncestors);
router.get('/:id', getCategoryById);
router.post('/', createCategory);
router.put('/:id', updateCategory);
router.patch('/:id/status', updateCategoryStatus);
router.delete('/:id', deleteCategory);

export default router;
