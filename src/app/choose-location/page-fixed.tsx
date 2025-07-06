'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, Plus, Home, Building2, Users, Landmark, ArrowLeft, Clock, Loader } from 'lucide-react';
import { useLocation, type Address } from '@/context/LocationContext';
import { useAuth } from '@/context/AuthContext';
import LocationSearchNew from '@/components/maps/LocationSearchNew';
import { getCurrentLocation, formatDistance, calculateDistance } from '@/utils/location';
import { toast } from 'sonner';

// Mock current user location for distance calculation
const CURRENT_USER_LOCATION = { lat: 13.0827, lng: 80.2707 };

export default function ChooseLocationPage() {
  const router = useRouter();
  const { currentAddress, addresses, saveAddress, setLocation } = useLocation();
  const { user, isAuthenticated } = useAuth();
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [recentSearches, setRecentSearches] = useState<any[]>([]);

  // Load recent searches on mount
  useEffect(() => {
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
    loadRecentSearches();
  }, []);

  // Handle search result selection
  const handleSearchSelect = async (place: any) => {
    try {
      // Create address object from search result
      const newAddress = {
        lat: place.lat,
        lng: place.lng,
        address_string: place.description,
        door_no: '',
        building: '',
        landmark: '',
        tag: 'other' as const,
        name: place.structured_formatting?.main_text || '',
        phone: ''
      };

      // Navigate to map picker with the selected location
      const params = new URLSearchParams({
        lat: place.lat.toString(),
        lng: place.lng.toString(),
        placeId: place.place_id
      });
      
      router.push(`/map-picker?${params.toString()}`);
    } catch (error) {
      console.error('Error handling search selection:', error);
      toast.error('Failed to select location');
    }
  };

  // Handle current location detection
  const handleUseCurrentLocation = async () => {
    try {
      setIsGettingLocation(true);
      
      // Immediately redirect to map picker with current location mode
      // The map picker will handle the actual location fetching
      router.push('/map-picker?mode=current');
    } catch (error: any) {
      console.error('Error navigating to map picker:', error);
      toast.error('Failed to open location picker');
    } finally {
      setIsGettingLocation(false);
    }
  };

  // Handle add new address
  const handleAddNewAddress = () => {
    // Navigate to map picker for manual selection
    router.push('/map-picker?mode=new');
  };

  // Handle saved address selection
  const handleAddressSelect = (address: any) => {
    setLocation(address);
    toast.success('Location updated successfully');
    router.push('/');
  };

  // Handle back navigation
  const handleBackClick = () => {
    router.back();
  };

  // Calculate distance for saved addresses
  const getAddressWithDistance = (address: Address) => {
    if (address.lat && address.lng) {
      const distance = calculateDistance(
        CURRENT_USER_LOCATION.lat,
        CURRENT_USER_LOCATION.lng,
        address.lat,
        address.lng
      );
      return {
        ...address,
        distance: formatDistance(distance)
      };
    }
    return { ...address, distance: 'Unknown' };
  };

  const savedAddressesWithDistance = addresses.map(getAddressWithDistance);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-blue-50">
      <div className="p-4 pb-24 max-w-md mx-auto">
        {/* Enhanced Header */}
        <div className="flex items-center gap-3 mb-6 pt-2">
          <button
            onClick={handleBackClick}
            className="p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-all duration-200 border border-gray-100"
          >
            <ArrowLeft size={20} className="text-gray-700" />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-gray-900">Choose Location</h1>
            <p className="text-sm text-gray-600">Enter your area or apartment name</p>
          </div>
        </div>

        {/* Enhanced Search Box */}
        <div className="mb-6 bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-1 border border-gray-100">
          <LocationSearchNew
            onPlaceSelect={handleSearchSelect}
            placeholder="Try JP Nagar, Siri Gardenia, etc."
            className="w-full border-0 bg-transparent focus:ring-0"
            savedAddresses={savedAddressesWithDistance}
            recentSearches={recentSearches}
          />
        </div>

        {/* Quick Actions */}
        <div className="space-y-3 mb-6">
          {/* Use Current Location */}
          <button 
            onClick={handleUseCurrentLocation}
            disabled={isGettingLocation}
            className="w-full bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-4 border border-gray-100 hover:shadow-xl transition-all duration-200 disabled:opacity-50"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-full">
                  {isGettingLocation ? (
                    <Loader className="animate-spin text-orange-600" size={20} />
                  ) : (
                    <MapPin className="text-orange-600" size={20} />
                  )}
                </div>
                <div className="text-left">
                  <p className="font-semibold text-gray-900">
                    {isGettingLocation ? 'Opening location picker...' : 'Use my current location'}
                  </p>
                  <p className="text-sm text-gray-600">
                    {isGettingLocation ? 'Redirecting to map...' : 'Auto-detect using GPS'}
                  </p>
                </div>
              </div>
              <div className="text-gray-400">
                <span className="text-lg">›</span>
              </div>
            </div>
          </button>

          {/* Add New Address */}
          <button 
            onClick={handleAddNewAddress}
            className="w-full bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-4 border border-gray-100 hover:shadow-xl transition-all duration-200"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-full">
                  <Plus className="text-green-600" size={20} />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-gray-900">Add new address</p>
                  <p className="text-sm text-gray-600">Select from map or search location</p>
                </div>
              </div>
              <div className="text-gray-400">
                <span className="text-lg">›</span>
              </div>
            </div>
          </button>
        </div>

        {/* Saved Addresses */}
        {savedAddressesWithDistance.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-bold text-gray-700 mb-3 px-2 flex items-center gap-2">
              <Home size={16} className="text-orange-500" />
              SAVED ADDRESSES
            </h3>
            <div className="space-y-3">
              {savedAddressesWithDistance.map((address: Address & { distance: string }, index: number) => {
                const isSelected = currentAddress?.id === address.id;
                const IconComponent = 
                  address.tag === 'home' ? Home :
                  address.tag === 'work' ? Building2 :
                  address.tag === 'other' ? Users :
                  Landmark;

                return (
                  <button
                    key={address.id}
                    onClick={() => handleAddressSelect(address)}
                    className={`w-full bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-4 border transition-all duration-200 hover:shadow-xl ${
                      isSelected ? 'border-orange-300 bg-orange-50/90' : 'border-gray-100'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className={`p-2 rounded-full ${
                          address.tag === 'home' ? 'bg-blue-100' :
                          address.tag === 'work' ? 'bg-green-100' :
                          'bg-purple-100'
                        }`}>
                          <IconComponent size={18} className={
                            address.tag === 'home' ? 'text-blue-600' :
                            address.tag === 'work' ? 'text-green-600' :
                            'text-purple-600'
                          } />
                        </div>
                        <div className="text-left flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold text-gray-900 capitalize">
                              {address.tag === 'home' ? 'Home' : 
                               address.tag === 'work' ? 'Work' : 
                               address.tag}
                            </p>
                            <span className="text-xs text-gray-500">•</span>
                            <span className="text-xs text-gray-500">{address.distance}</span>
                            {isSelected && (
                              <span className="text-[10px] text-white bg-green-500 rounded-full px-2 py-1">
                                CURRENT
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 leading-relaxed">
                            {address.address_string}
                          </p>
                        </div>
                      </div>
                      <div className="text-gray-400 flex-shrink-0 ml-2">
                        <span className="text-lg">⋮</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
            {savedAddressesWithDistance.length > 3 && (
              <button className="text-orange-600 text-sm font-medium mt-3 px-2 hover:text-orange-700 transition-colors">
                View more ⌄
              </button>
            )}
          </div>
        )}

        {/* Recent Searches */}
        {recentSearches.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-bold text-gray-700 mb-3 px-2 flex items-center gap-2">
              <Clock size={16} className="text-orange-500" />
              RECENT SEARCHES
            </h3>
            <div className="space-y-3">
              {recentSearches.slice(0, 3).map((search, index) => (
                <button
                  key={index}
                  onClick={() => handleSearchSelect(search)}
                  className="w-full bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-4 border border-gray-100 hover:shadow-xl transition-all duration-200"
                >
                  <div className="flex items-start gap-3 text-left">
                    <div className="p-2 bg-gray-100 rounded-full">
                      <Clock className="text-gray-600" size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 mb-1">
                        {search.structured_formatting?.main_text}
                      </p>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {search.structured_formatting?.secondary_text}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {search.distance || 'Distance unknown'}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Enhanced Empty State */}
        {savedAddressesWithDistance.length === 0 && recentSearches.length === 0 && (
          <div className="mt-12 text-center">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-gray-100">
              <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="h-10 w-10 text-orange-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No saved addresses yet</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Add your first address to get started with seamless deliveries
              </p>
              <button
                onClick={handleAddNewAddress}
                className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-orange-600 hover:to-orange-700 transition-all duration-200 shadow-lg transform hover:scale-105"
              >
                Add Your First Address
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
