const express = require('express');
const router = express.Router();
const mediaController = require('../controllers/mediaController');
const { verifyToken } = require('../middleware/auth');

// Get all media files
router.get('/', mediaController.getAll);

// Get one media file by ID
router.get('/:id', mediaController.getOne);

// Upload media file (requires authentication)
router.post('/', verifyToken, mediaController.upload.single('file'), mediaController.uploadMedia);

// Update media metadata (requires authentication)
router.put('/:id', verifyToken, mediaController.update);

// Delete media file (requires authentication)
router.delete('/:id', verifyToken, mediaController.delete);

module.exports = router;
