const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { verifyToken } = require('../middleware/auth');

// Get dashboard analytics overview
router.get('/dashboard', verifyToken, async (req, res) => {
  try {
    // Calculate revenue stats
    const revenueStats = await getRevenueStats();
    
    // Calculate order stats
    const orderStats = await getOrderStats();
    
    // Calculate user stats
    const userStats = await getUserStats();
    
    // Calculate product stats
    const productStats = await getProductStats();
    
    // Combine stats
    const stats = {
      revenue: revenueStats,
      orders: orderStats,
      users: userStats,
      products: productStats
    };
    
    res.json(stats);
  } catch (error) {
    console.error('Error fetching dashboard analytics:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard analytics', details: error.message });
  }
});

// Get revenue analytics
router.get('/revenue', verifyToken, async (req, res) => {
  try {
    const { period = 'month' } = req.query;
    
    // Get revenue data based on period
    const revenueData = await getRevenueTrend(period);
    
    res.json(revenueData);
  } catch (error) {
    console.error('Error fetching revenue analytics:', error);
    res.status(500).json({ error: 'Failed to fetch revenue analytics', details: error.message });
  }
});

// Get order analytics
router.get('/orders', auth, async (req, res) => {
  try {
    const { period = 'month' } = req.query;
    
    // Get order data based on period
    const orderData = await getOrderTrend(period);
    
    res.json(orderData);
  } catch (error) {
    console.error('Error fetching order analytics:', error);
    res.status(500).json({ error: 'Failed to fetch order analytics', details: error.message });
  }
});

// Get user analytics
router.get('/users', auth, async (req, res) => {
  try {
    const { period = 'month' } = req.query;
    
    // Get user data based on period
    const userData = await getUserTrend(period);
    
    res.json(userData);
  } catch (error) {
    console.error('Error fetching user analytics:', error);
    res.status(500).json({ error: 'Failed to fetch user analytics', details: error.message });
  }
});

// Get product analytics
router.get('/products', auth, async (req, res) => {
  try {
    // Get top products by sales
    const topProducts = await getTopProducts();
    
    // Get products by category
    const productsByCategory = await getProductsByCategory();
    
    res.json({
      topProducts,
      productsByCategory
    });
  } catch (error) {
    console.error('Error fetching product analytics:', error);
    res.status(500).json({ error: 'Failed to fetch product analytics', details: error.message });
  }
});

// Record user activity (page view, etc.)
router.post('/activity', async (req, res) => {
  try {
    const { userId, event, page, metadata = {}, ip } = req.body;
    
    // Create activity record
    await prisma.userActivity.create({
      data: {
        userId,
        event,
        page,
        metadata,
        ip,
        timestamp: new Date()
      }
    });
    
    res.status(201).json({ message: 'Activity recorded successfully' });
  } catch (error) {
    console.error('Error recording user activity:', error);
    res.status(500).json({ error: 'Failed to record user activity', details: error.message });
  }
});

// Get user activity (requires auth)
router.get('/activity', auth, async (req, res) => {
  try {
    const { userId, event, page, limit = 100, offset = 0 } = req.query;
    
    // Build filters
    const where = {};
    if (userId) where.userId = userId;
    if (event) where.event = event;
    if (page) where.page = page;
    
    // Query activities
    const activities = await prisma.userActivity.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      take: parseInt(limit),
      skip: parseInt(offset)
    });
    
    // Get total count
    const total = await prisma.userActivity.count({ where });
    
    res.json({
      data: activities,
      total
    });
  } catch (error) {
    console.error('Error fetching user activity:', error);
    res.status(500).json({ error: 'Failed to fetch user activity', details: error.message });
  }
});

// Helper functions for analytics calculations

