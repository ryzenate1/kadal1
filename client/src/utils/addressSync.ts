/**
 * Address synchronization utility for seamless sync between checkout and account sections
 * Ensures two-way sync using localStorage as the source of truth
 */

import React from 'react';
import { toast } from 'sonner';

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
      const stored = localStorage.getItem(STORAGE_KEY);
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
  saveAddresses(addresses: Address[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(addresses));
      addressSyncEvent.notifyChange();
    } catch (error) {
      console.error('Error saving addresses:', error);
      toast.error('Failed to save addresses');
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
    
    if (!address.phoneNumber?.trim()) {
      errors.push('Phone number is required');
    } else if (!/^\+?[\d\s-()]{10,15}$/.test(address.phoneNumber.trim())) {
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

  // Load addresses on mount and subscribe to changes
  React.useEffect(() => {
    const loadAddresses = () => {
      const allAddresses = addressManager.getAddresses();
      setAddresses(allAddresses);
      setDefaultAddress(addressManager.getDefaultAddress());
    };

    // Initial load
    loadAddresses();

    // Subscribe to changes
    const unsubscribe = addressManager.subscribe(loadAddresses);

    return unsubscribe;
  }, []);

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
