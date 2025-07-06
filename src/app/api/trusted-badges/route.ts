import { NextResponse } from 'next/server';

// Sample data as fallback if API call fails
const fallbackData = [
  {
    id: 'seer',
    name: 'Seer Fish (Vanjaram)',
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?q=80&w=2070&auto=format&fit=crop',
    category: 'Premium',
    price: 899,
    originalPrice: 999,
    weight: '500g',
    freshness: 'Fresh',
    iconName: 'Fish',
    color: 'bg-blue-500',
    rating: 4.8,
    description: 'Rich in omega-3, perfect for grilling',
    isActive: true
  },
  {
    id: 'prawns',
    name: 'Tiger Prawns',
    image: 'https://images.unsplash.com/photo-1565680018093-ebb6b9ab5460?q=80&w=2070&auto=format&fit=crop',
    category: 'Shellfish',
    price: 599,
    originalPrice: 699,
    weight: '250g',
    freshness: 'Fresh',
    iconName: 'Anchor',
    color: 'bg-amber-500',
    rating: 4.6,
    description: 'Juicy and flavorful, great for curries',
    isActive: true
  },
  {
    id: 'salmon',
    name: 'Indian Salmon',
    image: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?q=80&w=2069&auto=format&fit=crop',
    category: 'Premium',
    price: 1299,
    originalPrice: 1499,
    weight: '1kg',
    freshness: 'Fresh',
    iconName: 'Waves',
    color: 'bg-pink-500',
    rating: 4.9,
    description: 'Rich in omega-3, perfect for grilling',
    isActive: true
  },
  {
    id: 'pomfret',
    name: 'White Pomfret',
    image: 'https://images.unsplash.com/photo-1605651377861-348620a3faae?q=80&w=2070&auto=format&fit=crop',
    category: 'Premium',
    price: 1099,
    originalPrice: 1299,
    weight: '700g',
    freshness: 'Fresh',
    iconName: 'Fish',
    color: 'bg-blue-500',
    rating: 4.7,
    description: 'Delicate white flesh, great for frying',
    isActive: true
  }
];

// Define the base URL for the admin API
const ADMIN_API_BASE_URL = process.env.ADMIN_API_URL || 'http://localhost:3001';

export async function GET(request: Request) {
  try {
    // Try to fetch from the admin API
    const response = await fetch(`${ADMIN_API_BASE_URL}/api/trusted-badges`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Use a short timeout for better UX if admin server is down
      signal: AbortSignal.timeout(3000), 
    }).catch(() => null); // Catch network errors
    
    // If the response was successful and returned data
    if (response && response.ok) {
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        return NextResponse.json(data);
      }
    }
    
    // Fall back to local data if admin API fails or returns empty data
    console.warn('Using fallback data for trusted badges');
    return NextResponse.json(fallbackData);
  } catch (error) {
    console.error('Error fetching trusted badges:', error);
    // Always fallback to sample data for a graceful user experience
    return NextResponse.json(fallbackData);
  }
} 