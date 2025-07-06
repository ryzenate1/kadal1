'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { loadGoogleMaps } from '@/utils/googleMapsLoader';

interface TestMapPickerProps {
  lat: number;
  lng: number;
  onLocationChange: (lat: number, lng: number) => void;
  onAddressChange: (address: string) => void;
}

export default function TestMapPicker({ lat, lng, onLocationChange, onAddressChange }: TestMapPickerProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const geocoderRef = useRef<google.maps.Geocoder | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reverseGeocode = useCallback(
    async (latitude: number, longitude: number) => {
      if (!geocoderRef.current) return;
      try {
        const response = await geocoderRef.current.geocode({
          location: { lat: latitude, lng: longitude },
        });
        if (response.results[0]) {
          onAddressChange(response.results[0].formatted_address);
        } else {
          onAddressChange('Address not found');
        }
      } catch (e) {
        console.error('Geocoding failed', e);
        onAddressChange('Failed to fetch address');
      }
    },
    [onAddressChange]
  );

  useEffect(() => {
    const initMap = async () => {
      try {
        await loadGoogleMaps();
        if (window.google && mapRef.current && !mapInstanceRef.current) {
          const mapInstance = new window.google.maps.Map(mapRef.current, {
            center: { lat, lng },
            zoom: 15,
            disableDefaultUI: true,
            gestureHandling: 'greedy',
            backgroundColor: '#FFFFFF',
          });
          mapInstanceRef.current = mapInstance;

          const marker = new window.google.maps.Marker({
            position: { lat, lng },
            map: mapInstance,
            draggable: true,
          });
          markerRef.current = marker;

          geocoderRef.current = new window.google.maps.Geocoder();

          marker.addListener('dragend', (event: google.maps.MapMouseEvent) => {
            if (event.latLng) {
              const newLat = event.latLng.lat();
              const newLng = event.latLng.lng();
              onLocationChange(newLat, newLng);
              reverseGeocode(newLat, newLng);
            }
          });

          mapInstance.addListener('click', (event: google.maps.MapMouseEvent) => {
            if (event.latLng) {
              const newLat = event.latLng.lat();
              const newLng = event.latLng.lng();
              onLocationChange(newLat, newLng);
              marker.setPosition(event.latLng);
              reverseGeocode(newLat, newLng);
            }
          });

          setIsInitialized(true);
          reverseGeocode(lat, lng);
        }
      } catch (e) {
        setError('Failed to load Google Maps');
        console.error(e);
      }
    };

    initMap();
  }, [lat, lng, onLocationChange, reverseGeocode]);

  useEffect(() => {
    if (mapInstanceRef.current && isInitialized) {
      mapInstanceRef.current.setCenter({ lat, lng });
      markerRef.current?.setPosition({ lat, lng });
    }
  }, [lat, lng, isInitialized]);

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-red-100 text-red-700">
        {error}
      </div>
    );
  }

  return <div ref={mapRef} className="w-full h-full" style={{ backgroundColor: 'white' }} />;
}
