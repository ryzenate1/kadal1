import { NextResponse } from 'next/server';

// Base API URL
const SERVER_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

// Get all shipping methods
export async function GET(request: Request) {
  try {
    const token = request.headers.get('Authorization');
    const url = new URL(request.url);
    const searchParams = url.searchParams;
    
    let queryString = '';
    if (searchParams.toString()) {
      queryString = '?' + searchParams.toString();
    }
    
    const response = await fetch(`${SERVER_API_URL}/shipping${queryString}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': token })
      }
    });
    
    if (!response.ok) {
      return NextResponse.json(
        { message: 'Failed to fetch shipping methods' }, 
        { status: response.status }
      );
    }
    
    const data = await response.json();
    return NextResponse.json(data);
    
  } catch (error: any) {
    console.error('Error fetching shipping methods:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Create new shipping method
export async function POST(request: Request) {
  try {
    const token = request.headers.get('Authorization');
    const body = await request.json();
    
    const response = await fetch(`${SERVER_API_URL}/shipping`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': token })
      },
      body: JSON.stringify(body)
    });
    
    if (!response.ok) {
      return NextResponse.json(
        { message: 'Failed to create shipping method' }, 
        { status: response.status }
      );
    }
    
    const data = await response.json();
    return NextResponse.json(data);
    
  } catch (error: any) {
    console.error('Error creating shipping method:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
