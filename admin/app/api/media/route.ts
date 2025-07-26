import { NextResponse } from 'next/server';

// Base API URL
const SERVER_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

// Get all media files
export async function GET(request: Request) {
  try {
    const token = request.headers.get('Authorization');
    const url = new URL(request.url);
    const searchParams = url.searchParams;
    
    let queryString = '';
    if (searchParams.toString()) {
      queryString = '?' + searchParams.toString();
    }
    
    const response = await fetch(`${SERVER_API_URL}/media${queryString}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': token })
      }
    });
    
    if (!response.ok) {
      return NextResponse.json(
        { message: 'Failed to fetch media files' }, 
        { status: response.status }
      );
    }
    
    const data = await response.json();
    return NextResponse.json(data);
    
  } catch (error: any) {
    console.error('Error fetching media files:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Create new media (upload)
export async function POST(request: Request) {
  try {
    const token = request.headers.get('Authorization');
    
    // Forward the form data directly to the backend
    const formData = await request.formData();
    
    const response = await fetch(`${SERVER_API_URL}/media/upload`, {
      method: 'POST',
      headers: {
        ...(token && { 'Authorization': token })
      },
      body: formData
    });
    
    if (!response.ok) {
      return NextResponse.json(
        { message: 'Failed to upload media' }, 
        { status: response.status }
      );
    }
    
    const data = await response.json();
    return NextResponse.json(data);
    
  } catch (error: any) {
    console.error('Error uploading media:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Bulk delete media
export async function DELETE(request: Request) {
  try {
    const token = request.headers.get('Authorization');
    const body = await request.json();
    
    const response = await fetch(`${SERVER_API_URL}/media`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': token })
      },
      body: JSON.stringify(body)
    });
    
    if (!response.ok) {
      return NextResponse.json(
        { message: 'Failed to delete media files' }, 
        { status: response.status }
      );
    }
    
    const data = await response.json();
    return NextResponse.json(data);
    
  } catch (error: any) {
    console.error('Error deleting media files:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
