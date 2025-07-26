const express = require('express');
const router = express.Router();
const trustedBadgeController = require('../controllers/trustedBadgeController');
const { verifyToken } = require('../middleware/auth');

// Public routes
router.get('/', trustedBadgeController.getAll);
router.get('/:id', trustedBadgeController.getOne);

// Protected routes (require authentication)
router.post('/', verifyToken, trustedBadgeController.create);
router.put('/:id', verifyToken, trustedBadgeController.update);
router.delete('/:id', verifyToken, trustedBadgeController.delete);

module.exports = router; 