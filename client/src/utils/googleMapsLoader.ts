// utils/googleMapsLoader.ts

let isLoaded = false;
let isLoading = false;
const loadPromises: Array<Promise<void>> = [];

export const loadGoogleMaps = (): Promise<void> => {
  if (isLoaded) {
    return Promise.resolve();
  }

  if (isLoading) {
    return loadPromises[loadPromises.length - 1];
  }

  isLoading = true;

  const promise = new Promise<void>((resolve, reject) => {
    try {
      // Check if Google Maps is already loaded
      if (typeof window !== 'undefined' && window.google && window.google.maps) {
        isLoaded = true;
        isLoading = false;
        resolve();
        return;
      }

      // Get API key from environment
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
      
      if (!apiKey) {
        reject(new Error('Google Maps API key not found. Please check your .env.local file.'));
        return;
      }

      console.log('Loading Google Maps with API key:', apiKey.substring(0, 10) + '...');

      // Create script element
      const script = document.createElement('script');

      // Global callback function with unique name
      const callbackName = `initGoogleMaps_${Date.now()}`;
      (window as any)[callbackName] = () => {
        console.log('Google Maps loaded successfully via callback');
        
        // Verify that all required Google Maps components are loaded
        if (window.google && window.google.maps && window.google.maps.Map) {
          isLoaded = true;
          isLoading = false;
          
          // Clean up callback
          delete (window as any)[callbackName];
          
          console.log('Google Maps API fully initialized');
          resolve();
        } else {
          console.error('Google Maps loaded but components missing');
          reject(new Error('Google Maps API loaded but components are not available'));
        }
      };

      // Use the unique callback name
      const libraries = ['places', 'geometry'].join(',');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=${libraries}&callback=${callbackName}&v=weekly`;
      script.async = true;
      script.defer = true;

      // Global callback function with unique name
      (window as any).initGoogleMaps = () => {
        console.log('Google Maps loaded successfully');
        isLoaded = true;
        isLoading = false;
        
        // Clean up callback
        delete (window as any).initGoogleMaps;
        
        resolve();
      };

      // Enhanced error handling
      script.onerror = (error: any) => {
        console.error('Failed to load Google Maps script:', error);
        isLoading = false;
        delete (window as any)[callbackName];
        reject(new Error('Failed to load Google Maps API. Please check your internet connection and API key.'));
      };

      // Add timeout for loading
      setTimeout(() => {
        if (isLoading && !isLoaded) {
          isLoading = false;
          delete (window as any)[callbackName];
          reject(new Error('Google Maps API loading timed out. Please check your API key and internet connection.'));
        }
      }, 10000);

      if (typeof document !== 'undefined') {
        document.head.appendChild(script);
      }
    } catch (error) {
      console.error('Error setting up Google Maps loader:', error);
      isLoading = false;
      reject(error);
    }
  });

  loadPromises.push(promise);
  return promise;
};

export const isGoogleMapsLoaded = (): boolean => {
  return typeof window !== 'undefined' && 
         isLoaded && 
         window.google && 
         window.google.maps && 
         !!window.google.maps.places;
};
