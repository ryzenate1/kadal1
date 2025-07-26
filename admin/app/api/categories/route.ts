import { NextResponse } from 'next/server';

// Configure route to be dynamic to avoid static generation bailout
export const dynamic = 'force-dynamic';

const SERVER_API_URL = 'http://localhost:5001/api';
const ADMIN_AUTH_TOKEN = 'admin-test-token';

// Fallback categories in case server is unavailable
const fallbackCategories = [
  {
    id: 'vangaram-fish',
    name: 'Vangaram Fish',
    slug: 'vangaram-fish',
    description: 'Premium quality Vangaram fish fresh from the ocean',
    imageUrl: 'https://images.unsplash.com/photo-1534766438357-2b270dbd1b40?q=80&w=1974&auto=format&fit=crop',
    order: 0,
    isActive: true,
    type: 'Fish',
    icon: 'Fish'
  },
  {
    id: 'sliced-vangaram',
    name: 'Sliced Vangaram',
    slug: 'sliced-vangaram',
    description: 'Pre-sliced Vangaram fish, ready to cook',
    imageUrl: 'https://images.unsplash.com/photo-1565680018093-ebb6b9ab5460?q=80&w=2070&auto=format&fit=crop',
    order: 1,
    isActive: true,
    type: 'Fish',
    icon: 'Fish'
  },
  {
    id: 'dried-fish',
    name: 'Dried Fish',
    slug: 'dried-fish',
    description: 'Traditional sun-dried fish with intense flavor',
    imageUrl: 'https://images.unsplash.com/photo-1592483648224-61bf8287bc4c?q=80&w=2070&auto=format&fit=crop',
    order: 2,
    isActive: true,
    type: 'Dried Fish',
    icon: 'Fish'
  },
  {
    id: 'jumbo-prawns',
    name: 'Jumbo Prawns',
    slug: 'jumbo-prawns',
    description: 'Large, succulent jumbo prawns',
    imageUrl: 'https://images.unsplash.com/photo-1510130387422-82bed34b37e9?q=80&w=2070&auto=format&fit=crop',
    order: 3,
    isActive: true,
    type: 'Prawns',
    icon: 'Shell'
  },
  {
    id: 'sea-prawns',
    name: 'Sea Prawns',
    slug: 'sea-prawns',
    description: 'Wild-caught sea prawns',
    imageUrl: 'https://images.unsplash.com/photo-1505576399279-565b52d4ac71?q=80&w=1935&auto=format&fit=crop',
    order: 4,
    isActive: true,
    type: 'Prawns',
    icon: 'Shell'
  },
  {
    id: 'fresh-lobster',
    name: 'Fresh Lobster',
    slug: 'fresh-lobster',
    description: 'Live lobsters caught daily',
    imageUrl: 'https://images.unsplash.com/photo-1610540881356-76bd50e523d3?q=80&w=2070&auto=format&fit=crop',
    order: 5,
    isActive: true,
    type: 'Shellfish',
    icon: 'Shell'
  },
  {
    id: 'blue-crabs',
    name: 'Blue Crabs',
    slug: 'blue-crabs',
    description: 'Fresh blue crabs from coastal waters',
    imageUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=2070&auto=format&fit=crop',
    order: 6,
    isActive: true,
    type: 'Crabs',
    icon: 'Shell'
  },
  {
    id: 'sea-crabs',
    name: 'Sea Crabs',
    slug: 'sea-crabs',
    description: 'Delicious sea crabs with firm meat',
    imageUrl: 'https://images.unsplash.com/photo-1559187575-5f89cedf009b?q=80&w=2071&auto=format&fit=crop',
    order: 7,
    isActive: true,
    type: 'Crabs',
    icon: 'Shell'
  },
  {
    id: 'fresh-squid',
    name: 'Fresh Squid',
    slug: 'fresh-squid',
    description: 'Tender fresh squid perfect for calamari',
    imageUrl: 'https://images.unsplash.com/photo-1612177343582-665b93b8a320?q=80&w=2071&auto=format&fit=crop',
    order: 8,
    isActive: true,
    type: 'Cephalopods',
    icon: 'Fish'
  },
  {
    id: 'fish-combo',
    name: 'Fish Combo Packs',
    slug: 'fish-combo',
    description: 'Assorted fish combo packs for variety',
    imageUrl: 'https://images.unsplash.com/photo-1534766555764-ce878a5e3a2b?q=80&w=2070&auto=format&fit=crop',
    order: 9,
    isActive: true,
    type: 'Combo',
    icon: 'Fish'
  }
];

