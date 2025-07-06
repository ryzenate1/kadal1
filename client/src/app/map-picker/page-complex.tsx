'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, MapPin, Crosshair, Check } from 'lucide-react';
import { Loader } from '@googlemaps/js-api-loader';
import { toast } from 'sonner';

interface MapPickerPageProps {}

export default function MapPickerPage({}: MapPickerPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  
  // Get URL parameters
  const mode = searchParams.get('mode'); // 'current' or 'new'
  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');
  const placeId = searchParams.get('placeId');

  // State
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [currentAddress, setCurrentAddress] = useState('');
  const [currentCoords, setCurrentCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  // Initialize Google Maps
  useEffect(() => {
    const initializeMap = async () => {
      try {
        const loader = new Loader({
          apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
          version: 'weekly',
          libraries: ['places', 'geocoding']
        });

        await loader.load();
        
        let initialLat = 13.0827; // Default to Chennai
        let initialLng = 80.2707;

        // If coordinates provided in URL, use them
        if (lat && lng) {
          initialLat = parseFloat(lat);
          initialLng = parseFloat(lng);
        }
        // If mode is current, get user's current location
        else if (mode === 'current') {
          await getCurrentLocation();
          return; // getCurrentLocation will initialize map
        }

        initializeMapWithCoords(initialLat, initialLng);
      } catch (error) {
        console.error('Error loading Google Maps:', error);
        toast.error('Failed to load map. Please try again.');
      }
    };

    initializeMap();
  }, [lat, lng, mode]);

  // Get current location
  const getCurrentLocation = async () => {
    setIsGettingLocation(true);
    
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000
        });
      });

      const { latitude, longitude } = position.coords;
      initializeMapWithCoords(latitude, longitude);
    } catch (error) {
      console.error('Error getting location:', error);
      toast.error('Could not get your location. Using default location.');
      // Fallback to default location
      initializeMapWithCoords(13.0827, 80.2707);
    } finally {
      setIsGettingLocation(false);
    }
  };

  // Initialize map with coordinates
  const initializeMapWithCoords = (latitude: number, longitude: number) => {
    if (!mapRef.current) return;

    const map = new google.maps.Map(mapRef.current, {
      center: { lat: latitude, lng: longitude },
      zoom: 17,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
      zoomControl: true,
      styles: [
        {
          featureType: 'poi',
          elementType: 'labels',
          stylers: [{ visibility: 'off' }]
        }
      ]
    });

    // Add marker
    const marker = new google.maps.Marker({
      position: { lat: latitude, lng: longitude },
      map: map,
      draggable: false,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 8,
        fillColor: '#FF6B35',
        fillOpacity: 1,
        strokeColor: '#FFFFFF',
        strokeWeight: 2
      }
    });

    mapInstanceRef.current = map;
    markerRef.current = marker;
    setCurrentCoords({ lat: latitude, lng: longitude });
    setIsMapLoaded(true);

    // Get initial address
    reverseGeocode(latitude, longitude);

    // Listen for map drag/idle to update marker position
    map.addListener('dragend', () => {
      const center = map.getCenter();
      if (center) {
        const newLat = center.lat();
        const newLng = center.lng();
        marker.setPosition({ lat: newLat, lng: newLng });
        setCurrentCoords({ lat: newLat, lng: newLng });
        reverseGeocode(newLat, newLng);
      }
    });
  };

  // Reverse geocode coordinates to get address
  const reverseGeocode = async (lat: number, lng: number) => {
    setIsLoadingAddress(true);
    
    try {
      const geocoder = new google.maps.Geocoder();
      
      const response = await new Promise<google.maps.GeocoderResponse>((resolve, reject) => {
        geocoder.geocode(
          { location: { lat, lng } },
          (results, status) => {
            if (status === 'OK') {
              resolve({ results: results || [] } as google.maps.GeocoderResponse);
            } else {
              reject(new Error(`Geocoding failed: ${status}`));
            }
          }
        );
      });

      if (response.results && response.results.length > 0) {
        const address = response.results[0].formatted_address;
        setCurrentAddress(address);
      } else {
        setCurrentAddress('Address not found');
      }
    } catch (error) {
      console.error('Error reverse geocoding:', error);
      setCurrentAddress('Unable to get address');
    } finally {
      setIsLoadingAddress(false);
    }
  };

  // Handle current location button
  const handleCurrentLocationClick = async () => {
    if (!mapInstanceRef.current) return;
    
    setIsGettingLocation(true);
    
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000
        });
      });

      const { latitude, longitude } = position.coords;
      const newCenter = { lat: latitude, lng: longitude };
      
      mapInstanceRef.current.setCenter(newCenter);
      markerRef.current?.setPosition(newCenter);
      setCurrentCoords(newCenter);
      reverseGeocode(latitude, longitude);
      
      toast.success('Location updated');
    } catch (error) {
      console.error('Error getting current location:', error);
      toast.error('Could not get your current location');
    } finally {
      setIsGettingLocation(false);
    }
  };

  // Handle confirm and proceed
  const handleConfirmAndProceed = () => {
    if (!currentCoords || !currentAddress) {
      toast.error('Please select a location');
      return;
    }

    // Navigate to add-details page with coordinates and address
    const params = new URLSearchParams({
      lat: currentCoords.lat.toString(),
      lng: currentCoords.lng.toString(),
      address: currentAddress
    });
    
    router.push(`/add-details?${params.toString()}`);
  };

  // Handle back navigation
  const handleBack = () => {
    router.back();
  };

  return (
    <div className="h-screen flex flex-col bg-white">
      {/* Header */}
      <div className="flex items-center gap-4 p-4 border-b border-gray-200 bg-white z-10">
        <button
          onClick={handleBack}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-semibold">Select Location</h1>
          <p className="text-sm text-gray-600">
            {mode === 'current' ? 'Confirm your current location' : 'Choose delivery location'}
          </p>
        </div>
      </div>

      {/* Map Container */}
      <div className="flex-1 relative">
        {/* Map */}
        <div ref={mapRef} className="w-full h-full" />
        
        {/* Fixed center pin overlay */}
        {isMapLoaded && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none z-10">
            <div className="relative">
              <MapPin 
                size={32} 
                className="text-orange-500 drop-shadow-lg" 
                fill="currentColor"
              />
              <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-orange-500 rounded-full opacity-50"></div>
            </div>
          </div>
        )}

        {/* Current location button */}
        <button
          onClick={handleCurrentLocationClick}
          disabled={isGettingLocation}
          className="absolute bottom-24 right-4 p-3 bg-white rounded-full shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          <Crosshair 
            size={24} 
            className={`${isGettingLocation ? 'animate-spin' : ''} text-gray-700`}
          />
        </button>

        {/* Loading overlay */}
        {(!isMapLoaded || isGettingLocation) && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-20">
            <div className="text-center">
              <div className="animate-spin w-8 h-8 border-2 border-gray-300 border-t-orange-500 rounded-full mx-auto mb-4"></div>
              <p className="text-gray-600">
                {isGettingLocation ? 'Getting your location...' : 'Loading map...'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Bottom address panel */}
      <div className="bg-white border-t border-gray-200 p-4">
        {/* Address display */}
        <div className="mb-4">
          <div className="flex items-start gap-3">
            <MapPin className="text-orange-500 mt-1 flex-shrink-0" size={20} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 mb-1">Delivery Location</p>
              {isLoadingAddress ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin w-4 h-4 border-2 border-gray-300 border-t-orange-500 rounded-full"></div>
                  <span className="text-sm text-gray-500">Getting address...</span>
                </div>
              ) : (
                <p className="text-sm text-gray-600 leading-relaxed">{currentAddress}</p>
              )}
            </div>
          </div>
        </div>

        {/* Confirm button */}
        <button
          onClick={handleConfirmAndProceed}
          disabled={!currentCoords || !currentAddress || isLoadingAddress}
          className="w-full bg-orange-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <Check size={20} />
          Confirm & Proceed
        </button>

        {/* Helper text */}
        <p className="text-xs text-gray-500 text-center mt-2">
          Drag the map to adjust the pin location
        </p>
      </div>
    </div>
  );
}
