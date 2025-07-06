'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { loadGoogleMaps } from '@/utils/googleMapsLoader';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface GoogleMapPickerProps {
  lat: number;
  lng: number;
  onLocationChange: (lat: number, lng: number) => void;
  onAddressChange?: (address: string) => void;
  className?: string;
}

export default function GoogleMapPicker({ 
  lat, 
  lng, 
  onLocationChange, 
  onAddressChange,
  className = "w-full h-full"
}: GoogleMapPickerProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const geocoderRef = useRef<google.maps.Geocoder | null>(null);
  
  const [isMapLoading, setIsMapLoading] = useState(true);
  const [mapError, setMapError] = useState<string | null>(null);
  const [isZooming, setIsZooming] = useState(false);

  // Detect browser zoom/resize to prevent overlay issues
  useEffect(() => {
    let zoomTimeout: NodeJS.Timeout;
    
    const handleZoomResize = () => {
      setIsZooming(true);
      // Force hide overlays during zoom
      const overlays = document.querySelectorAll('.google-maps-overlay');
      overlays.forEach(overlay => {
        (overlay as HTMLElement).style.display = 'none';
      });
      
      clearTimeout(zoomTimeout);
      zoomTimeout = setTimeout(() => {
        setIsZooming(false);
      }, 500);
    };

    // Listen for zoom/resize events
    window.addEventListener('resize', handleZoomResize);
    window.addEventListener('wheel', (e) => {
      if (e.ctrlKey) { // Detect Ctrl+Zoom
        handleZoomResize();
      }
    }, { passive: true });
    
    // Also listen for zoom detection via visual viewport API
    if ('visualViewport' in window) {
      window.visualViewport?.addEventListener('resize', handleZoomResize);
    }

    return () => {
      window.removeEventListener('resize', handleZoomResize);
      window.removeEventListener('wheel', handleZoomResize);
      if ('visualViewport' in window) {
        window.visualViewport?.removeEventListener('resize', handleZoomResize);
      }
      clearTimeout(zoomTimeout);
    };
  }, []);

  // Reverse geocode coordinates to address
  const reverseGeocode = useCallback(async (latitude: number, longitude: number) => {
    if (!geocoderRef.current || !onAddressChange) return;

    try {
      const response = await new Promise<google.maps.GeocoderResult[]>((resolve, reject) => {
        geocoderRef.current!.geocode(
          { location: { lat: latitude, lng: longitude } },
          (results, status) => {
            if (status === 'OK' && results) {
              resolve(results);
            } else {
              reject(new Error(`Geocoding failed: ${status}`));
            }
          }
        );
      });

      if (response && response[0]) {
        const address = response[0].formatted_address;
        onAddressChange(address);
      }
    } catch (error) {
      console.warn('Reverse geocoding failed:', error);
      onAddressChange(`Location: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
    }
  }, [onAddressChange]);

  // Update marker position
  const updateMarkerPosition = useCallback((latitude: number, longitude: number) => {
    if (markerRef.current) {
      const newPosition = new google.maps.LatLng(latitude, longitude);
      markerRef.current.setPosition(newPosition);
    }
    
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setCenter({ lat: latitude, lng: longitude });
    }

    onLocationChange(latitude, longitude);
    reverseGeocode(latitude, longitude);
  }, [onLocationChange, reverseGeocode]);

  // Initialize Google Map - SIMPLIFIED
  useEffect(() => {
    let mounted = true;
    
    const initializeMap = async () => {
      try {
        if (!mapRef.current || !mounted) return;

        console.log('Starting simplified Google Maps initialization...');
        setIsMapLoading(true);
        setMapError(null);

        // Load Google Maps API
        await loadGoogleMaps();
        if (!mounted) return;

        // Create map with minimal UI
        const map = new google.maps.Map(mapRef.current, {
          center: { lat, lng },
          zoom: 16,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          zoomControl: false, // Hide zoom controls
          scaleControl: false,
          rotateControl: false,
          gestureHandling: 'greedy', // Disable ctrl+scroll requirement
          disableDoubleClickZoom: false,
          keyboardShortcuts: false, // Disable keyboard shortcuts
        });

        // Wait for map to be ready
        await new Promise<void>((resolve) => {
          const listener = map.addListener('tilesloaded', () => {
            google.maps.event.removeListener(listener);
            resolve();
          });
        });

        if (!mounted) return;

        mapInstanceRef.current = map;
        geocoderRef.current = new google.maps.Geocoder();

        // Create marker
        const marker = new google.maps.Marker({
          position: { lat, lng },
          map: map,
          draggable: true,
          title: 'Drag to adjust location'
        });

        markerRef.current = marker;

        // Add event listeners
        marker.addListener('dragend', (event: google.maps.MapMouseEvent) => {
          if (event.latLng) {
            const newLat = event.latLng.lat();
            const newLng = event.latLng.lng();
            updateMarkerPosition(newLat, newLng);
          }
        });

        map.addListener('click', (event: google.maps.MapMouseEvent) => {
          if (event.latLng) {
            const newLat = event.latLng.lat();
            const newLng = event.latLng.lng();
            updateMarkerPosition(newLat, newLng);
          }
        });

        // Initial reverse geocoding
        reverseGeocode(lat, lng);

        // Hide any Google Maps UI elements that might appear
        const hideGoogleMapsUI = () => {
          const elementsToHide = document.querySelectorAll([
            '.gm-style .gm-style-iw',
            '.gm-style-iw-c',
            '.gm-bundled-control',
            '.gm-control-active',
            '[class*="gm-"][class*="control"]',
            '.gm-svpc'
          ].join(','));
          
          elementsToHide.forEach(element => {
            (element as HTMLElement).style.display = 'none';
          });
          
          // Also force hide any remaining overlays that shouldn't be visible
          const overlays = document.querySelectorAll('.google-maps-overlay');
          overlays.forEach(overlay => {
            const overlayElement = overlay as HTMLElement;
            if (mapInstanceRef.current && !mapError && !isMapLoading) {
              overlayElement.style.display = 'none';
              overlayElement.style.visibility = 'hidden';
              overlayElement.style.opacity = '0';
              overlayElement.style.pointerEvents = 'none';
            }
          });
        };
        
        // Run immediately and periodically
        hideGoogleMapsUI();
        const uiHideInterval = setInterval(hideGoogleMapsUI, 1000);
        
        // Clean up interval after 10 seconds
        setTimeout(() => clearInterval(uiHideInterval), 10000);

        // Clear loading state with aggressive overlay cleanup
        setIsMapLoading(false);
        
        // Additional cleanup after state change
        setTimeout(() => {
          hideGoogleMapsUI();
        }, 100);
        console.log('Simplified Google Maps initialization complete!');

      } catch (error: any) {
        console.error('Failed to initialize Google Maps:', error);
        if (mounted) {
          setMapError(error.message || 'Failed to load Google Maps');
          setIsMapLoading(false);
        }
      }
    };

    // Small delay for DOM to be ready
    const timeoutId = setTimeout(initializeMap, 200);
    
    return () => {
      mounted = false;
      clearTimeout(timeoutId);
    };
  }, [lat, lng]); // Re-initialize when coordinates change

  // Retry function
  const retryMapLoad = () => {
    setMapError(null);
    setIsMapLoading(true);
    
    // Clean up existing instances
    mapInstanceRef.current = null;
    markerRef.current = null;
    geocoderRef.current = null;
    
    // Force re-render
    window.location.reload();
  };

  return (
    <div 
      className={className} 
      style={{ 
        position: 'relative',
        width: '100%',
        height: '100%'
      }}
    >
      {/* Map container - NO ROUNDED CORNERS for mobile alignment */}
      <div 
        ref={mapRef} 
        tabIndex={-1}
        className="google-maps-container no-tailwind-map-container google-maps-overlay"
        style={{ 
          minHeight: '400px',
          height: '100%',
          width: '100%',
          backgroundColor: '#f0f0f0',
          outline: 'none !important', 
          border: 'none !important',   
          boxShadow: 'none !important',
          borderRadius: '0px', // Remove rounded corners for mobile alignment
          overflow: 'hidden',
          // Force no focus styles
          WebkitAppearance: 'none',
          MozAppearance: 'none',
          appearance: 'none'
        }}
        onFocus={(e) => {
          e.preventDefault();
          e.stopPropagation();
          e.target.blur();
        }}
        onMouseDown={(e) => {
          e.preventDefault();
        }}
      />

      {/* Debug info removed for production */}
      
      {/* Error overlay - Only render if actually needed */}
      {mapError && !isZooming && !mapInstanceRef.current && (
        <div 
          className="google-maps-overlay"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(255,255,255,0.95)',
            borderRadius: '0px',
            zIndex: 10
          }}
        >
          <div style={{ textAlign: 'center', padding: '32px' }}>
            <AlertCircle style={{ height: '48px', width: '48px', color: '#ef4444', margin: '0 auto 16px' }} />
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>Map Error</h3>
            <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '16px' }}>{mapError}</p>
            <button
              onClick={retryMapLoad}
              style={{
                backgroundColor: '#f97316',
                color: 'white',
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              <RefreshCw size={16} style={{ display: 'inline', marginRight: '8px' }} />
              Retry Map
            </button>
          </div>
        </div>
      )}

      {/* Loading overlay - ONLY render when actually loading AND no map instance */}
      {isMapLoading && !mapInstanceRef.current && !isZooming && !mapError && (
        <div 
          className="google-maps-overlay"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(255,255,255,0.95)',
            borderRadius: '0px',
            zIndex: 10
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '48px',
              height: '48px',
              border: '4px solid #fed7aa',
              borderTop: '4px solid #f97316',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 16px'
            }}></div>
            <h3 style={{ fontWeight: '600', marginBottom: '8px', fontSize: '16px' }}>Loading Map</h3>
            <p style={{ fontSize: '14px', color: '#6b7280' }}>Initializing...</p>
          </div>
        </div>
      )}
      
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        /* Ensure overlays are properly hidden when not needed */
        .google-maps-overlay[style*="display: none"] {
          display: none !important;
        }
      `}</style>
    </div>
  );
}
