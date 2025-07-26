import { Request, Response } from 'express';
import { prisma } from '../index';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Register a new user
export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, phoneNumber, password } = req.body;

    // Validate input
    if (!name || !email || !phoneNumber || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { phoneNumber }
        ]
      }
    });

    if (existingUser) {
      return res.status(400).json({ 
        message: 'User with this email or phone number already exists' 
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        phoneNumber,
        password: hashedPassword,
        role: 'customer'
      }
    });

    // Create token
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: '30d' }
    );

    // Return user data (excluding password)
    res.status(201).json({
      id: user.id,
      name: user.name,
      email: user.email,
      phoneNumber: user.phoneNumber,
      role: user.role,
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Login user
export const login = async (req: Request, res: Response) => {
  try {
    const { phoneNumber, password } = req.body;

    // Validate input
    if (!phoneNumber || !password) {
      return res.status(400).json({ message: 'Phone number and password are required' });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { phoneNumber },
      include: {
        addresses: {
          where: { isDefault: true },
          take: 1
        }
      }
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Create token
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: '30d' }
    );

    // Return user data (excluding password)
    res.status(200).json({
      id: user.id,
      name: user.name,
      email: user.email,
      phoneNumber: user.phoneNumber,
      role: user.role,
      defaultAddress: user.addresses[0] || null,
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Send OTP (in a real app, this would send an SMS)
export const sendOtp = async (req: Request, res: Response) => {
  try {
    const { phoneNumber } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({ message: 'Phone number is required' });
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { phoneNumber }
    });

    // Generate a random 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // In a real app, you would send an SMS with the OTP
    // For development, we'll just return it (NEVER do this in production)
    
    // Store OTP in database or cache (Redis would be ideal)
    // For simplicity, we're not implementing this part

    res.status(200).json({ 
      message: 'OTP sent successfully',
      otp, // Remove this in production!
      userExists: !!user
    });
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Verify OTP and login/register
export const verifyOtp = async (req: Request, res: Response) => {
  try {
    const { phoneNumber, otp, name, email } = req.body;

    if (!phoneNumber || !otp) {
      return res.status(400).json({ message: 'Phone number and OTP are required' });
    }

    // In a real app, you would verify the OTP against what was stored
    // For development, we'll assume it's correct if it's 6 digits
    if (otp.length !== 6 || !/^\d+$/.test(otp)) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    // Check if user exists
    let user = await prisma.user.findUnique({
      where: { phoneNumber },
      include: {
        addresses: {
          where: { isDefault: true },
          take: 1
        }
      }
    });

    // If user doesn't exist and we have name and email, create a new user
    if (!user && name && email) {
      // Generate a random password (user can set it later)
      const password = Math.random().toString(36).slice(-8);
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      user = await prisma.user.create({
        data: {
          name,
          email,
          phoneNumber,
          password: hashedPassword,
          role: 'customer'
        },
        include: {
          addresses: {
            where: { isDefault: true },
            take: 1
          }
        }
      });
    } else if (!user) {
      return res.status(400).json({ 
        message: 'User not found. Please provide name and email to register.' 
      });
    }

    // Create token
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: '30d' }
    );

    // Return user data
    res.status(200).json({
      id: user.id,
      name: user.name,
      email: user.email,
      phoneNumber: user.phoneNumber,
      role: user.role,
      defaultAddress: user.addresses[0] || null,
      token
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
