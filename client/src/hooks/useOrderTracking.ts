import { useState, useEffect, useCallback } from 'react';

interface OrderTrackingInfo {
  orderId: string;
  orderNumber: string;
  status: string;
  trackingNumber?: string;
  estimatedDelivery?: string;
  trackingHistory: Array<{
    status: string;
    description: string;
    timestamp: string;
  }>;
  updatedAt: string;
  isLoading: boolean;
  error: string | null;
}

const initialTrackingState: OrderTrackingInfo = {
  orderId: '',
  orderNumber: '',
  status: '',
  trackingNumber: undefined,
  estimatedDelivery: undefined,
  trackingHistory: [],
  updatedAt: '',
  isLoading: true,
  error: null
};

export function useOrderTracking(orderId: string, pollingInterval = 30000) {
  const [trackingInfo, setTrackingInfo] = useState<OrderTrackingInfo>(initialTrackingState);

  const fetchTrackingInfo = useCallback(async () => {
    if (!orderId) return;

    try {
      setTrackingInfo(current => ({ ...current, isLoading: true, error: null }));

      const response = await fetch(`/api/user/orders/${orderId}/track`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch tracking information');
      }

      const data = await response.json();
      
      setTrackingInfo({
        orderId: data.orderId,
        orderNumber: data.orderNumber,
        status: data.status,
        trackingNumber: data.trackingNumber,
        estimatedDelivery: data.estimatedDelivery,
        trackingHistory: data.trackingHistory || [],
        updatedAt: data.updatedAt,
        isLoading: false,
        error: null
      });
    } catch (error) {
      console.error('Error fetching order tracking:', error);
      setTrackingInfo(current => ({
        ...current,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch tracking information'
      }));
    }
  }, [orderId]);

  // Initial fetch
  useEffect(() => {
    if (orderId) {
      fetchTrackingInfo();
    } else {
      setTrackingInfo(initialTrackingState);
    }
  }, [orderId, fetchTrackingInfo]);

  // Set up polling for real-time updates
  useEffect(() => {
    if (!orderId || !pollingInterval) return;

    const intervalId = setInterval(fetchTrackingInfo, pollingInterval);
    
    return () => clearInterval(intervalId);
  }, [orderId, pollingInterval, fetchTrackingInfo]);

  const refreshTracking = useCallback(() => {
    fetchTrackingInfo();
  }, [fetchTrackingInfo]);

  return {
    ...trackingInfo,
    refreshTracking
  };
}
