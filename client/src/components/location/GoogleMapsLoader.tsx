'use client';

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

// Track loading state globally
const googleMapsApi = {
  loading: false,
  loaded: false,
  listeners: new Set<() => void>(),
  error: null as Error | null,
};

interface GoogleMapsLoaderProps {
  children: React.ReactNode;
  apiKey: string;
  libraries?: string[];
  loadingComponent?: React.ReactNode;
}

const GoogleMapsLoader = ({
  children,
  apiKey,
  libraries = ['places'],
  loadingComponent = (
    <div className="flex items-center justify-center h-screen">
      <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
    </div>
  ),
}: GoogleMapsLoaderProps) => {
  const [isMounted, setIsMounted] = useState(false);
  const [isLoaded, setIsLoaded] = useState(googleMapsApi.loaded);
  const [loadError, setLoadError] = useState<Error | null>(googleMapsApi.error);

  useEffect(() => {
    setIsMounted(true);
    
    // Only run on client-side
    if (typeof window === 'undefined') return;

    // If already loaded, update state and return
    if (googleMapsApi.loaded) {
      setIsLoaded(true);
      return;
    }

    // If already loading, just add a listener
    if (googleMapsApi.loading) {
      const listener = () => {
        setIsLoaded(true);
        setLoadError(googleMapsApi.error);
      };
      googleMapsApi.listeners.add(listener);
      return () => {
        googleMapsApi.listeners.delete(listener);
      };
    }

    // Set loading state
    googleMapsApi.loading = true;
    googleMapsApi.loaded = false;
    googleMapsApi.error = null;
    setIsLoaded(false);
    setLoadError(null);

    // Create a unique callback name for this instance
    const callbackName = `__googleMapsCallback_${Math.random().toString(36).substr(2, 9)}`;
    
    // Create a global callback function for the Google Maps API to call
    (window as any)[callbackName] = () => {
      googleMapsApi.loaded = true;
      googleMapsApi.loading = false;
      googleMapsApi.listeners.forEach(listener => listener());
      googleMapsApi.listeners.clear();
      delete (window as any)[callbackName];
    };

    // Load Google Maps API script
    const script = document.createElement('script');
    const librariesParam = libraries.length > 0 ? `&libraries=${libraries.join(',')}` : '';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}${librariesParam}&callback=${callbackName}`;
    script.async = true;
    script.defer = true;
    
    // Set up error handling
    script.onerror = (error: Event | string) => {
      const errorMsg = 'Failed to load Google Maps API';
      console.error(errorMsg, error);
      const errorObj = new Error(errorMsg);
      googleMapsApi.error = errorObj;
      googleMapsApi.loading = false;
      setLoadError(errorObj);
      googleMapsApi.listeners.clear();
      delete (window as any)[callbackName];
    };

    // Add the script to the document
    document.head.appendChild(script);

    // Clean up function
    return () => {
      // Clean up the callback if the component unmounts before loading completes
      if ((window as any)[callbackName]) {
        delete (window as any)[callbackName];
      }
    };
  }, [apiKey, libraries]);

  // Only render loading state or children after mounting to prevent hydration mismatch
  if (!isMounted) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
        <p>Error loading Google Maps: {loadError.message}</p>
        <p className="mt-2 text-sm">
          Make sure you have set the <code>NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code> in your <code>.env.local</code> file
          and that the API key has the required Google Maps APIs enabled.
        </p>
      </div>
    );
  }

  if (!isLoaded) {
    return <>{loadingComponent}</>;
  }

  return <>{children}</>;
};

export default GoogleMapsLoader;
