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

// GET - Retrieve a specific trusted badge by ID from server
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const response = await fetchFromServer(`/trusted-badges/${params.id}`);
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error fetching trusted badge:', error);
    return NextResponse.json(
      { error: 'Failed to fetch trusted badge', details: error.message },
      { status: 500 }
    );
  }
}

// PUT - Update an existing trusted badge on server
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    
    const response = await fetchFromServer(`/trusted-badges/${params.id}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error updating trusted badge:', error);
    return NextResponse.json(
      { error: 'Failed to update trusted badge', details: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Remove a trusted badge from server
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const response = await fetchFromServer(`/trusted-badges/${params.id}`, {
      method: 'DELETE',
    });
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error deleting trusted badge:', error);
    return NextResponse.json(
      { error: 'Failed to delete trusted badge', details: error.message },
      { status: 500 }
    );
  }
}
