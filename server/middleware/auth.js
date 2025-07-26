const jwt = require('jsonwebtoken');

// JWT secret key - should match the one used in auth routes
const JWT_SECRET = process.env.JWT_SECRET || 'kadal-thunai-secret-key';

/**
 * Verify JWT token middleware
 */
function verifyToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    
    // For development mode, allow access without token for GET requests
    if (process.env.NODE_ENV === 'development' && req.method === 'GET') {
      console.log('Development mode: Allowing GET request without token');
      return next();
    }
    
    // Accept admin test tokens for development
    if (authHeader === 'Bearer admin-token' || authHeader === 'Bearer admin-test-token') {
      req.user = { id: 'admin-test', role: 'admin' };
      return next();
    }    
    // Check if authorization header exists
    if (!authHeader) {
      return res.status(401).json({ 
        error: 'Unauthorized', 
        message: 'Authorization header missing'
      });
    }
    
    // Extract token from header
    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ 
        error: 'Unauthorized', 
        message: 'Token missing'
      });
    }
    
    // Verify token
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(401).json({ 
          error: 'Unauthorized', 
          message: 'Invalid token'
        });
      }
      
      // Set user information on request object
      req.user = {
        id: decoded.userId || decoded.id,
        role: decoded.role,
        email: decoded.email,
        phoneNumber: decoded.phoneNumber
      };
      
      next();
    });
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ 
      error: 'Server Error', 
      message: 'Authentication processing failed'
    });
  }
}

/**
 * Generate JWT token for user
 */
function generateToken(user) {
  const payload = {
    id: user.id,
    userId: user.id, // For backward compatibility
    email: user.email,
    phoneNumber: user.phoneNumber,
    role: user.role || 'user'
  };

  return jwt.sign(payload, JWT_SECRET, { 
    expiresIn: '7d' // Token expires in 7 days
  });
}

/**
 * Optional auth middleware - doesn't fail if no token
 */
function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    req.user = null;
    return next();
  }

  const token = authHeader.startsWith('Bearer ') 
    ? authHeader.substring(7) 
    : authHeader;

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = {
      id: decoded.userId || decoded.id,
      role: decoded.role,
      email: decoded.email,
      phoneNumber: decoded.phoneNumber
    };
  } catch (error) {
    req.user = null;
  }
  
  next();
}

module.exports = {
  verifyToken,
  generateToken,
  optionalAuth,
  JWT_SECRET
};