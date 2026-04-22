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
    <div className="h-screen w-full relative overflow-hidden bg-slate-950">
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/10 to-black/50 pointer-events-none" />

      {/* Header with Search */}
      <div className="absolute top-0 left-0 right-0 z-10 px-4 pt-5">
        <div className="flex items-center gap-3 bg-white/90 backdrop-blur-xl rounded-2xl border border-white/60 shadow-lg px-3 py-2">
          <button
            onClick={handleBack}
            className="p-2 rounded-xl hover:bg-black/5 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-slate-700" />
          </button>
          <div className="flex-1">
            <LocationSearch
              onPlaceSelect={handleSearchSelect}
              placeholder="Search for a landmark or street"
              className="w-full"
              showRecentSearches={false}
            />
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="absolute inset-0">
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
      <div className="absolute top-24 right-4 z-10">
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
                  () => {
                    toast.error('Unable to get current location');
                  }
                );
              }
            } catch {
              toast.error('Geolocation not supported');
            }
          }}
          className="bg-white/90 backdrop-blur-xl p-3 rounded-2xl shadow-lg hover:shadow-xl transition-shadow"
        >
          <MapPin className="h-5 w-5 text-orange-500" />
        </button>
      </div>

      {/* Location Info Card */}
      <div className="absolute bottom-24 left-4 right-4 z-10">
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl border border-white/70 shadow-xl p-4">
          <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400 mb-2">Delivery Pin</p>
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-orange-100">
              <MapPin className="text-orange-600" size={18} />
            </div>
            <div className="flex-1 min-w-0">
              {isLoadingAddress ? (
                <div className="animate-pulse space-y-2">
                  <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                  <div className="h-3 bg-slate-200 rounded w-full"></div>
                </div>
              ) : (
                <>
                  <p className="font-semibold text-sm text-slate-900 mb-1">
                    {currentLocation.address.split(',')[0]}
                  </p>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {currentLocation.address}
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Confirm Button */}
      <div className="absolute bottom-4 left-4 right-4 z-10">
        <button
          onClick={handleConfirmProceed}
          disabled={isLoadingAddress || !currentLocation.address}
          className="w-full bg-gradient-to-r from-orange-500 via-orange-600 to-amber-500 text-white py-4 rounded-2xl font-semibold text-sm shadow-xl hover:from-orange-600 hover:to-amber-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoadingAddress ? 'Loading address...' : 'Confirm & continue'}
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
