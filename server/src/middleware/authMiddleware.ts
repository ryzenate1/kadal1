import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../index';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: string;
      };
    }
  }
}

// Middleware to authenticate users
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authorization token required' });
    }
    
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'Authorization token required' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
      id: string;
      role: string;
    };
    
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, role: true }
    });
    
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    
    // Add user to request object
    req.user = {
      id: user.id,
      role: user.role
    };
    
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({ message: 'Not authorized' });
  }
};

// Middleware to check if user is an admin
export const isAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // First authenticate the user
    authenticate(req, res, () => {
      // Check if the user has admin role
      if (req.user?.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
      }
      
      next();
    });
  } catch (error) {
    console.error('Admin authorization error:', error);
    res.status(403).json({ message: 'Not authorized as an admin' });
  }
};

// Middleware to check if user is a customer or admin
export const isCustomerOrAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // First authenticate the user
    authenticate(req, res, () => {
      // Check if the user has customer or admin role
      if (req.user?.role !== 'customer' && req.user?.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied. Insufficient privileges.' });
      }
      
      next();
    });
  } catch (error) {
    console.error('Authorization error:', error);
    res.status(403).json({ message: 'Not authorized' });
  }
}; 