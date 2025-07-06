import { Address as ContextAddress } from '@/context/LocationContext';

// Local interface to replace the problematic import
interface SelectorAddress {
  id?: string;
  type: 'home' | 'work' | 'other';
  name: string;
  address: string;
  lat: number;
  lng: number;
  doorNo?: string;
  landmark?: string;
  phone?: string;
  isCurrent?: boolean;
}

/**
 * Convert MobileLocationSelector Address to LocationContext Address format
 */
export const toContextAddress = (
  address: SelectorAddress,
  userId: string = 'guest'
): Omit<ContextAddress, 'id' | 'created_at'> => {
  return {
    user_id: userId,
    lat: address.lat,
    lng: address.lng,
    address_string: address.address,
    door_no: address.doorNo || '',
    building: address.address.split(',')[0] || '',
    landmark: address.landmark || '',
    tag: address.type,
    name: address.name || address.address.split(',')[0] || 'New Address',
    phone: address.phone || ''
  };
};

/**
 * Convert LocationContext Address to MobileLocationSelector Address format
 */
export const toSelectorAddress = (address: ContextAddress): SelectorAddress => {
  return {
    id: address.id,
    type: address.tag,
    name: address.name,
    address: address.address_string,
    lat: address.lat,
    lng: address.lng,
    doorNo: address.door_no,
    landmark: address.landmark,
    phone: address.phone,
    isCurrent: true // Assuming if we're converting from context, it's the current address
  };
};

/**
 * Format address for display
 */
export const formatAddress = (address: string): string => {
  // Remove any extra whitespace and normalize commas
  return address
    .split(',')
    .map(part => part.trim())
    .filter(part => part.length > 0)
    .join(', ');
};

/**
 * Get a short version of the address (first line)
 */
export const getShortAddress = (address: string): string => {
  return address.split(',')[0] || address;
};

/**
 * Calculate distance between two coordinates in kilometers
 */
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in km
  return parseFloat(distance.toFixed(1));
};

const deg2rad = (deg: number): number => {
  return deg * (Math.PI / 180);
};

/**
 * Get the distance string (e.g., "2.5 km away")
 */
export const getDistanceString = (distance: number): string => {
  if (distance < 1) {
    return `${Math.round(distance * 1000)} m away`;
  }
  return `${distance} km away`;
};
