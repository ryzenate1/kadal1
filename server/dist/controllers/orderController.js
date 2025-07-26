"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderController = void 0;
const client_1 = require("@prisma/client");
const orderService_1 = require("../services/orderService");
const activityLogService_1 = require("../services/activityLogService");
const notificationService_1 = require("../services/notificationService");
const prisma = new client_1.PrismaClient();
exports.OrderController = {
    // Get all orders
    getAllOrders: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const orders = yield orderService_1.OrderService.getAllOrders();
            // Format orders for API response
            const formattedOrders = orders.map(order => ({
                id: order.id,
                orderNumber: `KT${order.id.slice(-6).toUpperCase()}`,
                status: order.status,
                totalAmount: order.totalAmount,
                paymentStatus: order.paymentStatus,
                paymentMethod: order.paymentMethod,
                trackingNumber: order.trackingNumber,
                estimatedDelivery: order.estimatedDelivery,
                createdAt: order.createdAt,
                updatedAt: order.updatedAt,
                pointsEarned: order.pointsEarned,
                user: {
                    id: order.user.id,
                    name: order.user.name,
                    email: order.user.email,
                    phoneNumber: order.user.phoneNumber,
                    loyaltyPoints: order.user.loyaltyPoints,
                    loyaltyTier: order.user.loyaltyTier
                },
                address: order.address ? {
                    name: order.address.name,
                    address: order.address.address,
                    city: order.address.city,
                    state: order.address.state,
                    pincode: order.address.pincode
                } : null,
                items: order.orderItems.map(item => ({
                    id: item.id,
                    productId: item.productId,
                    productName: item.product.name,
                    productImage: item.product.imageUrl,
                    quantity: item.quantity,
                    price: item.price,
                    weight: item.product.weight
                })),
                trackingHistory: order.trackingHistory.map(history => ({
                    status: history.status,
                    description: history.description,
                    timestamp: history.timestamp
                }))
            }));
            res.status(200).json(formattedOrders);
        }
        catch (error) {
            console.error('Error fetching orders:', error);
            res.status(500).json({ error: 'Failed to fetch orders' });
        }
    }),
    // Get orders by user ID
    getOrdersByUserId: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const userId = req.params.userId;
            const orders = yield orderService_1.OrderService.getOrdersByUserId(userId);
            // Format orders for API response
            const formattedOrders = orders.map(order => ({
                id: order.id,
                orderNumber: `KT${order.id.slice(-6).toUpperCase()}`,
                status: order.status,
                totalAmount: order.totalAmount,
                paymentStatus: order.paymentStatus,
                paymentMethod: order.paymentMethod,
                trackingNumber: order.trackingNumber,
                estimatedDelivery: order.estimatedDelivery,
                createdAt: order.createdAt,
                updatedAt: order.updatedAt,
                pointsEarned: order.pointsEarned,
                address: order.address ? {
                    name: order.address.name,
                    address: order.address.address,
                    city: order.address.city,
                    state: order.address.state,
                    pincode: order.address.pincode
                } : null,
                items: order.orderItems.map(item => ({
                    id: item.id,
                    productId: item.productId,
                    productName: item.product.name,
                    productImage: item.product.imageUrl,
                    quantity: item.quantity,
                    price: item.price,
                    weight: item.product.weight
                })),
                trackingHistory: order.trackingHistory.map(history => ({
                    status: history.status,
                    description: history.description,
                    timestamp: history.timestamp
                }))
            }));
            res.status(200).json(formattedOrders);
        }
        catch (error) {
            console.error(`Error fetching orders for user ${req.params.userId}:`, error);
            res.status(500).json({ error: 'Failed to fetch orders' });
        }
    }),
    // Get order by ID
    getOrderById: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const orderId = req.params.id;
            const order = yield orderService_1.OrderService.getOrderById(orderId);
            if (!order) {
                return res.status(404).json({ error: 'Order not found' });
            }
            // Format order for API response
            const formattedOrder = {
                id: order.id,
                orderNumber: `KT${order.id.slice(-6).toUpperCase()}`,
                status: order.status,
                totalAmount: order.totalAmount,
                paymentStatus: order.paymentStatus,
                paymentMethod: order.paymentMethod,
                trackingNumber: order.trackingNumber,
                estimatedDelivery: order.estimatedDelivery,
                createdAt: order.createdAt,
                updatedAt: order.updatedAt,
                pointsEarned: order.pointsEarned,
                user: {
                    id: order.user.id,
                    name: order.user.name,
                    email: order.user.email,
                    phoneNumber: order.user.phoneNumber,
                    loyaltyPoints: order.user.loyaltyPoints,
                    loyaltyTier: order.user.loyaltyTier
                },
                address: order.address ? {
                    name: order.address.name,
                    address: order.address.address,
                    city: order.address.city,
                    state: order.address.state,
                    pincode: order.address.pincode
                } : null,
                items: order.orderItems.map(item => ({
                    id: item.id,
                    productId: item.productId,
                    productName: item.product.name,
                    productImage: item.product.imageUrl,
                    quantity: item.quantity,
                    price: item.price,
                    weight: item.product.weight
                })),
                trackingHistory: order.trackingHistory.map(history => ({
                    status: history.status,
                    description: history.description,
                    timestamp: history.timestamp
                }))
            };
            res.status(200).json(formattedOrder);
        }
        catch (error) {
            console.error(`Error fetching order ${req.params.id}:`, error);
            res.status(500).json({ error: 'Failed to fetch order details' });
        }
    }),
    // Update order status
    updateOrderStatus: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { id } = req.params;
            const { status, description } = req.body;
            if (!status) {
                return res.status(400).json({ error: 'Status is required' });
            }
            const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
            if (!validStatuses.includes(status)) {
                return res.status(400).json({ error: 'Invalid status value' });
            }
            const updatedOrder = yield orderService_1.OrderService.updateOrderStatus(id, status, description || `Order status updated to ${status}`); // Log the activity
            yield activityLogService_1.ActivityLogService.createLog({
                userId: req.body.adminId || updatedOrder.userId, // Use admin ID if available, else user ID
                action: 'update_order_status',
                description: `Order #${updatedOrder.id.slice(-6).toUpperCase()} status updated to ${status}`,
                resourceType: 'order',
                resourceId: updatedOrder.id,
                metadata: {
                    previousStatus: updatedOrder.trackingHistory.length > 1 ? updatedOrder.trackingHistory[1].status : 'unknown',
                    newStatus: status,
                    updatedBy: req.body.adminId ? 'admin' : 'system'
                }
            });
            // Create a notification for the user
            let notificationTitle = '';
            let notificationMessage = '';
            switch (status) {
                case 'confirmed':
                    notificationTitle = 'Order Confirmed';
                    notificationMessage = `Your order #${updatedOrder.id.slice(-6).toUpperCase()} has been confirmed and is being processed.`;
                    break;
                case 'processing':
                    notificationTitle = 'Order Processing';
                    notificationMessage = `Your order #${updatedOrder.id.slice(-6).toUpperCase()} is now being processed and prepared for shipping.`;
                    break;
                case 'shipped':
                    notificationTitle = 'Order Shipped';
                    notificationMessage = `Great news! Your order #${updatedOrder.id.slice(-6).toUpperCase()} has been shipped${updatedOrder.trackingNumber ? ` with tracking number ${updatedOrder.trackingNumber}` : ''}.`;
                    break;
                case 'delivered':
                    notificationTitle = 'Order Delivered';
                    notificationMessage = `Your order #${updatedOrder.id.slice(-6).toUpperCase()} has been delivered. Enjoy your fresh seafood!`;
                    break;
                case 'cancelled':
                    notificationTitle = 'Order Cancelled';
                    notificationMessage = `Your order #${updatedOrder.id.slice(-6).toUpperCase()} has been cancelled. Please contact customer support for any questions.`;
                    break;
                default:
                    notificationTitle = 'Order Update';
                    notificationMessage = `Your order #${updatedOrder.id.slice(-6).toUpperCase()} status has been updated to ${status}.`;
            }
            if (notificationTitle) {
                yield notificationService_1.NotificationService.createNotification({
                    userId: updatedOrder.userId,
                    title: notificationTitle,
                    message: notificationMessage,
                    type: 'order',
                    resourceType: 'order',
                    resourceId: updatedOrder.id
                });
            }
            // Format order for API response
            const formattedOrder = {
                id: updatedOrder.id,
                status: updatedOrder.status,
                updatedAt: updatedOrder.updatedAt,
                pointsEarned: updatedOrder.pointsEarned,
                userId: updatedOrder.userId
            };
            // Log the action
            console.log(`Order ${id} status updated to ${status} by admin`);
            res.status(200).json({
                message: 'Order status updated successfully',
                order: formattedOrder
            });
        }
        catch (error) {
            console.error(`Error updating order ${req.params.id}:`, error);
            res.status(500).json({ error: 'Failed to update order status' });
        }
    }),
    // Create a new order (simplified for demo)
    createOrder: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { items, shippingAddress, paymentMethod, totalAmount, deliverySlot } = req.body;
            // Validate required fields
            if (!items || !shippingAddress || !paymentMethod || !totalAmount) {
                return res.status(400).json({ error: 'Missing required fields' });
            }
            // Generate unique order ID and tracking number
            const orderId = `ORD-${Date.now()}${Math.floor(Math.random() * 1000)}`;
            const trackingNumber = `TRK${Date.now()}${Math.floor(Math.random() * 10000)}`;
            // Create order data for demo
            const orderData = {
                id: orderId,
                trackingNumber,
                status: 'confirmed',
                totalAmount: parseFloat(totalAmount),
                paymentMethod,
                paymentStatus: paymentMethod === 'cod' ? 'pending' : 'paid',
                shippingAddress,
                items,
                deliverySlot,
                createdAt: new Date(),
                updatedAt: new Date(),
                estimatedDelivery: new Date(Date.now() + 60 * 60 * 1000), // 1 hour from now
            };
            res.status(201).json(orderData);
        }
        catch (error) {
            console.error('Error creating order:', error);
            res.status(500).json({ error: 'Failed to create order' });
        }
    }),
    // Cancel an order
    cancelOrder: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { id } = req.params;
            const { reason, userId } = req.body;
            const canceledOrder = yield orderService_1.OrderService.cancelOrder(id, reason);
            // Log the activity
            yield activityLogService_1.ActivityLogService.createLog({
                userId: userId || canceledOrder.userId,
                action: 'cancel_order',
                description: `Order #${canceledOrder.id.slice(-6).toUpperCase()} cancelled`,
                resourceType: 'order',
                resourceId: canceledOrder.id,
                metadata: {
                    reason: reason || 'Not provided',
                    cancelledBy: userId ? 'user' : 'admin'
                }
            });
            // Create a notification for the user
            yield notificationService_1.NotificationService.createNotification({
                userId: canceledOrder.userId,
                title: 'Order Cancelled',
                message: `Your order #${canceledOrder.id.slice(-6).toUpperCase()} has been cancelled${reason ? `: ${reason}` : ''}. Please contact customer support if you have any questions.`,
                type: 'order',
                resourceType: 'order',
                resourceId: canceledOrder.id
            });
            // Create a notification for admin users about cancelled order
            if (!userId) { // If cancelled by user, notify admins
                const adminUsers = yield prisma.user.findMany({
                    where: { role: 'admin' }
                });
                for (const admin of adminUsers) {
                    yield notificationService_1.NotificationService.createNotification({
                        userId: admin.id,
                        title: 'Order Cancelled by Customer',
                        message: `Order #${canceledOrder.id.slice(-6).toUpperCase()} has been cancelled by the customer${reason ? `: ${reason}` : ''}.`,
                        type: 'admin',
                        resourceType: 'order',
                        resourceId: canceledOrder.id
                    });
                }
            }
            // Log the action
            console.log(`Order ${id} cancelled. Reason: ${reason || 'Not provided'}`);
            res.status(200).json({
                message: 'Order cancelled successfully',
                order: {
                    id: canceledOrder.id,
                    status: canceledOrder.status,
                    updatedAt: canceledOrder.updatedAt
                }
            });
        }
        catch (error) {
            console.error(`Error cancelling order ${req.params.id}:`, error);
            res.status(500).json({ error: 'Failed to cancel order' });
        }
    }),
    // Get order tracking (for demo/public access)
    getOrderTracking: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { id } = req.params;
            // For demo purposes, return mock tracking data
            const trackingData = {
                id: id,
                trackingNumber: `TRK${id.replace('ORD-', '')}`,
                status: 'processing',
                estimatedDelivery: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
                createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
                updatedAt: new Date().toISOString(),
                trackingHistory: [
                    {
                        status: 'Processing',
                        timestamp: new Date().toISOString(),
                        description: 'Your order is being prepared',
                        location: 'Kadal Thunai Kitchen'
                    },
                    {
                        status: 'Order Confirmed',
                        timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
                        description: 'Your order has been confirmed',
                        location: 'Kadal Thunai Kitchen'
                    },
                    {
                        status: 'Order Placed',
                        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
                        description: 'Your order has been received',
                        location: 'Online'
                    }
                ],
                shippingAddress: {
                    name: 'Customer',
                    phone: '9876543210',
                    address: '123 Main Street, Apartment 4B',
                    city: 'Chennai',
                    state: 'Tamil Nadu',
                    pincode: '600001'
                },
                items: [
                    {
                        id: '1',
                        name: 'Fresh Tuna Steak',
                        quantity: 2,
                        price: 299.50,
                        image: '/images/products/tuna.jpg'
                    }
                ],
                paymentMethod: 'cod',
                paymentStatus: 'pending',
                totalAmount: 649.00,
                deliveryFee: 49.00,
                discount: 0
            };
            res.json(trackingData);
        }
        catch (error) {
            console.error('Error getting order tracking:', error);
            res.status(500).json({ error: 'Failed to get order tracking' });
        }
    }),
};
