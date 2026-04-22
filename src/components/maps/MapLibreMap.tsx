'use client';

import { useEffect, useRef, useCallback } from 'react';

export interface MapLibreMapProps {
  center: { lat: number; lng: number };
  zoom?: number;
  draggable?: boolean;
  onPositionChange?: (lat: number, lng: number, address?: string) => void;
  className?: string;
}

// Stadia Maps Alidade Smooth — beautiful, Google Maps quality, no API key needed for dev
// Free tier: 200,000 tile requests/month — perfect for a seafood delivery app
// Switch to 'alidade_smooth_dark' for dark mode look
const TILE_STYLE =
  'https://tiles.stadiamaps.com/styles/alidade_smooth.json';

// Default center: Chennai coast
const CHENNAI = { lat: 13.0827, lng: 80.2707 };

async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      { headers: { 'Accept-Language': 'en' } }
    );
    if (!res.ok) throw new Error('Nominatim error');
    const data = await res.json();
    return data.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
  } catch {
    return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
  }
}

export function MapLibreMap({
  center,
  zoom = 15,
  draggable = true,
  onPositionChange,
  className = '',
}: MapLibreMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const mountedRef = useRef(true);

  const updatePosition = useCallback(
    async (lat: number, lng: number) => {
      if (!mountedRef.current) return;
      const address = await reverseGeocode(lat, lng);
      if (mountedRef.current && onPositionChange) {
        onPositionChange(lat, lng, address);
      }
    },
    [onPositionChange]
  );

  useEffect(() => {
    mountedRef.current = true;
    let map: any;
    let marker: any;

    const init = async () => {
      if (!containerRef.current) return;

      // Dynamic import — keeps bundle small, only loads when map is shown
      const maplibre = await import('maplibre-gl');

      if (!mountedRef.current || !containerRef.current) return;

      const { lat, lng } = center ?? CHENNAI;

      map = new maplibre.Map({
        container: containerRef.current,
        style: TILE_STYLE,
        center: [lng, lat],
        zoom,
        attributionControl: false,
      });

      // Compact attribution bottom-right
      map.addControl(
        new maplibre.AttributionControl({ compact: true }),
        'bottom-right'
      );

      // Zoom controls
      map.addControl(new maplibre.NavigationControl({ showCompass: false }), 'top-right');

      map.on('load', () => {
        if (!mountedRef.current) return;

        // Custom red pin marker using HTML element
        const el = document.createElement('div');
        el.className = 'kadal-map-marker';
        el.innerHTML = `
          <svg width="36" height="48" viewBox="0 0 36 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="rgba(0,0,0,0.35)"/>
            </filter>
            <path d="M18 0C8.06 0 0 8.06 0 18C0 31.5 18 48 18 48C18 48 36 31.5 36 18C36 8.06 27.94 0 18 0Z"
              fill="#dc2626" filter="url(#shadow)"/>
            <circle cx="18" cy="18" r="7" fill="white"/>
          </svg>`;
        el.style.cssText = 'cursor: pointer; transform: translate(-50%, -100%);';

        marker = new maplibre.Marker({
          element: el,
          draggable,
          anchor: 'bottom',
        })
          .setLngLat([lng, lat])
          .addTo(map);

        markerRef.current = marker;
        mapRef.current = map;

        // Trigger initial reverse geocode
        updatePosition(lat, lng);

        if (draggable) {
          marker.on('dragend', () => {
            const lnglat = marker.getLngLat();
            updatePosition(lnglat.lat, lnglat.lng);
          });

          // Also allow clicking on map to move marker
          map.on('click', (e: any) => {
            const { lat: clickLat, lng: clickLng } = e.lngLat;
            marker.setLngLat([clickLng, clickLat]);
            updatePosition(clickLat, clickLng);
          });
        }
      });
    };

    init();

    return () => {
      mountedRef.current = false;
      if (markerRef.current) {
        markerRef.current.remove();
        markerRef.current = null;
      }
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fly to new center when props change
  useEffect(() => {
    if (!mapRef.current || !center) return;
    const { lat, lng } = center;
    mapRef.current.flyTo({ center: [lng, lat], zoom, speed: 1.4 });
    if (markerRef.current) {
      markerRef.current.setLngLat([lng, lat]);
    }
  }, [center.lat, center.lng, zoom]);

  return (
    <div className={`relative w-full h-full ${className}`}>
      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
}

export default MapLibreMap;
