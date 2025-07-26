import { NextResponse } from 'next/server';

const SERVER_API_URL = 'http://localhost:5001/api';

// Helper function to handle server API requests
async function fetchFromServer(endpoint: string, options?: RequestInit) {
  try {
    const response = await fetch(`${SERVER_API_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer admin-test-token',
        // Add any auth headers if needed
        ...options?.headers,
      },
    });
    
    if (!response.ok) {
      throw new Error(`Server responded with ${response.status}: ${response.statusText}`);
    }
    
    return response;
  } catch (error) {
    console.error(`Error calling server API ${endpoint}:`, error);
    throw error;
  }
}

// GET - Retrieve all trusted badges from server
export async function GET() {
  try {
    const response = await fetchFromServer('/trusted-badges');
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error fetching trusted badges:', error);
    return NextResponse.json(
      { error: 'Failed to fetch trusted badges', details: error.message },
      { status: 500 }
    );
  }
}

// POST - Create a new trusted badge on server
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const response = await fetchFromServer('/trusted-badges', {
      method: 'POST',
      body: JSON.stringify(body),
    });
    
    const data = await response.json();
    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    console.error('Error creating trusted badge:', error);
    return NextResponse.json(
      { error: 'Failed to create trusted badge', details: error.message },
      { status: 500 }
    );
  }
}