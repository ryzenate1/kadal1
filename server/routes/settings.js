const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');
const { verifyToken } = require('../middleware/auth');

// Store settings routes
router.get('/', settingsController.getAll);
router.get('/:key', settingsController.getByKey);
router.post('/', verifyToken, settingsController.upsert);
router.delete('/:key', verifyToken, settingsController.delete);

// Shipping methods routes
router.get('/shipping/methods', settingsController.getShippingMethods);
router.post('/shipping/methods', verifyToken, settingsController.createShippingMethod);
router.put('/shipping/methods/:id', verifyToken, settingsController.updateShippingMethod);
router.delete('/shipping/methods/:id', verifyToken, settingsController.deleteShippingMethod);

module.exports = router;
