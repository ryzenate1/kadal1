"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const orderController_1 = require("../controllers/orderController");
// Import auth middleware from server root
const auth = require('../../middleware/auth');
const router = express_1.default.Router();
// GET all orders (admin only)
router.get('/', auth, orderController_1.OrderController.getAllOrders);
// GET orders by user ID
router.get('/user/:userId', auth, orderController_1.OrderController.getOrdersByUserId);
// GET order by ID
router.get('/:id', auth, orderController_1.OrderController.getOrderById);
// GET order tracking by ID (no auth for demo)
router.get('/:id/tracking', orderController_1.OrderController.getOrderTracking);
// PUT update order status (admin only)
router.put('/:id/status', auth, orderController_1.OrderController.updateOrderStatus);
// POST create new order (no auth for demo)
router.post('/', orderController_1.OrderController.createOrder);
// PUT cancel order
router.put('/:id/cancel', auth, orderController_1.OrderController.cancelOrder);
exports.default = router;
