"use client";

import { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Clock } from 'lucide-react';
import { Loader } from '@googlemaps/js-api-loader';

interface Place {
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
  geometry?: {
    location: { lat: number; lng: number };
  };
}

interface LocationSearchProps {
  onPlaceSelect: (place: Place & { lat: number; lng: number }) => void;
  placeholder?: string;
  className?: string;
  showRecentSearches?: boolean;
}

export default function LocationSearch({
  onPlaceSelect,
  placeholder = "Search for area, street name...",
  className = "",
  showRecentSearches = true
}: LocationSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Place[]>([]);
  const [recentSearches, setRecentSearches] = useState<Place[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const searchRef = useRef<HTMLDivElement>(null);
  const autocompleteService = useRef<google.maps.places.AutocompleteService | null>(null);
  const placesService = useRef<google.maps.places.PlacesService | null>(null);

  // Initialize Google Places API
  useEffect(() => {
    const initPlacesAPI = async () => {
      try {
        const loader = new Loader({
          apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
          version: 'weekly',
          libraries: ['places']
        });

        const google = await loader.load();
        autocompleteService.current = new google.maps.places.AutocompleteService();
        
        // Create a dummy div for PlacesService (required)
        const dummyDiv = document.createElement('div');
        const dummyMap = new google.maps.Map(dummyDiv);
        placesService.current = new google.maps.places.PlacesService(dummyMap);
        
        // Load recent searches
        loadRecentSearches();
      } catch (err) {
        console.error('Error initializing Google Places:', err);
        setError('Location search is temporarily unavailable');
      }
    };

    initPlacesAPI();
  }, []);

  // Load recent searches from localStorage
  const loadRecentSearches = () => {
    try {
      const saved = localStorage.getItem('recent_searches');
      if (saved) {
        setRecentSearches(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error loading recent searches:', error);
    }
  };

  // Save recent search to localStorage
  const saveRecentSearch = (place: Place) => {
    try {
      const updated = [place, ...recentSearches.filter(p => p.place_id !== place.place_id)].slice(0, 3);
      localStorage.setItem('recent_searches', JSON.stringify(updated));
      setRecentSearches(updated);
    } catch (error) {
      console.error('Error saving recent search:', error);
    }
  };

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query.length >= 2 && autocompleteService.current) {
        searchPlaces(query);
      } else {
        setResults([]);
      }
    }, 400);

    return () => clearTimeout(timeoutId);
  }, [query]);

  const searchPlaces = async (searchQuery: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const request = {
        input: searchQuery,
        componentRestrictions: { country: 'in' }, // Restrict to India
        fields: ['place_id', 'description', 'structured_formatting']
      };

      autocompleteService.current?.getPlacePredictions(request, (predictions, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
          setResults(predictions.slice(0, 5)); // Limit to 5 results
        } else {
          setResults([]);
          if (status !== google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
            setError('Search failed. Please try again.');
          }
        }
        setIsLoading(false);
      });
    } catch (err) {
      console.error('Search error:', err);
      setError('Search failed. Please try again.');
      setIsLoading(false);
    }
  };

  const handlePlaceSelect = async (place: Place) => {
    try {
      if (!placesService.current) return;
      
      // Get place details to get coordinates
      placesService.current.getDetails({
        placeId: place.place_id,
        fields: ['geometry', 'formatted_address']
      }, (placeDetails, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && placeDetails?.geometry?.location) {
          const selectedPlace = {
            ...place,
            lat: placeDetails.geometry.location.lat(),
            lng: placeDetails.geometry.location.lng()
          };
          
          saveRecentSearch(place);
          onPlaceSelect(selectedPlace);
          setQuery('');
          setShowResults(false);
        }
      });
    } catch (error) {
      console.error('Error selecting place:', error);
    }
  };

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setShowResults(true)}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-500"
        />
      </div>

      {/* Search Results & Recent Searches */}
      {showResults && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-y-auto">
          {/* Loading State */}
          {isLoading && (
            <div className="p-4 text-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500 mx-auto"></div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="p-4 text-center text-red-500 text-sm">
              {error}
            </div>
          )}

          {/* Search Results */}
          {query.length >= 2 && results.length > 0 && (
            <div>
              <div className="px-4 py-2 text-xs font-semibold text-gray-500 bg-gray-50 border-b">
                SEARCH RESULTS
              </div>
              {results.map((place) => (
                <button
                  key={place.place_id}
                  onClick={() => handlePlaceSelect(place)}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                >
                  <div className="flex items-start space-x-3">
                    <MapPin className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-gray-900">
                        {place.structured_formatting.main_text}
                      </p>
                      <p className="text-sm text-gray-500">
                        {place.structured_formatting.secondary_text}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Recent Searches */}
          {showRecentSearches && query.length === 0 && recentSearches.length > 0 && (
            <div>
              <div className="px-4 py-2 text-xs font-semibold text-gray-500 bg-gray-50 border-b">
                RECENT SEARCHES
              </div>
              {recentSearches.map((place) => (
                <button
                  key={place.place_id}
                  onClick={() => handlePlaceSelect(place)}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                >
                  <div className="flex items-start space-x-3">
                    <Clock className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-gray-900">
                        {place.structured_formatting.main_text}
                      </p>
                      <p className="text-sm text-gray-500">
                        {place.structured_formatting.secondary_text}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* No Results */}
          {query.length >= 2 && results.length === 0 && !isLoading && !error && (
            <div className="p-4 text-center text-gray-500">
              <MapPin className="h-8 w-8 text-gray-300 mx-auto mb-2" />
              <p>No locations found for "{query}"</p>
              <p className="text-sm mt-1">Try searching with different keywords</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
