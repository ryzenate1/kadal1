'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { fetchJson } from '@/lib/apiClient';
import { notifyAddressBookUpdated, subscribeToAddressBookUpdates } from '@/lib/addressSync';

export type Address = {
  id: string;
  user_id: string;
  lat: number;
  lng: number;
  address_string: string;
  door_no: string;
  building: string;
  landmark: string;
  tag: 'home' | 'work' | 'other';
  name: string;
  phone: string;
  created_at: string;
};

export type LocationContextType = {
  currentAddress: Address | null;
  addresses: Address[];
  setLocation: (address: Address) => void;
  saveAddress: (
    address: Omit<Address, 'id' | 'created_at' | 'user_id'> & {
      city?: string;
      state?: string;
      pincode?: string;
    }
  ) => Promise<Address>;
  updateAddress: (id: string, updates: Partial<Omit<Address, 'id' | 'created_at' | 'user_id'>>) => Promise<void>;
  deleteAddress: (id: string) => Promise<void>;
  clearLocation: () => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
};

type ApiAddress = {
  id: string;
  name: string;
  phoneNumber: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  type: 'home' | 'work' | 'other';
  isDefault: boolean;
  createdAt: string;
};

const LocationContext = createContext<LocationContextType | undefined>(undefined);

const LEGACY_STORAGE_KEY = 'savedAddresses';
const CURRENT_ADDRESS_KEY = 'currentAddress';
const CURRENT_ADDRESS_ID_KEY = 'currentAddressId';
const CURRENT_COORDS_KEY = 'currentCoordinates';
const CURRENT_TAG_KEY = 'userAddressType';

function readStoredCoords() {
  try {
    const raw = localStorage.getItem(CURRENT_COORDS_KEY);
    if (!raw) return { lat: 13.0827, lng: 80.2707 };
    const parsed = JSON.parse(raw) as { lat?: number; lng?: number };
    return {
      lat: typeof parsed.lat === 'number' ? parsed.lat : 13.0827,
      lng: typeof parsed.lng === 'number' ? parsed.lng : 80.2707,
    };
  } catch {
    return { lat: 13.0827, lng: 80.2707 };
  }
}

function mapApiAddress(address: ApiAddress): Address {
  const coords = readStoredCoords();
  return {
    id: address.id,
    user_id: 'current-user',
    lat: coords.lat,
    lng: coords.lng,
    address_string: [address.address, address.city, address.state, address.pincode].filter(Boolean).join(', '),
    door_no: '',
    building: '',
    landmark: '',
    tag: address.type || 'home',
    name: address.name || '',
    phone: address.phoneNumber || '',
    created_at: address.createdAt || new Date().toISOString(),
  };
}

function splitAddress(addressLine: string) {
  const parts = addressLine.split(',').map((part) => part.trim()).filter(Boolean);
  const pincodeMatch = addressLine.match(/\b\d{6}\b/);

  return {
    street: parts[0] || addressLine,
    city: parts.length >= 3 ? parts[parts.length - 3] : parts[1] || 'Chennai',
    state: parts.length >= 2 ? parts[parts.length - 2] : 'Tamil Nadu',
    pincode: pincodeMatch?.[0] || '',
  };
}

function readLegacyAddresses(): Address[] {
  try {
    const raw = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Address[]) : [];
  } catch {
    return [];
  }
}

