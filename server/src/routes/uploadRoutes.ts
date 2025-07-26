import express from 'express';
import { authenticate, isAdmin } from '../middleware/auth'; // Assuming uploads should be admin-only
import { uploadImage } from '../controllers/uploadController';

const router = express.Router();

// POST /api/upload/image
// This route will be used by the admin panel to upload product images
router.post('/image', authenticate, isAdmin, uploadImage);

export default router; 