import { Loader } from '@googlemaps/js-api-loader';

// Google Maps API key
const GOOGLE_MAPS_API_KEY = 'AIzaSyDQHNY_CkWLugrH3C9VUgdUTj2YImqM4Ps';

// Create a loader instance for Google Maps
export const mapsLoader = new Loader({
  apiKey: GOOGLE_MAPS_API_KEY,
  version: 'weekly',
  libraries: ['places', 'geometry']
});

// Function to load Google Maps script
export const loadGoogleMaps = () => {
  return mapsLoader.load();
};

// Function to get current user location
export const getCurrentLocation = (): Promise<{ lat: number; lng: number }> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => {
        reject(error);
      }
    );
  });
};

// Function to get address from coordinates (reverse geocoding)
export const getAddressFromCoordinates = async (
  lat: number, 
  lng: number
): Promise<string> => {
  const google = await mapsLoader.load();
  const geocoder = new google.maps.Geocoder();
  
  return new Promise((resolve, reject) => {
    geocoder.geocode(
      { location: { lat, lng } },
      (results: google.maps.GeocoderResult[] | null, status: google.maps.GeocoderStatus) => {
        if (status === 'OK' && results && results[0]) {
          resolve(results[0].formatted_address);
        } else {
          reject(new Error(`Geocoder failed with status: ${status}`));
        }
      }
    );
  });
};

// Function to get coordinates from address (geocoding)
export const getCoordinatesFromAddress = async (
  address: string
): Promise<{ lat: number; lng: number }> => {
  const google = await mapsLoader.load();
  const geocoder = new google.maps.Geocoder();
  
  return new Promise((resolve, reject) => {
    geocoder.geocode(
      { address },
      (results: google.maps.GeocoderResult[] | null, status: google.maps.GeocoderStatus) => {
        if (status === 'OK' && results && results[0] && results[0].geometry.location) {
          const location = results[0].geometry.location;
          resolve({
            lat: location.lat(),
            lng: location.lng(),
          });
        } else {
          reject(new Error(`Geocoder failed with status: ${status}`));
        }
      }
    );
  });
};

// Calculate distance between two points
export const calculateDistance = async (
  origin: { lat: number; lng: number }, 
  destination: { lat: number; lng: number }
): Promise<number> => {
  const google = await mapsLoader.load();
  
  return new Promise((resolve, reject) => {
    const service = new google.maps.DistanceMatrixService();
    service.getDistanceMatrix(
      {
        origins: [new google.maps.LatLng(origin.lat, origin.lng)],
        destinations: [new google.maps.LatLng(destination.lat, destination.lng)],
        travelMode: google.maps.TravelMode.DRIVING,
      },
      (response, status) => {
        if (status === 'OK' && response?.rows[0]?.elements[0]?.distance) {
          resolve(response.rows[0].elements[0].distance.value);
        } else {
          reject(new Error(`Distance calculation failed with status: ${status}`));
        }
      }
    );
  });
};