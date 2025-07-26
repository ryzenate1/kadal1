import { NextResponse } from 'next/server';

// Configure route to be dynamic to avoid static generation bailout
export const dynamic = 'force-dynamic';

const ADMIN_API_URL = process.env.ADMIN_API_URL || 'http://localhost:5001';

// Test token for development (in production, this would come from session/auth)
const TEST_TOKEN = 'admin-test-token';

// GET - Retrieve all featured fish from server API
export async function GET(request: Request) {
  try {
    console.log('Admin fetching featured fish from server API');
    
    const response = await fetch(`${ADMIN_API_URL}/api/featured-fish`, {
      headers: {
        'Authorization': `Bearer ${TEST_TOKEN}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store'
    });

    if (!response.ok) {
      console.error(`Server API returned status: ${response.status}`);
      throw new Error(`Server API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('Featured fish fetched from server:', data.length);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching from server API:', error);
    
    // Fallback to in-memory data if server is unavailable
    const fallbackData = [
      {
        id: 'premium-combo',
        name: "Premium Fish Combo",
        image: "https://images.unsplash.com/photo-1534766555764-ce878a5e3a2b?q=80&w=2070&auto=format&fit=crop",
        imageUrl: "https://images.unsplash.com/photo-1534766555764-ce878a5e3a2b?q=80&w=2070&auto=format&fit=crop",
        slug: "premium",
        type: "Premium",
        description: "Curated selection of premium fish varieties",
        featured: true,
        price: 999,
        weight: "1.2kg",
        discount: 10,
        iconName: "Fish",
        isActive: true,
        order: 0
      },
      {
        id: 'grilling-special',
        name: "Grilling Special",
        image: "https://images.unsplash.com/photo-1580476262798-bddd9f4b7369?q=80&w=2070&auto=format&fit=crop",
        imageUrl: "https://images.unsplash.com/photo-1580476262798-bddd9f4b7369?q=80&w=2070&auto=format&fit=crop",
        slug: "grilling",
        type: "Combo",
        description: "Perfect for seafood barbecues and grilling",
        featured: true,
        price: 899,
        weight: "800g",
        discount: 15,
        iconName: "Fish",
        isActive: true,
        order: 1
      }
    ];
    
    console.log('Using fallback featured fish data');
    return NextResponse.json(fallbackData);
  }
}

// POST - Create a new featured fish
export async function POST(request: Request) {
  try {
    const newFish = await request.json();
    console.log('Admin creating featured fish:', newFish);
    
    const response = await fetch(`${ADMIN_API_URL}/api/featured-fish`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TEST_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newFish),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Server API create error:', errorData);
      return NextResponse.json(
        { error: errorData.message || 'Failed to create featured fish' },
        { status: response.status }
      );
    }

    const createdFish = await response.json();
    console.log('Featured fish created successfully on server');
    return NextResponse.json(createdFish, { status: 201 });
  } catch (error) {
    console.error('Error creating featured fish:', error);
    return NextResponse.json(
      { error: 'Failed to create featured fish' },
      { status: 500 }
    );
  }
}

// PUT - Update an existing featured fish
export async function PUT(request: Request) {
  try {
    const updatedFish = await request.json();
    const id = new URL(request.url).searchParams.get('id') || updatedFish.id;
    
    console.log('Admin updating featured fish:', id);
    
    if (!id) {
      return NextResponse.json(
        { error: 'Featured fish ID is required for updates' },
        { status: 400 }
      );
    }

    const response = await fetch(`${ADMIN_API_URL}/api/featured-fish/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${TEST_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedFish),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Server API update error:', errorData);
      return NextResponse.json(
        { error: errorData.message || 'Failed to update featured fish' },
        { status: response.status }
      );
    }

    const result = await response.json();
    console.log('Featured fish updated successfully on server');
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error updating featured fish:', error);
    return NextResponse.json(
      { error: 'Failed to update featured fish' },
      { status: 500 }
    );
  }
}

// DELETE - Remove a featured fish
export async function DELETE(request: Request) {
  try {
    const id = new URL(request.url).searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Featured fish ID is required for deletion' },
        { status: 400 }
      );
    }

    console.log('Admin deleting featured fish:', id);

    const response = await fetch(`${ADMIN_API_URL}/api/featured-fish/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${TEST_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Server API delete error:', errorData);
      return NextResponse.json(
        { error: errorData.message || 'Failed to delete featured fish' },
        { status: response.status }
      );
    }

    const result = await response.json();
    console.log('Featured fish deleted successfully on server');
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error deleting featured fish:', error);
    return NextResponse.json(
      { error: 'Failed to delete featured fish' },
      { status: 500 }
    );
  }
}