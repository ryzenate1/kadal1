'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Search, MapPin, Clock, X } from 'lucide-react';

interface SearchResult {
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
  geometry?: {
    location: {
      lat: number;
      lng: number;
    };
  };
}

interface LocationSearchProps {
  onPlaceSelect: (place: SearchResult) => void;
  onSearchChange?: (query: string) => void;
  savedAddresses?: any[];
  recentSearches?: any[];
  placeholder?: string;
  className?: string;
}

export default function LocationSearch({
  onPlaceSelect,
  onSearchChange,
  savedAddresses = [],
  recentSearches = [],
  placeholder = "Try JP Nagar, Siri Gardenia, etc.",
  className = ""
}: LocationSearchProps) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const debounceTimeoutRef = useRef<NodeJS.Timeout>();
  const autocompleteServiceRef = useRef<google.maps.places.AutocompleteService | null>(null);

  // Mock suggestions fallback when Google Places API is not available
  const setMockSuggestions = (searchQuery: string) => {
    const mockResults: SearchResult[] = [
      {
        place_id: 'mock_1',
        description: `${searchQuery}, Bangalore, Karnataka, India`,
        structured_formatting: {
          main_text: searchQuery,
          secondary_text: 'Bangalore, Karnataka, India'
        }
      },
      {
        place_id: 'mock_2', 
        description: `${searchQuery}, Chennai, Tamil Nadu, India`,
        structured_formatting: {
          main_text: searchQuery,
          secondary_text: 'Chennai, Tamil Nadu, India'
        }
      },
      {
        place_id: 'mock_3',
        description: `${searchQuery}, Mumbai, Maharashtra, India`,
        structured_formatting: {
          main_text: searchQuery,
          secondary_text: 'Mumbai, Maharashtra, India'
        }
      }
    ];
    
    setSuggestions(mockResults);
    setShowDropdown(true);
    setIsLoading(false);
  };

  // Initialize Google Places Autocomplete Service
  useEffect(() => {
    const initializeAutocomplete = async () => {
      try {
        // Import and load Google Maps
        const { loadGoogleMaps, isGoogleMapsLoaded } = await import('@/utils/googleMapsLoader');
        
        if (!isGoogleMapsLoaded()) {
          await loadGoogleMaps();
        }
        
        // Now initialize the autocomplete service
        if (typeof window !== 'undefined' && window.google && window.google.maps && window.google.maps.places) {
          autocompleteServiceRef.current = new window.google.maps.places.AutocompleteService();
          console.log('Google Places AutocompleteService initialized successfully');
        } else {
          console.error('Google Maps Places API not available');
        }
      } catch (error) {
        console.error('Failed to load Google Maps:', error);
      }
    };

    initializeAutocomplete();
  }, []);

  // Debounced search function using Google Places Autocomplete API
  const debouncedSearch = useCallback((searchQuery: string) => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(() => {
      if (searchQuery.trim()) {
        setIsLoading(true);
        
        // Check if Google Places service is available
        if (autocompleteServiceRef.current && window.google && window.google.maps && window.google.maps.places) {
          // Google Places Autocomplete API call
          autocompleteServiceRef.current.getPlacePredictions(
            {
              input: searchQuery,
              componentRestrictions: { country: 'IN' }, // Restrict to India
              types: ['geocode'] // Focus on addresses/places
            },
            (predictions, status) => {
              setIsLoading(false);
              
              if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
                setSuggestions(predictions.map(prediction => ({
                  place_id: prediction.place_id,
                  description: prediction.description,
                  structured_formatting: prediction.structured_formatting
                })));
                setShowDropdown(true);
              } else {
                console.warn('Google Places API error:', status);
                // Fallback to mock suggestions
                setMockSuggestions(searchQuery);
              }
            }
          );
        } else {
          console.warn('Google Places service not available, using mock data');
          // Fallback to mock suggestions
          setMockSuggestions(searchQuery);
        }
      } else {
        setSuggestions([]);
        setShowDropdown(query.trim().length === 0); // Show saved addresses when empty
      }
    }, 300); // 300ms debounce as specified
  }, [query]);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    onSearchChange?.(value);
    debouncedSearch(value);
  };

  // Handle place selection - redirect to map picker
  const handlePlaceSelect = (place: SearchResult) => {
    setQuery(place.structured_formatting.main_text);
    setShowDropdown(false);
    setSuggestions([]);
    
    // Save to recent searches
    const updatedRecentSearches = [
      { query: place.description, place_id: place.place_id },
      ...recentSearches.filter(search => search.place_id !== place.place_id).slice(0, 4)
    ];
    localStorage.setItem('recent_searches', JSON.stringify(updatedRecentSearches));
    
    onPlaceSelect(place);
  };

  // Handle saved address selection
  const handleSavedAddressSelect = (address: any) => {
    const placeResult: SearchResult = {
      place_id: address.id,
      description: address.address_string || address.fullAddress,
      structured_formatting: {
        main_text: address.label || address.tag,
        secondary_text: address.address_string || address.fullAddress
      },
      geometry: {
        location: {
          lat: address.lat,
          lng: address.lng
        }
      }
    };
    handlePlaceSelect(placeResult);
  };

  // Clear search
  const clearSearch = () => {
    setQuery('');
    setSuggestions([]);
    setShowDropdown(false);
    onSearchChange?.('');
  };

  // Handle focus - show saved addresses when empty
  const handleFocus = () => {
    if (query.trim().length === 0) {
      setShowDropdown(true); // Show saved addresses when focused and empty
    } else {
      setShowDropdown(suggestions.length > 0);
    }
  };

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.location-search-container')) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`relative location-search-container ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={handleFocus}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:border-orange-500 focus:outline-none transition-colors text-sm"
        />
        {query && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* Dropdown with suggestions */}
      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
          {/* Loading state */}
          {isLoading && (
            <div className="p-4 text-center text-gray-500">
              <div className="animate-spin w-5 h-5 border-2 border-gray-300 border-t-orange-500 rounded-full mx-auto"></div>
              <p className="mt-2 text-sm">Searching...</p>
            </div>
          )}

          {/* Search Results */}
          {!isLoading && query.trim() && suggestions.length > 0 && (
            <>
              <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Search Results</p>
              </div>
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion.place_id}
                  onClick={() => handlePlaceSelect(suggestion)}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <MapPin className="text-gray-400 mt-0.5 flex-shrink-0" size={16} />
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-gray-900 truncate text-sm">
                        {suggestion.structured_formatting.main_text}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {suggestion.structured_formatting.secondary_text}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </>
          )}

          {/* No results for search */}
          {!isLoading && query.trim() && suggestions.length === 0 && (
            <div className="p-4 text-center text-gray-500">
              <MapPin className="mx-auto mb-2 text-gray-300" size={24} />
              <p className="text-sm">No places found for "{query}"</p>
              <p className="text-xs text-gray-400 mt-1">Try a different search term</p>
            </div>
          )}

          {/* Saved Addresses (shown when empty query) */}
          {!isLoading && !query.trim() && savedAddresses.length > 0 && (
            <>
              <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Saved Addresses</p>
              </div>
              {savedAddresses.slice(0, 5).map((address, index) => (
                <button
                  key={address.id || index}
                  onClick={() => handleSavedAddressSelect(address)}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <MapPin className="text-orange-500 mt-0.5 flex-shrink-0" size={16} />
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-gray-900 truncate text-sm">
                        {address.label || address.tag || 'Saved Address'}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {address.address_string || address.fullAddress}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </>
          )}

          {/* Recent Searches (shown when empty and no saved addresses) */}
          {!isLoading && !query.trim() && savedAddresses.length === 0 && recentSearches.length > 0 && (
            <>
              <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Recent Searches</p>
              </div>
              {recentSearches.slice(0, 3).map((search, index) => (
                <button
                  key={index}
                  onClick={() => setQuery(search.query)}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <Clock className="text-gray-400 mt-0.5 flex-shrink-0" size={16} />
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-gray-900 truncate text-sm">{search.query}</p>
                    </div>
                  </div>
                </button>
              ))}
            </>
          )}

          {/* Empty state */}
          {!isLoading && !query.trim() && savedAddresses.length === 0 && recentSearches.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              <MapPin className="mx-auto mb-2 text-gray-300" size={32} />
              <p className="text-sm font-medium">No saved addresses</p>
              <p className="text-xs text-gray-400 mt-1">Start typing to search for places</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
