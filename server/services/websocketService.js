const WebSocket = require('ws');
const url = require('url');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const jwt = require('jsonwebtoken');
const adminService = require('./adminWebSocketService');

// Store active connections
let activeConnections = {
  // userId: WebSocket
};

// Store admin connections
let adminConnections = [];

// Initialize WebSocket server
function initializeWebSocketServer(server) {
  const wss = new WebSocket.Server({ server });
  
  wss.on('connection', async (ws, req) => {
    try {
      const params = url.parse(req.url, true).query;
      const { token, orderId } = params;
      
      // Handle authentication
      if (!token) {
        ws.send(JSON.stringify({ type: 'error', message: 'Authentication required' }));
        ws.close();
        return;
      }
      
      // Verify token
      let userId;
      let isAdmin = false;
      
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        userId = decoded.userId;
        isAdmin = decoded.role === 'admin';
      } catch (error) {
        ws.send(JSON.stringify({ type: 'error', message: 'Invalid token' }));
        ws.close();
        return;
      }
      
      // Store connection info with the WebSocket
      ws.userId = userId;
      ws.isAdmin = isAdmin;
      
      if (orderId) {
        ws.orderId = orderId;
        
        // Verify this user is authorized to track this order (admins can track any order)
        if (!isAdmin) {
          const order = await prisma.order.findUnique({
            where: { id: orderId },
            select: { userId: true }
          });
          
          if (!order || order.userId !== userId) {
            ws.send(JSON.stringify({ type: 'error', message: 'Not authorized to track this order' }));
            ws.close();
            return;
          }
        }
        
        // Send initial order status
        const orderData = await getOrderTrackingData(orderId);
        ws.send(JSON.stringify({ 
          type: 'order_update',
          data: orderData
        }));
      }
        // Store the connection
      if (isAdmin) {
        adminConnections.push(ws);
        adminService.registerAdminConnection(userId, ws);
        
        // Send initial admin stats
        const stats = await getOrderStats();
        ws.send(JSON.stringify({
          type: 'admin_stats',
          data: stats
        }));
      } else {
        activeConnections[userId] = ws;
      }
      
      // Handle connection close
      ws.on('close', () => {
        if (isAdmin) {
          adminConnections = adminConnections.filter(conn => conn !== ws);
          adminService.removeAdminConnection(userId);
        } else {
          delete activeConnections[userId];
        }
      });
      
      // Handle messages from clients
      ws.on('message', async (message) => {
        try {
          const data = JSON.parse(message);
          
          if (data.type === 'ping') {
            ws.send(JSON.stringify({ type: 'pong' }));
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      });
      
      // Send welcome message
      ws.send(JSON.stringify({ 
        type: 'connected',
        userId,
        isAdmin
      }));
    } catch (error) {
      console.error('WebSocket connection error:', error);
      ws.close();
    }
  });
    console.log('WebSocket server initialized');
  
  // Initialize admin analytics service
  adminService.initializeAdminAnalytics(server, {
    broadcastOrderUpdate,
    sendNotification,
    broadcastNotification
  });
  
  return wss;
}

// Broadcast order update to relevant clients
async function broadcastOrderUpdate(orderId) {
  try {
    const orderData = await getOrderTrackingData(orderId);
    
    if (!orderData) return;
    
    // Get the user ID for this order
    const userId = orderData.order.userId;
    
    // Send to the customer if they're connected
    if (activeConnections[userId]) {
      activeConnections[userId].send(JSON.stringify({
        type: 'order_update',
        data: orderData
      }));
    }
    
    // Send to all admin connections
    adminConnections.forEach(conn => {
      conn.send(JSON.stringify({
        type: 'order_update',
        data: orderData
      }));
    });
    
    // Update admin stats for all admins
    const stats = await getOrderStats();
    adminConnections.forEach(conn => {
      conn.send(JSON.stringify({
        type: 'admin_stats',
        data: stats
      }));
    });
  } catch (error) {
    console.error('Error broadcasting order update:', error);
  }
}

// Send notification to a specific user
function sendNotification(userId, notification) {
  try {
    if (activeConnections[userId]) {
      activeConnections[userId].send(JSON.stringify({
        type: 'notification',
        data: notification
      }));
    }
  } catch (error) {
    console.error('Error sending notification:', error);
  }
}

// Send broadcast notification to all users or admins
function broadcastNotification(notification, adminOnly = false) {
  try {
    if (adminOnly) {
      // Send to all admin connections
      adminConnections.forEach(conn => {
        conn.send(JSON.stringify({
          type: 'notification',
          data: notification
        }));
      });
    } else {
      // Send to all connections
      Object.values(activeConnections).forEach(conn => {
        conn.send(JSON.stringify({
          type: 'notification',
          data: notification
        }));
      });
      
      adminConnections.forEach(conn => {
        conn.send(JSON.stringify({
          type: 'notification',
          data: notification
        }));
      });
    }
  } catch (error) {
    console.error('Error broadcasting notification:', error);
  }
}

// Get order tracking data
async function getOrderTrackingData(orderId) {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
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
                imageUrl: true,
                price: true,
                weight: true
              }
            }
          }
        },
        trackingHistory: {
          orderBy: {
            timestamp: 'desc'
          }
        }
      }
    });
    
    if (!order) return null;
    
    // Calculate estimated delivery time based on last status update
    const lastUpdate = order.trackingHistory[0];
    let estimatedDelivery = order.estimatedDelivery;
    let eta = 0;
    
    if (!estimatedDelivery) {
      // Default to 1 hour from now if no estimate exists
      estimatedDelivery = new Date(Date.now() + 60 * 60 * 1000).toISOString();
    }
    
    // Calculate ETA in minutes
    eta = Math.max(0, Math.floor((new Date(estimatedDelivery).getTime() - Date.now()) / (1000 * 60)));
    
    // Calculate progress percentage based on status
    const statusProgress = {
      'pending': 0,
      'processing': 25,
      'ready_for_pickup': 50,
      'out_for_delivery': 75,
      'delivered': 100,
      'cancelled': 0
    };
    
    const progressPercentage = statusProgress[order.status] || 0;
    
    // Format response for tracking UI
    return {
      order,
      tracking: {
        eta,
        progressPercentage,
        currentStatus: order.status,
        locationUpdates: order.trackingHistory.map(history => ({
          status: history.status,
          description: history.description,
          timestamp: history.timestamp,
          metadata: history.metadata ? JSON.parse(history.metadata) : null
        }))
      }
    };
  } catch (error) {
    console.error('Error getting order tracking data:', error);
    return null;
  }
}

