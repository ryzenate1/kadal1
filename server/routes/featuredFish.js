const express = require('express');
const router = express.Router();
const featuredFishController = require('../controllers/featuredFishController');
const { verifyToken } = require('../middleware/auth');

// Public routes
router.get('/', featuredFishController.getAll);

// Protected routes (require authentication)
router.post('/', verifyToken, featuredFishController.create);
router.put('/:id', verifyToken, featuredFishController.update);
router.delete('/:id', verifyToken, featuredFishController.delete);

module.exports = router; 