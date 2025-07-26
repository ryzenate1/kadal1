import { NextResponse } from 'next/server';

// Use server API as primary source
const SERVER_API_URL = 'http://localhost:5001/api';

export async function GET() {
  try {
    // Fetch from server API first
    const response = await fetch(`${SERVER_API_URL}/products`, {
      cache: 'no-store'
    });
    
    if (!response.ok) {
      throw new Error(`Server API returned status: ${response.status}`);
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching products from server:', error);
    
    // Return empty array with error info for admin panel to handle
    return NextResponse.json({ 
      error: 'Failed to fetch products from server. Please ensure the server is running on port 5001.',
      data: []
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Forward the request to server API
    const response = await fetch(`${SERVER_API_URL}/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer admin-token' // Add auth header for server
      },
      body: JSON.stringify(body)
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Failed to create product' }));
      return NextResponse.json({ error: errorData.message }, { status: response.status });
    }
    
    const data = await response.json();
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}