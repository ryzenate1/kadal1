'use client';

import React, { useState, useEffect } from 'react';
import TrustBadges from './TrustBadges';
import { Fish, Clock, AlertCircle } from 'lucide-react';

interface FishCardProps {
  id: string;
  name: string;
  image: string;
  category: string;
  price: number;
  originalPrice: number;
  weight: string;
  freshness: string;
  iconName?: string;
  color: string;
  rating: number;
  description: string;
  isActive?: boolean;
}

// Simple loading component
const Loading = () => (
  <div className="py-6 sm:py-8 lg:py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 to-teal-50 text-center rounded-xl animate-pulse">
    <div className="mx-auto w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 mb-4 sm:mb-5 lg:mb-6 rounded-full flex items-center justify-center bg-white/80 backdrop-blur-sm shadow-md">
      <Clock className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-blue-500 animate-spin" />
    </div>
    <p className="text-base sm:text-lg lg:text-xl font-medium text-blue-600">Loading fresh seafood collection...</p>
  </div>
);

// Simple error component
const ErrorDisplay = ({ message }: { message: string }) => (
  <div className="py-6 sm:py-8 lg:py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-red-50 to-pink-50 text-center rounded-xl">
    <div className="mx-auto w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 mb-4 sm:mb-5 lg:mb-6 rounded-full flex items-center justify-center bg-white/80 backdrop-blur-sm shadow-md">
      <AlertCircle className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-red-500" />
    </div>
    <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-red-600 mb-2 sm:mb-3 lg:mb-4">Something went wrong</h3>
    <p className="text-sm sm:text-base lg:text-lg text-gray-700 mb-4 sm:mb-5 lg:mb-6">{message}</p>
    <button 
      onClick={() => window.location.reload()}
      className="px-4 sm:px-5 lg:px-6 py-2 sm:py-2.5 lg:py-3 bg-red-600 text-white text-sm sm:text-base lg:text-lg rounded-lg hover:bg-red-700 transition-colors"
    >
      Try Again
    </button>
  </div>
);

// Simple fallback component
const TrustBadgesSimple = () => {
  const defaultFishCards = [
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
      description: 'Rich in omega-3, perfect for grilling'
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
      description: 'Juicy and flavorful, great for curries'
    },
  ];

  return <TrustBadges fishCards={defaultFishCards} />;
};

// Error boundary component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error in TrustBadges component:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorDisplay message={this.state.error?.message || "An unexpected error occurred"} />;
    }

    return this.props.children;
  }
}

// Main wrapper component
export default function TrustBadgesWrapper() {
  const [fishCards, setFishCards] = useState<FishCardProps[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    async function fetchFishCards() {
      setIsLoading(true);
      setError(null);
      try {
        console.log('Fetching fish picks from API...');
        const res = await fetch('/api/fish-picks');
        if (!res.ok) {
          throw new Error('Failed to fetch fish picks');
        }
        const data = await res.json();
        
        // Filter out inactive cards
        const activeCards = data.filter((card: FishCardProps) => card.isActive !== false);
        setFishCards(activeCards);
        console.log('Loaded fish picks:', activeCards.length, 'active cards');
      } catch (err: any) {
        console.error('Error loading fish picks:', err);
        setError(err.message || 'Failed to load fresh seafood collection');
      } finally {
        setIsLoading(false);
      }
    }

    fetchFishCards();
  }, []);

  if (isLoading) {
    return <Loading />;
  }

  if (error || fishCards.length === 0) {
    console.warn('Error or no fish cards available, using fallback');
    return <TrustBadgesSimple />;
  }

  return (
    <ErrorBoundary>
      <TrustBadges fishCards={fishCards} />
    </ErrorBoundary>
  );
} 