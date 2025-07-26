import express from 'express';
import { 
  getProfile, 
  updateProfile, 
  changePassword, 
  getAddresses, 
  addAddress, 
  updateAddress, 
  deleteAddress 
} from '../controllers/user';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// User profile routes
router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.post('/change-password', changePassword);

// Address routes
router.get('/addresses', getAddresses);
router.post('/addresses', addAddress);
router.put('/addresses/:id', updateAddress);
router.delete('/addresses/:id', deleteAddress);

// Add this route to your existing user routes
router.get('/verify', authenticate, (req, res) => {
  // If authenticate middleware passes, the token is valid
  res.status(200).json({ 
    verified: true, 
    user: { 
      id: req.user?.id,
      role: req.user?.role 
    } 
  });
});
export default router;
