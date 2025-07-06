'use client';

import { useEffect, useRef, useState } from 'react';
import { loadGoogleMaps, getAddressFromCoordinates } from '@/services/googleMaps';
import { Button } from '@/components/ui/button';
import { Loader2, MapPin, CheckCircle, X } from 'lucide-react';

interface GoogleMapProps {
  onLocationSelect: (location: { lat: number; lng: number; address?: string }) => void;
  initialPosition?: { lat: number; lng: number; address?: string };
  onClose?: () => void;
}

export default function GoogleMap({ onLocationSelect, initialPosition, onClose }: GoogleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null);
  const [currentMarker, setCurrentMarker] = useState<google.maps.Marker | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<{ 
    lat: number; 
    lng: number; 
    address?: string 
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingAddress, setIsFetchingAddress] = useState(false);

  // Initialize the map
  useEffect(() => {
    const initMap = async () => {
      try {
        setIsLoading(true);
        const google = await loadGoogleMaps();
        
        // If we have an initial position, use that instead of geolocation
        if (initialPosition) {
          if (mapRef.current) {
            const mapOptions: google.maps.MapOptions = {
              center: { lat: initialPosition.lat, lng: initialPosition.lng },
              zoom: 15,
              disableDefaultUI: false,
              zoomControl: true,
              mapTypeControl: false,
              streetViewControl: false,
              fullscreenControl: true,
              gestureHandling: 'greedy',
              styles: [
                {
                  featureType: 'poi',
                  elementType: 'labels',
                  stylers: [{ visibility: 'off' }]
                }
              ]
            };

            const map = new google.maps.Map(mapRef.current, mapOptions);
            setMapInstance(map);

            // Add marker at initial position
            const marker = new google.maps.Marker({
              position: { lat: initialPosition.lat, lng: initialPosition.lng },
              map: map,
              animation: google.maps.Animation.DROP,
              draggable: true,
              icon: {
                url: 'data:image/svg+xml;utf-8,<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="%23E11D48" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="10" r="3"/><path d="M12 2a8 8 0 0 0-8 8c0 1.892.402 3.13 1.5 4.5L12 22l6.5-7.5c1.098-1.37 1.5-2.608 1.5-4.5a8 8 0 0 0-8-8z"/></svg>',
                scaledSize: new google.maps.Size(36, 36),
                anchor: new google.maps.Point(18, 36),
              }
            });
            setCurrentMarker(marker);

            // Set selected location from initial position
            setSelectedLocation(initialPosition);

            // Add event listeners (same as below)
            setupMapEventListeners(map, marker);
          }
          
          setIsLoading(false);
          return;
        }
        
        // Otherwise use geolocation
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            
            if (mapRef.current) {
              const mapOptions: google.maps.MapOptions = {
                center: { lat: latitude, lng: longitude },
                zoom: 15,
                disableDefaultUI: false,
                zoomControl: true,
                mapTypeControl: false,
                streetViewControl: false,
                fullscreenControl: true,
                gestureHandling: 'greedy',
                styles: [
                  {
                    featureType: 'poi',
                    elementType: 'labels',
                    stylers: [{ visibility: 'off' }]
                  }
                ]
              };

              const map = new google.maps.Map(mapRef.current, mapOptions);
              setMapInstance(map);

              // Add marker at user's location
              const marker = new google.maps.Marker({
                position: { lat: latitude, lng: longitude },
                map: map,
                animation: google.maps.Animation.DROP,
                draggable: true,
                icon: {
                  url: 'data:image/svg+xml;utf-8,<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="%23E11D48" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="10" r="3"/><path d="M12 2a8 8 0 0 0-8 8c0 1.892.402 3.13 1.5 4.5L12 22l6.5-7.5c1.098-1.37 1.5-2.608 1.5-4.5a8 8 0 0 0-8-8z"/></svg>',
                  scaledSize: new google.maps.Size(36, 36),
                  anchor: new google.maps.Point(18, 36),
                }
              });
              setCurrentMarker(marker);

              // Get initial address and set selected location
              getAddressFromCoordinates(latitude, longitude)
                .then((address) => {
                  setSelectedLocation({
                    lat: latitude,
                    lng: longitude,
                    address
                  });
                })
                .catch((error) => {
                  console.error('Error getting address:', error);
                  setSelectedLocation({
                    lat: latitude,
                    lng: longitude
                  });
                });

              // Setup map event listeners
              setupMapEventListeners(map, marker);
            }
            
            setIsLoading(false);
          },
          (error) => {
            console.error('Error getting location:', error);
            
            // Default to Chennai if location access is denied
            const defaultLocation = { lat: 13.0827, lng: 80.2707 }; // Chennai coordinates
            
            if (mapRef.current) {
              const mapOptions: google.maps.MapOptions = {
                center: defaultLocation,
                zoom: 13,
                disableDefaultUI: false,
                zoomControl: true,
                mapTypeControl: false,
                streetViewControl: false,
                fullscreenControl: true
              };

              const map = new google.maps.Map(mapRef.current, mapOptions);
              setMapInstance(map);

              // Add marker at default location
              const marker = new google.maps.Marker({
                position: defaultLocation,
                map: map,
                draggable: true,
                icon: {
                  url: 'data:image/svg+xml;utf-8,<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="%23E11D48" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="10" r="3"/><path d="M12 2a8 8 0 0 0-8 8c0 1.892.402 3.13 1.5 4.5L12 22l6.5-7.5c1.098-1.37 1.5-2.608 1.5-4.5a8 8 0 0 0-8-8z"/></svg>',
                  scaledSize: new google.maps.Size(36, 36),
                  anchor: new google.maps.Point(18, 36),
                }
              });
              setCurrentMarker(marker);

              // Set initial selected location
              setSelectedLocation(defaultLocation);
              
              // Setup map event listeners
              setupMapEventListeners(map, marker);
            }
            
            setIsLoading(false);
          },
          { timeout: 10000, enableHighAccuracy: true }
        );
      } catch (error) {
        console.error('Error initializing map:', error);
        setIsLoading(false);
      }
    };

    initMap();

    return () => {
      // Clean up resources
      if (currentMarker) {
        currentMarker.setMap(null);
      }
    };
  }, [initialPosition]);

  // Helper function to setup map event listeners
  const setupMapEventListeners = (map: google.maps.Map, marker: google.maps.Marker) => {
    // Add click event to map
    map.addListener('click', (e: google.maps.MapMouseEvent) => {
      if (e.latLng && marker) {
        const newPos = e.latLng;
        marker.setPosition(newPos);
        
        setIsFetchingAddress(true);
        getAddressFromCoordinates(newPos.lat(), newPos.lng())
          .then((address) => {
            setSelectedLocation({
              lat: newPos.lat(),
              lng: newPos.lng(),
              address
            });
          })
          .catch((error) => {
            console.error('Error getting address:', error);
            setSelectedLocation({
              lat: newPos.lat(),
              lng: newPos.lng()
            });
          })
          .finally(() => {
            setIsFetchingAddress(false);
          });
      }
    });

    // Add drag event to marker
    marker.addListener('dragend', () => {
      const position = marker.getPosition();
      if (position) {
        setIsFetchingAddress(true);
        getAddressFromCoordinates(position.lat(), position.lng())
          .then((address) => {
            setSelectedLocation({
              lat: position.lat(),
              lng: position.lng(),
              address
            });
          })
          .catch((error) => {
            console.error('Error getting address:', error);
            setSelectedLocation({
              lat: position.lat(),
              lng: position.lng()
            });
          })
          .finally(() => {
            setIsFetchingAddress(false);
          });
      }
    });
  };

  const handleConfirmLocation = () => {
    if (selectedLocation) {
      onLocationSelect(selectedLocation);
    }
  };

  return (
    <div className="h-screen w-full flex flex-col">
      {/* Back button if onClose is provided */}
      {onClose && (
        <div className="absolute top-4 left-4 z-10">
          <button 
            onClick={onClose}
            className="bg-white p-2 rounded-full shadow-md"
          >
            <X className="h-6 w-6 text-gray-700" />
          </button>
        </div>
      )}
      
      <div className="relative h-full w-full">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="flex flex-col items-center">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="mt-2 text-sm text-gray-500">Loading map...</p>
            </div>
          </div>
        ) : (
          <div ref={mapRef} className="h-full w-full"></div>
        )}
        
        {/* Selected location info overlay */}
        {selectedLocation && (
          <div className="absolute bottom-0 left-0 right-0 bg-white p-4 shadow-lg rounded-t-xl">
            <div className="flex items-start mb-2">
              <MapPin className="h-5 w-5 text-primary mt-1 mr-2 flex-shrink-0" />
              <div className="flex-1">
                <p className="font-medium text-base">
                  {isFetchingAddress ? 'Fetching address...' : selectedLocation.address || 'Selected location'}
                </p>
                <p className="text-xs text-gray-500">
                  {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
                </p>
              </div>
            </div>
            <Button 
              onClick={handleConfirmLocation}
              className="w-full mt-2"
              disabled={isFetchingAddress}
            >
              {isFetchingAddress ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Getting address...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Confirm location
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
