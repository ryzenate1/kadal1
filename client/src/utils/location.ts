import { Loader } from '@googlemaps/js-api-loader';

export interface LocationResult {
  lat: number;
  lng: number;
  address: string;
  accuracy?: number;
}

export interface LocationError {
  code: number;
  message: string;
}

/**
 * Get user's current location using browser geolocation API
 */
export const getCurrentLocation = (): Promise<LocationResult> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject({
        code: 0,
        message: 'Geolocation is not supported by this browser. Please enter your address manually.'
      });
      return;
    }

    const options = {
      enableHighAccuracy: true,
      timeout: 15000, // Increased timeout
      maximumAge: 300000 // 5 minutes
    };

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude, accuracy } = position.coords;
          
          // Try reverse geocoding, but don't fail if it doesn't work
          let address = `Location: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
          try {
            address = await reverseGeocode(latitude, longitude);
          } catch (geocodeError) {
            console.warn('Reverse geocoding failed, using coordinates as address:', geocodeError);
          }
          
          resolve({
            lat: latitude,
            lng: longitude,
            address,
            accuracy
          });
        } catch (error) {
          reject({
            code: 2,
            message: 'Failed to process location data. Please try again.'
          });
        }
      },
      (error) => {
        let errorMessage = 'Failed to get your location. ';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage += 'Please allow location access in your browser settings and try again.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage += 'Location information is unavailable. Please check your GPS or try again.';
            break;
          case error.TIMEOUT:
            errorMessage += 'Location request timed out. Please try again.';
            break;
          default:
            errorMessage += 'An unknown error occurred. Please try again.';
            break;
        }
        
        reject({
          code: error.code,
          message: errorMessage
        });
      },
      options
    );
  });
};

/**
 * Reverse geocode coordinates to get formatted address
 */
export const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
  try {
    const loader = new Loader({
      apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
      version: 'weekly',
      libraries: ['places']
    });

    const google = await loader.load();
    const geocoder = new google.maps.Geocoder();

    return new Promise((resolve, reject) => {
      geocoder.geocode(
        { location: { lat, lng } },
        (results, status) => {
          if (status === google.maps.GeocoderStatus.OK && results && results[0]) {
            resolve(results[0].formatted_address);
          } else {
            reject(new Error('Geocoding failed'));
          }
        }
      );
    });
  } catch (error) {
    throw new Error('Failed to initialize geocoding service');
  }
};

/**
 * Search for places using Google Places API
 */
export const searchPlaces = async (query: string): Promise<any[]> => {
  try {
    const loader = new Loader({
      apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
      version: 'weekly',
      libraries: ['places']
    });

    const google = await loader.load();
    const service = new google.maps.places.AutocompleteService();

    return new Promise((resolve, reject) => {
      service.getPlacePredictions(
        {
          input: query,
          componentRestrictions: { country: 'in' },
          types: ['establishment', 'geocode']
        },
        (predictions, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
            resolve(predictions);
          } else {
            resolve([]);
          }
        }
      );
    });
  } catch (error) {
    throw new Error('Failed to search places');
  }
};

/**
 * Get detailed information about a place using place ID
 */
export const getPlaceDetails = async (placeId: string): Promise<any> => {
  try {
    const loader = new Loader({
      apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
      version: 'weekly',
      libraries: ['places']
    });

    const google = await loader.load();
    
    // Create a dummy div for PlacesService
    const dummyDiv = document.createElement('div');
    const dummyMap = new google.maps.Map(dummyDiv);
    const service = new google.maps.places.PlacesService(dummyMap);

    return new Promise((resolve, reject) => {
      service.getDetails(
        {
          placeId,
          fields: ['geometry', 'formatted_address', 'name', 'place_id']
        },
        (place, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && place) {
            resolve(place);
          } else {
            reject(new Error('Failed to get place details'));
          }
        }
      );
    });
  } catch (error) {
    throw new Error('Failed to get place details');
  }
};

/**
 * Calculate distance between two coordinates
 */
export const calculateDistance = (
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/**
 * Format distance for display
 */
export const formatDistance = (distanceKm: number): string => {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m`;
  }
  return `${distanceKm.toFixed(1)} km`;
};
