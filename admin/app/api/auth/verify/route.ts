import { NextResponse } from 'next/server';

// Base API URL - use environment variable or default to localhost
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

// Handler for token verification
export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader) {
      return NextResponse.json(
        { message: 'Authorization header missing' },
        { status: 401 }
      );
    }
    
    // Forward request to the backend server
    const response = await fetch(`${API_URL}/auth/verify`, {
      method: 'GET',
      headers: {
        Authorization: authHeader,
      },
    });
    
    if (!response.ok) {
      return NextResponse.json(
        { message: 'Token verification failed' },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Token verification error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
