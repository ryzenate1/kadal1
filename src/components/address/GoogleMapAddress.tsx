'use client';

import { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, MapPin, X } from 'lucide-react';

interface GoogleMapAddressProps {
  onSelect: (address: string, location: { lat: number; lng: number }) => void;
  initialPosition?: { lat: number; lng: number };
  className?: string;
  apiKey: string;
}

export function GoogleMapAddress({
  onSelect,
  initialPosition,
  className = '',
  apiKey,
}: GoogleMapAddressProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [marker, setMarker] = useState<google.maps.Marker | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentAddress, setCurrentAddress] = useState('');
  const [currentPosition, setCurrentPosition] = useState<{ lat: number; lng: number }>(
    initialPosition || { lat: 13.0827, lng: 80.2707 } // Default to Chennai
  );

  // Initialize the map
  useEffect(() => {
    if (!mapRef.current || !apiKey) return;

    const loader = new Loader({
      apiKey,
      version: 'weekly',
      libraries: ['places'],
    });

    setIsLoading(true);
    setError(null);

    const initMap = async () => {
      try {
        const google = await loader.load();
        
        // Create map
        const mapInstance = new google.maps.Map(mapRef.current!, {
          center: currentPosition,
          zoom: 15,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true,
          zoomControl: true,
        });

        // Create marker
        const markerInstance = new google.maps.Marker({
          position: currentPosition,
          map: mapInstance,
          draggable: true,
          title: 'Drag to select location',
        });

        // Handle marker drag end
        markerInstance.addListener('dragend', () => {
          const position = markerInstance.getPosition();
          if (position) {
            const lat = position.lat();
            const lng = position.lng();
            setCurrentPosition({ lat, lng });
            updateAddressFromLatLng(lat, lng);
          }
        });

        // Handle map click
        mapInstance.addListener('click', (e: google.maps.MapMouseEvent) => {
          if (e.latLng) {
            const lat = e.latLng.lat();
            const lng = e.latLng.lng();
            markerInstance.setPosition(e.latLng);
            setCurrentPosition({ lat, lng });
            updateAddressFromLatLng(lat, lng);
          }
        });

        setMap(mapInstance);
        setMarker(markerInstance);

        // Get current location if no initial position
        if (!initialPosition) {
          getCurrentLocation();
        } else {
          updateAddressFromLatLng(initialPosition.lat, initialPosition.lng);
        }
      } catch (error) {
        console.error('Error loading Google Maps:', error);
        setError('Failed to load Google Maps. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    initMap();

    // Cleanup
    return () => {
      if (map) {
        google.maps.event.clearInstanceListeners(map);
      }
    };
  }, [apiKey]);

  // Update map when currentPosition changes
  useEffect(() => {
    if (map && marker) {
      const position = new google.maps.LatLng(currentPosition.lat, currentPosition.lng);
      map.panTo(position);
      marker.setPosition(position);
    }
  }, [currentPosition, map, marker]);

  // Get current location using geolocation API
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      setIsLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCurrentPosition({ lat: latitude, lng: longitude });
          updateAddressFromLatLng(latitude, longitude);
          setIsLoading(false);
        },
        (error) => {
          console.error('Error getting current location:', error);
          setError('Unable to retrieve your location. Please enable location services.');
          setIsLoading(false);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      setError('Geolocation is not supported by your browser');
    }
  };

  // Update address from latitude and longitude
  const updateAddressFromLatLng = (lat: number, lng: number) => {
    if (!window.google) return;

    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
      if (status === 'OK' && results?.[0]) {
        setCurrentAddress(results[0].formatted_address);
        onSelect(results[0].formatted_address, { lat, lng });
      } else {
        setCurrentAddress(`Location at ${lat.toFixed(6)}, ${lng.toFixed(6)}`);
        onSelect(`Location at ${lat.toFixed(6)}, ${lng.toFixed(6)}`, { lat, lng });
      }
    });
  };

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim() || !map) return;

    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ address: searchQuery }, (results, status) => {
      if (status === 'OK' && results?.[0]) {
        const location = results[0].geometry.location;
        const lat = location.lat();
        const lng = location.lng();
        
        setCurrentPosition({ lat, lng });
        setCurrentAddress(results[0].formatted_address);
        onSelect(results[0].formatted_address, { lat, lng });
      } else {
        setError('No results found for the specified address');
      }
    });
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="relative">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Search for an address..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button type="submit" disabled={isLoading || !searchQuery.trim()}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Search'}
          </Button>
        </form>
        
        <div className="mt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={getCurrentLocation}
            disabled={isLoading}
            className="text-xs"
          >
            <MapPin className="mr-1 h-3 w-3" /> Use my current location
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4 text-sm text-red-600">
          <p>{error}</p>
        </div>
      )}

      <div className="relative h-64 overflow-hidden rounded-lg bg-gray-100 md:h-80">
        {isLoading ? (
          <div className="flex h-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : (
          <div ref={mapRef} className="h-full w-full" />
        )}
      </div>

      {currentAddress && (
        <div className="rounded-lg border bg-gray-50 p-4 text-sm">
          <p className="font-medium">Selected Location:</p>
          <p className="text-gray-700">{currentAddress}</p>
        </div>
      )}
    </div>
  );
}