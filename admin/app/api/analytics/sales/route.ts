import { NextResponse } from 'next/server';

// Base API URL
const SERVER_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

// Get sales analytics
export async function GET(request: Request) {
  try {
    const token = request.headers.get('Authorization');
    const url = new URL(request.url);
    const searchParams = url.searchParams;
    
    let queryString = '';
    if (searchParams.toString()) {
      queryString = '?' + searchParams.toString();
    }
    
    const response = await fetch(`${SERVER_API_URL}/analytics/sales${queryString}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': token })
      }
    });
    
    if (!response.ok) {
      return NextResponse.json(
        { message: 'Failed to fetch sales analytics' }, 
        { status: response.status }
      );
    }
    
    const data = await response.json();
    return NextResponse.json(data);
    
  } catch (error: any) {
    console.error('Error fetching sales analytics:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
