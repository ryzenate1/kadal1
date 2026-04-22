'use client';

import { useEffect, useRef } from 'react';
import { Loader } from '@googlemaps/js-api-loader';

export interface GoogleMapComponentProps {
  center: {
    lat: number;
    lng: number;
  };
  zoom?: number;
  draggable?: boolean;
  onPositionChange?: (lat: number, lng: number, address?: string) => void;
  className?: string;
  apiKey: string;
  markerIcon?: string;
}

export function GoogleMapComponent({
  center,
  zoom = 15,
  draggable = true,
  onPositionChange,
  className = '',
  apiKey,
  markerIcon = '/marker-icon.png',
}: GoogleMapComponentProps) {
  const mapRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const geocoder = useRef<google.maps.Geocoder | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const loader = new Loader({
      apiKey,
      version: 'weekly',
      libraries: ['places'],
    });

    let map: google.maps.Map;
    let marker: google.maps.Marker;

    const initMap = async () => {
      try {
        await loader.load();

        map = new google.maps.Map(containerRef.current!, {
          center: { lat: center.lat, lng: center.lng },
          zoom,
          disableDefaultUI: true,
          zoomControl: true,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true,
        });

        geocoder.current = new google.maps.Geocoder();

        marker = new google.maps.Marker({
          position: { lat: center.lat, lng: center.lng },
          map,
          draggable,
          animation: google.maps.Animation.DROP,
          icon: {
            url: markerIcon,
            scaledSize: new google.maps.Size(40, 40),
            origin: new google.maps.Point(0, 0),
            anchor: new google.maps.Point(20, 40),
          },
        });

        if (draggable && onPositionChange) {
          marker.addListener('dragend', () => {
            const position = marker.getPosition();
            if (position) {
              const lat = position.lat();
              const lng = position.lng();

              geocoder.current?.geocode({ location: { lat, lng } }, (results, status) => {
                if (status === 'OK' && results?.[0]) {
                  onPositionChange(lat, lng, results[0].formatted_address);
                } else {
                  onPositionChange(lat, lng);
                }
              });
            }
          });
        }

        mapRef.current = map;
        markerRef.current = marker;
      } catch (error) {
        console.error('Error loading Google Maps:', error);
      }
    };

    initMap();

    return () => {
      if (marker) {
        marker.setMap(null);
      }
      if (map) {
        const parent = map.getDiv().parentNode;
        if (parent) {
          google.maps.event.clearInstanceListeners(map);
          parent.removeChild(map.getDiv());
        }
      }
    };
  }, [apiKey, center.lat, center.lng, draggable, onPositionChange, zoom, markerIcon]);

  useEffect(() => {
    if (markerRef.current && mapRef.current) {
      const newPosition = new google.maps.LatLng(center.lat, center.lng);
      markerRef.current.setPosition(newPosition);
      mapRef.current.panTo(newPosition);
    }
  }, [center.lat, center.lng]);

  return <div ref={containerRef} className={`w-full h-full ${className}`} />;
}
