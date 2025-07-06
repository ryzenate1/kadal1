"use client";

import { useEffect, useState, useRef } from 'react';
import { Loader2 } from 'lucide-react';
import { loadGoogleMaps } from '@/utils/googleMapsLoader'; // Import the utility

export default function TestMapPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initializeMap = async () => {
      try {
        await loadGoogleMaps(); // Use the loader utility
        if (window.google && mapRef.current) {
          const chennai = { lat: 13.0827, lng: 80.2707 };
          const newMap = new window.google.maps.Map(mapRef.current, {
            center: chennai,
            zoom: 12,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false, // Keep it simple
            backgroundColor: 'white', // Explicitly set background
            disableDefaultUI: true,
            gestureHandling: 'greedy'
          });

          new window.google.maps.Marker({
            position: chennai,
            map: newMap,
            title: 'Chennai, India',
          });

          setIsLoading(false);
        } else {
          throw new Error('Google Maps API or map container not available.');
        }
      } catch (err: any) {
        console.error('Error initializing map:', err);
        setError(err.message || 'Failed to initialize map. Please check your API key and try again.');
        setIsLoading(false);
      }
    };

    initializeMap();

  }, []); // Empty dependency array ensures this runs once

  return (
    <div className="fixed inset-0">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-20">
          <div className="flex flex-col items-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-2" />
            <p>Loading map...</p>
          </div>
        </div>
      )}
      
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-50 z-20">
          <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded max-w-md text-center">
            <p className="font-bold">Error:</p>
            <p>{error}</p>
          </div>
        </div>
      )}

      <div ref={mapRef} className="w-full h-full bg-white" />
    </div>
  );
}
