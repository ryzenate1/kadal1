"use client";

import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

interface LocationFormatterProps {
  coordinates: string | null;
  fallback?: string;
}

/**
 * Component that converts GPS coordinates to human-readable address
 * If the value is already a formatted address, it will pass it through
 */
const LocationFormatter = ({ coordinates, fallback = 'Unknown location' }: LocationFormatterProps) => {
  const [formattedAddress, setFormattedAddress] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Reset states when coordinates change
    setFormattedAddress(null);
    setError(null);
    
    if (!coordinates) return;
    
    // Check if input is already a formatted address (not coordinates)
    if (!isCoordinates(coordinates)) {
      setFormattedAddress(coordinates);
      return;
    }
    
    // Convert coordinates to address
    convertCoordinatesToAddress(coordinates);
  }, [coordinates]);
  
  // Function to check if the string looks like coordinates
  const isCoordinates = (value: string): boolean => {
    // Basic regex to match latitude,longitude format
    const coordRegex = /^-?\d+(\.\d+)?,-?\d+(\.\d+)?$/;
    return coordRegex.test(value);
  };
  
  // Function to convert coordinates to address using geocoding
  const convertCoordinatesToAddress = async (coordString: string) => {
    try {
      setIsLoading(true);
      
      // Parse coordinates
      const [lat, lng] = coordString.split(',').map(Number);
      
      if (isNaN(lat) || isNaN(lng)) {
        throw new Error('Invalid coordinates format');
      }
      
      // In a real app, you would use a geocoding API like Google Maps, Mapbox, etc.
      // For the demonstration, we'll simulate the API response with predefined mappings
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Sample coordinate to address mapping (simulating API response)
      const mockAddressMap: Record<string, string> = {
        '13.0827,80.2707': 'Anna Salai, Chennai, Tamil Nadu 600002',
        '13.0499,80.2121': 'T Nagar, Chennai, Tamil Nadu 600017',
        '13.0569,80.2425': 'Nungambakkam, Chennai, Tamil Nadu 600034',
        '12.9716,80.2194': 'Adyar, Chennai, Tamil Nadu 600020',
        '11.0168,76.9558': 'Gandhipuram, Coimbatore, Tamil Nadu 641012',
        '10.7905,78.7047': 'Trichy, Tamil Nadu 620001',
        '9.9252,78.1198': 'Madurai, Tamil Nadu 625001'
      };
      
      // Get address for exact coordinates or try to find the closest match
      const exactKey = `${lat},${lng}`;
      if (mockAddressMap[exactKey]) {
        setFormattedAddress(mockAddressMap[exactKey]);
        return;
      }
      
      // If no exact match, use a generic address for demonstration
      // For Chennai coordinates range
      if (lat > 12.8 && lat < 13.2 && lng > 80.1 && lng < 80.4) {
        setFormattedAddress(`${lat.toFixed(4)}, ${lng.toFixed(4)} (Chennai Area, Tamil Nadu)`);
      }
      // For Coimbatore coordinates range
      else if (lat > 10.9 && lat < 11.1 && lng > 76.8 && lng < 77.1) {
        setFormattedAddress(`${lat.toFixed(4)}, ${lng.toFixed(4)} (Coimbatore Area, Tamil Nadu)`);
      }
      // Default fallback
      else {
        setFormattedAddress(`${lat.toFixed(4)}, ${lng.toFixed(4)} (Tamil Nadu)`);
      }
      
    } catch (err) {
      console.error('Error converting coordinates to address:', err);
      setError('Could not convert coordinates to address');
      setFormattedAddress(coordinates); // Fallback to showing the raw coordinates
    } finally {
      setIsLoading(false);
    }
  };
  
  // Loading state
  if (isLoading) {
    return (
      <span className="flex items-center text-gray-600">
        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
        <span className="text-xs">Converting coordinates...</span>
      </span>
    );
  }
  
  // Error state
  if (error) {
    return <span className="text-red-500 text-sm">{coordinates || fallback}</span>;
  }
  
  // Display formatted address or fallback
  return <span>{formattedAddress || fallback}</span>;
};

export default LocationFormatter; 