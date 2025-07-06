'use client';

import { useState, useEffect } from 'react';
import { useLocation } from '@/context/LocationContext';

interface DeliveryOption {
  id: string;
  name: string;
  fee: number;
  eta: string;
}

// This custom hook optimizes delivery option fetching
export default function useDeliveryOptions() {
  const { currentAddress } = useLocation();
  const [deliveryOptions, setDeliveryOptions] = useState<DeliveryOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Prefetch delivery options whenever location changes
  useEffect(() => {
    if (!currentAddress) return;
    
    const fetchDeliveryOptions = async () => {
      setIsLoading(true);
      try {
        // Try to get from cache first
        const cachedOptions = sessionStorage.getItem(`delivery-options-${currentAddress.id}`);
        if (cachedOptions) {
          setDeliveryOptions(JSON.parse(cachedOptions));
          setIsLoading(false);
          
          // Refresh in background
          refreshDeliveryOptions();
          return;
        }
        
        // Fetch from API if not in cache
        await refreshDeliveryOptions();
      } catch (error) {
        console.error('Error fetching delivery options:', error);
        setIsLoading(false);
      }
    };
    
    fetchDeliveryOptions();
  }, [currentAddress]);
  
  // Function to refresh delivery options from API
  const refreshDeliveryOptions = async () => {
    try {
      // Replace with actual API call
      const response = await fetch(`/api/delivery-options?lat=${currentAddress?.lat}&lng=${currentAddress?.lng}`, {
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setDeliveryOptions(data);
        
        // Cache for future use
        sessionStorage.setItem(`delivery-options-${currentAddress?.id}`, JSON.stringify(data));
      } else {
        // Fallback to default options
        const defaultOptions = [
          { id: 'standard', name: 'Standard Delivery', fee: 49, eta: '45-60 min' },
          { id: 'express', name: 'Express Delivery', fee: 99, eta: '25-30 min' }
        ];
        setDeliveryOptions(defaultOptions);
        sessionStorage.setItem(`delivery-options-${currentAddress?.id}`, JSON.stringify(defaultOptions));
      }
    } catch (error) {
      console.error('Error refreshing delivery options:', error);
      // Fallback to default options
      const defaultOptions = [
        { id: 'standard', name: 'Standard Delivery', fee: 49, eta: '45-60 min' },
        { id: 'express', name: 'Express Delivery', fee: 99, eta: '25-30 min' }
      ];
      setDeliveryOptions(defaultOptions);
    } finally {
      setIsLoading(false);
    }
  };
  
  return { deliveryOptions, isLoading, refreshDeliveryOptions };
}