// GET - Retrieve all categories or a specific category
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    try {
      // Try to fetch from server API first
      const serverUrl = id 
        ? `${SERVER_API_URL}/categories/${id}` 
        : `${SERVER_API_URL}/categories`;
      
      const response = await fetch(serverUrl, {
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store'
      });

      if (response.ok) {
        const data = await response.json();
        return NextResponse.json(data);
      } else {
        console.warn(`Server API returned status: ${response.status}`);
        throw new Error(`Server API failed with status ${response.status}`);
      }
    } catch (serverError) {
      console.warn('Server API unavailable, using fallback data:', serverError);
      
      if (id) {
        const category = fallbackCategories.find(c => c.id === id);
        if (!category) {
          return NextResponse.json({ error: 'Category not found' }, { status: 404 });
        }
        return NextResponse.json(category);
      }
      
      return NextResponse.json(fallbackCategories);
    }
  } catch (error) {
    console.error('Error in GET categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}

// POST - Create a new category
export async function POST(request: Request) {
  try {
    const newCategory = await request.json();
    
    console.log("Creating new category:", JSON.stringify(newCategory));
    
    // Validate required fields
    if (!newCategory.name || !newCategory.slug) {
      return NextResponse.json(
        { error: 'Name and slug are required fields' },
        { status: 400 }
      );
    }

    try {
      // Try to create on server
      const response = await fetch(`${SERVER_API_URL}/categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${ADMIN_AUTH_TOKEN}`
        },
        body: JSON.stringify(newCategory)
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Category created successfully on server:", data.name);
        return NextResponse.json(data, { status: 201 });
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Server error' }));
        console.error('Server API create failed:', errorData);
        throw new Error(errorData.message || `Server API failed with status ${response.status}`);
      }
    } catch (serverError) {
      console.error('Failed to create category on server:', serverError);
      return NextResponse.json(
        { error: 'Failed to create category on server' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    );
  }
}

// PUT - Update an existing category
export async function PUT(request: Request) {
  try {
    const updatedCategory = await request.json();
    const url = new URL(request.url);
    const id = url.searchParams.get('id') || updatedCategory.id;
    
    console.log("Updating category ID:", id, "Data:", JSON.stringify(updatedCategory));
    
    // Validate ID
    if (!id) {
      return NextResponse.json(
        { error: 'Category ID is required for updates' },
        { status: 400 }
      );
    }

    try {
      // Try to update on server
      const response = await fetch(`${SERVER_API_URL}/categories/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${ADMIN_AUTH_TOKEN}`
        },
        body: JSON.stringify(updatedCategory)
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Category updated successfully on server:", data.name);
        return NextResponse.json(data);
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Server error' }));
        console.error('Server API update failed:', errorData);
        throw new Error(errorData.message || `Server API failed with status ${response.status}`);
      }
    } catch (serverError) {
      console.error('Failed to update category on server:', serverError);
      return NextResponse.json(
        { error: 'Failed to update category on server' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error updating category:', error);
    return NextResponse.json(
      { error: 'Failed to update category' },
      { status: 500 }
    );
  }
}

// DELETE - Remove a category
export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Category ID is required for deletion' },
        { status: 400 }
      );
    }

    try {
      // Try to delete from server
      const response = await fetch(`${SERVER_API_URL}/categories/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${ADMIN_AUTH_TOKEN}`
        }
      });

      if (response.ok) {
        console.log("Category deleted successfully from server");
        return NextResponse.json({ success: true });
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Server error' }));
        console.error('Server API delete failed:', errorData);
        throw new Error(errorData.message || `Server API failed with status ${response.status}`);
      }
    } catch (serverError) {
      console.error('Failed to delete category from server:', serverError);
      return NextResponse.json(
        { error: 'Failed to delete category from server' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json(
      { error: 'Failed to delete category' },
      { status: 500 }
    );
  }
}