// Get revenue statistics
async function getRevenueStats() {
  // Total revenue
  const totalRevenueResult = await prisma.order.aggregate({
    _sum: { totalAmount: true },
    where: { status: 'delivered' }
  });
  const totalRevenue = totalRevenueResult._sum.totalAmount || 0;
  
  // Today's revenue
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const todayRevenueResult = await prisma.order.aggregate({
    _sum: { totalAmount: true },
    where: { 
      status: 'delivered',
      createdAt: { gte: today }
    }
  });
  const todayRevenue = todayRevenueResult._sum.totalAmount || 0;
  
  // This month's revenue
  const firstDayOfMonth = new Date();
  firstDayOfMonth.setDate(1);
  firstDayOfMonth.setHours(0, 0, 0, 0);
  
  const monthRevenueResult = await prisma.order.aggregate({
    _sum: { totalAmount: true },
    where: {
      status: 'delivered',
      createdAt: { gte: firstDayOfMonth }
    }
  });
  const monthRevenue = monthRevenueResult._sum.totalAmount || 0;
  
  // Last month's revenue for comparison
  const firstDayOfLastMonth = new Date();
  firstDayOfLastMonth.setMonth(firstDayOfLastMonth.getMonth() - 1);
  firstDayOfLastMonth.setDate(1);
  firstDayOfLastMonth.setHours(0, 0, 0, 0);
  
  const lastDayOfLastMonth = new Date();
  lastDayOfLastMonth.setDate(0);
  lastDayOfLastMonth.setHours(23, 59, 59, 999);
  
  const lastMonthRevenueResult = await prisma.order.aggregate({
    _sum: { totalAmount: true },
    where: {
      status: 'delivered',
      createdAt: { 
        gte: firstDayOfLastMonth,
        lte: lastDayOfLastMonth
      }
    }
  });
  const lastMonthRevenue = lastMonthRevenueResult._sum.totalAmount || 0;
  
  // Calculate growth percentage
  const growth = lastMonthRevenue > 0 
    ? ((monthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
    : 0;
  
  return {
    total: totalRevenue,
    today: todayRevenue,
    month: monthRevenue,
    lastMonth: lastMonthRevenue,
    growth
  };
}

// Get order statistics
async function getOrderStats() {
  // Total orders
  const totalOrders = await prisma.order.count();
  
  // Orders by status
  const pending = await prisma.order.count({ where: { status: 'pending' } });
  const processing = await prisma.order.count({ where: { status: 'processing' } });
  const shipped = await prisma.order.count({ where: { status: 'shipped' } });
  const delivered = await prisma.order.count({ where: { status: 'delivered' } });
  const cancelled = await prisma.order.count({ where: { status: 'cancelled' } });
  
  // Today's orders
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const todayOrders = await prisma.order.count({
    where: { createdAt: { gte: today } }
  });
  
  // This month's orders
  const firstDayOfMonth = new Date();
  firstDayOfMonth.setDate(1);
  firstDayOfMonth.setHours(0, 0, 0, 0);
  
  const monthOrders = await prisma.order.count({
    where: { createdAt: { gte: firstDayOfMonth } }
  });
  
  // Last month's orders for comparison
  const firstDayOfLastMonth = new Date();
  firstDayOfLastMonth.setMonth(firstDayOfLastMonth.getMonth() - 1);
  firstDayOfLastMonth.setDate(1);
  firstDayOfLastMonth.setHours(0, 0, 0, 0);
  
  const lastDayOfLastMonth = new Date();
  lastDayOfLastMonth.setDate(0);
  lastDayOfLastMonth.setHours(23, 59, 59, 999);
  
  const lastMonthOrders = await prisma.order.count({
    where: {
      createdAt: { 
        gte: firstDayOfLastMonth,
        lte: lastDayOfLastMonth
      }
    }
  });
  
  // Calculate growth percentage
  const growth = lastMonthOrders > 0 
    ? ((monthOrders - lastMonthOrders) / lastMonthOrders) * 100
    : 0;
  
  return {
    total: totalOrders,
    today: todayOrders,
    month: monthOrders,
    lastMonth: lastMonthOrders,
    growth,
    byStatus: {
      pending,
      processing,
      shipped,
      delivered,
      cancelled
    }
  };
}

// Get user statistics
async function getUserStats() {
  // Total users
  const totalUsers = await prisma.user.count();
  
  // Today's new users
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const todayUsers = await prisma.user.count({
    where: { createdAt: { gte: today } }
  });
  
  // This month's new users
  const firstDayOfMonth = new Date();
  firstDayOfMonth.setDate(1);
  firstDayOfMonth.setHours(0, 0, 0, 0);
  
  const monthUsers = await prisma.user.count({
    where: { createdAt: { gte: firstDayOfMonth } }
  });
  
  // Last month's new users for comparison
  const firstDayOfLastMonth = new Date();
  firstDayOfLastMonth.setMonth(firstDayOfLastMonth.getMonth() - 1);
  firstDayOfLastMonth.setDate(1);
  firstDayOfLastMonth.setHours(0, 0, 0, 0);
  
  const lastDayOfLastMonth = new Date();
  lastDayOfLastMonth.setDate(0);
  lastDayOfLastMonth.setHours(23, 59, 59, 999);
  
  const lastMonthUsers = await prisma.user.count({
    where: {
      createdAt: { 
        gte: firstDayOfLastMonth,
        lte: lastDayOfLastMonth
      }
    }
  });
  
  // Calculate growth percentage
  const growth = lastMonthUsers > 0 
    ? ((monthUsers - lastMonthUsers) / lastMonthUsers) * 100
    : 0;
  
  return {
    total: totalUsers,
    today: todayUsers,
    month: monthUsers,
    lastMonth: lastMonthUsers,
    growth
  };
}

// Get product statistics
async function getProductStats() {
  // Total products
  const totalProducts = await prisma.product.count();
  
  // Products by category
  const productsByCategory = await prisma.product.groupBy({
    by: ['categoryId'],
    _count: {
      id: true
    }
  });
  
  // Get category names
  const categories = await prisma.category.findMany({
    select: {
      id: true,
      name: true
    }
  });
  
  // Map category IDs to names
  const categoryMap = {};
  categories.forEach(category => {
    categoryMap[category.id] = category.name;
  });
  
  // Format product by category data
  const formattedProductsByCategory = productsByCategory.map(item => ({
    category: categoryMap[item.categoryId] || 'Uncategorized',
    count: item._count.id
  }));
  
  return {
    total: totalProducts,
    byCategory: formattedProductsByCategory
  };
}

// Get revenue trend
async function getRevenueTrend(period) {
  const result = [];
  
  // Determine date range and grouping based on period
  let startDate, endDate, groupBy;
  const now = new Date();
  
  if (period === 'week') {
    // Last 7 days
    startDate = new Date();
    startDate.setDate(startDate.getDate() - 6);
    startDate.setHours(0, 0, 0, 0);
    endDate = new Date();
    endDate.setHours(23, 59, 59, 999);
    groupBy = 'day';
  } else if (period === 'month') {
    // Current month
    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    groupBy = 'day';
  } else if (period === 'year') {
    // Current year
    startDate = new Date(now.getFullYear(), 0, 1);
    endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
    groupBy = 'month';
  } else {
    // Default to last 30 days
    startDate = new Date();
    startDate.setDate(startDate.getDate() - 29);
    startDate.setHours(0, 0, 0, 0);
    endDate = new Date();
    endDate.setHours(23, 59, 59, 999);
    groupBy = 'day';
  }
  
  // Generate date points based on grouping
  const datePoints = [];
  let current = new Date(startDate);
  
  while (current <= endDate) {
    datePoints.push(new Date(current));
    
    if (groupBy === 'day') {
      current.setDate(current.getDate() + 1);
    } else if (groupBy === 'month') {
      current.setMonth(current.getMonth() + 1);
    }
  }
  
  // Get all orders in date range
  const orders = await prisma.order.findMany({
    where: {
      createdAt: {
        gte: startDate,
        lte: endDate
      },
      status: 'delivered' // Only count delivered orders for revenue
    },
    select: {
      totalAmount: true,
      createdAt: true
    }
  });
  
  // Group orders by date
  for (const date of datePoints) {
    let totalRevenue = 0;
    
    // Format date for comparison
    const dateStr = groupBy === 'day' 
      ? `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
      : `${date.getFullYear()}-${date.getMonth() + 1}`;
    
    // Sum revenue for this date point
    for (const order of orders) {
      const orderDate = order.createdAt;
      const orderDateStr = groupBy === 'day'
        ? `${orderDate.getFullYear()}-${orderDate.getMonth() + 1}-${orderDate.getDate()}`
        : `${orderDate.getFullYear()}-${orderDate.getMonth() + 1}`;
      
      if (orderDateStr === dateStr) {
        totalRevenue += order.totalAmount;
      }
    }
    
    // Format date label
    let label;
    if (groupBy === 'day') {
      label = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } else if (groupBy === 'month') {
      label = date.toLocaleDateString('en-US', { month: 'short' });
    }
    
    result.push({
      date: date.toISOString(),
      label,
      revenue: totalRevenue
    });
  }
  
  return result;
}

// Get order trend
async function getOrderTrend(period) {
  // Similar implementation to getRevenueTrend but for order counts
  const result = [];
  
  // Determine date range and grouping based on period
  let startDate, endDate, groupBy;
  const now = new Date();
  
  if (period === 'week') {
    startDate = new Date();
    startDate.setDate(startDate.getDate() - 6);
    startDate.setHours(0, 0, 0, 0);
    endDate = new Date();
    endDate.setHours(23, 59, 59, 999);
    groupBy = 'day';
  } else if (period === 'month') {
    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    groupBy = 'day';
  } else if (period === 'year') {
    startDate = new Date(now.getFullYear(), 0, 1);
    endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
    groupBy = 'month';
  } else {
    startDate = new Date();
    startDate.setDate(startDate.getDate() - 29);
    startDate.setHours(0, 0, 0, 0);
    endDate = new Date();
    endDate.setHours(23, 59, 59, 999);
    groupBy = 'day';
  }
  
  // Generate date points based on grouping
  const datePoints = [];
  let current = new Date(startDate);
  
  while (current <= endDate) {
    datePoints.push(new Date(current));
    
    if (groupBy === 'day') {
      current.setDate(current.getDate() + 1);
    } else if (groupBy === 'month') {
      current.setMonth(current.getMonth() + 1);
    }
  }
  
  // Get all orders in date range
  const orders = await prisma.order.findMany({
    where: {
      createdAt: {
        gte: startDate,
        lte: endDate
      }
    },
    select: {
      status: true,
      createdAt: true
    }
  });
  
  // Group orders by date
  for (const date of datePoints) {
    const statusCounts = {
      pending: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0
    };
    
    // Format date for comparison
    const dateStr = groupBy === 'day' 
      ? `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
      : `${date.getFullYear()}-${date.getMonth() + 1}`;
    
    // Count orders for this date point
    for (const order of orders) {
      const orderDate = order.createdAt;
      const orderDateStr = groupBy === 'day'
        ? `${orderDate.getFullYear()}-${orderDate.getMonth() + 1}-${orderDate.getDate()}`
        : `${orderDate.getFullYear()}-${orderDate.getMonth() + 1}`;
      
      if (orderDateStr === dateStr) {
        statusCounts[order.status] = (statusCounts[order.status] || 0) + 1;
      }
    }
    
    // Format date label
    let label;
    if (groupBy === 'day') {
      label = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } else if (groupBy === 'month') {
      label = date.toLocaleDateString('en-US', { month: 'short' });
    }
    
    const total = Object.values(statusCounts).reduce((sum, count) => sum + count, 0);
    
    result.push({
      date: date.toISOString(),
      label,
      total,
      ...statusCounts
    });
  }
  
  return result;
}

// Get user trend
async function getUserTrend(period) {
  // Similar implementation to getOrderTrend but for user signups
  const result = [];
  
  // Determine date range and grouping based on period
  let startDate, endDate, groupBy;
  const now = new Date();
  
  if (period === 'week') {
    startDate = new Date();
    startDate.setDate(startDate.getDate() - 6);
    startDate.setHours(0, 0, 0, 0);
    endDate = new Date();
    endDate.setHours(23, 59, 59, 999);
    groupBy = 'day';
  } else if (period === 'month') {
    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    groupBy = 'day';
  } else if (period === 'year') {
    startDate = new Date(now.getFullYear(), 0, 1);
    endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
    groupBy = 'month';
  } else {
    startDate = new Date();
    startDate.setDate(startDate.getDate() - 29);
    startDate.setHours(0, 0, 0, 0);
    endDate = new Date();
    endDate.setHours(23, 59, 59, 999);
    groupBy = 'day';
  }
  
  // Generate date points based on grouping
  const datePoints = [];
  let current = new Date(startDate);
  
  while (current <= endDate) {
    datePoints.push(new Date(current));
    
    if (groupBy === 'day') {
      current.setDate(current.getDate() + 1);
    } else if (groupBy === 'month') {
      current.setMonth(current.getMonth() + 1);
    }
  }
  
  // Get all users in date range
  const users = await prisma.user.findMany({
    where: {
      createdAt: {
        gte: startDate,
        lte: endDate
      }
    },
    select: {
      createdAt: true
    }
  });
  
  // Group users by date
  for (const date of datePoints) {
    let count = 0;
    
    // Format date for comparison
    const dateStr = groupBy === 'day' 
      ? `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
      : `${date.getFullYear()}-${date.getMonth() + 1}`;
    
    // Count users for this date point
    for (const user of users) {
      const userDate = user.createdAt;
      const userDateStr = groupBy === 'day'
        ? `${userDate.getFullYear()}-${userDate.getMonth() + 1}-${userDate.getDate()}`
        : `${userDate.getFullYear()}-${userDate.getMonth() + 1}`;
      
      if (userDateStr === dateStr) {
        count++;
      }
    }
    
    // Format date label
    let label;
    if (groupBy === 'day') {
      label = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } else if (groupBy === 'month') {
      label = date.toLocaleDateString('en-US', { month: 'short' });
    }
    
    result.push({
      date: date.toISOString(),
      label,
      count
    });
  }
  
  return result;
}

// Get top products by sales
async function getTopProducts(limit = 10) {
  // Simulated top products by sales
  return [
    { id: 'product1', name: 'King Fish', salesCount: 156, revenue: 31200 },
    { id: 'product2', name: 'Salmon', salesCount: 124, revenue: 24800 },
    { id: 'product3', name: 'Tuna', salesCount: 98, revenue: 19600 },
    { id: 'product4', name: 'Crab', salesCount: 87, revenue: 17400 },
    { id: 'product5', name: 'Shrimp', salesCount: 76, revenue: 15200 }
  ];
}

// Get products by category
async function getProductsByCategory() {
  // Get categories with product counts
  const categories = await prisma.category.findMany({
    select: {
      id: true,
      name: true,
      _count: {
        select: {
          products: true
        }
      }
    }
  });
  
  return categories.map(category => ({
    category: category.name,
    count: category._count.products
  }));
}

module.exports = router;
