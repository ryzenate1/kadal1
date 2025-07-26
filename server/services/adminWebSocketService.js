const WebSocket = require('ws');
const url = require('url');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const jwt = require('jsonwebtoken');

// Admin-specific WebSocket service to complement the main websocketService

// Store admin connections for analytics dashboard
let adminConnections = new Map();

// Initialize admin analytics stream 
async function initializeAdminAnalytics(server, mainWebSocketService) {
  // We'll enhance the main WebSocket service with admin-specific features
  const { 
    broadcastOrderUpdate,
    sendNotification,
    broadcastNotification
  } = mainWebSocketService;
  
  // Set up periodic dashboard updates for admins
  const dashboardUpdateInterval = setInterval(async () => {
    try {
      const stats = await getAdminDashboardStats();
      
      // Send to all connected admins
      for (const [adminId, connection] of adminConnections.entries()) {
        if (connection.readyState === WebSocket.OPEN) {
          connection.send(JSON.stringify({
            type: 'admin_dashboard_update',
            data: stats
          }));
        }
      }
    } catch (error) {
      console.error('Error sending admin dashboard updates:', error);
    }
  }, 30000); // Update every 30 seconds
  
  // Clean up interval on server shutdown
  process.on('SIGINT', () => {
    clearInterval(dashboardUpdateInterval);
    process.exit();
  });
  
  console.log('Admin analytics service initialized');
  return { adminConnections };
}

// Get real-time admin dashboard stats
async function getAdminDashboardStats() {
  try {
    // Get current date with time set to start of day
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Get yesterday with time set to start of day
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    // Get start of this week (Sunday)
    const startOfWeek = new Date(today);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    
    // Get start of last week
    const startOfLastWeek = new Date(startOfWeek);
    startOfLastWeek.setDate(startOfLastWeek.getDate() - 7);
    
    // Get start of this month
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    
    // Get recent orders
    const recentOrders = await prisma.order.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phoneNumber: true
          }
        },
        address: true,
        orderItems: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                imageUrl: true
              }
            }
          }
        }
      }
    });
    
    // Get order counts by status
    const orderStatuses = await prisma.order.groupBy({
      by: ['status'],
      _count: true
    });
    
    // Build status counts object
    const statusCounts = {
      total: 0,
      pending: 0,
      processing: 0,
      ready_for_pickup: 0,
      out_for_delivery: 0,
      delivered: 0,
      cancelled: 0
    };
    
    orderStatuses.forEach(status => {
      statusCounts[status.status] = status._count;
      statusCounts.total += status._count;
    });
    
    // Get today's orders
    const todayOrders = await prisma.order.count({
      where: {
        createdAt: {
          gte: today
        }
      }
    });
    
    // Get yesterday's orders
    const yesterdayOrders = await prisma.order.count({
      where: {
        createdAt: {
          gte: yesterday,
          lt: today
        }
      }
    });
    
    // Get current revenue metrics
    const revenue = await prisma.order.aggregate({
      _sum: {
        totalAmount: true
      },
      where: {
        status: {
          not: 'cancelled'
        }
      }
    });
    
    // Get today's revenue
    const todayRevenue = await prisma.order.aggregate({
      _sum: {
        totalAmount: true
      },
      where: {
        createdAt: {
          gte: today
        },
        status: {
          not: 'cancelled'
        }
      }
    });
    
    // Get user metrics
    const userCount = await prisma.user.count();
    const newUsersToday = await prisma.user.count({
      where: {
        createdAt: {
          gte: today
        }
      }
    });
    
    // Get product metrics
    const productCount = await prisma.product.count();
    const lowStockProducts = await prisma.product.count({
      where: {
        stock: {
          lt: 10
        }
      }
    });
    
    // Calculate growth rates
    const orderGrowth = yesterdayOrders > 0 
      ? ((todayOrders - yesterdayOrders) / yesterdayOrders) * 100 
      : 0;
    
    return {
      orderStats: statusCounts,
      recentOrders,
      revenue: revenue._sum.totalAmount || 0,
      todayRevenue: todayRevenue._sum.totalAmount || 0,
      todayOrders,
      orderGrowth,
      userCount,
      newUsersToday,
      productCount,
      lowStockProducts,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error getting admin dashboard stats:', error);
    return {
      orderStats: { total: 0, pending: 0, processing: 0, ready_for_pickup: 0, out_for_delivery: 0, delivered: 0, cancelled: 0 },
      recentOrders: [],
      revenue: 0,
      todayRevenue: 0,
      todayOrders: 0,
      orderGrowth: 0,
      userCount: 0,
      newUsersToday: 0,
      productCount: 0,
      lowStockProducts: 0,
      timestamp: new Date().toISOString()
    };
  }
}

// Register an admin connection
function registerAdminConnection(userId, connection) {
  adminConnections.set(userId, connection);
  
  // Send initial dashboard stats
  getAdminDashboardStats().then(stats => {
    if (connection.readyState === WebSocket.OPEN) {
      connection.send(JSON.stringify({
        type: 'admin_dashboard_update',
        data: stats
      }));
    }
  }).catch(error => {
    console.error('Error sending initial admin stats:', error);
  });
}

// Remove an admin connection
function removeAdminConnection(userId) {
  adminConnections.delete(userId);
}

// Send notification to all admin connections
function notifyAllAdmins(notification) {
  for (const [adminId, connection] of adminConnections.entries()) {
    if (connection.readyState === WebSocket.OPEN) {
      connection.send(JSON.stringify({
        type: 'notification',
        data: notification
      }));
    }
  }
}

module.exports = {
  initializeAdminAnalytics,
  registerAdminConnection,
  removeAdminConnection,
  notifyAllAdmins,
  getAdminDashboardStats
};
