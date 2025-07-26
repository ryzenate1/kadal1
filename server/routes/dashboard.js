const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { verifyToken } = require('../middleware/auth');

// GET /api/dashboard/stats
router.get('/stats', verifyToken, async (req, res) => {
  try {
    // Calculate dashboard statistics
    const usersCount = await prisma.user.count({
      where: { role: 'customer' }
    });

    const ordersCount = await prisma.order.count();
    
    const pendingOrdersCount = await prisma.order.count({
      where: { status: 'pending' }
    });
    
    const completedOrdersCount = await prisma.order.count({
      where: { status: 'delivered' }
    });
    
    const productsCount = await prisma.product.count();

    // Calculate total revenue
    const orders = await prisma.order.findMany({
      where: { status: { not: 'cancelled' } },
      select: { totalAmount: true }
    });
    
    const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    
    // Get counts for the previous period to calculate growth rates
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const previousOrders = await prisma.order.count({
      where: {
        createdAt: {
          lt: thirtyDaysAgo
        }
      }
    });
    
    const previousRevenue = await prisma.order.findMany({
      where: {
        status: { not: 'cancelled' },
        createdAt: {
          lt: thirtyDaysAgo
        }
      },
      select: { totalAmount: true }
    });
    
    const prevTotalRevenue = previousRevenue.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    
    // Calculate growth percentages
    const orderGrowth = previousOrders > 0 
      ? ((ordersCount - previousOrders) / previousOrders) * 100 
      : 0;
      
    const revenueGrowth = prevTotalRevenue > 0 
      ? ((totalRevenue - prevTotalRevenue) / prevTotalRevenue) * 100 
      : 0;
      
    // Return formatted dashboard stats
    res.json({
      users: {
        total: usersCount,
        growth: 0 // Can add user growth calculation if needed
      },
      orders: {
        total: ordersCount,
        growth: orderGrowth,
        byStatus: {
          pending: pendingOrdersCount,
          delivered: completedOrdersCount
        }
      },
      products: {
        total: productsCount,
        active: productsCount // Assuming all products are active
      },
      revenue: {
        total: totalRevenue,
        growth: revenueGrowth
      }
    });
    
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ 
      error: 'Failed to fetch dashboard statistics',
      details: error.message
    });
  }
});

module.exports = router;
