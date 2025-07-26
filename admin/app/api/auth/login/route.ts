import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

// For API routes in the admin panel to verify tokens with the server

// Base API URL - use environment variable or default to localhost
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

// Handler for login
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { phoneNumber, password } = body;
    
    if (!phoneNumber || !password) {
      return NextResponse.json(
        { message: 'Phone number and password are required' },
        { status: 400 }
      );
    }
    
    // Forward request to the backend server
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ phoneNumber, password }),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      return NextResponse.json(
        { message: data.message || 'Authentication failed' },
        { status: response.status }
      );
    }
    
    // Check if user is admin
    if (data.user && data.user.role !== 'admin') {
      return NextResponse.json(
        { message: 'Unauthorized: Admin access required' },
        { status: 403 }
      );
    }
    
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
