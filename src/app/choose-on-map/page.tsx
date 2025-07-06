'use client';

import React, { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, MapPin, Loader2 } from 'lucide-react';
import GoogleMap from '@/components/maps/GoogleMap';
import LocationSearch from '@/components/maps/LocationSearch';
import { reverseGeocode } from '@/utils/location';
import { toast } from 'sonner';

function ChooseOnMapPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Get initial location from URL params
  const initialLat = parseFloat(searchParams.get('lat') || '13.0827');
  const initialLng = parseFloat(searchParams.get('lng') || '80.2707');
  const initialAddress = searchParams.get('address') || '';
  const mode = searchParams.get('mode') || 'new';

  const [mapCenter, setMapCenter] = useState({ lat: initialLat, lng: initialLng });
  const [currentLocation, setCurrentLocation] = useState({
    lat: initialLat,
    lng: initialLng,
    address: initialAddress
  });
  const [isLoadingAddress, setIsLoadingAddress] = useState(!initialAddress);

  // Update location when map center changes
  const handleLocationChange = (location: { lat: number; lng: number; address: string }) => {
    setCurrentLocation(location);
    setIsLoadingAddress(false);
  };

  // Handle search result selection
  const handleSearchSelect = (place: any) => {
    const newCenter = { lat: place.lat, lng: place.lng };
    setMapCenter(newCenter);
    setCurrentLocation({
      lat: place.lat,
      lng: place.lng,
      address: place.description
    });
  };

  // Handle confirm and proceed
  const handleConfirmProceed = () => {
    if (!currentLocation.address) {
      toast.error('Please wait for address to load');
      return;
    }

    // Navigate to add new address page with location data
    const params = new URLSearchParams({
      lat: currentLocation.lat.toString(),
      lng: currentLocation.lng.toString(),
      address: currentLocation.address,
      mode: mode
    });
    
    router.push(`/add-new-address?${params.toString()}`);
  };

  // Handle back navigation
  const handleBack = () => {
    router.back();
  };

  // Get address on initial load if not provided
  useEffect(() => {
    const getInitialAddress = async () => {
      if (!initialAddress && initialLat && initialLng) {
        try {
          setIsLoadingAddress(true);
          const address = await reverseGeocode(initialLat, initialLng);
          setCurrentLocation(prev => ({ ...prev, address }));
        } catch (error) {
          console.error('Error getting initial address:', error);
          setCurrentLocation(prev => ({ 
            ...prev, 
            address: 'Unable to determine address' 
          }));
        } finally {
          setIsLoadingAddress(false);
        }
      }
    };

    getInitialAddress();
  }, [initialAddress, initialLat, initialLng]);

  return (
    <div className="h-screen w-full relative overflow-hidden bg-gray-100">
      {/* Header with Search */}
      <div className="absolute top-0 left-0 right-0 z-10 p-4 bg-white shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={handleBack}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <div className="flex-1">
            <LocationSearch
              onPlaceSelect={handleSearchSelect}
              placeholder="Search an area or address"
              className="w-full"
              showRecentSearches={false}
            />
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="absolute top-20 bottom-0 left-0 right-0">
        <GoogleMap
          center={mapCenter}
          zoom={16}
          onLocationChange={handleLocationChange}
          showCenterPin={true}
          height="100%"
          className="w-full h-full"
        />
      </div>

      {/* Current Location Button */}
      <div className="absolute top-32 right-4 z-10">
        <button
          onClick={async () => {
            try {
              if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                  (position) => {
                    const newCenter = {
                      lat: position.coords.latitude,
                      lng: position.coords.longitude
                    };
                    setMapCenter(newCenter);
                  },
                  (error) => {
                    toast.error('Unable to get current location');
                  }
                );
              }
            } catch (error) {
              toast.error('Geolocation not supported');
            }
          }}
          className="bg-white p-3 rounded-full shadow-lg hover:shadow-xl transition-shadow"
        >
          <MapPin className="h-5 w-5 text-orange-500" />
        </button>
      </div>

      {/* Location Info Card */}
      <div className="absolute bottom-20 left-4 right-4 bg-white rounded-xl shadow-lg p-4 z-10">
        <p className="text-xs text-gray-500 mb-2">Place the pin at exact delivery location</p>
        <div className="flex items-start gap-3">
          <MapPin className="text-orange-500 mt-1 flex-shrink-0" size={20} />
          <div className="flex-1 min-w-0">
            {isLoadingAddress ? (
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-full"></div>
              </div>
            ) : (
              <>
                <p className="font-semibold text-sm text-gray-900 mb-1">
                  {currentLocation.address.split(',')[0]}
                </p>
                <p className="text-xs text-gray-500 leading-relaxed">
                  {currentLocation.address}
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Confirm Button */}
      <div className="absolute bottom-4 left-4 right-4 z-10">
        <button 
          onClick={handleConfirmProceed}
          disabled={isLoadingAddress || !currentLocation.address}
          className="w-full bg-orange-500 text-white py-4 rounded-xl font-semibold text-sm shadow-md hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoadingAddress ? 'Loading address...' : 'Confirm & proceed'}
        </button>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin mr-2" /> Loading map...</div>}>
      <ChooseOnMapPage />
    </Suspense>
  );
}
