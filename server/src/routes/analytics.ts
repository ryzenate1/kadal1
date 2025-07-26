import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Get dashboard analytics
router.get('/dashboard', async (req, res) => {
  try {
    // Get current date for time-based queries
    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfWeek = new Date(today.getTime() - (today.getDay() * 24 * 60 * 60 * 1000));

    // Get basic counts
    const [
      totalUsers,
      totalOrders,
      totalProducts,
      totalCategories,
      todayOrders,
      weekOrders,
      monthOrders,
      lowStockProducts
    ] = await Promise.all([
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
    const revenueData = await prisma.order.aggregate({
      _sum: { totalAmount: true },
      where: { 
        status: { in: ['delivered', 'shipped'] }
      }
    });

    const todayRevenue = await prisma.order.aggregate({
      _sum: { totalAmount: true },
      where: { 
        createdAt: { gte: startOfToday },
        status: { in: ['delivered', 'shipped'] }
      }
    });

    const monthRevenue = await prisma.order.aggregate({
      _sum: { totalAmount: true },
      where: { 
        createdAt: { gte: startOfMonth },
        status: { in: ['delivered', 'shipped'] }
      }
    });

    // Get recent orders
    const recentOrders = await prisma.order.findMany({
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
    const topProducts = await prisma.orderItem.groupBy({
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
    const topProductsWithDetails = await Promise.all(
      topProducts.map(async (item) => {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
          select: {
            id: true,
            name: true,
            price: true,
            imageUrl: true
          }
        });
        return {
          ...product,
          totalSold: item._sum.quantity
        };
      })
    );

    // Get order status breakdown
    const orderStatusBreakdown = await prisma.order.groupBy({
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
  } catch (error: any) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ message: 'Error fetching analytics', error: error.message });
  }
});

// Get sales analytics
router.get('/sales', async (req, res) => {
  try {
    const { period = '7d' } = req.query;
    
    let startDate: Date;
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

    const salesData = await prisma.order.findMany({
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
  } catch (error: any) {
    console.error('Error fetching sales analytics:', error);
    res.status(500).json({ message: 'Error fetching sales analytics', error: error.message });
  }
});

export default router;
