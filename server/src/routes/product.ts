import express from 'express';
import { authenticate, isAdmin } from '../middleware/auth';
import {
  getAllProducts,
  getProductByIdOrSlug,
  createProduct,
  updateProduct,
  deleteProduct
} from '../controllers/product';

const router = express.Router();

// Public routes
router.get('/', getAllProducts);
router.get('/:idOrSlug', getProductByIdOrSlug);

// Protected routes (admin only)
router.use(authenticate, isAdmin);
router.post('/', createProduct);
router.put('/:id', updateProduct);
router.delete('/:id', deleteProduct);

export default router;
