'use client';

import { useState } from 'react';
import { X, Search, MapPin, Home, Plus, ChevronRight, MapPin as Pin, MoreVertical } from 'lucide-react';
import dynamic from 'next/dynamic';
import AddAddressOverlay from './AddAddressOverlay';
import GoogleMap from './GoogleMap';

// Remove the problematic LocationMap import since the file is empty
// const LocationMap = dynamic(
//   () => import('@/components/location/LocationMap'),
//   { ssr: false, loading: () => (
//     <div className="flex items-center justify-center h-full">
//       <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
//     </div>
//   )
// });

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type ViewType = 'main' | 'map';

const MobileLocationSelector = () => {
  const [view, setView] = useState<ViewType>('main');
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const [showMap, setShowMap] = useState(false);
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{ 
    lat: number; 
    lng: number; 
    address?: string 
  } | null>(null);
  const [currentAddress, setCurrentAddress] = useState({
    name: 'Adityaram Nagar',
    fullAddress: 'Adityaram Nagar, Panaiyur, Chennai, Tamil Nadu 600119, India',
    lat: 13.0827,
    lng: 80.2707
  });

  // Mock data
  const savedAddresses = [
    {
      id: 1,
      type: 'home',
      name: 'Home',
      distance: '13 m',
      address: '123 Main St, Adityaram Nagar, Panaiyur, Chennai, Tamil Nadu 600119',
      isCurrent: true,
    },
    {
      id: 2,
      type: 'other',
      name: 'Place',
      distance: '63 m',
      address: '456 Park Ave, Adityaram Nagar, Chennai',
      isCurrent: false,
    },
    {
      id: 3,
      type: 'other',
      name: 'Place1',
      distance: '88 m',
      address: '789 Oak St, Adityaram Nagar, Chennai',
      isCurrent: false,
    },
  ];

  const recentSearches = [
    {
      id: 1,
      name: 'Adityaram Nagar',
      distance: '37 m',
      address: 'Adityaram Nagar, Panaiyur, Chennai, Tamil Nadu 600119, India',
    },
  ];

  const handleUseCurrentLocation = () => {
    setShowMap(true);
  };

  const handleLocationSelect = (location: { lat: number; lng: number }) => {
    setSelectedLocation(location);
  };

  const handleAddNewAddress = () => {
    setShowAddAddress(true);
  };

  const handleSaveAddress = (address: {
    houseNo: string;
    area: string;
    directions: string;
    tag: 'home' | 'work' | 'family' | 'other';
  }) => {
    // Here you would typically save the address to your state/API
    console.log('Saving address:', address);
    setShowAddAddress(false);
    // Optionally show a success message
  };

  const handleCloseMap = () => {
    // Handle location confirmation
    setShowMap(false);
    // Optionally navigate back or update the UI
    router.back();
  };

  if (showMap) {
    return (
      <GoogleMap 
        onLocationSelect={(location) => {
          handleLocationSelect(location);
          // Update the current address when a new location is selected
          if (location.address) {
            setCurrentAddress({
              name: location.address.split(',')[0] || 'Selected Location',
              fullAddress: location.address,
              lat: location.lat,
              lng: location.lng
            });
          }
          setShowMap(false);
        }}
        initialPosition={selectedLocation || { lat: 13.0827, lng: 80.2707 }} // Default to Chennai
        onClose={() => setShowMap(false)}
      />
    );
  }

  return (
    <div className="bg-white min-h-screen">
      {/* Header */}
      <div className="sticky top-0 bg-white z-10 border-b border-gray-100 p-4">
        <div className="flex items-center gap-4 mb-4">
          <button onClick={() => router.back()} className="text-gray-700">
            <X size={24} />
          </button>
          <h1 className="text-xl font-bold flex-1">Enter your area or apartment name</h1>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <Input
            type="text"
            placeholder="Try JP Nagar, Siri Gardenia, etc."
            className="pl-10 pr-4 py-3 rounded-xl border-gray-300 focus:border-red-500 focus:ring-1 focus:ring-red-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Location Options */}
        <div className="space-y-3">
          <button 
            onClick={handleUseCurrentLocation}
            className="flex items-center justify-between w-full p-3 rounded-xl bg-white border border-gray-100 shadow-sm hover:bg-gray-50"
          >
            <div className="flex items-center gap-3">
              <div className="bg-red-100 p-2 rounded-full">
                <MapPin className="text-red-600" size={20} />
              </div>
              <span className="text-red-600 font-medium">Use my current location</span>
            </div>
            <ChevronRight className="text-gray-400" size={20} />
          </button>
          
          <button 
            onClick={handleAddNewAddress}
            className="flex items-center justify-between w-full p-3 rounded-xl bg-white border border-gray-100 shadow-sm hover:bg-gray-50"
          >
            <div className="flex items-center gap-3">
              <div className="bg-red-100 p-2 rounded-full">
                <Plus className="text-red-600" size={20} />
              </div>
              <span className="text-red-600 font-medium">Add new address</span>
            </div>
            <ChevronRight className="text-gray-400" size={20} />
          </button>

          {/* Add Address Overlay */}
          <AddAddressOverlay
            isOpen={showAddAddress}
            onClose={() => setShowAddAddress(false)}
            onSave={handleSaveAddress}
            currentLocation={currentAddress}
          />
        </div>

        {/* Saved Addresses */}
        <div>
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Saved Addresses</h2>
          <div className="space-y-3">
            {savedAddresses.map((address) => (
              <div key={address.id} className="p-4 border border-gray-100 rounded-xl bg-white shadow-sm">
                <div className="flex justify-between items-start">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      {address.type === 'home' ? (
                        <Home className="text-gray-600" size={18} />
                      ) : (
                        <Pin className="text-gray-600" size={18} />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{address.name} • {address.distance}</span>
                        {address.isCurrent && (
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                            CURRENTLY SELECTED
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 mt-1">{address.address}</p>
                    </div>
                  </div>
                  <button className="text-gray-400 hover:text-gray-600">
                    <MoreVertical size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <button className="text-red-600 font-medium text-sm mt-3 flex items-center">
            View more <span className="ml-1">⌄</span>
          </button>
        </div>

        {/* Recent Searches */}
        <div>
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Recent Searches</h2>
          <div className="space-y-3">
            {recentSearches.map((search) => (
              <div key={search.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50">
                <Pin className="text-gray-400 mt-0.5 flex-shrink-0" size={18} />
                <div>
                  <p className="font-medium">{search.name} • {search.distance}</p>
                  <p className="text-sm text-gray-500 mt-1">{search.address}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileLocationSelector;