// Get order statistics for admin dashboard
async function getOrderStats() {
  try {
    const total = await prisma.order.count();
    
    // Count by status
    const pending = await prisma.order.count({ where: { status: 'pending' } });
    const processing = await prisma.order.count({ where: { status: 'processing' } });
    const readyForPickup = await prisma.order.count({ where: { status: 'ready_for_pickup' } });
    const outForDelivery = await prisma.order.count({ where: { status: 'out_for_delivery' } });
    const delivered = await prisma.order.count({ where: { status: 'delivered' } });
    const cancelled = await prisma.order.count({ where: { status: 'cancelled' } });
    
    // Get recent orders
    const recentOrders = await prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });
    
    // Sum total revenue (from delivered orders)
    const revenueResult = await prisma.order.aggregate({
      where: { status: 'delivered' },
      _sum: { totalAmount: true }
    });
    const revenue = revenueResult._sum.totalAmount || 0;
    
    return {
      total,
      byStatus: {
        pending,
        processing,
        readyForPickup,
        outForDelivery,
        delivered,
        cancelled
      },
      recentOrders,
      revenue
    };
  } catch (error) {
    console.error('Error getting order stats:', error);
    return {
      total: 0,
      byStatus: {
        pending: 0,
        processing: 0,
        readyForPickup: 0,
        outForDelivery: 0,
        delivered: 0,
        cancelled: 0
      },
      recentOrders: [],
      revenue: 0
    };
  }
}

module.exports = {
  initializeWebSocketServer,
  broadcastOrderUpdate,
  sendNotification,
  broadcastNotification
};
