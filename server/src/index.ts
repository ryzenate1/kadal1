import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import authRoutes from './routes/auth';
import userRoutes from './routes/user';
import productRoutes from './routes/product';
import orderRoutes from './routes/order';
import loyaltyRoutes from './routes/loyalty';
import categoryRoutes from './routes/category';
import uploadRoutes from './routes/uploadRoutes';
import trustedBadgeRoutes from './routes/trustedBadgeRoutes';
import featuredFishRoutes from './routes/featured-fish';
import fishPicksRoutes from './routes/fishPicksRoutes';
import blogPostsRoutes from './routes/blog-posts';
import contentRoutes from './routes/content';
import statusRoutes from './routes/status';
import usersRoutes from './routes/users';
import analyticsRoutes from './routes/analytics';
import settingsRoutes from './routes/settings';
import mediaRoutes from './routes/media';
import shippingRoutes from './routes/shipping';

// Load environment variables
dotenv.config();

// Initialize Prisma client
export const prisma = new PrismaClient();

// Create Express app
const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
// Add this near the top of the file
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:3000';
const ADMIN_ORIGIN = process.env.ADMIN_ORIGIN || 'http://localhost:3001';

// Update the CORS configuration
app.use(cors({
  origin: [CLIENT_ORIGIN, ADMIN_ORIGIN, '*'], // Allow specific origins + all in development
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, '../public')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/loyalty', loyaltyRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/trusted-badges', trustedBadgeRoutes);
app.use('/api/featured-fish', featuredFishRoutes);
app.use('/api/fish-picks', fishPicksRoutes);
app.use('/api/blog-posts', blogPostsRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/status', statusRoutes);
app.use('/api/admin/users', usersRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/shipping', shippingRoutes);

// Create or get test users endpoint
app.get('/api/setup-test-users', async (req, res) => {
  try {
    const bcrypt = require('bcryptjs');
    
    // Hash passwords
    const adminPassword = await bcrypt.hash('admin123', 10);
    const customerPassword = await bcrypt.hash('customer123', 10);
    
    // Create or update test admin user
    let adminUser = await prisma.user.upsert({
      where: { phoneNumber: '9876543210' },
      update: {
        password: adminPassword,
        role: 'admin'
      },
      create: {
        name: 'Kadal Thunai Admin',
        email: 'admin@kadalthunai.com',
        phoneNumber: '9876543210',
        password: adminPassword,
        role: 'admin',
        loyaltyPoints: 1250,
        loyaltyTier: 'Gold'
      }
    });
    
    // Create or update test customer user
    let customerUser = await prisma.user.upsert({
      where: { phoneNumber: '9876543211' },
      update: {
        password: customerPassword,
        role: 'customer'
      },
      create: {
        name: 'Test Customer',
        email: 'customer@example.com',
        phoneNumber: '9876543211',
        password: customerPassword,
        role: 'customer',
        loyaltyPoints: 350,
        loyaltyTier: 'Bronze'
      }
    });
    
    res.json({
      message: 'Test users created/updated successfully',
      adminId: adminUser.id,
      customerId: customerUser.id,
      adminCredentials: {
        phoneNumber: '9876543210',
        password: 'admin123',
        role: 'admin'
      },
      customerCredentials: {
        phoneNumber: '9876543211',
        password: 'customer123',
        role: 'customer'
      }
    });
  } catch (error: any) {
    console.error('Error setting up test users:', error);
    res.status(500).json({ 
      message: 'Error setting up test users', 
      error: error.message 
    });
  }
});

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Handle graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  console.log('Disconnected from database');
  process.exit(0);
});
