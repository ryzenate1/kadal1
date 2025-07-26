import express from 'express';
import { 
  getLoyaltyInfo, 
  getLoyaltyActivity, 
  redeemPoints 
} from '../controllers/loyalty';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// Loyalty routes
router.get('/info', getLoyaltyInfo);
router.get('/activity', getLoyaltyActivity);
router.post('/redeem', redeemPoints);

export default router;