export function LocationProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const [currentAddress, setCurrentAddress] = useState<Address | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // fetchJson automatically attaches all clientStorage auth headers
  // (Authorization Bearer token, x-user-id, x-user-email, etc.)
  const fetchAddressesFromApi = async () => {
    return fetchJson<ApiAddress[]>('/api/user/addresses');
  };

  const refreshAddresses = async (preferredAddressId?: string | null) => {
    if (!isAuthenticated) {
      setAddresses([]);
      return;
    }

    setIsLoading(true);
    try {
      const savedAddressId = preferredAddressId ?? localStorage.getItem(CURRENT_ADDRESS_ID_KEY);
      const apiAddresses = await fetchAddressesFromApi();
      const mapped = apiAddresses.map(mapApiAddress);
      setAddresses(mapped);

      if (mapped.length === 0) {
        localStorage.removeItem(LEGACY_STORAGE_KEY);
        return;
      }

      const preferred =
        mapped.find((address) => address.id === savedAddressId) ||
        mapped.find((address) => address.id === currentAddress?.id) ||
        mapped[0];

      setCurrentAddress((prev) => {
        if (prev?.id && prev.id !== preferred.id) {
          return prev;
        }
        persistCurrentLocation(preferred);
        return preferred;
      });

      localStorage.setItem(LEGACY_STORAGE_KEY, JSON.stringify(mapped));
    } catch (error) {
      console.error('Error loading saved addresses:', error);
      const legacy = readLegacyAddresses();
      setAddresses(legacy);
    } finally {
      setIsLoading(false);
    }
  };

  const persistCurrentLocation = (address: Address | null) => {
    if (!address) return;
    localStorage.setItem(CURRENT_ADDRESS_KEY, address.address_string);
    localStorage.setItem(CURRENT_ADDRESS_ID_KEY, address.id);
    localStorage.setItem(CURRENT_COORDS_KEY, JSON.stringify({ lat: address.lat, lng: address.lng }));
    localStorage.setItem(CURRENT_TAG_KEY, address.tag);
    localStorage.setItem('userLocation', address.address_string);
  };

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const savedAddress = localStorage.getItem(CURRENT_ADDRESS_KEY);
        const savedAddressId = localStorage.getItem(CURRENT_ADDRESS_ID_KEY);
        const savedTag = localStorage.getItem(CURRENT_TAG_KEY);
        const coords = readStoredCoords();

        if (savedAddress && savedAddressId) {
          setCurrentAddress({
            id: savedAddressId,
            user_id: user?.id || 'current-user',
            lat: coords.lat,
            lng: coords.lng,
            address_string: savedAddress,
            door_no: '',
            building: '',
            landmark: '',
            tag: (savedTag as Address['tag']) || 'home',
            name: '',
            phone: user?.phoneNumber || '',
            created_at: new Date().toISOString(),
          });
        }

        if (!isAuthenticated) {
          setAddresses([]);
          return;
        }

        await refreshAddresses(savedAddressId);
      } catch (error) {
        console.error('Error loading saved addresses:', error);
      }
    };

    void bootstrap();
  }, [isAuthenticated, user?.id, user?.phoneNumber]);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    return subscribeToAddressBookUpdates(() => {
      void refreshAddresses(localStorage.getItem(CURRENT_ADDRESS_ID_KEY));
    });
  }, [isAuthenticated, currentAddress?.id]);

  const setLocation = (address: Address) => {
    setCurrentAddress(address);
    persistCurrentLocation(address);
  };

  const saveAddress = async (
    address: Omit<Address, 'id' | 'created_at' | 'user_id'> & {
      city?: string;
      state?: string;
      pincode?: string;
    }
  ): Promise<Address> => {
    setIsLoading(true);
    try {
      if (!isAuthenticated) {
        const guestAddress: Address = {
          ...address,
          id: `guest-${Date.now()}`,
          user_id: user?.id || 'guest',
          created_at: new Date().toISOString(),
        };
        setLocation(guestAddress);
        return guestAddress;
      }

      const parsedAddress = splitAddress(address.address_string);
      const resolvedPincode = address.pincode?.trim() || parsedAddress.pincode;

      const payload = {
        name: address.name.trim() || 'Saved Address',
        phoneNumber: address.phone.trim(),
        address: [address.door_no, address.building, address.landmark, parsedAddress.street]
          .filter(Boolean)
          .join(', '),
        city: address.city?.trim() || parsedAddress.city,
        state: address.state?.trim() || parsedAddress.state,
        pincode: resolvedPincode,
        type: address.tag,
        isDefault: addresses.length === 0,
      };

      if (!payload.pincode) {
        // No pincode — save as session-only location (no DB persistence)
        const sessionAddress: Address = {
          ...address,
          id: `session-${Date.now()}`,
          user_id: user?.id || 'current-user',
          created_at: new Date().toISOString(),
        };
        setLocation(sessionAddress);
        return sessionAddress;
      }

      // fetchJson automatically attaches all clientStorage auth headers
      const created = await fetchJson<ApiAddress>('/api/user/addresses', {
        method: 'POST',
        body: payload,
      });

      const mapped = {
        ...mapApiAddress(created),
        lat: address.lat,
        lng: address.lng,
        address_string: address.address_string,
        door_no: address.door_no,
        building: address.building,
        landmark: address.landmark,
        tag: address.tag,
        name: address.name,
        phone: address.phone,
      };

      setAddresses((prev) => {
        const next = [mapped, ...prev.filter((entry) => entry.id !== mapped.id)];
        localStorage.setItem(LEGACY_STORAGE_KEY, JSON.stringify(next));
        return next;
      });
      persistCurrentLocation(mapped);
      setCurrentAddress(mapped);
      notifyAddressBookUpdated();
      return mapped;
    } finally {
      setIsLoading(false);
    }
  };

  const updateAddress = async (id: string, updates: Partial<Omit<Address, 'id' | 'created_at' | 'user_id'>>) => {
    setIsLoading(true);
    try {
      await fetchJson(`/api/user/addresses/${id}`, {
        method: 'PATCH',
        body: {
          name: updates.name,
          phoneNumber: updates.phone,
          address: [updates.door_no, updates.building, updates.landmark, updates.address_string]
            .filter(Boolean)
            .join(', '),
          type: updates.tag,
        },
      });

      setAddresses((prev) =>
        prev.map((address) => (address.id === id ? { ...address, ...updates } : address))
      );
      if (currentAddress?.id === id) {
        const next = { ...currentAddress, ...updates };
        setCurrentAddress(next);
        persistCurrentLocation(next);
      }
      notifyAddressBookUpdated();
    } finally {
      setIsLoading(false);
    }
  };

  const deleteAddress = async (id: string) => {
    setIsLoading(true);
    try {
      if (isAuthenticated) {
        await fetchJson(`/api/user/addresses/${id}`, {
          method: 'DELETE',
        });
      }
      const next = addresses.filter((address) => address.id !== id);
      setAddresses(next);
      localStorage.setItem(LEGACY_STORAGE_KEY, JSON.stringify(next));
      if (currentAddress?.id === id) {
        if (next[0]) {
          setLocation(next[0]);
        } else {
          clearLocation();
        }
      }
      notifyAddressBookUpdated();
    } finally {
      setIsLoading(false);
    }
  };

  const clearLocation = () => {
    setCurrentAddress(null);
    localStorage.removeItem(CURRENT_ADDRESS_KEY);
    localStorage.removeItem(CURRENT_ADDRESS_ID_KEY);
    localStorage.removeItem(CURRENT_COORDS_KEY);
    localStorage.removeItem(CURRENT_TAG_KEY);
    localStorage.removeItem('userLocation');
  };

  return (
    <LocationContext.Provider
      value={{
        currentAddress,
        addresses,
        setLocation,
        saveAddress,
        updateAddress,
        deleteAddress,
        clearLocation,
        isLoading,
        setIsLoading,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const context = useContext(LocationContext);
  if (context === undefined) {
    console.warn('useLocation was called outside a LocationProvider - using fallback state');
    return {
      currentAddress: null,
      addresses: [],
      setLocation: () => console.warn('setLocation called outside provider'),
      saveAddress: async () => {
        throw new Error('saveAddress called outside provider');
      },
      updateAddress: async () => {
        throw new Error('updateAddress called outside provider');
      },
      deleteAddress: async () => {
        throw new Error('deleteAddress called outside provider');
      },
      clearLocation: () => console.warn('clearLocation called outside provider'),
      isLoading: false,
      setIsLoading: () => {},
    };
  }
  return context;
}
