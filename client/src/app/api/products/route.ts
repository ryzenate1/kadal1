import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  
  // Extract all query parameters
  const categoryId = searchParams.get('categoryId');
  const featured = searchParams.get('featured');
  const tag = searchParams.get('tag');
  const limit = searchParams.get('limit');
  
  // Build the query string for the server API
  let queryParts: string[] = [];
  
  if (categoryId) queryParts.push(`categoryId=${categoryId}`);
  if (featured) queryParts.push(`featured=${featured}`);
  if (tag) queryParts.push(`tag=${tag}`);
  if (limit) queryParts.push(`limit=${limit}`);
  
  let url = 'http://localhost:5001/api/products';
  if (queryParts.length > 0) {
    url += `?${queryParts.join('&')}`;
  }
  
  try {
    const res = await fetch(url, { next: { revalidate: 0 } });
    
    if (!res.ok) {
      console.error(`Server API returned status: ${res.status}`);
      return NextResponse.json({ error: 'Failed to fetch products' }, { status: res.status });
    }
    
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 