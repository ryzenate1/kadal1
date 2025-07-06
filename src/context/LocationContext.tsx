'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';

export type Address = {
  id: string;
  user_id: string;
  lat: number;
  lng: number;
  address_string: string;
  door_no: string;
  building: string;
  landmark: string;
  tag: "home" | "work" | "other";
  name: string;
  phone: string;
  created_at: string;
};

export type LocationContextType = {
  currentAddress: Address | null;
  addresses: Address[];
  setLocation: (address: Address) => void;
  saveAddress: (address: Omit<Address, 'id' | 'created_at' | 'user_id'>) => Promise<Address>;
  updateAddress: (id: string, updates: Partial<Omit<Address, 'id' | 'created_at' | 'user_id'>>) => Promise<void>;
  deleteAddress: (id: string) => Promise<void>;
  clearLocation: () => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
};

const LocationContext = createContext<LocationContextType | undefined>(undefined);

const STORAGE_KEY = 'savedAddresses';

export function LocationProvider({ children }: { children: ReactNode }) {
  const [currentAddress, setCurrentAddress] = useState<Address | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user, isAuthenticated } = useAuth();

  // Load saved addresses from localStorage
  const loadSavedAddresses = () => {
    try {
      const savedAddresses = localStorage.getItem(STORAGE_KEY);
      if (savedAddresses) {
        const parsedAddresses = JSON.parse(savedAddresses);
        setAddresses(parsedAddresses);
        
        // Set current address if not already set
        if (!currentAddress && parsedAddresses.length > 0) {
          const defaultAddress = parsedAddresses.find((addr: Address) => addr.id === localStorage.getItem('currentAddressId')) || parsedAddresses[0];
          setCurrentAddress(defaultAddress);
        }
      }
    } catch (error) {
      console.error('Error loading saved addresses:', error);
    }
  };

  // Load saved location and addresses on app init or auth state change
  useEffect(() => {
    const loadSavedLocation = () => {
      try {
        const savedAddress = localStorage.getItem('currentAddress');
        const savedCoordinates = localStorage.getItem('currentCoordinates');
        const savedAddressId = localStorage.getItem('currentAddressId');
        const savedAddressType = localStorage.getItem('userAddressType');

        if (savedAddress && savedCoordinates && savedAddressId) {
          const coordinates = JSON.parse(savedCoordinates);
          const address: Address = {
            id: savedAddressId,
            user_id: user?.id || 'current-user',
            lat: coordinates.lat,
            lng: coordinates.lng,
            address_string: savedAddress,
            door_no: '',
            building: '',
            landmark: '',
            name: '',
            phone: '',
            tag: (savedAddressType?.toLowerCase() as Address['tag']) || 'home',
            created_at: new Date().toISOString()
          };
          setCurrentAddress(address);
        }
      } catch (error) {
        console.error('Error loading saved location:', error);
      }
    };

    loadSavedLocation();
    loadSavedAddresses();
  }, [user]); // Re-run when user changes (login/logout)

  const setLocation = (address: Address) => {
    try {
      // Update context
      setCurrentAddress(address);
      
      // Save to localStorage
      localStorage.setItem('currentAddress', address.address_string);
      localStorage.setItem('currentAddressId', address.id);
      localStorage.setItem('currentCoordinates', JSON.stringify({ lat: address.lat, lng: address.lng }));
      localStorage.setItem('userAddressType', address.tag);
      
      // Also save for backward compatibility
      localStorage.setItem('userLocation', address.address_string);
      
      return address;
    } catch (error) {
      console.error('Error saving location:', error);
      throw error;
    }
  };

  // Save a new address
  const saveAddress = async (address: Omit<Address, 'id' | 'created_at' | 'user_id'>): Promise<Address> => {
    try {
      setIsLoading(true);
      const newAddress: Address = {
        ...address,
        id: `addr-${Date.now()}`,
        user_id: user?.id || 'current-user',
        created_at: new Date().toISOString(),
      };

      const updatedAddresses = [...addresses, newAddress];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedAddresses));
      setAddresses(updatedAddresses);
      
      // Set as current address if it's the first one
      if (addresses.length === 0) {
        setLocation(newAddress);
      }
      
      return newAddress;
    } catch (error) {
      console.error('Error saving address:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Update an existing address
  const updateAddress = async (id: string, updates: Partial<Omit<Address, 'id' | 'created_at' | 'user_id'>>) => {
    try {
      setIsLoading(true);
      const updatedAddresses = addresses.map(addr => 
        addr.id === id ? { ...addr, ...updates } : addr
      );
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedAddresses));
      setAddresses(updatedAddresses);
      
      // Update current address if it's the one being updated
      if (currentAddress?.id === id) {
        setLocation({ ...currentAddress, ...updates });
      }
    } catch (error) {
      console.error('Error updating address:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Delete an address
  const deleteAddress = async (id: string) => {
    try {
      setIsLoading(true);
      const updatedAddresses = addresses.filter(addr => addr.id !== id);
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedAddresses));
      setAddresses(updatedAddresses);
      
      // Clear current address if it's the one being deleted
      if (currentAddress?.id === id) {
        clearLocation();
        // Set another address as current if available
        if (updatedAddresses.length > 0) {
          setLocation(updatedAddresses[0]);
        }
      }
    } catch (error) {
      console.error('Error deleting address:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const clearLocation = () => {
    setCurrentAddress(null);
    localStorage.removeItem('currentAddress');
    localStorage.removeItem('currentAddressId');
    localStorage.removeItem('currentCoordinates');
    localStorage.removeItem('userAddressType');
    localStorage.removeItem('userLocation');
  };

  return (
    <LocationContext.Provider value={{
      currentAddress,
      addresses,
      setLocation,
      saveAddress,
      updateAddress,
      deleteAddress,
      clearLocation,
      isLoading,
      setIsLoading,
    }}>
      {children}
    </LocationContext.Provider>
  );
}

/**
 * Hook to access the LocationContext
 * 
 * This is the single source of truth for the user's location.
 * It handles:
 * - Persisting the location between sessions via localStorage
 * - Sharing location state between components
 * - Syncing with user authentication state
 * 
 * Always use this hook instead of direct localStorage access when
 * working with location data to ensure UI consistency.
 */
export function useLocation() {
  const context = useContext(LocationContext);
  if (context === undefined) {
    // Instead of throwing an error, return a default state that doesn't break the app
    // This is a fallback for edge cases where the hook might be called outside the provider
    console.warn('useLocation was called outside a LocationProvider - using fallback state');
    return {
      currentAddress: null,
      addresses: [],
      setLocation: () => console.warn('setLocation called outside provider'),
      saveAddress: async () => { 
        console.warn('saveAddress called outside provider'); 
        throw new Error('saveAddress called outside provider');
      },
      updateAddress: async () => { 
        console.warn('updateAddress called outside provider'); 
        throw new Error('updateAddress called outside provider');
      },
      deleteAddress: async () => { 
        console.warn('deleteAddress called outside provider'); 
        throw new Error('deleteAddress called outside provider');
      },
      clearLocation: () => console.warn('clearLocation called outside provider'),
      isLoading: false,
      setIsLoading: () => {}
    };
  }
  return context;
}
