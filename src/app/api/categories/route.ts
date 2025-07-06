import { NextRequest, NextResponse } from 'next/server';
import { getAuthHeaders } from '@/lib/apiUtils';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

// Server API URL
const SERVER_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
// Admin API URL
const ADMIN_API_URL = process.env.NEXT_PUBLIC_ADMIN_API_URL || 'http://localhost:3001/api';

// Fallback categories if the server API is unavailable
const fallbackCategories = [
  {
    id: 'vangaram-fish',
    name: 'Vangaram Fish',
    slug: 'vangaram-fish',
    description: 'Premium quality Vangaram fish fresh from the ocean',
    image: 'https://images.unsplash.com/photo-1534766438357-2b270dbd1b40?q=80&w=1974&auto=format&fit=crop',
    order: 0,
    isActive: true,
    type: 'Fish',
    icon: 'Fish',
    iconName: 'Fish'
  },
  {
    id: 'sliced-vangaram',
    name: 'Sliced Vangaram',
    slug: 'sliced-vangaram',
    description: 'Pre-sliced Vangaram fish, ready to cook',
    image: 'https://images.unsplash.com/photo-1565680018093-ebb6b9ab5460?q=80&w=2070&auto=format&fit=crop',
    order: 1,
    isActive: true,
    type: 'Fish',
    icon: 'Fish',
    iconName: 'Fish'
  },
  {
    id: 'dried-fish',
    name: 'Dried Fish',
    slug: 'dried-fish',
    description: 'Traditional sun-dried fish with intense flavor',
    image: 'https://images.unsplash.com/photo-1592483648224-61bf8287bc4c?q=80&w=2070&auto=format&fit=crop',
    order: 2,
    isActive: true,
    type: 'Dried Fish',
    icon: 'Fish',
    iconName: 'Fish'
  },
  {
    id: 'jumbo-prawns',
    name: 'Jumbo Prawns',
    slug: 'jumbo-prawns',
    description: 'Large, succulent jumbo prawns',
    image: 'https://images.unsplash.com/photo-1510130387422-82bed34b37e9?q=80&w=2070&auto=format&fit=crop',
    order: 3,
    isActive: true,
    type: 'Prawns',
    icon: 'Shell',
    iconName: 'Shell'
  },
  {
    id: 'sea-prawns',
    name: 'Sea Prawns',
    slug: 'sea-prawns',
    description: 'Fresh sea prawns with natural sweetness',
    image: 'https://images.unsplash.com/photo-1505576399279-565b52d4ac71?q=80&w=1935&auto=format&fit=crop',
    order: 4,
    isActive: true,
    type: 'Prawns',
    icon: 'Shell',
    iconName: 'Shell'
  },
  {
    id: 'fresh-lobster',
    name: 'Fresh Lobster',
    slug: 'fresh-lobster',
    description: 'Premium fresh lobsters for special occasions',
    image: 'https://images.unsplash.com/photo-1610540881356-76bd50e523d3?q=80&w=2070&auto=format&fit=crop',
    order: 5,
    isActive: true,
    type: 'Shellfish',
    icon: 'Shell',
    iconName: 'Shell'
  },
  {
    id: 'fresh-crabs',
    name: 'Fresh Crabs',
    slug: 'fresh-crabs',
    description: 'Live fresh crabs with sweet meat',
    image: 'https://images.unsplash.com/photo-1559187575-5f89cedf009b?q=80&w=2071&auto=format&fit=crop',
    order: 6,
    isActive: true,
    type: 'Crabs',
    icon: 'Shell',
    iconName: 'Shell'
  },
  {
    id: 'mixed-seafood',
    name: 'Mixed Seafood',
    slug: 'mixed-seafood',
    description: 'Variety pack of fresh seafood',
    image: 'https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?q=80&w=1974&auto=format&fit=crop',
    order: 7,
    isActive: true,
    type: 'Mixed',
    icon: 'Fish',
    iconName: 'Fish'
  }
];

export async function GET(req: NextRequest) {
  // Removed excessive logging to prevent console spam
  
  try {
    // Try to fetch from admin API first (this is the primary source)
    try {
      const adminRes = await fetch(`${ADMIN_API_URL}/categories`, { 
        headers: getAuthHeaders(),
        cache: 'no-store',
        next: { revalidate: 0 }
      });
      
      if (adminRes.ok) {
        const adminData = await adminRes.json();
        
        // Map admin data to client format
        const mappedData = adminData.map((category: any) => ({
          id: category.id || category._id,
          name: category.name,
          slug: category.slug,
          description: category.description || `Fresh ${category.name} with premium quality`,
          image: category.imageUrl || category.image,
          order: category.order || 0,
          isActive: category.isActive !== false,
          type: category.type || 'Seafood',
          icon: category.icon || 'Fish',
          iconName: category.icon || 'Fish'
        }));
        
        return NextResponse.json(mappedData);
      }
      
      console.warn(`Admin API returned status: ${adminRes.status}`);
    } catch (adminError) {
      console.warn('Admin API failed, trying fallback...');
    }
    
    // If admin API fails, try server API as fallback
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout
      
      const response = await fetch(`${SERVER_API_URL}/categories`, {
        method: 'GET',
        headers: getAuthHeaders(),
        signal: controller.signal,
        cache: 'no-store'
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const serverData = await response.json();
        
        // Transform server data to match our client format
        const formattedData = serverData.map((category: any) => ({
          id: category.id || category._id,
          name: category.name,
          slug: category.slug,
          description: category.description || `Fresh ${category.name} with premium quality`,
          image: category.imageUrl || category.image,
          order: category.order || 0,
          isActive: category.isActive !== false,
          type: category.type || 'Seafood',
          icon: category.icon || 'Fish',
          iconName: category.icon || 'Fish'
        }));
        
        return NextResponse.json(formattedData);
      }
      
      console.warn(`Server API returned status: ${response.status}`);
    } catch (error) {
      console.warn('Server API failed, using fallback data...');
    }
    
    // Return fallback data if all APIs fail
    return NextResponse.json(fallbackCategories);  } catch (error) {
    console.error('Error in categories API, using fallback data');
    
    // Always return some data, never fail completely
    return NextResponse.json(fallbackCategories);
  }
}