const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || ['http://localhost:3000', 'http://localhost:5001'],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// API Routes
app.use('/api/products', require('../routes/products'));
app.use('/api/categories', require('../routes/categories'));
app.use('/api/cards', require('../routes/cards'));
app.use('/api/trustedBadges', require('../routes/trustedBadges'));
app.use('/api/featuredFish', require('../routes/featuredFish'));
app.use('/api/upload', require('../routes/upload'));
app.use('/api/auth', require('../routes/auth'));
app.use('/api/orders', require('../routes/orders'));
app.use('/api/users', require('../routes/users'));
app.use('/api/user-activity', require('../routes/user-activity'));
app.use('/api/blog', require('../routes/blog'));
app.use('/api/content', require('../routes/content'));
app.use('/api/analytics', require('../routes/analytics'));
app.use('/api/settings', require('../routes/settings'));
app.use('/api/media', require('../routes/media'));
app.use('/api/status', require('../routes/status'));

// Health check
app.use('/health', require('../routes/health'));

// Direct health check endpoint 
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// For Vercel serverless functions
module.exports = app;

// For local development
if (require.main === module) {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
  });
}

