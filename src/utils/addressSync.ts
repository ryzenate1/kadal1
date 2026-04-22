/**
 * Address synchronization utility for seamless sync between checkout and account sections
 * Ensures two-way sync using localStorage as the source of truth
 */

import React from 'react';
import { toast } from 'sonner';
import { clientStorage } from '@/lib/clientStorage';
import { getAuthHeaders } from '@/lib/apiClient';
import { getSupabaseBrowserClient, isSupabaseRealtimeEnabled } from '@/lib/supabaseClient';

export interface Address {
  id: string;
  name: string;
  phoneNumber: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  type: 'home' | 'work' | 'other';
  isDefault: boolean;
}

const STORAGE_KEY = 'savedAddresses';
const API_BASE = '/api/user/addresses';

function getGuestStorageKey() {
  return `${STORAGE_KEY}:guest`;
}

function getUserStorageKey(userIdOrEmail: string) {
  return `${STORAGE_KEY}:user:${userIdOrEmail}`;
}

function getCurrentStorageKey() {
  const user = clientStorage.user.get();
  const identity = user?.id || user?.email;
  if (!identity) {
    return getGuestStorageKey();
  }
  return getUserStorageKey(identity);
}

function hasAuthenticatedUser() {
  const user = clientStorage.user.get();
  const token = clientStorage.auth.getToken();
  return Boolean(token && user?.id && user?.email);
}

function getUserHeaders() {
  if (!hasAuthenticatedUser()) {
    return null;
  }

  const headers = getAuthHeaders();
  const hasIdentity =
    headers.has('Authorization') ||
    headers.has('x-user-id') ||
    headers.has('x-user-email') ||
    headers.has('x-auth-user-id');

  if (!hasIdentity) {
    return null;
  }

  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  return headers;
}

/**
 * Address sync event to notify other components of changes
 */
class AddressSyncEvent extends EventTarget {
  notifyChange() {
    this.dispatchEvent(new CustomEvent('addressChange'));
  }
}

export const addressSyncEvent = new AddressSyncEvent();

/**
 * Address management utility
 */
