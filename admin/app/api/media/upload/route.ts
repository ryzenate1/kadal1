import { NextRequest, NextResponse } from 'next/server';

// Base API URL
const SERVER_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('Authorization');
    const formData = await request.formData();
    
    const response = await fetch(`${SERVER_API_URL}/media/upload`, {
      method: 'POST',
      headers: {
        ...(token && { 'Authorization': token })
      },
      // Use node-fetch compatible way to send formData
      body: formData as any
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Server returned error:', response.status, errorText);
      return NextResponse.json(
        { message: 'Failed to upload media file' }, 
        { status: response.status }
      );
    }
    
    const data = await response.json();
    return NextResponse.json(data);
    
  } catch (error: any) {
    console.error('Error uploading media file:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
