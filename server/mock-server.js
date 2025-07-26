// Minimal mock server for testing API fallback without database
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const http = require('http');
const { v4: uuidv4 } = require('uuid');

const app = express();
const port = process.env.PORT || 5002;

// In-memory storage for test data
const mockDB = {
  orders: new Map(),
  trackingHistory: new Map()
};

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Auth middleware
const auth = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    // Log token info for debugging
    console.log('Token received:', token.substring(0, 20) + '...');
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      console.log('Token decoded successfully:', decoded);
      req.user = decoded;
      next();
    } catch (error) {
      console.error('Token verification error:', error);
      res.status(401).json({ message: 'Invalid token', error: error.message });
    }
  } catch (error) {
    console.error('Auth error:', error);
    res.status(401).json({ message: 'Authentication failed', error: error.message });
  }
};

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Mock Order tracking API is running' });
});

// Create order
app.post('/api/orders', auth, async (req, res) => {
  try {
    const { addressId, paymentMethod, totalAmount, items } = req.body;
    const userId = req.user.userId;
    
    // Validate input
    if (!paymentMethod || !totalAmount || !items || !items.length) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Create mock order
    const orderId = uuidv4();
    const order = {
      id: orderId,
      userId,
      addressId: addressId || 'default-address',
      status: 'pending',
      totalAmount,
      paymentStatus: 'pending',
      paymentMethod,
      trackingNumber: `TRK${Math.floor(Math.random() * 1000000)}`,
      estimatedDelivery: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      eta: 60,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Store in mock DB
    mockDB.orders.set(orderId, order);
    
    // Create initial tracking history
    const trackingId = uuidv4();
    const tracking = {
      id: trackingId,
      orderId,
      status: 'pending',
      description: 'Order received',
      timestamp: new Date().toISOString(),
      metadata: null
    };
    
    // Store tracking
    if (!mockDB.trackingHistory.has(orderId)) {
      mockDB.trackingHistory.set(orderId, []);
    }
    mockDB.trackingHistory.get(orderId).push(tracking);
    
    console.log('Created order:', orderId);
    res.status(201).json(order);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Failed to create order', details: error.message });
  }
});

// Get order tracking
app.get('/api/orders/:id/tracking', auth, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get order from mock DB
    const order = mockDB.orders.get(id);
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    // Get tracking history
    const trackingHistory = mockDB.trackingHistory.get(id) || [];
    
    // Calculate estimated delivery time based on last status update
    const lastUpdate = trackingHistory[0];
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
    const response = {
      order: {
        ...order,
        trackingHistory
      },
      tracking: {
        eta,
        progressPercentage,
        currentStatus: order.status,
        locationUpdates: trackingHistory.map(history => ({
          status: history.status,
          description: history.description,
          timestamp: history.timestamp,
          metadata: history.metadata ? JSON.parse(history.metadata) : {}
        }))
      }
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error getting order tracking:', error);
    res.status(500).json({ error: 'Failed to get order tracking', details: error.message });
  }
});

// Update order status
app.put('/api/orders/:id/status', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, description } = req.body;
    
    // Check authorization - only admins can update status
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to update order status' });
    }
    
    // Validate status
    const validStatuses = ['pending', 'processing', 'ready_for_pickup', 'out_for_delivery', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    
    // Get and update order
    const order = mockDB.orders.get(id);
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    // Update order status
    order.status = status;
    order.updatedAt = new Date().toISOString();
    
    // Add tracking history
    const trackingId = uuidv4();
    const tracking = {
      id: trackingId,
      orderId: id,
      status,
      description: description || `Order status updated to ${status}`,
      timestamp: new Date().toISOString(),
      metadata: null
    };
    
    // Store tracking
    if (!mockDB.trackingHistory.has(id)) {
      mockDB.trackingHistory.set(id, []);
    }
    mockDB.trackingHistory.get(id).unshift(tracking); // Add to beginning of array
    
    console.log('Updated order status:', id, status);
    res.json({ order, trackingEntry: tracking });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ error: 'Failed to update order status', details: error.message });
  }
});

// Add tracking update
app.post('/api/orders/:id/tracking', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, description, metadata } = req.body;
    
    // Check authorization - only admins can add tracking updates
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to update tracking' });
    }
    
    // Get order
    const order = mockDB.orders.get(id);
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    // Create tracking history entry
    const trackingId = uuidv4();
    const tracking = {
      id: trackingId,
      orderId: id,
      status,
      description,
      timestamp: new Date().toISOString(),
      metadata
    };
    
    // Store tracking
    if (!mockDB.trackingHistory.has(id)) {
      mockDB.trackingHistory.set(id, []);
    }
    mockDB.trackingHistory.get(id).unshift(tracking); // Add to beginning of array
    
    console.log('Added tracking update:', id, status);
    res.status(201).json(tracking);
  } catch (error) {
    console.error('Error adding tracking update:', error);
    res.status(500).json({ error: 'Failed to add tracking update', details: error.message });
  }
});

// Start server
const server = http.createServer(app);

server.listen(port, () => {
  console.log(`Mock server running on port ${port}`);
});
