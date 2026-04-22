'use client';

import React, { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, MapPin, Crosshair, Check, Target, Loader2 } from 'lucide-react';
import GoogleMapPicker from '@/components/maps/GoogleMapPicker';
import { toast } from 'sonner';

function MapPickerPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get URL parameters
  const mode = searchParams.get('mode');
  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');

  useEffect(() => {
    // Force disable scrolling on the body for this page
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    // Cleanup on component unmount
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, []);

  const [currentAddress, setCurrentAddress] = useState('Getting your location...');
  const [isLoading, setIsLoading] = useState(true);
  const [coordinates, setCoordinates] = useState({
    lat: parseFloat(lat || '13.0827'),
    lng: parseFloat(lng || '80.2707'),
  });

  // Handle location updates from map
  const handleLocationChange = (newLat: number, newLng: number) => {
    setCoordinates({ lat: newLat, lng: newLng });
  };

  // Handle address updates from reverse geocoding
  const handleAddressChange = (newAddress: string) => {
    setCurrentAddress(newAddress);
    setIsLoading(false);
  };

  // Handle back navigation
  const handleBack = () => {
    router.push('/choose-location');
  };

  // Handle current location
  const handleCurrentLocation = async () => {
    try {
      setIsLoading(true);
      setCurrentAddress('Getting your current location...');

      if (!navigator.geolocation) {
        throw new Error('Geolocation is not supported by this browser');
      }

      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        });
      });

      setCoordinates({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      });
    } catch (error: any) {
      toast.error(error?.message || 'Could not get your location');
      setIsLoading(false);
    }
  };

  // Handle confirm and proceed
  const handleConfirmAndProceed = () => {
    if (isLoading) return;

    const params = new URLSearchParams({
      lat: coordinates.lat.toString(),
      lng: coordinates.lng.toString(),
      address: currentAddress,
    });

    router.push(`/choose-location?${params.toString()}`);
  };

  return (
    <div className="fixed inset-0 bg-slate-950 z-50 flex flex-col overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/5 to-black/60 pointer-events-none" />

      {/* Header - Floating over map */}
      <div className="absolute top-0 left-0 right-0 z-20 px-4 pt-5">
        <div className="flex items-center justify-between bg-white/90 backdrop-blur-xl rounded-2xl border border-white/60 shadow-lg px-3 py-2">
          <button
            onClick={handleBack}
            className="p-2 rounded-xl hover:bg-black/5 transition-colors"
          >
            <ArrowLeft size={22} className="text-slate-700" />
          </button>

          <div className="px-3 py-1.5 rounded-xl bg-white/70 border border-white/60">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
              {mode === 'current'
                ? isLoading
                  ? 'Locating'
                  : 'Current Location'
                : 'Pick Location'}
            </p>
          </div>

          <button
            onClick={handleCurrentLocation}
            className="p-2 rounded-xl bg-white/80 hover:bg-white transition-colors"
          >
            <Target size={22} className="text-orange-500" />
          </button>
        </div>
      </div>

      {/* Map Container */}
      <div className="relative w-full h-full">
        <GoogleMapPicker
          lat={coordinates.lat}
          lng={coordinates.lng}
          onLocationChange={handleLocationChange}
          onAddressChange={handleAddressChange}
          className="w-full h-full"
        />
      </div>

      {/* Bottom Panel */}
      <div className="absolute bottom-0 left-0 right-0 z-20">
        <div className="px-4 pb-4">
          <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/60 p-5">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-orange-100 rounded-2xl">
                <MapPin className="text-orange-600" size={22} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Delivery Address</p>
                {isLoading ? (
                  <div className="flex items-center gap-2 mt-2">
                    <div className="animate-spin w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full" />
                    <span className="text-sm text-slate-600">Getting address...</span>
                  </div>
                ) : (
                  <p className="text-sm text-slate-700 leading-relaxed mt-2">{currentAddress}</p>
                )}
              </div>
            </div>

            <button
              onClick={handleConfirmAndProceed}
              disabled={isLoading}
              className="mt-4 w-full bg-gradient-to-r from-orange-500 via-orange-600 to-amber-500 text-white py-4 px-6 rounded-2xl font-semibold text-sm shadow-xl hover:from-orange-600 hover:to-amber-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              <Check size={20} />
              Confirm &amp; Continue
            </button>

            <p className="text-[11px] text-slate-500 text-center mt-3">
              Drag the map to fine-tune your pin placement
            </p>
          </div>
        </div>
      </div>

      {/* Loading Overlay */}
      {mode === 'current' && isLoading && (
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-30">
          <div className="bg-white rounded-2xl shadow-2xl p-8 text-center max-w-sm mx-4">
            <div className="w-16 h-16 mx-auto mb-4 relative">
              <div className="absolute inset-0 border-4 border-orange-200 rounded-full" />
              <div className="absolute inset-0 border-4 border-orange-500 rounded-full border-t-transparent animate-spin" />
              <Crosshair className="absolute inset-0 m-auto text-orange-500" size={24} />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Finding your location</h3>
            <p className="text-sm text-gray-600">Allow location access for a precise delivery pin</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin mr-2" /> Loading map picker...
        </div>
      }
    >
      <MapPickerPage />
    </Suspense>
  );
}
