import express from 'express';
import { OrderController } from '../controllers/orderController';

// Import auth middleware from server root
const auth = require('../../middleware/auth');

const router = express.Router();

// GET all orders (admin only)
router.get('/', auth, OrderController.getAllOrders);

// GET orders by user ID
router.get('/user/:userId', auth, OrderController.getOrdersByUserId);

// GET order by ID
router.get('/:id', auth, OrderController.getOrderById);

// GET order tracking by ID (no auth for demo)
router.get('/:id/tracking', OrderController.getOrderTracking);

// PUT update order status (admin only)
router.put('/:id/status', auth, OrderController.updateOrderStatus);

// POST create new order (no auth for demo)
router.post('/', OrderController.createOrder);

// PUT cancel order
router.put('/:id/cancel', auth, OrderController.cancelOrder);

export default router;
