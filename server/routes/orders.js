const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { verifyToken } = require('../middleware/auth');
const orderController = require('../controllers/orderController');

// Get all orders with pagination and filters
router.get('/', verifyToken, async (req, res) => {
  try {
    const { page = 1, limit = 10, status, userId, sortBy = 'createdAt', order = 'desc' } = req.query;
    
    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);
    
    // Build filters
    const where = {};
    if (status) where.status = status;
    if (userId) where.userId = userId;
    
    // Build sort options
    const orderBy = {};
    orderBy[sortBy] = order.toLowerCase();
    
    // Query orders with included relationships
    const orders = await prisma.order.findMany({
      skip,
      take,
      where,
      orderBy,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phoneNumber: true,
          }
        },
        items: {
          include: {
            product: true
          }
        }
      }
    });
    
    // Get total count for pagination
    const total = await prisma.order.count({ where });
    
    res.json({
      data: orders,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders', details: error.message });
  }
});

// Get single order by ID
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phoneNumber: true,
            address: true
          }
        },
        items: {
          include: {
            product: true
          }
        }
      }
    });
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    res.json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ error: 'Failed to fetch order', details: error.message });
  }
});

// Create new order
router.post('/', async (req, res) => {
  try {
    const { userId, items, shippingAddress, paymentMethod, totalAmount, status = 'pending', deliverySlot } = req.body;
    
    // Validate required fields
    if (!items || !shippingAddress || !paymentMethod || !totalAmount) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Generate unique order ID and tracking number
    const orderId = `ORD-${Date.now()}${Math.floor(Math.random() * 1000)}`;
    const trackingNumber = `TRK${Date.now()}${Math.floor(Math.random() * 10000)}`;
    
    // Create order data
    const orderData = {
      id: orderId,
      userId: userId || 'guest',
      shippingAddress: JSON.stringify(shippingAddress),
      paymentMethod,
      totalAmount: parseFloat(totalAmount),
      status,
      deliverySlot: deliverySlot || null,
      trackingNumber,
      createdAt: new Date(),
      updatedAt: new Date(),
      estimatedDelivery: new Date(Date.now() + 60 * 60 * 1000), // 1 hour from now
      items: items.map(item => ({
        id: item.id || item.productId,
        name: item.name,
        quantity: item.quantity,
        price: parseFloat(item.price),
        image: item.image
      }))
    };
    
    // In a real app, you would save this to the database
    // For now, we'll just return the order data
    
    res.status(201).json(orderData);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Failed to create order', details: error.message });
  }
});

// Update order status
router.patch('/:id/status', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }
    
    // Validate status value
    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }
    
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { status },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phoneNumber: true
          }
        }
      }
    });
    
    res.json(updatedOrder);
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ error: 'Failed to update order status', details: error.message });
  }
});

// Update order details
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { shippingAddress, paymentMethod, status } = req.body;
    
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        shippingAddress,
        paymentMethod,
        status
      }
    });
    
    res.json(updatedOrder);
  } catch (error) {
    console.error('Error updating order:', error);
    res.status(500).json({ error: 'Failed to update order', details: error.message });
  }
});

// Delete order (soft delete in production)
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // In production, consider soft delete instead
    await prisma.order.delete({
      where: { id }
    });
    
    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    console.error('Error deleting order:', error);
    res.status(500).json({ error: 'Failed to delete order', details: error.message });
  }
});

// Get order statistics
router.get('/stats/summary', verifyToken, async (req, res) => {
  try {
    const total = await prisma.order.count();
    
    // Count by status
    const pending = await prisma.order.count({ where: { status: 'pending' } });
    const processing = await prisma.order.count({ where: { status: 'processing' } });
    const shipped = await prisma.order.count({ where: { status: 'shipped' } });
    const delivered = await prisma.order.count({ where: { status: 'delivered' } });
    const cancelled = await prisma.order.count({ where: { status: 'cancelled' } });
    
    // Sum total revenue (from delivered orders)
    const revenueResult = await prisma.order.aggregate({
      where: { status: 'delivered' },
      _sum: { totalAmount: true }
    });
    const revenue = revenueResult._sum.totalAmount || 0;
    
    res.json({
      total,
      byStatus: {
        pending,
        processing,
        shipped,
        delivered,
        cancelled
      },
      revenue
    });
  } catch (error) {
    console.error('Error fetching order statistics:', error);
    res.status(500).json({ error: 'Failed to fetch order statistics', details: error.message });
  }
});

// Get order tracking - simplified for demo purposes
router.get('/:id/tracking', async (req, res) => {
  try {
    const { id } = req.params;
    
    // For demo purposes, return mock tracking data
    // In production, you would fetch from database
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
  } catch (error) {
    console.error('Error getting order tracking:', error);
    res.status(500).json({ error: 'Failed to get order tracking', details: error.message });
  }
});

// Add tracking history/update for an order
router.post('/:id/tracking', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, description, location } = req.body;
    
    // Check if order exists
    const order = await prisma.order.findUnique({
      where: { id }
    });
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    // Check authorization - only admins can add tracking updates
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to update tracking' });
    }
    
    // Create tracking history entry
    const trackingEntry = await prisma.trackingHistory.create({
      data: {
        orderId: id,
        status,
        description,
        metadata: location ? JSON.stringify(location) : null
      }
    });
    
    // Update order status if provided
    if (status) {
      await prisma.order.update({
        where: { id },
        data: { status }
      });
    }
    
    // Create notification for the user
    await prisma.notification.create({
      data: {
        userId: order.userId,
        title: `Order Update: ${getStatusDisplayName(status)}`,
        message: description || `Your order status has been updated to ${getStatusDisplayName(status)}.`,
        type: 'order',
        resourceType: 'order',
        resourceId: id
      }
    });
    
    res.status(201).json(trackingEntry);
  } catch (error) {
    console.error('Error adding tracking update:', error);
    res.status(500).json({ error: 'Failed to add tracking update', details: error.message });
  }
});

module.exports = router;

// Helper function to get display name for status
function getStatusDisplayName(status) {
  const displayNames = {
    'pending': 'Pending',
    'processing': 'Processing',
    'ready_for_pickup': 'Ready for Pickup',
    'out_for_delivery': 'Out for Delivery',
    'delivered': 'Delivered',
    'cancelled': 'Cancelled'
  };
  
  return displayNames[status] || status;
}
