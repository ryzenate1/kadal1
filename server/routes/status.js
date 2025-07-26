const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Status check endpoint with detailed information
router.get('/', async (req, res) => {
  try {
    // Check database connection
    const dbStatus = await checkDatabaseConnection();
    
    // Check service health
    const servicesStatus = {
      products: await checkProductsService(),
      orders: await checkOrdersService(),
      users: await checkUsersService(),
      media: await checkMediaService()
    };
    
    // Return comprehensive status
    res.json({
      status: 'ok',
      message: 'API server is online',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      database: dbStatus,
      services: servicesStatus,
      uptime: process.uptime()
    });
  } catch (error) {
    console.error('Status check error:', error);
    res.status(500).json({ 
      status: 'error',
      message: 'Error checking system status',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Check database connection
async function checkDatabaseConnection() {
  try {
    // Simple query to test database connection
    await prisma.$queryRaw`SELECT 1`;
    return { connected: true };
  } catch (error) {
    console.error('Database connection error:', error);
    return { 
      connected: false,
      error: process.env.NODE_ENV === 'development' ? error.message : 'Database connection failed'
    };
  }
}

// Check products service
async function checkProductsService() {
  try {
    // Count products to check service
    const count = await prisma.product.count();
    return { status: 'ok', count };
  } catch (error) {
    return { status: 'error', message: 'Products service check failed' };
  }
}

// Check orders service
async function checkOrdersService() {
  try {
    // Count orders to check service if orders table exists
    try {
      const count = await prisma.order.count();
      return { status: 'ok', count };
    } catch (e) {
      return { status: 'unavailable', message: 'Orders service not configured' };
    }
  } catch (error) {
    return { status: 'error', message: 'Orders service check failed' };
  }
}

// Check users service
async function checkUsersService() {
  try {
    // Count users to check service if users table exists
    try {
      const count = await prisma.user.count();
      return { status: 'ok', count };
    } catch (e) {
      return { status: 'unavailable', message: 'Users service not configured' };
    }
  } catch (error) {
    return { status: 'error', message: 'Users service check failed' };
  }
}

// Check media service
async function checkMediaService() {
  try {
    // Here you would check your media service
    // For simplicity, we'll just check if the uploads directory is accessible
    const fs = require('fs');
    const path = require('path');
    const uploadsPath = path.join(__dirname, '..', 'uploads');
    
    if (fs.existsSync(uploadsPath)) {
      return { status: 'ok', path: uploadsPath };
    } else {
      return { status: 'warning', message: 'Uploads directory not found' };
    }
  } catch (error) {
    return { status: 'error', message: 'Media service check failed' };
  }
}

module.exports = router;
