import { NextRequest, NextResponse } from 'next/server';
import { getAuthHeaders } from '@/lib/apiUtils';

export const dynamic = 'force-dynamic';

// Server API URL
const SERVER_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
// Admin API URL
const ADMIN_API_URL = process.env.NEXT_PUBLIC_ADMIN_API_URL || 'http://localhost:3001/api';
const fallbackFeaturedFish = [
  {
    id: 'premium-combo',
    name: "Premium Fish Combo",
    image: "https://images.unsplash.com/photo-1534766555764-ce878a5e3a2b?q=80&w=2070&auto=format&fit=crop",
    slug: "premium",
    type: "Premium",
    description: "Curated selection of premium fish varieties",
    featured: true,
    price: 999,
    weight: "1.2kg",
    discount: 10,
    iconName: "Fish",
    isActive: true
  },
  {
    id: 'grilling-special',
    name: "Grilling Special",
    image: "https://images.unsplash.com/photo-1580476262798-bddd9f4b7369?q=80&w=2070&auto=format&fit=crop",
    slug: "grilling",
    type: "Combo",
    description: "Perfect for seafood barbecues and grilling",
    featured: true,
    price: 899,
    weight: "800g",
    discount: 15,
    iconName: "Fish",
    isActive: true
  },
  {
    id: 'seafood-feast',
    name: "Seafood Feast",
    image: "https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?q=80&w=1974&auto=format&fit=crop",
    slug: "feast",
    type: "Combo",
    description: "Premium selection of mixed seafood",
    featured: true,
    price: 1299,
    weight: "1.5kg",
    discount: 8,
    iconName: "Shell",
    isActive: true
  },
  {
    id: 'fresh-catch',
    name: "Fresh Catch Box",
    image: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?q=80&w=2069&auto=format&fit=crop",
    slug: "fresh-catch",
    type: "Fresh",
    description: "Today's freshest catches from local fishermen",
    featured: true,
    price: 799,
    weight: "900g",
    discount: 12,
    iconName: "Anchor",
    isActive: true
  }
];

export async function GET(req: NextRequest) {
  try {
    // Try to fetch from the server API first
    try {
      console.log('Fetching featured fish from server API...');
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout
      
      const response = await fetch(`${SERVER_API_URL}/featured-fish`, {
        method: 'GET',
        headers: getAuthHeaders(),
        signal: controller.signal,
        cache: 'no-store'
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const data = await response.json();
          if (Array.isArray(data) && data.length > 0) {
          // Normalize server data
          const normalizedData = data.map((fish: any, index: number) => ({
            id: fish.id || fish._id,
            name: fish.name,
            slug: fish.slug?.replace(/^fish-combo\//, '') || fish.id,
            description: fish.description || `Fresh ${fish.name} with premium quality`,
            image: fish.image || fish.imageUrl,
            price: Number(fish.price) || 999,
            weight: fish.weight || '1kg',
            discount: Number(fish.discount) || 0,
            featured: fish.featured !== false,
            type: fish.type || 'Premium',
            iconName: fish.iconName || fish.icon || 'Fish',
            isActive: fish.isActive !== false
          }));
          
          console.log('Successfully fetched featured fish from server API');
          return NextResponse.json({
            title: "Today's Fresh Catch",
            subtitle: "Discover our premium selection of fresh seafood, sustainably sourced and delivered within hours of catch.",
            products: normalizedData
          });
        }
      }
      console.error(`Server API returned status: ${response.status}`);
    } catch (error) {
      console.warn('Server API failed:', error);
    }
    
    // Try to fetch from admin API as fallback
    try {
      console.log('Fetching featured fish from admin API...');
      const adminRes = await fetch(`${ADMIN_API_URL}/featured-fish`, { 
        headers: getAuthHeaders(),
        cache: 'no-store'
      });
      
      if (adminRes.ok) {
        const adminData = await adminRes.json();
          // Map admin data to client format
        const mappedData = adminData.map((fish: any) => ({
          id: fish.id || fish._id,
          name: fish.name,
          slug: fish.slug?.replace(/^fish-combo\//, '') || fish.id,
          description: fish.description || `Fresh ${fish.name} with premium quality`,
          image: fish.imageUrl || fish.image,
          price: Number(fish.price) || 999,
          weight: fish.weight || '1kg',
          discount: Number(fish.discount) || 0,
          featured: fish.featured !== false,
          type: fish.type || 'Premium',
          iconName: fish.iconName || fish.icon || 'Fish',
          isActive: fish.isActive !== false
        }));
        
        console.log('Successfully fetched featured fish from admin API');
        return NextResponse.json({
          title: "Today's Fresh Catch",
          subtitle: "Discover our premium selection of fresh seafood, sustainably sourced and delivered within hours of catch.",
          products: mappedData
        });
      }
    } catch (adminError) {
      console.warn('Admin API fallback also failed:', adminError);
    }
      // Return fallback data if all APIs fail
    console.log('Using fallback featured fish data');
    return NextResponse.json({
      title: "Today's Fresh Catch",
      subtitle: "Discover our premium selection of fresh seafood, sustainably sourced and delivered within hours of catch.",
      products: fallbackFeaturedFish
    });
  } catch (error) {
    console.error('Error in featured fish API:', error);
      // Always return some data, never fail completely
    return NextResponse.json({
      title: "Today's Fresh Catch",
      subtitle: "Discover our premium selection of fresh seafood, sustainably sourced and delivered within hours of catch.",
      products: fallbackFeaturedFish
    });
  }
}