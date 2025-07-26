const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { verifyToken } = require('../middleware/auth');

// Get all user activities with pagination
router.get('/', verifyToken, async (req, res) => {
  try {
    const { page = 1, limit = 20, userId, type, sortBy = 'createdAt', order = 'desc' } = req.query;
    
    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);
    
    // Build filters
    let where = {};
    if (userId) where.userId = userId;
    if (type) where.type = type;
    
    // Build sort options
    const orderBy = {};
    orderBy[sortBy] = order.toLowerCase();
      // Query activities
    const activities = await prisma.activityLog.findMany({
      skip,
      take,
      where,
      orderBy,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });
    
    // Get total count for pagination
    const total = await prisma.activityLog.count({ where });
    
    res.json({
      data: activities,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching user activities:', error);
    res.status(500).json({ error: 'Failed to fetch user activities', details: error.message });
  }
});

// Get activity by ID
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const activity = await prisma.activityLog.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });
    
    if (!activity) {
      return res.status(404).json({ error: 'Activity not found' });
    }
    
    res.json(activity);
  } catch (error) {
    console.error('Error fetching activity:', error);
    res.status(500).json({ error: 'Failed to fetch activity', details: error.message });
  }
});

// Create new activity record
router.post('/', verifyToken, async (req, res) => {
  try {
    const { userId, type, description, metadata } = req.body;
    
    // Validate required fields
    if (!userId || !type || !description) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Create activity
    const activity = await prisma.activityLog.create({
      data: {
        userId,
        type,
        description,
        metadata
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });
    
    res.status(201).json(activity);
  } catch (error) {
    console.error('Error creating activity:', error);
    res.status(500).json({ error: 'Failed to create activity', details: error.message });
  }
});

// Get user activities summary
router.get('/stats/summary', verifyToken, async (req, res) => {
  try {
    const total = await prisma.activityLog.count();
    
    // Count by type
    const loginCount = await prisma.activityLog.count({ where: { type: 'LOGIN' } });
    const orderCount = await prisma.activityLog.count({ where: { type: 'ORDER' } });
    const profileUpdateCount = await prisma.activityLog.count({ where: { type: 'PROFILE_UPDATE' } });
    
    // Recent activities in last 24 hours
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    
    const recentActivities = await prisma.activityLog.count({
      where: {
        createdAt: {
          gte: oneDayAgo
        }
      }
    });
    
    res.json({
      total,
      byType: {
        login: loginCount,
        order: orderCount,
        profileUpdate: profileUpdateCount
      },
      recentActivities
    });
  } catch (error) {
    console.error('Error fetching activity statistics:', error);
    res.status(500).json({ error: 'Failed to fetch activity statistics', details: error.message });
  }
});

module.exports = router;
