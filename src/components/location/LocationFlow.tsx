'use client';

import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { X, Search, MapPin, Home, Briefcase, Map, Navigation, ChevronRight, ChevronLeft, Check, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';
import { useLocation, type Address, type LocationContextType } from '@/context/LocationContext';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

type ViewType = 'main' | 'map' | 'save-address';

type SearchResult = {
  lat: string;
  lon: string;
  display_name: string;
  place_id: string;
  address?: {
    [key: string]: string;
  };
};

interface Location {
  lat: number;
  lng: number;
  address_string: string;
  display_name?: string;
  place_id?: string;
  id?: string;
  user_id?: string;
  door_no?: string;
  building?: string;
  landmark?: string;
  name?: string;
  phone?: string;
  tag?: 'home' | 'work' | 'other';
  created_at?: string;
}

interface LocationFlowProps {
  onClose: () => void;
  onLocationSelect: (location: Location) => void;
  apiKey: string;
}

export function LocationFlow({ onClose, onLocationSelect, apiKey }: LocationFlowProps) {
  const locationContext = useLocation();
  const { currentAddress } = locationContext;
  
  // Safely access context properties with fallbacks
  const addresses = 'addresses' in locationContext ? locationContext.addresses : [];
  const saveAddress = 'saveAddress' in locationContext ? locationContext.saveAddress : async () => {
    console.warn('saveAddress called outside provider');
    return {} as Address;
  };
  const setLocation = 'setLocation' in locationContext ? locationContext.setLocation : () => {
    console.warn('setLocation called outside provider');
  };
  const isLoading = 'isLoading' in locationContext ? locationContext.isLoading : false;
  const [view, setView] = useState<ViewType>('main');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Location[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [formData, setFormData] = useState<{
    name: string;
    phone: string;
    doorNo: string;
    building: string;
    landmark: string;
    tag: 'home' | 'work' | 'other';
  }>({
    name: '',
    phone: '',
    doorNo: '',
    building: '',
    landmark: '',
    tag: 'home',
  });

  // Handle search input change
  const handleSearch = useCallback(async (query: string) => {
    setSearchQuery(query);
    if (query.length < 3) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      // Using OpenStreetMap Nominatim API for geocoding
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`
      );
      const data: SearchResult[] = await response.json();
      
      const formattedResults: Location[] = data.map(result => ({
        lat: parseFloat(result.lat),
        lng: parseFloat(result.lon),
        address_string: result.display_name,
        display_name: result.display_name,
        place_id: result.place_id
      }));
      
      setSearchResults(formattedResults);
    } catch (error) {
      console.error('Error searching locations:', error);
      toast.error('Failed to search locations');
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Handle selecting a search result
  const handleSelectResult = useCallback((result: Location) => {
    setSelectedLocation(result);
    setView('save-address');
  }, []);

  // Handle map position change
  const handleMapPositionChange = useCallback(async (lat: number, lng: number, address?: string) => {
    // Create a base location object with all required properties
    const baseLocation = (prev: Location | null) => ({
      lat,
      lng,
      address_string: address || 'Getting address...',
      display_name: address || '',
      // Include all required properties from the Location type
      ...(prev || {}),
      // Ensure we don't have any undefined values for required properties
      place_id: prev?.place_id || '',
      id: prev?.id || '',
      user_id: prev?.user_id || '',
      door_no: prev?.door_no || '',
      building: prev?.building || '',
      landmark: prev?.landmark || '',
      name: prev?.name || '',
      phone: prev?.phone || '',
      tag: prev?.tag || 'other',
      created_at: prev?.created_at || new Date().toISOString(),
    });

    // Update the location immediately
    setSelectedLocation(prev => baseLocation(prev));
    
    // If we don't have an address, try to get one using Google's reverse geocoding
    if (!address) {
      try {
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch address');
        }
        
        const data = await response.json();
        
        if (data.results && data.results.length > 0) {
          const formattedAddress = data.results[0].formatted_address;
          setSelectedLocation(prev => ({
            ...baseLocation(prev),
            address_string: formattedAddress,
            display_name: formattedAddress,
          }));
        }
      } catch (error) {
        console.error('Reverse geocoding error:', error);
        // Fallback to coordinates if reverse geocoding fails
        setSelectedLocation(prev => ({
          ...baseLocation(prev),
          address_string: `Location at ${lat.toFixed(6)}, ${lng.toFixed(6)}`,
        }));
      }
    }
  }, []);

  // Handle getting current location
  // Check if geolocation is available and request permission
  const checkGeolocationPermission = useCallback(async (): Promise<boolean> => {
    if (!navigator.permissions) {
      // Permissions API not supported, we'll have to try directly
      return true;
    }

    try {
      const permissionStatus = await navigator.permissions.query({ name: 'geolocation' as PermissionName });
      
      if (permissionStatus.state === 'granted') {
        return true;
      } else if (permissionStatus.state === 'prompt') {
        // Permission hasn't been granted or denied yet
        return new Promise((resolve) => {
          const timeout = setTimeout(() => resolve(false), 1000);
          permissionStatus.onchange = () => {
            clearTimeout(timeout);
            resolve(permissionStatus.state === 'granted');
          };
        });
      }
      return false;
    } catch (error) {
      console.error('Error checking geolocation permission:', error);
      return true; // Try anyway if we can't check permissions
    }
  }, []);

  const handleGetCurrentLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }

    setIsSearching(true);
    
    try {
      // First check if we have permission
      const hasPermission = await checkGeolocationPermission();
      if (!hasPermission) {
        toast.error('Please allow location access to use this feature');
        return;
      }

      // Try to get the position with a timeout
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        let timeoutId: NodeJS.Timeout;
        
        const success = (position: GeolocationPosition) => {
          clearTimeout(timeoutId);
          resolve(position);
        };
        
        const error = (error: GeolocationPositionError) => {
          clearTimeout(timeoutId);
          reject(error);
        };
        
        // Set a timeout to handle cases where the browser doesn't respond
        timeoutId = setTimeout(() => {
          reject(new Error('Geolocation request timed out'));
        }, 10000);
        
        // Request the position
        navigator.geolocation.getCurrentPosition(
          success,
          error,
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
          }
        );
      });

      const { latitude, longitude } = position.coords;
      
      // Create and set the initial location with all required properties
      setSelectedLocation({
        lat: latitude,
        lng: longitude,
        address_string: 'Getting address...',
        display_name: '',
      });
      
      // Try to get the address, but don't block on it
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`
        );
        
        if (response.ok) {
          const data = await response.json();
          setSelectedLocation({
            lat: latitude,
            lng: longitude,
            address_string: data.display_name || 'Selected location',
            display_name: data.display_name || '',
          });
        }
      } catch (error) {
        console.error('Reverse geocoding error:', error);
        // Continue with just the coordinates if reverse geocoding fails
        setSelectedLocation({
          lat: latitude,
          lng: longitude,
          address_string: `Location at ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
          display_name: '',
        });
      }
      
      // Switch to save address view
      setView('save-address');
      
    } catch (error) {
      console.error('Geolocation error:', error);
      
      if (error instanceof GeolocationPositionError) {
        switch(error.code) {
          case 1: // PERMISSION_DENIED
            toast.error('Please allow location access in your browser settings');
            // Try to open settings on mobile
            if (/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
              try {
                // @ts-ignore - This is a non-standard API
                if (navigator.permissions && navigator.permissions.request) {
                  // @ts-ignore
                  await navigator.permissions.request({ name: 'geolocation' });
                }
              } catch (e) {
                console.error('Failed to request permission:', e);
              }
            }
            break;
          case 2: // POSITION_UNAVAILABLE
            toast.error('Unable to determine your location. Please check your connection or try again later.');
            break;
          case 3: // TIMEOUT
            toast.error('Location request timed out. Please try again.');
            break;
          default:
            toast.error('Error getting your location. Please try again.');
        }
      } else if (error instanceof Error && error.message.includes('Geolocation request timed out')) {
        toast.error('Location request timed out. Please try again.');
      } else {
        toast.error('Failed to get your location. Please try again.');
      }
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Handle saving address
  const handleSaveAddress = useCallback(async () => {
    if (!selectedLocation) return;
    
    try {
      const address: Omit<Address, 'id' | 'created_at' | 'user_id'> = {
        lat: selectedLocation.lat,
        lng: selectedLocation.lng,
        address_string: selectedLocation.address_string,
        door_no: formData.doorNo,
        building: formData.building,
        landmark: formData.landmark,
        tag: formData.tag,
        name: formData.name,
        phone: formData.phone,
      };
      
      const savedAddress = await saveAddress(address);
      toast.success('Address saved successfully');
      
      // Call onLocationSelect with the full address including the ID
      const updatedLocation: Location = {
        ...selectedLocation,
        id: savedAddress.id,
        user_id: savedAddress.user_id,
        created_at: savedAddress.created_at,
        door_no: savedAddress.door_no,
        building: savedAddress.building,
        landmark: savedAddress.landmark,
        name: savedAddress.name,
        phone: savedAddress.phone,
        tag: savedAddress.tag,
      };
      
      onLocationSelect(updatedLocation);
      onClose();
    } catch (error) {
      console.error('Error saving address:', error);
      toast.error('Failed to save address');
    }
  }, [selectedLocation, formData, saveAddress, onLocationSelect, onClose]);

  // Handle selecting an address from saved addresses
  const handleSelectAddress = useCallback((address: Address) => {
    const location: Location = {
      id: address.id,
      user_id: address.user_id,
      lat: address.lat,
      lng: address.lng,
      address_string: address.address_string,
      door_no: address.door_no,
      building: address.building,
      landmark: address.landmark,
      name: address.name,
      phone: address.phone,
      tag: address.tag,
      created_at: address.created_at
    };
    onLocationSelect(location);
    onClose();
  }, [onLocationSelect, onClose]);

  // Render the main view
  const renderMainView = useCallback(() => {
    return (
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search for area, street name..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>

        {isSearching && searchQuery ? (
          <div className="space-y-2">
            {searchResults.map((result) => (
              <div
                key={result.place_id}
                className="p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                onClick={() => handleSelectResult(result)}
              >
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 text-gray-500 mr-2" />
                  <div className="text-sm">
                    {result.display_name?.split(',').slice(0, 3).join(', ')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={handleGetCurrentLocation}
                disabled={isSearching}
              >
                <div className="bg-blue-50 p-2 rounded-full mr-3">
                  <Navigation className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="font-medium">Use current location</p>
                  <p className="text-sm text-gray-500">Using GPS</p>
                </div>
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start h-14 text-left px-4 py-3 rounded-xl border-gray-200 hover:bg-gray-50"
                onClick={() => setView('map')}
              >
                <div className="bg-green-50 p-2 rounded-full mr-3">
                  <Map className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="font-medium">Select on map</p>
                  <p className="text-sm text-gray-500">Choose your delivery location</p>
                </div>
              </Button>
            </div>

            {addresses.length > 0 && (
              <div className="mt-6">
                <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
                  SAVED ADDRESSES
                </h3>
                <div className="space-y-3">
                  {addresses.map((address) => (
                    <div
                      key={address.id}
                      className="flex items-center p-3 border rounded-xl cursor-pointer hover:bg-gray-50"
                      onClick={() => handleSelectAddress(address)}
                    >
                      <div className="bg-blue-50 p-2 rounded-lg mr-3">
                        {address.tag === 'home' && <Home className="h-5 w-5 text-blue-500" />}
                        {address.tag === 'work' && <Briefcase className="h-5 w-5 text-green-500" />}
                        {!['home', 'work'].includes(address.tag || '') && (
                          <MapPin className="h-5 w-5 text-purple-500" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {address.name} • {address.tag}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5 truncate">
                          {address.address_string?.split(',').slice(0, 3).join(', ')}
                        </p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-gray-400 ml-2 flex-shrink-0" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    );
  }, [
    searchQuery,
    isSearching,
    searchResults,
    addresses,
    handleSearch,
    handleSelectResult,
    handleGetCurrentLocation,
    handleSelectAddress
  ]);

  // Render map view
  const renderMapView = useCallback(() => {
    const MapComponent = dynamic(
      () => import('@/components/map/MapComponent').then((mod) => mod.MapComponent),
      { 
        ssr: false, 
        loading: () => (
          <div className="h-full flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        )
      }
    ) as React.ComponentType<{
      center: { lat: number; lng: number };
      zoom: number;
      draggable: boolean;
      onPositionChange: (lat: number, lng: number, address?: string) => void;
      className: string;
      apiKey: string;
    }>;

    return (
      <div className="h-full flex flex-col">
        <div className="p-4 border-b">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setView('main')}
              className="h-8 w-8"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-lg font-semibold">Select on map</h2>
          </div>
        </div>
        <div className="flex-1 relative">
          <MapComponent
            center={selectedLocation || { lat: 13.0827, lng: 80.2707 }} // Default to Chennai
            zoom={15}
            draggable={true}
            onPositionChange={(lat, lng, address) => {
              handleMapPositionChange(lat, lng);
              if (address && selectedLocation) {
                setSelectedLocation({
                  ...selectedLocation,
                  address_string: address,
                  display_name: address
                });
              }
            }}
            className="w-full h-full"
            apiKey={apiKey}
          />
        </div>
        <div className="p-4 border-t">
          <div className="mb-2">
            <p className="text-sm font-medium">Selected Location:</p>
            <p className="text-sm text-gray-600 truncate">
              {selectedLocation?.address_string || 'Drag the marker to select a location'}
            </p>
          </div>
          <Button
            className="w-full"
            onClick={() => setView('save-address')}
            disabled={!selectedLocation}
          >
            Confirm Location
          </Button>
        </div>
      </div>
    );
  }, [selectedLocation, handleMapPositionChange, apiKey]);

  // Render save address form
  const renderSaveAddressForm = () => (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Save Address</h2>
        <p className="text-sm text-gray-500 mt-1">
          {selectedLocation?.address_string}
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Full Name <span className="text-red-500">*</span>
          </label>
          <Input
            placeholder="Enter your name"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            className="h-12 rounded-xl"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Mobile Number <span className="text-red-500">*</span>
          </label>
          <Input
            placeholder="Enter mobile number"
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({...formData, phone: e.target.value})}
            className="h-12 rounded-xl"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Flat/House No. <span className="text-red-500">*</span>
          </label>
          <Input
            placeholder="Enter flat/house no."
            value={formData.doorNo}
            onChange={(e) => setFormData({...formData, doorNo: e.target.value})}
            className="h-12 rounded-xl"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Building/Street Name <span className="text-red-500">*</span>
          </label>
          <Input
            placeholder="Enter building/street name"
            value={formData.building}
            onChange={(e) => setFormData({...formData, building: e.target.value})}
            className="h-12 rounded-xl"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Landmark (Optional)
          </label>
          <Input
            placeholder="E.g. Near metro station"
            value={formData.landmark}
            onChange={(e) => setFormData({...formData, landmark: e.target.value})}
            className="h-12 rounded-xl"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Save as
          </label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { value: 'home', label: 'Home', icon: <Home className="h-5 w-5" /> },
              { value: 'work', label: 'Work', icon: <Briefcase className="h-5 w-5" /> },
              { value: 'other', label: 'Other', icon: <MapPin className="h-5 w-5" /> },
            ].map((type) => (
              <Button
                key={type.value}
                type="button"
                variant={formData.tag === type.value ? 'default' : 'outline'}
                className={cn(
                  "flex-col h-auto py-3 rounded-xl",
                  formData.tag === type.value 
                    ? "bg-blue-600 hover:bg-blue-700" 
                    : "border-gray-200 hover:bg-gray-50"
                )}
                onClick={() => setFormData({...formData, tag: type.value as any})}
              >
                <span className={cn("mb-1", formData.tag !== type.value && "text-gray-600")}>
                  {type.icon}
                </span>
                <span className="text-sm">{type.label}</span>
              </Button>
            ))}
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t">
        <Button 
          className="w-full h-12 rounded-xl text-base font-medium"
          onClick={handleSaveAddress}
          disabled={!formData.name || !formData.phone || !formData.doorNo || !formData.building}
        >
          Save Address & Continue
        </Button>
      </div>
    </div>
  );

  // Render the current view
  const renderView = useCallback(() => {
    switch (view) {
      case 'map':
        return renderMapView();
      case 'save-address':
        return renderSaveAddressForm();
      case 'main':
      default:
        return renderMainView();
    }
  }, [view, renderMapView, renderSaveAddressForm, renderMainView]);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b p-4">
        <div className="flex items-center justify-between">
          <button 
            onClick={view === 'main' ? onClose : () => setView('main')}
            className="p-1 -ml-1"
          >
            <X className="h-6 w-6 text-gray-600" />
          </button>
          <h1 className="text-lg font-semibold">
            {view === 'save-address' ? 'Save Address' : 'Choose Location'}
          </h1>
          <div className="w-6"></div> {/* For alignment */}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 pb-24">
        {renderView()}
      </div>
    </div>
  );
}
