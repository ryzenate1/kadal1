"use client";

import { useState, useCallback } from 'react';

interface FeaturedFish {
  id: string;
  name: string;
  image: string;
  slug: string;
  type: string;
  description: string;
  featured: boolean;
  price: number;
  weight: string;
  discount: number;
  iconName: string;
  isActive: boolean;
}

export function useFeaturedFish() {
  const [featuredFish, setFeaturedFish] = useState<FeaturedFish[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFeaturedFish = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch featured fish from API
      const response = await fetch('/api/featured-fish');
      if (!response.ok) {
        throw new Error(`Failed to fetch featured fish (Status: ${response.status})`);
      }
      
      const data = await response.json();
      setFeaturedFish(data);
      console.log('Fetched featured fish:', data);
    } catch (err: any) {
      console.error('Error loading featured fish:', err);
      setError(err.message || 'An error occurred while loading featured fish');
      
      // Fallback to sample data if API fails
      setFeaturedFish([
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
        }
      ]);
    } finally {
      setLoading(false);
    }
  }, []);

  return { featuredFish, loading, error, fetchFeaturedFish };
}
