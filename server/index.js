const express = require('express');
const path = require('path');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const http = require('http');
const { initializeWebSocketServer } = require('./services/websocketService');

// Import routes
const productRoutes = require('./routes/products');
const categoryRoutes = require('./routes/categories');
const trustedBadgeRoutes = require('./routes/trustedBadges');
const featuredFishRoutes = require('./routes/featuredFish');
const uploadRoutes = require('./routes/upload');
const mediaRoutes = require('./routes/media');
const settingsRoutes = require('./routes/settings');
const authRoutes = require('./routes/auth');
const statusRoutes = require('./routes/status');
const orderRoutes = require('./routes/orders');
const userActivityRoutes = require('./routes/user-activity');
const dashboardRoutes = require('./routes/dashboard');
const userRoutes = require('./routes/users');
const contentRoutes = require('./routes/content');
const analyticsRoutes = require('./routes/analytics');

const prisma = new PrismaClient();
const app = express();

// Enable CORS for all routes
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Use the routes
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/trusted-badges', trustedBadgeRoutes);
app.use('/api/featured-fish', featuredFishRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/status', statusRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/user-activity', userActivityRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/users', userRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/analytics', analyticsRoutes);

// Create or get test users
app.get('/api/setup-test-users', async (req, res) => {
  try {
    // Hash passwords
    const adminPassword = await bcrypt.hash('password123', 10);
    const customerPassword = await bcrypt.hash('customer123', 10);
    
    // Create test admin user if not exists
    let adminUser = await prisma.user.findUnique({
      where: { email: 'admin@example.com' }
    });
    
    if (!adminUser) {
      adminUser = await prisma.user.create({
        data: {
          name: 'Admin User',
          email: 'admin@example.com',
          phoneNumber: '9876543211',
          password: adminPassword,
          role: 'admin',
          loyaltyPoints: 0,
          loyaltyTier: 'Bronze'
        }
      });
    }
    
    // Create test customer user if not exists
    let customerUser = await prisma.user.findUnique({
      where: { email: 'customer@example.com' }
    });
      if (!customerUser) {      customerUser = await prisma.user.create({
        data: {
          name: 'Test Customer',
          email: 'customer@example.com',
          phoneNumber: '9876543212',
          password: customerPassword, // Use properly hashed password
          role: 'customer',
          loyaltyPoints: 350,
          loyaltyTier: 'Bronze'
        }
      });
    }
    
    res.json({
      message: 'Test users created successfully',
      adminId: adminUser.id,
      customerId: customerUser.id
    });
  } catch (error) {
    console.error('Error setting up test users:', error);
    res.status(500).json({ error: 'Failed to setup test users' });
  }
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error:', err);
  res.status(500).json({ message: 'Server error', error: err.message });
});

const PORT = process.env.PORT || 5001;

// Create HTTP server
const server = http.createServer(app);

// Initialize WebSocket server
initializeWebSocketServer(server);

server.listen(PORT, () => {
  console.log(`HTTP Server running on port ${PORT}`);
  console.log(`WebSocket Server running on ws://localhost:${PORT}`);
});