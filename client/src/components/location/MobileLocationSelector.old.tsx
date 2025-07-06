'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { X, Search, MapPin, Home, Plus, ChevronRight, Loader2, ChevronLeft, MoreVertical, Map, Navigation, Briefcase } from 'lucide-react';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

// Types
type ViewType = 'list' | 'map' | 'add-address' | 'saved-addresses';

export interface Address {
  id?: string;
  type: 'home' | 'work' | 'other';
  name: string;
  address: string;
  lat: number;
  lng: number;
  isCurrent?: boolean;
  tag?: string;
  distance?: string;
  doorNo?: string;
  landmark?: string;
  phone?: string;
}

interface LocationResult {
  lat: number;
  lng: number;
  formattedAddress?: string;
  address?: string;
  place_id?: string;
  geometry?: {
    location: {
      lat: () => number;
      lng: () => number;
    };
  };
}

// Dynamic imports
const GoogleMapAddress = dynamic(
  () => import('@/components/address/GoogleMapAddress').then((mod) => mod.GoogleMapAddress),
  { 
    ssr: false, 
    loading: () => (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    )
  }
);

const MobileLocationSelector = () => {
  const router = useRouter();
  
  // State for view management
  const [view, setView] = useState<ViewType>('list');
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentAddress, setCurrentAddress] = useState<Address | null>(null);
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number; address?: string } | null>(null);
  const [isSavingAddress, setIsSavingAddress] = useState(false);
  const [newAddress, setNewAddress] = useState<Partial<Address>>({
    type: 'home',
    name: '',
    address: '',
    doorNo: '',
    landmark: '',
    phone: ''
  });
  
  // Get API key from environment variables
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';
  
  // Load saved addresses from localStorage on component mount
  useEffect(() => {
    const saved = localStorage.getItem('saved_addresses');
    if (saved) {
      setSavedAddresses(JSON.parse(saved));
    }
    
    // Try to get current location if not already set
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setSelectedLocation({ lat: latitude, lng: longitude });
          
          // Reverse geocode to get address
          fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`)
            .then(res => res.json())
            .then(data => {
              if (data.results && data.results[0]) {
                const address = data.results[0].formatted_address;
                setCurrentAddress({
                  name: 'Current Location',
                  address: address,
                  lat: latitude,
                  lng: longitude,
                  type: 'home',
                  isCurrent: true
                });
                // Update search query
                setSearchQuery(address);
              }
            })
            .catch(console.error);
        },
        (error) => {
          console.error('Error getting location:', error);
          toast.error('Unable to get your current location. Please enable location services.');
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    }
    
    setIsLoading(false);
  }, [apiKey]);
  
  const handleLocationSelect = useCallback((result: any) => {
    const address = result.formatted_address || result.address || 'Selected Location';
    const location = {
      lat: result.lat || result.geometry?.location.lat(),
      lng: result.lng || result.geometry?.location.lng(),
      address: address,
      place_id: result.place_id
    };
    
    setSelectedLocation(location);
    
    // Update new address form with selected location
    setNewAddress(prev => ({
      ...prev,
      address: address,
      lat: location.lat,
      lng: location.lng
    }));
    
    // Switch to add address view if not already there
    if (view !== 'add-address') {
      setView('add-address');
    }
  }, [view]);
  
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }
    
    setIsLoading(true);
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          const response = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`
          );
          const data = await response.json();
          
          if (data.results && data.results[0]) {
            const address = data.results[0].formatted_address;
            handleLocationSelect({
              lat: latitude,
              lng: longitude,
              formatted_address: address,
              geometry: { location: { lat: () => latitude, lng: () => longitude } }
            });
            
            // Update current address
            setCurrentAddress({
              name: 'Current Location',
              address: address,
              lat: latitude,
              lng: longitude,
              type: 'home',
              isCurrent: true
            });
            
            toast.success('Location updated successfully');
          }
        } catch (error) {
          console.error('Error fetching address:', error);
          toast.error('Failed to get address for current location');
        } finally {
          setIsLoading(false);
        }
      },
      (error) => {
        console.error('Error getting location:', error);
        toast.error('Unable to get your current location');
        setIsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };
  
  // Handle saving a new address
  const handleSaveAddress = () => {
    if (!newAddress.address || !newAddress.type) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    setIsSavingAddress(true);
    
    // Create new address object
    const addressToSave: Address = {
      id: Date.now().toString(),
      name: newAddress.name || newAddress.address?.split(',')[0] || 'New Address',
      address: newAddress.address || '',
      lat: newAddress.lat || 0,
      lng: newAddress.lng || 0,
      type: newAddress.type || 'home',
      doorNo: newAddress.doorNo,
      landmark: newAddress.landmark,
      phone: newAddress.phone,
      isCurrent: true
    };
    
    // Update saved addresses
    const updatedAddresses = [
      ...savedAddresses.filter(addr => !addr.isCurrent),
      { ...addressToSave, isCurrent: true }
    ];
    
    // Save to localStorage
    localStorage.setItem('saved_addresses', JSON.stringify(updatedAddresses));
    setSavedAddresses(updatedAddresses);
    setCurrentAddress(addressToSave);
    
    // Reset form
    setNewAddress({
      type: 'home',
      name: '',
      address: '',
      doorNo: '',
      landmark: '',
      phone: ''
    });
    
    toast.success('Address saved successfully');
    setIsSavingAddress(false);
    setView('list');
  };

  // Render map view
  if (view === 'map') {
    return (
      <div className="h-screen w-full flex flex-col">
        <div className="relative flex-1">
          <GoogleMapAddress
            apiKey={apiKey}
            initialPosition={selectedLocation || { lat: 13.0827, lng: 80.2707 }}
            onSelect={(address, location) => {
              handleLocationSelect({
                ...location,
                formatted_address: address
              });
            }}
          />
          
          {/* Map controls */}
          <div className="absolute top-4 left-0 right-0 flex justify-between px-4">
            <button 
              onClick={() => setView('list')}
              className="bg-white p-2 rounded-full shadow-md"
              aria-label="Back to list"
            >
              <ChevronLeft className="h-5 w-5 text-gray-700" />
            </button>
            
            <button 
              onClick={handleUseCurrentLocation}
              className="bg-white p-2 rounded-full shadow-md"
              aria-label="Use current location"
            >
              <Navigation className="h-5 w-5 text-blue-600" />
            </button>
          </div>
          
          {/* Bottom sheet with address preview */}
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl p-6 shadow-lg">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-medium text-gray-900">Confirm your location</h3>
                <p className="text-sm text-gray-500">
                  {selectedLocation?.address || 'Drag the map to adjust the pin position'}
                </p>
              </div>
              <button 
                onClick={() => setView('add-address')}
                className="text-blue-600 font-medium text-sm"
              >
                Edit
              </button>
            </div>
            
            <Button 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-medium"
              onClick={() => setView('add-address')}
            >
              Confirm Location
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Render add address form
  if (view === 'add-address') {
    return (
      <div className="bg-white min-h-screen p-4">
        <div className="flex items-center gap-4 mb-6">
          <button 
            onClick={() => setView('map')} 
            className="text-gray-700"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h2 className="text-xl font-semibold">Add New Address</h2>
        </div>
        
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Save as</label>
            <div className="grid grid-cols-3 gap-2">
              {['home', 'work', 'other'].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setNewAddress(prev => ({ ...prev, type: type as 'home' | 'work' | 'other' }))}
                  className={`flex items-center justify-center gap-2 p-3 rounded-lg border ${
                    newAddress.type === type 
                      ? 'border-blue-500 bg-blue-50 text-blue-700' 
                      : 'border-gray-200'
                  }`}
                >
                  {type === 'home' && <Home className="h-5 w-5" />}
                  {type === 'work' && <Briefcase className="h-5 w-5" />}
                  {type === 'other' && <MapPin className="h-5 w-5" />}
                  <span className="capitalize">{type}</span>
                </button>
              ))}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Complete Address</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={newAddress.address}
                onChange={(e) => setNewAddress(prev => ({ ...prev, address: e.target.value }))}
                placeholder="House/Flat No, Floor, Building Name"
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Landmark (Optional)</label>
            <input
              type="text"
              value={newAddress.landmark || ''}
              onChange={(e) => setNewAddress(prev => ({ ...prev, landmark: e.target.value }))}
              placeholder="E.g. Near metro station, behind mall"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
            <input
              type="tel"
              value={newAddress.phone || ''}
              onChange={(e) => setNewAddress(prev => ({ ...prev, phone: e.target.value }))}
              placeholder="Enter 10-digit mobile number"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              maxLength={10}
            />
          </div>
          
          <Button 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-medium mt-4"
            onClick={handleSaveAddress}
            disabled={isSavingAddress || !newAddress.address}
          >
            {isSavingAddress ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : 'Save Address'}
          </Button>
        </div>
      </div>
    );
  }

  // Render main list view
  return (
    <div className="bg-white min-h-screen">
      {/* Header */}
      <div className="sticky top-0 bg-white z-10 border-b border-gray-100 p-4">
        <div className="flex items-center gap-4 mb-4">
          <button 
            onClick={() => router.back()} 
            className="text-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
          <h1 className="text-xl font-semibold">Select Location</h1>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search for your area, street name..."
            className="pl-10 pr-4 py-3 w-full border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 space-y-6">
        {/* Current Location */}
        {currentAddress && (
          <div className="mb-6">
            <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">Current Location</h2>
            <div 
              className="p-4 border border-gray-100 rounded-xl bg-white shadow-sm cursor-pointer hover:bg-gray-50"
              onClick={() => handleLocationSelect(currentAddress)}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  <MapPin className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">Current Location</p>
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                      CURRENT
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1 truncate">{currentAddress.address}</p>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </div>
            </div>
          </div>
        )}
        
        {/* Location Options */}
        <div className="space-y-3">
          <button 
            onClick={handleUseCurrentLocation}
            className="flex items-center w-full p-4 border border-gray-200 rounded-xl text-left hover:bg-gray-50"
          >
            <div className="bg-blue-100 p-2 rounded-full mr-3">
              <Navigation className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="font-medium">Use current location</p>
              <p className="text-sm text-gray-500">Enable GPS to detect your location</p>
            </div>
          </button>
          
          <button 
            onClick={() => setView('map')}
            className="flex items-center w-full p-4 border border-gray-200 rounded-xl text-left hover:bg-gray-50"
          >
            <div className="bg-blue-100 p-2 rounded-full mr-3">
              <Map className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="font-medium">Set location on map</p>
              <p className="text-sm text-gray-500">Pinpoint your exact delivery location</p>
            </div>
          </button>
        </div>
        
        {/* Saved Addresses */}
        {savedAddresses.length > 0 && (
          <div className="mt-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Saved Addresses</h2>
              <button 
                onClick={() => setView('saved-addresses')}
                className="text-sm text-blue-600 font-medium"
              >
                View All
              </button>
            </div>
            
            <div className="space-y-3">
              {savedAddresses.slice(0, 2).map((address) => (
                <div 
                  key={address.id}
                  className="p-4 border border-gray-100 rounded-xl bg-white shadow-sm cursor-pointer hover:bg-gray-50"
                  onClick={() => handleLocationSelect(address)}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      {address.type === 'home' ? (
                        <Home className="h-5 w-5 text-blue-600" />
                      ) : address.type === 'work' ? (
                        <Briefcase className="h-5 w-5 text-green-600" />
                      ) : (
                        <MapPin className="h-5 w-5 text-purple-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium capitalize">
                          {address.type === 'home' ? 'Home' : address.type === 'work' ? 'Work' : 'Other'}
                        </p>
                        {address.isCurrent && (
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                            CURRENT
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 mt-1">{address.address}</p>
                      {address.distance && (
                        <p className="text-xs text-gray-400 mt-1">{address.distance} away</p>
                      )}
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MobileLocationSelector;
