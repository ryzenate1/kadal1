const express = require('express');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { generateToken, JWT_SECRET } = require('../middleware/auth');
const router = express.Router();
const prisma = new PrismaClient();

// Login route
router.post('/login', async (req, res) => {
  try {
    const { phoneNumber, password } = req.body;
    
    console.log('=== LOGIN ATTEMPT ===');
    console.log('Phone Number:', phoneNumber);
    console.log('Password:', password);
    
    if (!phoneNumber || !password) {
      console.log('Missing phone number or password');
      return res.status(400).json({ message: 'Phone number and password are required' });
    }
    
    // Find user by phone number
    const user = await prisma.user.findUnique({
      where: { phoneNumber }
    });
    
    console.log('User found:', !!user);
    if (user) {
      console.log('User role:', user.role);
      console.log('User email:', user.email);
    }
    
    if (!user) {
      console.log('User not found for phone:', phoneNumber);
      return res.status(401).json({ message: 'Invalid phone number or password' });
    }
    
    // Check password
    const passwordValid = await bcrypt.compare(password, user.password);    console.log('Password valid:', passwordValid);
    
    if (!passwordValid) {
      console.log('Password does not match');
      return res.status(401).json({ message: 'Invalid phone number or password' });
    }
      // Create token using the centralized function
    const token = generateToken(user);
    
    // Log the login activity
    try {
      await prisma.activityLog.create({
        data: {
          userId: user.id,
          action: 'LOGIN',
          description: `User logged in from ${req.ip || 'unknown IP'}`,
          resourceType: 'AUTH',
          resourceId: user.id,
          metadata: JSON.stringify({
            userAgent: req.headers['user-agent'],
            ip: req.ip
          })
        }
      });
    } catch (logError) {
      console.error('Failed to log login activity:', logError);
    }
    
    // Don't send the password back
    const { password: _, ...userWithoutPassword } = user;
    
    console.log('Login successful for user:', user.email);
    
    res.json({
      message: 'Login successful',
      token,
      user: userWithoutPassword
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login', error: error.message });
  }
});

// Verify token route
router.get('/verify', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({ message: 'Authorization header missing' });
    }
    
    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Token missing' });
    }
      // Verify token
    jwt.verify(token, JWT_SECRET, async (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: 'Invalid token' });
      }
      
      // Check if decoded token has the required user information
      if (!decoded || (!decoded.userId && !decoded.id && !decoded.phoneNumber)) {
        return res.status(401).json({ message: 'Invalid token payload' });
      }
      
      // Find user - try multiple approaches based on token content
      let user;
      try {
        if (decoded.userId) {
          user = await prisma.user.findUnique({
            where: { id: decoded.userId }
          });
        } else if (decoded.id) {
          user = await prisma.user.findUnique({
            where: { id: decoded.id }
          });
        } else if (decoded.phoneNumber) {
          user = await prisma.user.findUnique({
            where: { phoneNumber: decoded.phoneNumber }
          });
        }
      } catch (dbError) {
        console.error('Database error during user lookup:', dbError);
        return res.status(500).json({ message: 'Database error' });
      }
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Don't send the password back
      const { password: _, ...userWithoutPassword } = user;
      
      res.json({
        message: 'Token is valid',
        user: userWithoutPassword
      });
    });
    
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(500).json({ message: 'Server error during verification', error: error.message });
  }
});

module.exports = router;
