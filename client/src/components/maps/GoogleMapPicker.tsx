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
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const initializationRef = useRef<boolean>(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const [isMapLoading, setIsMapLoading] = useState(true);
  const [mapError, setMapError] = useState<string | null>(null);
  const [containerReady, setContainerReady] = useState(false);
  const [isZooming, setIsZooming] = useState(false);

  const removeGrayOverlay = useCallback(() => {
    if (!mapRef.current) return;
    const divs = mapRef.current.querySelectorAll('div');
    divs.forEach(div => {
      if (div.style.backgroundColor === 'rgb(229, 227, 223)') {
        div.style.backgroundColor = 'transparent';
      }
    });
  }, []);

  // Detect browser zoom/resize to prevent overlay issues
  useEffect(() => {
    let zoomTimeout: NodeJS.Timeout;
    
    const handleZoomResize = () => {
      setIsZooming(true);
      // Force remove all gray overlays immediately
      removeGrayOverlay();
      
      clearTimeout(zoomTimeout);
      zoomTimeout = setTimeout(() => {
        setIsZooming(false);
        // Remove overlays again after zoom completes
        removeGrayOverlay();
      }, 500);
    };

    // Listen for zoom events
    window.addEventListener('resize', handleZoomResize);
    window.addEventListener('wheel', (e) => {
      if (e.ctrlKey) { // Detect Ctrl+Zoom
        handleZoomResize();
      }
    }, { passive: true });
    
    // Visual viewport API for better zoom detection
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

  // Ref callback to ensure container is properly set
  const setMapRef = useCallback((element: HTMLDivElement | null) => {
    if (element !== mapRef.current) {
      (mapRef as any).current = element;
      setContainerReady(!!element);
      console.log('Map container ref set:', !!element, element?.offsetWidth, element?.offsetHeight);
      
      // If we now have a container and haven't initialized yet, trigger initialization
      if (element && !initializationRef.current) {
        setTimeout(() => {
          if (!initializationRef.current) {
            window.dispatchEvent(new CustomEvent('retryMap'));
          }
        }, 100);
      }
    }
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

  // Initialize Google Map
  useEffect(() => {
    // Prevent double initialization in React Strict Mode
    if (initializationRef.current) {
      console.log('Map already initialized, skipping...');
      return;
    }
    
    let mounted = true;
    
    const initializeMap = async () => {
      try {
        console.log('Initialize map called - checking container readiness...');
        
        if (!mapRef.current) {
          console.log('Map container ref not available - waiting...');
          return;
        }

        if (!mounted || initializationRef.current) {
          console.log('Component unmounted or already initialized');
          return;
        }

        // Wait for container to be properly sized
        let attempts = 0;
        while (attempts < 10 && (!mapRef.current || mapRef.current.offsetWidth === 0)) {
          console.log(`Attempt ${attempts + 1}: Waiting for container to be ready...`);
          await new Promise(resolve => setTimeout(resolve, 100));
          attempts++;
        }

        if (!mapRef.current || mapRef.current.offsetWidth === 0) {
          console.log('Container still not ready after waiting, proceeding anyway...');
        }

        // Mark as initializing
        initializationRef.current = true;

        setIsMapLoading(true);
        setMapError(null);

        console.log('Starting Google Maps initialization...');

        // Wait for container to be properly rendered
        await new Promise(resolve => setTimeout(resolve, 200));

        if (!mounted || !mapRef.current) return;

        console.log('Map container dimensions:', mapRef.current.offsetWidth, 'x', mapRef.current.offsetHeight);

        // Force container dimensions if needed
        if (mapRef.current.offsetWidth === 0 || mapRef.current.offsetHeight === 0) {
          console.warn('Map container has zero dimensions, forcing layout...');
          mapRef.current.style.width = '100%';
          mapRef.current.style.height = '100%';
          mapRef.current.style.minHeight = '400px';
          mapRef.current.style.display = 'block';
          
          // Force a reflow
          mapRef.current.offsetHeight;
        }

        // Load Google Maps API
        await loadGoogleMaps();

        if (!mounted) return; // Check again after async operation

        console.log('Google Maps API loaded successfully');

        // Verify Google Maps is available
        if (!window.google || !window.google.maps) {
          throw new Error('Google Maps JavaScript API failed to load properly');
        }

        console.log('Creating map instance...');

        // Initialize map with comprehensive configuration to prevent gray overlays
        const mapOptions: google.maps.MapOptions = {
          center: { lat, lng },
          zoom: 16,
          
          // Force white background to prevent gray overlays
          backgroundColor: 'white',
          
          // Disable all UI controls that might cause overlays
          disableDefaultUI: true,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          zoomControl: false,
          scaleControl: false,
          rotateControl: false,
          gestureHandling: 'greedy', // Disable ctrl+scroll requirement - removes the message
          clickableIcons: false,
          keyboardShortcuts: false, // Disable keyboard shortcuts
          
          // Remove mapId that might have default styling
          // mapId: undefined,
          
          // Custom styles to prevent gray elements
          styles: [
            {
              featureType: 'all',
              elementType: 'all',
              stylers: [
                { visibility: 'on' }
              ]
            },
            {
              featureType: 'poi',
              elementType: 'labels',
              stylers: [{ visibility: 'off' }]
            }
          ]
        };

        console.log('Map options:', mapOptions);

        const map = new google.maps.Map(mapRef.current, mapOptions);

        if (!mounted) return;

        console.log('Map instance created, waiting for initialization...');

        // Wait for map to be ready with multiple fallbacks
        await new Promise<void>((resolve) => {
          let resolved = false;
          
          const resolveOnce = () => {
            if (!resolved) {
              resolved = true;
              resolve();
            }
          };

          // Listen for tilesloaded (more reliable than idle)
          const tilesLoadedListener = map.addListener('tilesloaded', () => {
            console.log('Map tiles loaded');
            google.maps.event.removeListener(tilesLoadedListener);
            resolveOnce();
          });

          // Listen for idle as backup
          const idleListener = map.addListener('idle', () => {
            console.log('Map idle');
            google.maps.event.removeListener(idleListener);
            resolveOnce();
          });
          
          // Fallback timeout (reduced)
          setTimeout(() => {
            console.log('Map initialization timeout - proceeding anyway');
            google.maps.event.removeListener(tilesLoadedListener);
            google.maps.event.removeListener(idleListener);
            resolveOnce();
          }, 3000);
        });

        if (!mounted) return;

        // After the map is ready, start a periodic check to remove overlays.
        intervalRef.current = setInterval(removeGrayOverlay, 500);

        mapInstanceRef.current = map;
        console.log('Map is ready and initialized');

        // Initialize geocoder
        geocoderRef.current = new google.maps.Geocoder();
        console.log('Geocoder initialized');

        // Create marker
        const marker = new google.maps.Marker({
          position: { lat, lng },
          map: map,
          draggable: true,
          title: 'Drag to adjust location',
          animation: google.maps.Animation.DROP
        });

        markerRef.current = marker;
        console.log('Marker created and added to map');

        // Add event listeners
        marker.addListener('drag', (event: google.maps.MapMouseEvent) => {
          if (event.latLng) {
            const newLat = event.latLng.lat();
            const newLng = event.latLng.lng();
            onLocationChange(newLat, newLng);
          }
        });

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

        console.log('Event listeners added');

        // Initial reverse geocoding
        reverseGeocode(lat, lng);

        // Explicitly clear loading state
        console.log('Clearing loading state...');
        if (mounted) {
          setIsMapLoading(false);
          console.log('Loading state cleared, isMapLoading should now be false');
        }
        console.log('Google Maps initialization complete!');

        // Set up resize observer to handle container size changes
        if (mapRef.current && ResizeObserver) {
          resizeObserverRef.current = new ResizeObserver(() => {
            if (mapInstanceRef.current) {
              // Trigger resize event on the map
              google.maps.event.trigger(mapInstanceRef.current, 'resize');
            }
          });
          resizeObserverRef.current.observe(mapRef.current);
        }

        // Force a resize immediately to ensure map renders properly
        setTimeout(() => {
          if (mapInstanceRef.current && mounted) {
            google.maps.event.trigger(mapInstanceRef.current, 'resize');
            mapInstanceRef.current.setCenter({ lat, lng });
            console.log('Forced map resize and center');
            
            // Force a final state update to ensure overlay is removed
            setIsMapLoading(false);
            console.log('Final loading state clear');
          }
        }, 500);

      } catch (error: any) {
        console.error('Failed to initialize Google Maps:', error);
        console.error('Error stack:', error.stack);
        if (mounted) {
          setMapError(error.message || 'Failed to load Google Maps');
          setIsMapLoading(false);
          initializationRef.current = false; // Reset on error
        }
      }
    };

    // Initialize map with proper timing
    const timeoutId = setTimeout(initializeMap, 100);
    
    // Listen for retry events
    const handleRetry = () => {
      if (!initializationRef.current) {
        setTimeout(initializeMap, 100);
      }
    };
    window.addEventListener('retryMap', handleRetry);
    
    return () => {
      mounted = false;
      clearTimeout(timeoutId);
      window.removeEventListener('retryMap', handleRetry);
      
      // Clean up interval
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      // Clean up resize observer
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
        resizeObserverRef.current = null;
      }
      
      // Reset initialization flag on unmount
      initializationRef.current = false;
    };
  }, []); // Only run once on mount

  // Update map when coordinates change externally
  useEffect(() => {
    if (mapInstanceRef.current && markerRef.current) {
      const newPosition = { lat, lng };
      mapInstanceRef.current.setCenter(newPosition);
      markerRef.current.setPosition(newPosition);
      reverseGeocode(lat, lng);
    }
  }, [lat, lng, reverseGeocode]);

  // Retry function
  const retryMapLoad = () => {
    console.log('Retrying map initialization...');
    setMapError(null);
    setIsMapLoading(true);
    initializationRef.current = false; // Reset initialization flag
    
    // Clean up existing map instance
    if (mapInstanceRef.current) {
      mapInstanceRef.current = null;
    }
    if (markerRef.current) {
      markerRef.current = null;
    }
    if (geocoderRef.current) {
      geocoderRef.current = null;
    }
    
    // Trigger re-initialization
    setTimeout(() => {
      if (mapRef.current) {
        // Force a re-initialization
        const event = new CustomEvent('retryMap');
        window.dispatchEvent(event);
      }
    }, 100);
  };

  return (
    <div className={className} style={{ position: 'relative' }}>
      {/* Always render the map container - NO ROUNDED CORNERS for mobile alignment */}
      <div 
        ref={setMapRef} 
        className="w-full h-full overflow-hidden no-tailwind-map-container google-maps-container" 
        style={{ 
          minHeight: '400px',
          height: '100%',
          width: '100%',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          borderRadius: '0px', // Remove rounded corners for mobile alignment
          backgroundColor: 'white', // Force white background
          outline: 'none',
          cursor: 'default'
        }}
        onFocus={(e) => e.preventDefault()}
        onMouseDown={(e) => e.preventDefault()}
      />

      {/* Debug info removed for production */}
      
      {/* All overlays disabled for testing - to isolate gray overlay source */}
      {false && (
        <div>All overlays disabled</div>
      )}
    </div>
  );
}
