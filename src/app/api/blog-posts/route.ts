import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const response = await fetch('http://localhost:5001/api/blog-posts');
    
    if (!response.ok) {
      console.error(`Server API returned status: ${response.status}`);
      return NextResponse.json({ error: 'Failed to fetch blog posts' }, { status: response.status });
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 