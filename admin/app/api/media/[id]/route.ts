import { NextRequest, NextResponse } from 'next/server';

// Base API URL
const SERVER_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

// Get specific media by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.headers.get('Authorization');
    const { id } = params;
    
    const response = await fetch(`${SERVER_API_URL}/media/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': token })
      }
    });
    
    if (!response.ok) {
      return NextResponse.json(
        { message: 'Failed to fetch media' }, 
        { status: response.status }
      );
    }
    
    const data = await response.json();
    return NextResponse.json(data);
    
  } catch (error: any) {
    console.error('Error fetching media:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Update media metadata
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.headers.get('Authorization');
    const { id } = params;
    const body = await request.json();
    
    const response = await fetch(`${SERVER_API_URL}/media/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': token })
      },
      body: JSON.stringify(body)
    });
    
    if (!response.ok) {
      return NextResponse.json(
        { message: 'Failed to update media' }, 
        { status: response.status }
      );
    }
    
    const data = await response.json();
    return NextResponse.json(data);
    
  } catch (error: any) {
    console.error('Error updating media:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.headers.get('Authorization');
    const id = params.id;
    
    const response = await fetch(`${SERVER_API_URL}/media/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': token })
      }
    });
    
    if (!response.ok) {
      return NextResponse.json(
        { message: 'Failed to delete media file' }, 
        { status: response.status }
      );
    }
    
    return NextResponse.json({ message: 'Media file deleted successfully' });
    
  } catch (error: any) {
    console.error('Error deleting media file:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
