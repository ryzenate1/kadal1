import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Fetch content from client API
    const response = await fetch('http://localhost:3001/api/content/homepage', {
      cache: 'no-store'
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch content from client API');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching homepage content:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch homepage content' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Forward the request to client API
    const response = await fetch('http://localhost:3001/api/content/homepage', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      throw new Error('Failed to update content via client API');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating homepage content:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update homepage content' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Forward the request to client API
    const response = await fetch('http://localhost:3001/api/content/homepage', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      throw new Error('Failed to add content via client API');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error adding homepage content:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to add homepage content' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sectionId = searchParams.get('sectionId');
    
    // Forward the request to client API
    const response = await fetch(`http://localhost:3001/api/content/homepage?sectionId=${sectionId}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      throw new Error('Failed to delete content via client API');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error deleting homepage content:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete homepage content' },
      { status: 500 }
    );
  }
}
