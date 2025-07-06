'use client';

import React, { Suspense, useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, MapPin, Crosshair, Check, Navigation, Target, Loader2 } from 'lucide-react';
import GoogleMapPicker from '@/components/maps/GoogleMapPicker';

function MapPickerPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Get URL parameters
  const mode = searchParams.get('mode');
  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');
  const placeId = searchParams.get('placeId');

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
    lng: parseFloat(lng || '80.2707')
  });

  // Handle location updates from map
  const handleLocationChange = (newLat: number, newLng: number) => {
    setCoordinates({ lat: newLat, lng: newLng });
  };

  // Handle address updates from reverse geocoding
  const handleAddressChange = (newAddress: string) => {
    setCurrentAddress(newAddress);
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
      
      // Check if geolocation is supported
      if (!navigator.geolocation) {
        throw new Error('Geolocation is not supported by this browser');
      }

      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve, 
          (error) => {
            let errorMessage = 'Failed to get location';
            switch (error.code) {
              case error.PERMISSION_DENIED:
                errorMessage = 'Location permission denied. Please allow location access and try again.';
                break;
              case error.POSITION_UNAVAILABLE:
                errorMessage = 'Location information is unavailable. Please try again.';
                break;
              case error.TIMEOUT:
                errorMessage = 'Location request timed out. Please try again.';
                break;
              default:
                errorMessage = 'An unknown error occurred while getting location.';
                break;
            }
            reject(new Error(errorMessage));
          },
          {
            enableHighAccuracy: true,
            timeout: 15000, // Increased timeout
            maximumAge: 300000
          }
        );
      });

      const newCoords = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };
      
      setCoordinates(newCoords);
      setCurrentAddress('📍 Location detected successfully');
      setIsLoading(false);
      
      // The Google Maps component will automatically reverse geocode and update the address
      
    } catch (error: any) {
      console.error('Error getting location:', error);
      setCurrentAddress(`❌ Location Error: ${error.message || 'Unable to get current location'}`);
      setIsLoading(false);
      
      // Show user-friendly error message
      const errorMessage = error.message || 'Unable to access your location. Please check your browser settings and try again.';
      alert(`Location Error: ${errorMessage}`);
      
      // Update the UI to show error state and provide retry option
      setCurrentAddress(`❌ Location Error: ${errorMessage}`);
    }
  };

  // Handle confirm and proceed
  const handleConfirmAndProceed = () => {
    const params = new URLSearchParams({
      lat: coordinates.lat.toString(),
      lng: coordinates.lng.toString(),
      address: currentAddress
    });
    
    router.push(`/add-details?${params.toString()}`);
  };

  // Initialize based on mode
  useEffect(() => {
    if (mode === 'current') {
      // Automatically start fetching current location when in current mode
      handleCurrentLocation();
    } else if (lat && lng) {
      // Use provided coordinates from URL
      setCoordinates({
        lat: parseFloat(lat),
        lng: parseFloat(lng)
      });
      setTimeout(() => {
        setCurrentAddress('Selected location from search results');
        setIsLoading(false);
      }, 1000);
    } else {
      // Default/new mode - show default location
      setTimeout(() => {
        setCurrentAddress('Tap the pin and drag to select your exact location');
        setIsLoading(false);
      }, 1000);
    }
  }, [mode, lat, lng]);

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col overflow-hidden">
      {/* Header - Floating over map */}
      <div className="absolute top-0 left-0 right-0 z-20">
        <div className="flex items-center justify-between p-4 pt-8">
          <button
            onClick={handleBack}
            className="p-3 bg-white/95 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-all duration-200"
          >
            <ArrowLeft size={24} className="text-gray-700" />
          </button>
          
          <div className="bg-white/95 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg">
            <p className="text-sm font-medium text-gray-700">
              {mode === 'current' 
                ? (isLoading ? 'Getting Your Location...' : 'Your Current Location')
                : 'Select Location'
              }
            </p>
          </div>

          <button
            onClick={handleCurrentLocation}
            className="p-3 bg-white/95 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-all duration-200"
          >
            <Target size={24} className="text-orange-500" />
          </button>
        </div>
      </div>

      {/* Map Container - Full screen with Real Google Maps */}
      <div className="relative w-full h-full">
        <GoogleMapPicker
          lat={coordinates.lat}
          lng={coordinates.lng}
          onLocationChange={handleLocationChange}
          onAddressChange={handleAddressChange}
          className="w-full h-full"
        />
      </div>

      {/* Bottom Panel - Floating */}
      <div className="absolute bottom-0 left-0 right-0 z-20">
        <div className="pb-4">
          <div className="mx-4 mb-4">
            {/* Address Display Card */}
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6 mb-4 border border-white/20">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-orange-100 rounded-full">
                  <MapPin className="text-orange-600" size={24} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 mb-2">Delivery Location</h3>
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full"></div>
                      <span className="text-sm text-gray-600">Getting address...</span>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-700 leading-relaxed">{currentAddress}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Action Button */}
            <button
              onClick={handleConfirmAndProceed}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-4 px-6 rounded-2xl font-semibold text-lg shadow-xl hover:from-orange-600 hover:to-orange-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 transform hover:scale-[0.98]"
            >
              <Check size={24} />
              Confirm & Continue
            </button>

            {/* Helper Text */}
            <p className="text-xs text-white/80 text-center mt-3 px-4">
              Drag the map to adjust the pin location for precise delivery
            </p>
          </div>
        </div>
      </div>

      {/* Loading Overlay */}
      {mode === 'current' && isLoading && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-30">
          <div className="bg-white rounded-2xl shadow-2xl p-8 text-center max-w-sm mx-4">
            <div className="w-16 h-16 mx-auto mb-4 relative">
              <div className="absolute inset-0 border-4 border-orange-200 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-orange-500 rounded-full border-t-transparent animate-spin"></div>
              <Crosshair className="absolute inset-0 m-auto text-orange-500" size={24} />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Auto-Detecting Your Location</h3>
            <p className="text-sm text-gray-600">
              Please allow location access for accurate delivery address
            </p>
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-xs text-blue-700">
                💡 If prompted, please click "Allow" to enable location access
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin mr-2" /> Loading map picker...</div>}>
      <MapPickerPage />
    </Suspense>
  );
}
