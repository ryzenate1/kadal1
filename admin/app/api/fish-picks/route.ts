import { NextResponse } from 'next/server';

const ADMIN_API_URL = process.env.NEXT_PUBLIC_ADMIN_API_URL || 'http://localhost:5001/api';

export async function GET() {
  try {
    console.log('Admin API: Fetching fish picks from server');
    
    const response = await fetch(`${ADMIN_API_URL}/fish-picks?includeInactive=true`, {
      headers: {
        'Authorization': 'Bearer admin-test-token',
        'Content-Type': 'application/json'
      },
      cache: 'no-store'
    });

    if (!response.ok) {
      console.error('Server API error:', response.status, response.statusText);
      throw new Error(`Server API error: ${response.status}`);
    }

    const data = await response.json();
    console.log(`Successfully fetched ${Array.isArray(data) ? data.length : 0} fish picks`);
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching fish picks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch fish picks' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    console.log('Admin API: Creating new fish pick:', data);

    const response = await fetch(`${ADMIN_API_URL}/fish-picks`, {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer admin-test-token',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Server API error:', response.status, errorData);
      throw new Error(errorData.error || `Server API error: ${response.status}`);
    }

    const result = await response.json();
    console.log('Fish pick created successfully:', result.id);
    
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Error creating fish pick:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create fish pick' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const data = await request.json();
    const id = new URL(request.url).searchParams.get('id') || data.id;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Fish pick ID is required' },
        { status: 400 }
      );
    }

    console.log('Admin API: Updating fish pick:', id, data);

    const response = await fetch(`${ADMIN_API_URL}/fish-picks/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': 'Bearer admin-test-token',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Server API error:', response.status, errorData);
      throw new Error(errorData.error || `Server API error: ${response.status}`);
    }

    const result = await response.json();
    console.log('Fish pick updated successfully:', result.id);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error updating fish pick:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update fish pick' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const id = new URL(request.url).searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Fish pick ID is required' },
        { status: 400 }
      );
    }

    console.log('Admin API: Deleting fish pick:', id);

    const response = await fetch(`${ADMIN_API_URL}/fish-picks/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': 'Bearer admin-test-token',
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Server API error:', response.status, errorData);
      throw new Error(errorData.error || `Server API error: ${response.status}`);
    }

    const result = await response.json();
    console.log('Fish pick deleted successfully:', id);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error deleting fish pick:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete fish pick' },
      { status: 500 }
    );
  }
}
