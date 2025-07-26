const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
const productsImagesDir = path.join(uploadsDir, 'images/products');

// Create directories if they don't exist
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
if (!fs.existsSync(productsImagesDir)) {
  fs.mkdirSync(productsImagesDir, { recursive: true });
}

// Configure storage for different types of uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Check destination based on request path
    if (req.path === '/image') {
      cb(null, productsImagesDir);
    } else {
      cb(null, uploadsDir);
    }
  },
  filename: (req, file, cb) => {
    // Create a unique filename with original extension
    const ext = path.extname(file.originalname);
    const filename = Date.now() + '-' + file.originalname.replace(/\s+/g, '-').toLowerCase();
    cb(null, filename);
  }
});

// File filter to allow only images
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Not an image! Please upload only images.'), false);
  }
};

const upload = multer({ 
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Generic image upload endpoint
router.post('/', upload.single('image'), (req, res) => {
  const url = `/uploads/${req.file.filename}`;
  res.json({ url });
});

// Product image upload endpoint
router.post('/image', upload.single('image'), (req, res) => {
  const url = `/uploads/images/products/${req.file.filename}`;
  res.json({ url });
});

module.exports = router; 