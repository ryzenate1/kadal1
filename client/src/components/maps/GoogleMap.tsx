"use client";

import { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';

interface GoogleMapProps {
  center?: { lat: number; lng: number };
  zoom?: number;
  onLocationChange?: (location: { lat: number; lng: number; address: string }) => void;
  showCenterPin?: boolean;
  height?: string;
  className?: string;
}

export default function GoogleMap({
  center = { lat: 13.0827, lng: 80.2707 }, // Default to Chennai
  zoom = 15,
  onLocationChange,
  showCenterPin = true,
  height = '400px',
  className = ''
}: GoogleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const geocoder = useRef<google.maps.Geocoder | null>(null);

  useEffect(() => {
    const initMap = async () => {
      try {
        setIsLoading(true);
        const loader = new Loader({
          apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
          version: 'weekly',
          libraries: ['places', 'geometry']
        });

        const google = await loader.load();
        geocoder.current = new google.maps.Geocoder();

        if (!mapRef.current) return;

        const mapOptions: google.maps.MapOptions = {
          center,
          zoom,
          disableDefaultUI: true,
          zoomControl: true,
          gestureHandling: 'cooperative',
          styles: [
            {
              featureType: 'poi',
              stylers: [{ visibility: 'simplified' }]
            }
          ]
        };

        const mapInstance = new google.maps.Map(mapRef.current, mapOptions);
        setMap(mapInstance);

        // Add idle event listener for center pin functionality
        if (showCenterPin && onLocationChange) {
          let debounceTimer: NodeJS.Timeout;
          
          mapInstance.addListener('idle', () => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(async () => {
              const center = mapInstance.getCenter();
              if (center && geocoder.current) {
                try {
                  const results = await geocoder.current.geocode({
                    location: { lat: center.lat(), lng: center.lng() }
                  });
                  
                  if (results.results[0]) {
                    onLocationChange({
                      lat: center.lat(),
                      lng: center.lng(),
                      address: results.results[0].formatted_address
                    });
                  }
                } catch (error) {
                  console.error('Geocoding error:', error);
                }
              }
            }, 500);
          });
        }

        setIsLoading(false);
      } catch (err) {
        console.error('Error loading Google Maps:', err);
        setError('Failed to load map. Please check your internet connection.');
        setIsLoading(false);
      }
    };

    initMap();
  }, [center.lat, center.lng, zoom, showCenterPin, onLocationChange]);

  // Update map center when center prop changes
  useEffect(() => {
    if (map && center) {
      map.setCenter(center);
    }
  }, [map, center]);

  if (error) {
    return (
      <div 
        className={`flex items-center justify-center bg-gray-100 ${className}`}
        style={{ height }}
      >
        <div className="text-center p-4">
          <p className="text-red-500 text-sm">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-2 px-4 py-2 bg-red-500 text-white rounded text-sm hover:bg-red-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`} style={{ height }}>
      <div ref={mapRef} className="w-full h-full" />
      
      {/* Center Pin */}
      {showCenterPin && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
          <div className="w-6 h-6 bg-orange-500 rounded-full border-2 border-white shadow-lg">
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full"></div>
          </div>
        </div>
      )}
      
      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
        </div>
      )}
    </div>
  );
}
