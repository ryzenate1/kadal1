'use client';

import { useEffect, useRef, useState } from 'react';
import { loadGoogleMaps } from '@/services/googleMaps';
import { Loader2, ExternalLink } from 'lucide-react';

export default function FooterMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Store location coordinates
  const storeLocation = { lat: 13.0827, lng: 80.2707 }; // Chennai coordinates
  const storeAddress = "Kadal Thunai, Chennai, Tamil Nadu, India";
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${storeLocation.lat},${storeLocation.lng}`;

  // Initialize the map
  useEffect(() => {
    const initMap = async () => {
      try {
        setIsLoading(true);
        const google = await loadGoogleMaps();
        
        if (mapRef.current) {
          const mapOptions: google.maps.MapOptions = {
            center: storeLocation,
            zoom: 15,
            disableDefaultUI: true,
            zoomControl: false,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false,
            scrollwheel: false,
            draggable: false,
            styles: [
              {
                featureType: 'poi',
                elementType: 'labels',
                stylers: [{ visibility: 'off' }]
              }
            ]
          };

          const map = new google.maps.Map(mapRef.current, mapOptions);
          
          // Add marker at store location
          new google.maps.Marker({
            position: storeLocation,
            map: map,
            animation: google.maps.Animation.DROP,
            icon: {
              url: 'data:image/svg+xml;utf-8,<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="%23E11D48" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="10" r="3"/><path d="M12 2a8 8 0 0 0-8 8c0 1.892.402 3.13 1.5 4.5L12 22l6.5-7.5c1.098-1.37 1.5-2.608 1.5-4.5a8 8 0 0 0-8-8z"/></svg>',
              scaledSize: new google.maps.Size(36, 36),
              anchor: new google.maps.Point(18, 36),
            }
          });
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error initializing map:', error);
        setIsLoading(false);
      }
    };

    initMap();
  }, []);

  return (
    <div className="w-full h-48 sm:h-64 relative rounded-lg overflow-hidden border border-gray-200 shadow-sm">
      {isLoading ? (
        <div className="flex items-center justify-center h-full bg-gray-100">
          <div className="flex flex-col items-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="mt-2 text-xs text-gray-500">Loading map...</p>
          </div>
        </div>
      ) : (
        <>
          <div ref={mapRef} className="h-full w-full"></div>
          <div className="absolute top-2 right-2">
            <a 
              href={googleMapsUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center bg-white text-xs font-medium py-1 px-2 rounded shadow-sm hover:bg-gray-50 transition-colors"
            >
              <ExternalLink className="h-3 w-3 mr-1" />
              View larger map
            </a>
          </div>
        </>
      )}
    </div>
  );
}
