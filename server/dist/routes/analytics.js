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
const express_1 = require("express");
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
// Get dashboard analytics
router.get('/dashboard', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Get current date for time-based queries
        const today = new Date();
        const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const startOfWeek = new Date(today.getTime() - (today.getDay() * 24 * 60 * 60 * 1000));
        // Get basic counts
        const [totalUsers, totalOrders, totalProducts, totalCategories, todayOrders, weekOrders, monthOrders, lowStockProducts] = yield Promise.all([
            prisma.user.count(),
            prisma.order.count(),
            prisma.product.count(),
            prisma.category.count(),
            prisma.order.count({
                where: { createdAt: { gte: startOfToday } }
            }),
            prisma.order.count({
                where: { createdAt: { gte: startOfWeek } }
            }),
            prisma.order.count({
                where: { createdAt: { gte: startOfMonth } }
            }),
            prisma.product.count({
                where: { stock: { lt: 10 } }
            })
        ]);
        // Get revenue data
        const revenueData = yield prisma.order.aggregate({
            _sum: { totalAmount: true },
            where: {
                status: { in: ['delivered', 'shipped'] }
            }
        });
        const todayRevenue = yield prisma.order.aggregate({
            _sum: { totalAmount: true },
            where: {
                createdAt: { gte: startOfToday },
                status: { in: ['delivered', 'shipped'] }
            }
        });
        const monthRevenue = yield prisma.order.aggregate({
            _sum: { totalAmount: true },
            where: {
                createdAt: { gte: startOfMonth },
                status: { in: ['delivered', 'shipped'] }
            }
        });
        // Get recent orders
        const recentOrders = yield prisma.order.findMany({
            take: 10,
            orderBy: { createdAt: 'desc' },
            include: {
                user: {
                    select: {
                        name: true,
                        email: true
                    }
                },
                orderItems: {
                    include: {
                        product: {
                            select: {
                                name: true
                            }
                        }
                    }
                }
            }
        });
        // Get top selling products
        const topProducts = yield prisma.orderItem.groupBy({
            by: ['productId'],
            _sum: {
                quantity: true
            },
            orderBy: {
                _sum: {
                    quantity: 'desc'
                }
            },
            take: 5
        });
        // Get product details for top selling
        const topProductsWithDetails = yield Promise.all(topProducts.map((item) => __awaiter(void 0, void 0, void 0, function* () {
            const product = yield prisma.product.findUnique({
                where: { id: item.productId },
                select: {
                    id: true,
                    name: true,
                    price: true,
                    imageUrl: true
                }
            });
            return Object.assign(Object.assign({}, product), { totalSold: item._sum.quantity });
        })));
        // Get order status breakdown
        const orderStatusBreakdown = yield prisma.order.groupBy({
            by: ['status'],
            _count: {
                status: true
            }
        });
        res.json({
            totalUsers,
            totalOrders,
            totalProducts,
            totalCategories,
            todayOrders,
            weekOrders,
            monthOrders,
            lowStockProducts,
            totalRevenue: revenueData._sum.totalAmount || 0,
            todayRevenue: todayRevenue._sum.totalAmount || 0,
            monthRevenue: monthRevenue._sum.totalAmount || 0,
            recentOrders,
            topProducts: topProductsWithDetails,
            orderStatusBreakdown
        });
    }
    catch (error) {
        console.error('Error fetching analytics:', error);
        res.status(500).json({ message: 'Error fetching analytics', error: error.message });
    }
}));
// Get sales analytics
router.get('/sales', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { period = '7d' } = req.query;
        let startDate;
        const endDate = new Date();
        switch (period) {
            case '24h':
                startDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
                break;
            case '7d':
                startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
                break;
            case '30d':
                startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
                break;
            case '90d':
                startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
                break;
            default:
                startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        }
        const salesData = yield prisma.order.findMany({
            where: {
                createdAt: {
                    gte: startDate,
                    lte: endDate
                },
                status: { in: ['delivered', 'shipped'] }
            },
            select: {
                totalAmount: true,
                createdAt: true
            },
            orderBy: {
                createdAt: 'asc'
            }
        });
        res.json(salesData);
    }
    catch (error) {
        console.error('Error fetching sales analytics:', error);
        res.status(500).json({ message: 'Error fetching sales analytics', error: error.message });
    }
}));
exports.default = router;
