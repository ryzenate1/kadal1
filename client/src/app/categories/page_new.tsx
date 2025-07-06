'use client';

import React, { useState, useEffect } from 'react';
import { Search, Filter, X, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { motion } from 'framer-motion';
import { fishProducts, FishProduct, getPopularFish, getPremiumFish, getFishByTag, searchFish } from '@/data/additionalFishData';
import PremiumFishCard from '@/components/fish/PremiumFishCard';

const CategoriesPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [filteredFish, setFilteredFish] = useState<FishProduct[]>(fishProducts);
  const [displayedFish, setDisplayedFish] = useState<FishProduct[]>([]);
  const [itemsToShow, setItemsToShow] = useState(12);

  // Filter options with accurate counts
  const filterOptions = [
    { value: 'all', label: 'All Fish', count: fishProducts.length },
    { value: 'popular', label: 'Popular', count: getPopularFish().length },
    { value: 'premium', label: 'Premium', count: getPremiumFish().length },
    { value: 'tastiest', label: 'Good for Fry', count: getFishByTag('Good for Fry').length },
    { value: 'boneless', label: 'Boneless', count: getFishByTag('Boneless').length },
    { value: 'good-for-curry', label: 'Good for Curry', count: getFishByTag('Good for Curry').length },
    { value: 'high-omega3', label: 'High Omega-3', count: getFishByTag('High Omega-3').length },
    { value: 'oily-fish', label: 'Oily Fish', count: getFishByTag('Oily Fish').length },
    { value: 'small-fish', label: 'Small Fish', count: getFishByTag('Small Fish').length },
    { value: 'local-fish', label: 'Local Fish', count: getFishByTag('Local Fish').length }
  ];

  // Apply filters and search
  useEffect(() => {
    let result = fishProducts;

    // Apply search filter first
    if (searchQuery.trim()) {
      result = searchFish(searchQuery.trim());
    }

    // Apply category filter
    switch (selectedFilter) {
      case 'popular':
        result = result.filter(fish => fish.isPopular);
        break;
      case 'premium':
        result = result.filter(fish => fish.isPremium);
        break;
      case 'tastiest':
        result = result.filter(fish => fish.tags.includes('Good for Fry'));
        break;
      case 'boneless':
        result = result.filter(fish => fish.tags.includes('Boneless'));
        break;
      case 'good-for-curry':
        result = result.filter(fish => fish.tags.includes('Good for Curry'));
        break;
      case 'high-omega3':
        result = result.filter(fish => fish.tags.includes('High Omega-3'));
        break;
      case 'oily-fish':
        result = result.filter(fish => fish.tags.includes('Oily Fish'));
        break;
      case 'small-fish':
        result = result.filter(fish => fish.tags.includes('Small Fish'));
        break;
      case 'local-fish':
        result = result.filter(fish => fish.tags.includes('Local Fish'));
        break;
      default:
        // 'all' - no additional filtering
        break;
    }

    setFilteredFish(result);
    setItemsToShow(12); // Reset items to show when filter changes
  }, [searchQuery, selectedFilter]);

  // Update displayed fish when filteredFish or itemsToShow changes
  useEffect(() => {
    setDisplayedFish(filteredFish.slice(0, itemsToShow));
  }, [filteredFish, itemsToShow]);

  const loadMoreFish = () => {
    setItemsToShow(prev => prev + 12);
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  const clearFilter = () => {
    setSelectedFilter('all');
  };

  const hasMoreFish = itemsToShow < filteredFish.length;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Fresh Seafood Collection
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover our premium selection of fresh fish and seafood, sourced directly from coastal waters.
            Each product comes with detailed nutritional information and authentic Tamil names.
          </p>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Input */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search for fish (e.g., Vanjaram, Salmon, Mathi)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Filter Dropdown */}
            <div className="flex gap-2">
              <Select value={selectedFilter} onValueChange={setSelectedFilter}>
                <SelectTrigger className="w-48">
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4" />
                    <SelectValue placeholder="Filter by..." />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {filterOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label} ({option.count})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {selectedFilter !== 'all' && (
                <Button
                  variant="outline"
                  onClick={clearFilter}
                  className="px-3 hover:bg-red-50 hover:border-red-200"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Active Filters Display */}
          {(searchQuery || selectedFilter !== 'all') && (
            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-200">
              {searchQuery && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  Search: "{searchQuery}"
                  <button onClick={clearSearch} className="hover:text-blue-900 transition-colors">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {selectedFilter !== 'all' && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                  Filter: {filterOptions.find(f => f.value === selectedFilter)?.label}
                  <button onClick={clearFilter} className="hover:text-green-900 transition-colors">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="flex justify-between items-center mb-6">
          <p className="text-gray-600 font-medium">
            Showing {displayedFish.length} of {filteredFish.length} {filteredFish.length === 1 ? 'product' : 'products'}
          </p>
          <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
            Prices shown for 500g unless specified
          </div>
        </div>

        {/* Fish Grid */}
        {filteredFish.length > 0 ? (
          <>
            <motion.div 
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {displayedFish.map((fish, index) => (
                <motion.div
                  key={fish.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="h-full"
                >
                  <PremiumFishCard fish={fish} className="h-full" />
                </motion.div>
              ))}
            </motion.div>

            {/* View More Button */}
            {hasMoreFish && (
              <div className="flex justify-center mt-12">
                <Button
                  onClick={loadMoreFish}
                  className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-medium transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  <Eye className="w-5 h-5 mr-2" />
                  View More Fish ({filteredFish.length - displayedFish.length} remaining)
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16">
            <div className="text-gray-400 mb-6">
              <Search className="w-20 h-20 mx-auto" />
            </div>
            <h3 className="text-2xl font-medium text-gray-900 mb-3">No fish found</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              We couldn't find any fish matching your search criteria. Try adjusting your filters or search terms.
            </p>
            <div className="flex justify-center gap-3">
              {searchQuery && (
                <Button onClick={clearSearch} variant="outline" className="font-medium">
                  Clear Search
                </Button>
              )}
              {selectedFilter !== 'all' && (
                <Button onClick={clearFilter} variant="outline" className="font-medium">
                  Clear Filter
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Quick Stats */}
        <div className="mt-16 bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-6 text-center">
            Our Collection at a Glance
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="bg-blue-50 rounded-xl p-4">
              <div className="text-3xl font-bold text-blue-600 mb-1">{fishProducts.length}</div>
              <div className="text-sm text-gray-600 font-medium">Total Fish Varieties</div>
            </div>
            <div className="bg-green-50 rounded-xl p-4">
              <div className="text-3xl font-bold text-green-600 mb-1">{getPremiumFish().length}</div>
              <div className="text-sm text-gray-600 font-medium">Premium Selection</div>
            </div>
            <div className="bg-purple-50 rounded-xl p-4">
              <div className="text-3xl font-bold text-purple-600 mb-1">{getPopularFish().length}</div>
              <div className="text-sm text-gray-600 font-medium">Popular Choices</div>
            </div>
            <div className="bg-orange-50 rounded-xl p-4">
              <div className="text-3xl font-bold text-orange-600 mb-1">{getFishByTag('High Omega-3').length}</div>
              <div className="text-sm text-gray-600 font-medium">High Omega-3</div>
            </div>
          </div>
        </div>

        {/* Fish Type Categories */}
        <div className="mt-12 bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-6 text-center">
            Browse by Category
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {filterOptions.slice(1).map((option) => (
              <button
                key={option.value}
                onClick={() => setSelectedFilter(option.value)}
                className={`p-4 rounded-xl border-2 transition-all text-center hover:shadow-md ${
                  selectedFilter === option.value
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="font-semibold text-lg">{option.count}</div>
                <div className="text-sm text-gray-600">{option.label}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoriesPage;
