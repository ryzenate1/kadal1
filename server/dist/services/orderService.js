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
exports.OrderService = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
exports.OrderService = {
    // Get all orders
    getAllOrders: () => __awaiter(void 0, void 0, void 0, function* () {
        return prisma.order.findMany({
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phoneNumber: true,
                        loyaltyPoints: true,
                        loyaltyTier: true
                    }
                },
                address: true,
                orderItems: {
                    include: {
                        product: true
                    }
                },
                trackingHistory: {
                    orderBy: {
                        timestamp: 'desc'
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
    }),
    // Get orders by user ID
    getOrdersByUserId: (userId) => __awaiter(void 0, void 0, void 0, function* () {
        return prisma.order.findMany({
            where: {
                userId
            },
            include: {
                address: true,
                orderItems: {
                    include: {
                        product: true
                    }
                },
                trackingHistory: {
                    orderBy: {
                        timestamp: 'desc'
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
    }),
    // Get order by ID
    getOrderById: (id) => __awaiter(void 0, void 0, void 0, function* () {
        return prisma.order.findUnique({
            where: { id },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phoneNumber: true,
                        loyaltyPoints: true,
                        loyaltyTier: true
                    }
                },
                address: true,
                orderItems: {
                    include: {
                        product: true
                    }
                },
                trackingHistory: {
                    orderBy: {
                        timestamp: 'desc'
                    }
                }
            }
        });
    }),
    // Update order status
    updateOrderStatus: (id, status, description) => __awaiter(void 0, void 0, void 0, function* () {
        // Start a transaction
        return prisma.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
            // Update order status
            const updatedOrder = yield tx.order.update({
                where: { id },
                data: {
                    status,
                    updatedAt: new Date()
                },
                include: {
                    user: true,
                    orderItems: {
                        include: {
                            product: true
                        }
                    }
                }
            });
            // Create tracking history entry
            const trackingEntry = yield tx.trackingHistory.create({
                data: {
                    orderId: id,
                    status,
                    description,
                    timestamp: new Date()
                }
            });
            // Get all tracking history for this order
            const trackingHistory = yield tx.trackingHistory.findMany({
                where: { orderId: id },
                orderBy: { timestamp: 'desc' }
            });
            // If order is delivered, award loyalty points
            if (status === 'delivered' && updatedOrder.pointsEarned === 0) {
                const pointsToAward = Math.floor(updatedOrder.totalAmount * 0.05); // 5% of order value
                // Update order with points earned
                yield tx.order.update({
                    where: { id },
                    data: { pointsEarned: pointsToAward }
                });
                // Add points to user
                yield tx.user.update({
                    where: { id: updatedOrder.userId },
                    data: {
                        loyaltyPoints: { increment: pointsToAward }
                    }
                });
                // Create loyalty activity entry
                yield tx.loyaltyActivity.create({
                    data: {
                        userId: updatedOrder.userId,
                        points: pointsToAward,
                        type: 'earned',
                        description: `Earned points for order #${id.slice(-6)}`
                    }
                });
                // Check and update loyalty tier
                const user = yield tx.user.findUnique({
                    where: { id: updatedOrder.userId },
                    select: { loyaltyPoints: true }
                });
                if (user) {
                    let newTier = 'Bronze';
                    if (user.loyaltyPoints >= 5000) {
                        newTier = 'Platinum';
                    }
                    else if (user.loyaltyPoints >= 2000) {
                        newTier = 'Gold';
                    }
                    else if (user.loyaltyPoints >= 500) {
                        newTier = 'Silver';
                    }
                    yield tx.user.update({
                        where: { id: updatedOrder.userId },
                        data: { loyaltyTier: newTier }
                    });
                }
            }
            return Object.assign(Object.assign({}, updatedOrder), { trackingHistory });
        }));
    }),
    // Create a new order
    createOrder: (orderData) => __awaiter(void 0, void 0, void 0, function* () {
        return prisma.order.create({
            data: {
                userId: orderData.userId,
                addressId: orderData.addressId,
                status: 'pending',
                totalAmount: orderData.totalAmount,
                paymentStatus: orderData.paymentStatus,
                paymentMethod: orderData.paymentMethod,
                orderItems: {
                    create: orderData.items.map((item) => ({
                        productId: item.productId,
                        quantity: item.quantity,
                        price: item.price
                    }))
                },
                trackingHistory: {
                    create: {
                        status: 'pending',
                        description: 'Order received'
                    }
                }
            },
            include: {
                orderItems: true,
                trackingHistory: true
            }
        });
    }),
    // Cancel an order
    cancelOrder: (id, reason) => __awaiter(void 0, void 0, void 0, function* () {
        return prisma.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
            // Update order status
            const updatedOrder = yield tx.order.update({
                where: { id },
                data: {
                    status: 'cancelled',
                    updatedAt: new Date()
                }
            });
            // Create tracking history entry
            yield tx.trackingHistory.create({
                data: {
                    orderId: id,
                    status: 'cancelled',
                    description: reason || 'Order cancelled by customer'
                }
            });
            return updatedOrder;
        }));
    })
};
