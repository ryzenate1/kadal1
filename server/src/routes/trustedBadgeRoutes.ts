import express from 'express';
import { 
  getAllTrustedBadges, 
  getTrustedBadgeById, 
  createTrustedBadge,
  updateTrustedBadge, 
  deleteTrustedBadge 
} from '../controllers/trustedBadgeController';
import { authenticate, isAdmin } from '../middleware/auth';

const router = express.Router();

// Public routes - available to everyone
router.get('/', getAllTrustedBadges);
router.get('/:id', getTrustedBadgeById);

// Protected routes - admin only
router.post('/', authenticate, isAdmin, createTrustedBadge);
router.put('/:id', authenticate, isAdmin, updateTrustedBadge);
router.delete('/:id', authenticate, isAdmin, deleteTrustedBadge);

export default router; 