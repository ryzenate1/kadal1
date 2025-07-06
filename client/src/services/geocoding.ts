'use client';

// This service will handle all geocoding operations using OpenStreetMap's Nominatim API
// Nominatim is free and doesn't require an API key, but has usage limits and requires
// proper attribution when displayed on a map

// Rate limiting: max 1 request per second, recommended stay below 60 per minute
// Add a small delay between requests to respect rate limits
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Convert address to coordinates using Nominatim
 */
export async function geocodeAddress(address: string): Promise<{ lat: number; lng: number } | null> {
  try {
    // Add a 250ms delay to respect rate limits
    await delay(250);
    
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`,
      {
        headers: {
          'User-Agent': 'KadalThunai-FishDeliveryApp/1.0',
          'Accept-Language': 'en-US,en;q=0.9'
        }
      }
    );

    const data = await response.json();

    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon)
      };
    } else {
      console.warn('No results found for address:', address);
      
      // In a development environment, return a mock location for Chennai
      if (process.env.NODE_ENV === 'development') {
        console.warn('Using mock location for Chennai in development environment');
        return { lat: 13.0827, lng: 80.2707 }; // Chennai coordinates
      }
      return null;
    }
  } catch (error) {
    console.error('Error geocoding address:', error);
    
    // In a development environment, return a mock location for Chennai
    if (process.env.NODE_ENV === 'development') {
      console.warn('Using mock location for Chennai in development environment');
      return { lat: 13.0827, lng: 80.2707 }; // Chennai coordinates
    }
    throw error;
  }
}

/**
 * Convert coordinates to address using Nominatim reverse geocoding
 */
export async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    // Add a 250ms delay to respect rate limits
    await delay(250);
    
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
      {
        headers: {
          'User-Agent': 'KadalThunai-FishDeliveryApp/1.0',
          'Accept-Language': 'en-US,en;q=0.9'
        }
      }
    );

    const data = await response.json();

    if (data && data.display_name) {
      return data.display_name;
    } else {
      console.warn('No results found for coordinates:', lat, lng);
      return `Location at ${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    }
  } catch (error) {
    console.error('Error reverse geocoding:', error);
    
    // In a development environment, return a mock address
    if (process.env.NODE_ENV === 'development') {
      console.warn('Using mock address in development environment');
      return "123 Main Street, Chennai, Tamil Nadu, India";
    }
    throw error;
  }
}