export const addressManager = {  /**
   * Get all saved addresses from localStorage
   */
  getAddresses(): Address[] {
    try {
      const stored = localStorage.getItem(getCurrentStorageKey());
      if (!stored) return [];
      
      const addresses = JSON.parse(stored);
      if (!Array.isArray(addresses)) return [];
      
      // Ensure all addresses have required fields (migration for old data)
      const migratedAddresses = addresses.map(addr => ({
        ...addr,
        type: addr.type || 'home', // Default to 'home' if type is missing
        phoneNumber: addr.phoneNumber || '' // Default to empty string if phoneNumber is missing
      }));
      
      return migratedAddresses;
    } catch (error) {
      console.error('Error getting addresses:', error);
      return [];
    }
  },

  /**
   * Save addresses to localStorage and notify listeners
   */
  saveAddresses(addresses: Address[], notify = true): void {
    try {
      localStorage.setItem(getCurrentStorageKey(), JSON.stringify(addresses));
      if (notify) {
        addressSyncEvent.notifyChange();
      }
    } catch (error) {
      console.error('Error saving addresses:', error);
      toast.error('Failed to save addresses');
    }
  },

  async syncFromApi(): Promise<Address[]> {
    try {
      const headers = getUserHeaders();
      if (!headers) {
        return this.getAddresses();
      }

      const response = await fetch(API_BASE, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        return this.getAddresses();
      }

      const serverAddresses = (await response.json()) as Address[];
      this.saveAddresses(serverAddresses);
      return serverAddresses;
    } catch (error) {
      console.error('Error syncing addresses from API:', error);
      return this.getAddresses();
    }
  },

  async bootstrapAddresses(): Promise<Address[]> {
    const user = clientStorage.user.get();
    const identity = user?.id || user?.email;
    if (!identity) {
      return this.getAddresses();
    }

    const userKey = getUserStorageKey(identity);
    const guestKey = getGuestStorageKey();
    const guestAddresses = JSON.parse(localStorage.getItem(guestKey) || '[]') as Address[];
    const userLocal = JSON.parse(localStorage.getItem(userKey) || '[]') as Address[];

    const headers = getUserHeaders();
    if (!headers) {
      return this.getAddresses();
    }

    try {
      const serverResponse = await fetch(API_BASE, { method: 'GET', headers });
      if (!serverResponse.ok) {
        return this.getAddresses();
      }

      const serverAddresses = (await serverResponse.json()) as Address[];
      if (serverAddresses.length > 0) {
        this.saveAddresses(serverAddresses);
        return serverAddresses;
      }

      const seedAddresses = userLocal.length > 0 ? userLocal : guestAddresses;
      if (seedAddresses.length === 0) {
        return this.getAddresses();
      }

      for (const addr of seedAddresses) {
        await fetch(API_BASE, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            name: addr.name,
            phoneNumber: addr.phoneNumber,
            address: addr.address,
            city: addr.city,
            state: addr.state,
            pincode: addr.pincode,
            type: addr.type,
            isDefault: addr.isDefault,
          }),
        });
      }

      const refreshed = await this.syncFromApi();
      if (guestAddresses.length > 0) {
        localStorage.removeItem(guestKey);
      }
      return refreshed;
    } catch (error) {
      console.error('Address bootstrap failed:', error);
      return this.getAddresses();
    }
  },

  /**
   * Add a new address
   */
  addAddress(address: Omit<Address, 'id'>): Address {
    const newAddress: Address = {
      ...address,
      id: `addr-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };

    const addresses = this.getAddresses();
    
    // If this is the first address or explicitly set as default, make it default
    if (addresses.length === 0 || address.isDefault) {
      // Remove default from other addresses
      addresses.forEach(addr => addr.isDefault = false);
      newAddress.isDefault = true;
    }

    addresses.push(newAddress);
    this.saveAddresses(addresses);

    // Keep DB in sync in background and replace optimistic ID with server ID.
    void (async () => {
      try {
        const headers = getUserHeaders();
        if (!headers) return;

        const response = await fetch(API_BASE, {
          method: 'POST',
          headers,
          body: JSON.stringify(address),
        });

        if (!response.ok) {
          const message = await response.text();
          throw new Error(message || 'Failed to save address to server');
        }

        const created = (await response.json()) as Address;
        const current = this.getAddresses().map((item) => (item.id === newAddress.id ? created : item));
        this.saveAddresses(current);
      } catch (error) {
        console.error('Address API create failed:', error);
        toast.error('Saved locally, but failed to sync to account');
      }
    })();
    
    toast.success('Address added successfully');
    return newAddress;
  },

  /**
   * Update an existing address
   */
  updateAddress(id: string, updates: Partial<Omit<Address, 'id'>>): Address | null {
    const addresses = this.getAddresses();
    const index = addresses.findIndex(addr => addr.id === id);
    
    if (index === -1) {
      toast.error('Address not found');
      return null;
    }

    const updatedAddress = { ...addresses[index], ...updates };
    
    // If setting as default, remove default from others
    if (updates.isDefault) {
      addresses.forEach(addr => addr.isDefault = false);
      updatedAddress.isDefault = true;
    }

    addresses[index] = updatedAddress;
    this.saveAddresses(addresses);

    void (async () => {
      try {
        const headers = getUserHeaders();
        if (!headers) return;

        const response = await fetch(`${API_BASE}/${id}`, {
          method: 'PATCH',
          headers,
          body: JSON.stringify(updates),
        });

        if (!response.ok) {
          throw new Error('Failed to update address on server');
        }

        const serverAddress = (await response.json()) as Address;
        const current = this.getAddresses().map((item) => (item.id === id ? serverAddress : item));
        this.saveAddresses(current);
      } catch (error) {
        console.error('Address API update failed:', error);
      }
    })();
    
    toast.success('Address updated successfully');
    return updatedAddress;
  },

  /**
   * Delete an address
   */
  deleteAddress(id: string): boolean {
    const addresses = this.getAddresses();
    const index = addresses.findIndex(addr => addr.id === id);
    
    if (index === -1) {
      toast.error('Address not found');
      return false;
    }

    const deletedAddress = addresses[index];
    addresses.splice(index, 1);
    
    // If deleted address was default, set another as default
    if (deletedAddress.isDefault && addresses.length > 0) {
      addresses[0].isDefault = true;
    }

    this.saveAddresses(addresses);

    void (async () => {
      try {
        const headers = getUserHeaders();
        if (!headers) return;

        const response = await fetch(`${API_BASE}/${id}`, {
          method: 'DELETE',
          headers,
        });

        if (!response.ok) {
          throw new Error('Failed to delete address from server');
        }

        await this.syncFromApi();
      } catch (error) {
        console.error('Address API delete failed:', error);
      }
    })();

    toast.success('Address deleted successfully');
    return true;
  },

  /**
   * Set an address as default
   */
  setDefaultAddress(id: string): Address | null {
    const addresses = this.getAddresses();
    const targetAddress = addresses.find(addr => addr.id === id);
    
    if (!targetAddress) {
      toast.error('Address not found');
      return null;
    }

    // Remove default from all addresses
    addresses.forEach(addr => addr.isDefault = false);
    
    // Set target as default
    targetAddress.isDefault = true;
    
    this.saveAddresses(addresses);

    void (async () => {
      try {
        const headers = getUserHeaders();
        if (!headers) return;

        const response = await fetch(`${API_BASE}/${id}/default`, {
          method: 'PATCH',
          headers,
        });

        if (!response.ok) {
          throw new Error('Failed to set default on server');
        }

        await this.syncFromApi();
      } catch (error) {
        console.error('Address API set default failed:', error);
      }
    })();

    toast.success('Default address updated');
    return targetAddress;
  },

  /**
   * Get default address
   */
  getDefaultAddress(): Address | null {
    const addresses = this.getAddresses();
    return addresses.find(addr => addr.isDefault) || (addresses.length > 0 ? addresses[0] : null);
  },

  /**
   * Get address by ID
   */
  getAddressById(id: string): Address | null {
    const addresses = this.getAddresses();
    return addresses.find(addr => addr.id === id) || null;
  },

  /**
   * Initialize addresses with mock data if empty
   */
  initializeWithMockData(userInfo?: { name?: string; phoneNumber?: string }): void {
    const addresses = this.getAddresses();
    
    if (addresses.length === 0) {
      const mockAddress: Address = {
        id: 'mock-default-1',
        name: userInfo?.name || 'Home',
        phoneNumber: userInfo?.phoneNumber || '9876543210',
        address: '123 Main Street, Apartment 4B',
        city: 'Chennai',
        state: 'Tamil Nadu',
        pincode: '600001',
        type: 'home',
        isDefault: true
      };

      this.saveAddresses([mockAddress]);
    }
  },

  /**
   * Subscribe to address changes
   */
  subscribe(callback: () => void): () => void {
    addressSyncEvent.addEventListener('addressChange', callback);
    
    // Return unsubscribe function
    return () => {
      addressSyncEvent.removeEventListener('addressChange', callback);
    };
  },

  /**
   * Validate address data
   */
  validateAddress(address: Partial<Address>): string[] {
    const errors: string[] = [];
    
    if (!address.name?.trim()) {
      errors.push('Address name is required');
    }
    
    if (address.phoneNumber?.trim() && !/^\+?[\d\s-()]{10,15}$/.test(address.phoneNumber.trim())) {
      errors.push('Invalid phone number format');
    }
    
    if (!address.address?.trim()) {
      errors.push('Street address is required');
    }
    
    if (!address.city?.trim()) {
      errors.push('City is required');
    }
    
    if (!address.state?.trim()) {
      errors.push('State is required');
    }
    
    if (!address.pincode?.trim()) {
      errors.push('Pincode is required');
    } else if (!/^\d{6}$/.test(address.pincode.trim())) {
      errors.push('Pincode must be 6 digits');
    }
    
    return errors;
  },

  /**
   * Format address for display
   */
  formatAddress(address: Address): string {
    return `${address.address}, ${address.city}, ${address.state} - ${address.pincode}`;
  },

  /**
   * Export addresses for backup
   */
  exportAddresses(): string {
    const addresses = this.getAddresses();
    return JSON.stringify(addresses, null, 2);
  },

  /**
   * Import addresses from backup
   */
  importAddresses(data: string): boolean {
    try {
      const addresses = JSON.parse(data);
      
      if (!Array.isArray(addresses)) {
        throw new Error('Invalid data format');
      }

      // Validate each address
      for (const addr of addresses) {
        const errors = this.validateAddress(addr);
        if (errors.length > 0) {
          throw new Error(`Invalid address data: ${errors.join(', ')}`);
        }
      }

      this.saveAddresses(addresses);
      toast.success('Addresses imported successfully');
      return true;
    } catch (error) {
      console.error('Error importing addresses:', error);
      toast.error('Failed to import addresses');
      return false;
    }
  }
};

/**
 * React hook for address management
 */
export function useAddressSync() {
  const [addresses, setAddresses] = React.useState<Address[]>([]);
  const [defaultAddress, setDefaultAddress] = React.useState<Address | null>(null);
  const [realtimeProfileId, setRealtimeProfileId] = React.useState<string | null>(
    clientStorage.user.get()?.id || null
  );

  // Load addresses on mount and subscribe to changes
  React.useEffect(() => {
    const loadAddresses = () => {
      const allAddresses = addressManager.getAddresses();
      setAddresses(allAddresses);
      setDefaultAddress(addressManager.getDefaultAddress());
      setRealtimeProfileId(clientStorage.user.get()?.id || null);
    };

    // Initial load
    loadAddresses();

    // Migrate guest addresses after login and pull latest server addresses.
    void addressManager.bootstrapAddresses();

    // Subscribe to changes
    const unsubscribe = addressManager.subscribe(loadAddresses);

    const onStorage = (event: StorageEvent) => {
      if (!event.key) return;
      if (event.key.startsWith('kadal:user') || event.key.startsWith('kadal:auth')) {
        loadAddresses();
        void addressManager.bootstrapAddresses();
      }
    };

    window.addEventListener('storage', onStorage);

    return () => {
      unsubscribe();
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  React.useEffect(() => {
    if (!realtimeProfileId) return;
    if (!isSupabaseRealtimeEnabled()) return;

    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    const channel = supabase
      .channel(`addresses:${realtimeProfileId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'addresses',
          filter: `profile_id=eq.${realtimeProfileId}`,
        },
        () => {
          void addressManager.syncFromApi();
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [realtimeProfileId]);

  return {
    addresses,
    defaultAddress,
    addAddress: addressManager.addAddress.bind(addressManager),
    updateAddress: addressManager.updateAddress.bind(addressManager),
    deleteAddress: addressManager.deleteAddress.bind(addressManager),
    setDefaultAddress: addressManager.setDefaultAddress.bind(addressManager),
    getAddressById: addressManager.getAddressById.bind(addressManager),
    validateAddress: addressManager.validateAddress.bind(addressManager),
    formatAddress: addressManager.formatAddress.bind(addressManager)
  };
}

/**
 * Legacy compatibility - expose Address type
 */
export type { Address as AddressType };

export default addressManager;
