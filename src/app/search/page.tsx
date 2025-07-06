'use client';

import React, { Suspense, useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Star, ShoppingCart, Loader2, Filter, SortAsc, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/formatPrice';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

interface Fish {
  id: string;
  name: string;
  slug: string;
  type: string;
  category: string;
  price: number;
  originalPrice?: number;
  image: string;
  weight?: string;
  omega3: number;
  protein: number;
  calories: number;
  rating: number;
  popular?: boolean;
  description: string;
  tags: string[];
}

// Enhanced fish data with more searchable fields
const fishData: Fish[] = [
  {
    id: 'vangaram-fish',
    name: 'Vangaram Fish',
    slug: 'vangaram-fish',
    type: 'Premium',
    category: 'Marine Fish',
    price: 450,
    originalPrice: 500,
    image: '/images/fish/vangaram.jpg',
    weight: '500g',
    omega3: 1.2,
    protein: 22,
    calories: 120,
    rating: 4.5,
    popular: true,
    description: 'Rich in omega-3, premium quality marine fish',
    tags: ['premium', 'marine', 'omega3', 'protein']
  },
  {
    id: 'sankara-fish',
    name: 'Sankara Fish',
    slug: 'sankara-fish',
    type: 'Fresh',
    category: 'River Fish',
    price: 350,
    image: '/images/fish/sankara.jpg',
    weight: '400g',
    omega3: 0.9,
    protein: 20,
    calories: 110,
    rating: 4.2,
    description: 'Fresh river fish with delicate flavor',
    tags: ['fresh', 'river', 'delicate']
  },
  {
    id: 'paal-sura',
    name: 'Paal Sura',
    slug: 'paal-sura',
    type: 'Premium',
    category: 'Marine Fish',
    price: 450,
    image: '/images/fish/paal-sura.jpg',
    omega3: 1.0,
    protein: 18,
    calories: 140,
    rating: 4.7,
    popular: true,
    description: 'Premium Black Pomfret, great for frying or curry',
    tags: ['pomfret', 'black', 'premium']
  },
  {
    id: '3',
    name: 'Anchovy (Nethili)',
    slug: 'anchovy-nethili',
    type: 'fish',
    category: 'saltwater',
    price: 299,
    originalPrice: 349,
    image: '/fish/anchovy.jpg',
    weight: '250g',
    omega3: 1.8,
    protein: 20,
    calories: 120,
    rating: 4.1,
    popular: false,
    description: 'Anchovy fish perfect for traditional recipes',
    tags: ['anchovy', 'traditional', 'small', 'budget']
  }
];

// Quantity selector component
interface QuantitySelectorProps {
  quantity: number;
  setQuantity: (qty: number) => void;
  min?: number;
  max?: number;
}

const QuantitySelector = ({ quantity, setQuantity, min = 1, max = 10 }: QuantitySelectorProps) => {
  return (
    <div className="flex items-center space-x-2 mb-3">
      <span className="text-sm font-medium text-gray-700">Qty:</span>
      <div className="flex items-center border border-gray-300 rounded-md">
        <button
          onClick={() => setQuantity(Math.max(min, quantity - 1))}
          disabled={quantity <= min}
          className="px-3 py-1 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          -
        </button>
        <span className="px-3 py-1 min-w-[3rem] text-center font-medium">{quantity}</span>
        <button
          onClick={() => setQuantity(Math.min(max, quantity + 1))}
          disabled={quantity >= max}
          className="px-3 py-1 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          +
        </button>
      </div>
    </div>
  );
};

// Enhanced search result item component
interface SearchResultItemProps {
  fish: Fish;
  searchTerm: string;
}

const SearchResultItem = ({ fish, searchTerm }: SearchResultItemProps) => {
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const { addToCart } = useCart();

  const handleAddToCart = async () => {
    try {
      setIsAdding(true);
      const cartItem = {
        name: fish.name,
        price: fish.price,
        image: fish.image,
        quantity,
        rating: fish.rating,
        benefits: [`${fish.omega3}g Omega-3`, `${fish.protein}g Protein`],
        bestFor: fish.tags,
        type: fish.type as 'fish' | 'combo',
        src: fish.slug,
        weight: fish.weight || '',
        calories: fish.calories,
        category: fish.category,
        omega3: fish.omega3,
        protein: fish.protein
      };
      await addToCart(cartItem);
      toast.success(`${quantity} ${fish.name} added to cart`);
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add to cart');
    } finally {
      setIsAdding(false);
    }
  };

  // Highlight matching text
  const highlightMatch = (text: string, searchTerm: string) => {
    if (!searchTerm.trim()) return text;
    
    const parts = text.split(new RegExp(`(${searchTerm})`, 'gi'));
    return parts.map((part: string, index: number) =>
      part.toLowerCase() === searchTerm.toLowerCase() ? (
        <span key={index} className="bg-yellow-200">{part}</span>
      ) : (
        <React.Fragment key={index}>{part}</React.Fragment>
      )
    );
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 h-full border border-gray-100 group"
    >
      <Link href={`/fish/${fish.slug}`} className="block">
        <div className="relative h-48 w-full overflow-hidden">
          <Image
            src={fish.image}
            alt={fish.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300" />
          
          {fish.popular && (
            <div className="absolute top-2 left-2 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full">
              POPULAR
            </div>
          )}
          
          {fish.type && (
            <div className={`absolute top-2 right-2 text-white text-xs font-medium px-2 py-1 rounded ${
              fish.type === 'Premium' ? 'bg-purple-600' : 'bg-green-600'
            }`}>
              {fish.type}
            </div>
          )}

          {fish.originalPrice && fish.originalPrice > fish.price && (
            <div className="absolute bottom-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
              {Math.round(((fish.originalPrice - fish.price) / fish.originalPrice) * 100)}% OFF
            </div>
          )}
        </div>
      </Link>

      <div className="p-4">
        <Link href={`/fish/${fish.slug}`} className="block mb-3">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 leading-tight">
              {highlightMatch(fish.name, searchTerm)}
            </h3>
            {fish.rating && (
              <div className="flex items-center bg-yellow-50 px-2 py-1 rounded shrink-0 ml-2">
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                <span className="ml-1 text-sm font-medium text-gray-800">{fish.rating}</span>
              </div>
            )}
          </div>
          
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {highlightMatch(fish.description, searchTerm)}
          </p>
          
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <span className="text-xl font-bold text-red-600">{formatPrice(fish.price)}</span>
              {fish.originalPrice && fish.originalPrice > fish.price && (
                <span className="text-sm text-gray-500 line-through">{formatPrice(fish.originalPrice)}</span>
              )}
            </div>
            {fish.weight && (
              <div className="flex items-center space-x-2 bg-gray-50 px-2 py-1 rounded">
                <span className="text-xs font-medium text-gray-700">{fish.weight}</span>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-4 text-xs text-gray-600 mb-3">
            <span>Protein: {fish.protein}g</span>
            <span>Omega-3: {fish.omega3}g</span>
            <span>{fish.calories} cal</span>
          </div>
        </Link>

        <QuantitySelector quantity={quantity} setQuantity={setQuantity} />

        <Button 
          className="w-full bg-red-600 hover:bg-red-700 text-white py-2 h-11 rounded-lg font-medium transition-colors shadow-sm disabled:opacity-50"
          onClick={handleAddToCart}
          disabled={isAdding}
        >
          {isAdding ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              <span className="text-sm">Adding...</span>
            </>
          ) : (
            <>
              <ShoppingCart className="w-5 h-5 mr-2" />
              <span className="text-sm font-semibold">
                Add {formatPrice(fish.price * quantity)}
              </span>
            </>
          )}
        </Button>
      </div>
    </motion.div>
  );
};

interface Filters {
  category: string;
  type: string;
  priceRange: string;
  popularOnly: boolean;
}

// Filter and sort controls
interface FilterControlsProps {
  filters: Filters;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
  sortBy: string;
  setSortBy: (sortBy: string) => void;
}

const FilterControls = ({ filters, setFilters, sortBy, setSortBy }: FilterControlsProps) => {
  const [showFilters, setShowFilters] = useState(false);

  // Get unique categories and types for filters
  const categories = Array.from(new Set(fishData.map(fish => fish.category))).filter(Boolean) as string[];
  const types = Array.from(new Set(fishData.map(fish => fish.type))).filter(Boolean) as string[];

  const updateFilter = (key: keyof Filters, value: string | boolean) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <div className="mb-6">
      <div className="flex flex-wrap items-center gap-4 mb-4">
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center space-x-2"
        >
          <Filter className="w-4 h-4" />
          <span>Filters</span>
        </Button>

        <div className="flex items-center space-x-2">
          <SortAsc className="w-4 h-4 text-gray-500" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="relevance">Sort by Relevance</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="rating">Highest Rated</option>
            <option value="popular">Most Popular</option>
          </select>
        </div>
      </div>

      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-gray-50 rounded-lg p-4 space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={filters.category}
                  onChange={(e) => updateFilter('category', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                <select
                  value={filters.type}
                  onChange={(e) => updateFilter('type', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="">All Types</option>
                  {types.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
                <select
                  value={filters.priceRange}
                  onChange={(e) => updateFilter('priceRange', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="">All Prices</option>
                  <option value="0-300">Under ₹300</option>
                  <option value="300-500">₹300 - ₹500</option>
                  <option value="500-1000">₹500+</option>
                </select>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={filters.popularOnly}
                  onChange={(e) => updateFilter('popularOnly', e.target.checked)}
                  className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                />
                <span className="text-sm text-gray-700">Popular items only</span>
              </label>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setFilters({ category: '', type: '', priceRange: '', popularOnly: false })}
                className="text-red-600 hover:text-red-700"
              >
                Clear Filters
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};




function SearchPageInner() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<Filters>({
    category: '',
    type: '',
    priceRange: '',
    popularOnly: false
  });
  const [sortBy, setSortBy] = useState('relevance');

  // Filter fish based on search term and filters
  const filteredFish = useMemo(() => {
    return fishData.filter(fish => {
      const matchesSearch = query ? 
        (fish.name?.toLowerCase().includes(query.toLowerCase()) ||
         fish.description?.toLowerCase().includes(query.toLowerCase()) ||
         fish.tags?.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
        ) : true;
      
      // Apply filters
      const matchesCategory = !filters.category || fish.category === filters.category;
      const matchesType = !filters.type || fish.type === filters.type;
      const matchesPopular = !filters.popularOnly || fish.popular;
      
      // Apply price range filter if set
      let matchesPrice = true;
      if (filters.priceRange) {
        const [min, max] = filters.priceRange.split('-').map(Number);
        if (max) {
          matchesPrice = fish.price >= min && fish.price <= max;
        } else {
          matchesPrice = fish.price >= min;
        }
      }
      
      return matchesSearch && matchesCategory && matchesType && matchesPopular && matchesPrice;
    });
  }, [query, filters]);

  // Sort results
  const sortedFish = useMemo(() => {
    const results = [...filteredFish];
    switch (sortBy) {
      case 'price-low':
        return results.sort((a, b) => a.price - b.price);
      case 'price-high':
        return results.sort((a, b) => b.price - a.price);
      case 'name-asc':
        return results.sort((a, b) => a.name.localeCompare(b.name));
      case 'name-desc':
        return results.sort((a, b) => b.name.localeCompare(a.name));
      case 'rating':
        return results.sort((a, b) => b.rating - a.rating);
      case 'popular':
        return results.sort((a, b) => Number(b.popular) - Number(a.popular));
      default:
        return results;
    }
  }, [filteredFish, sortBy]);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [query, filters, sortBy]);

  return (
    <div className="min-h-screen bg-gray-50 pt-6 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {query ? `Search results for "${query}"` : 'All Products'}
          </h1>
          <p className="text-gray-600">
            {loading ? 'Searching...' : 
              sortedFish.length > 0 
                ? `Found ${sortedFish.length} result${sortedFish.length === 1 ? '' : 's'}`
                : 'No results found. Try adjusting your search or filters.'}
          </p>
        </div>

        <FilterControls 
          filters={filters}
          setFilters={setFilters}
          sortBy={sortBy}
          setSortBy={setSortBy}
        />

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-gray-200 rounded-lg animate-pulse h-96"></div>
            ))}
          </div>
        ) : sortedFish.length > 0 ? (
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {sortedFish.map(fish => (
              <SearchResultItem key={fish.id} fish={fish} searchTerm={query} />
            ))}
          </motion.div>
        ) : (
          <motion.div 
            className="text-center py-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Search className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
            <p className="text-gray-500 max-w-md mx-auto mb-6">
              {query 
                ? `We couldn't find any products matching "${query}". Try using different keywords or adjust your filters.`
                : 'No products match your current filters. Try adjusting your search criteria.'
              }
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-4">
              <Button
                onClick={() => {
                  setFilters({ category: '', type: '', priceRange: '', popularOnly: false });
                  setSortBy('relevance');
                }}
                variant="outline"
              >
                Clear All Filters
              </Button>
              <Link 
                href="/category/fish-combo" 
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700"
              >
                Browse All Fish
              </Link>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin mr-2" /> Loading search...</div>}>
      <SearchPageInner />
    </Suspense>
  );
}