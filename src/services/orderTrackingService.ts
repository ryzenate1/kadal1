'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { useAuth } from '@/context/AuthContext';
import { getSupabaseBrowserClient } from '@/lib/supabaseClient';

// Interface for order tracking data
export interface OrderTrackingData {
  order: {
    id: string;
    status: string;
    user?: {
      id: string;
      name: string;
      phoneNumber: string;
      email?: string;
    };
    address?: {
      id: string;
      address: string;
      city?: string;
      state?: string;
      pincode?: string;
    };
    orderItems?: Array<{
      id: string;
      quantity: number;
      price: number;
      product?: {
        id: string;
        name: string;
        imageUrl?: string;
      };
    }>;
    createdAt: string;
    estimatedDelivery?: string;
    totalAmount: number;
    paymentMethod: string;
    paymentStatus: 'pending' | 'processing' | 'completed' | 'failed';
  };
  tracking: {
    eta: number;
    progressPercentage: number;
    currentStatus: string;
    locationUpdates: Array<{
      status: string;
      description: string;
      timestamp: string;
      metadata?: any;
    }>;
  };
}

// Custom hook for tracking an order in real-time
export function useOrderTracking(orderId: string | null) {
  const { isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [trackingData, setTrackingData] = useState<OrderTrackingData | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLive, setIsLive] = useState(false);
  const pollRef = useRef<NodeJS.Timeout | null>(null);
  const realtimeChannelRef = useRef<RealtimeChannel | null>(null);
  
  // Function to fetch tracking data via REST API
  const fetchTrackingData = useCallback(async () => {
    if (!orderId || !isAuthenticated) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch(`/api/orders/${orderId}/tracking`, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch tracking data: ${response.status}`);
      }
      
      const data = await response.json();
      setTrackingData(data);
      setIsConnected(true);
      setIsLive(true);
    } catch (err) {
      console.error('Error fetching order tracking:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch tracking data');
      setIsConnected(false);
      setIsLive(false);
    } finally {
      setIsLoading(false);
    }
  }, [orderId, isAuthenticated]);
  
  // Initialize tracking on component mount
  useEffect(() => {
    if (orderId && isAuthenticated) {
      fetchTrackingData();
    }
    
    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
      }

      if (realtimeChannelRef.current) {
        realtimeChannelRef.current.unsubscribe();
        realtimeChannelRef.current = null;
      }
    };
  }, [orderId, isAuthenticated, fetchTrackingData]);

  useEffect(() => {
    if (!orderId || !isAuthenticated) {
      return;
    }

    const supabase = getSupabaseBrowserClient();
    const resolvedOrderId = trackingData?.order?.id;

    if (realtimeChannelRef.current) {
      realtimeChannelRef.current.unsubscribe();
      realtimeChannelRef.current = null;
    }

    if (!supabase || !resolvedOrderId) {
      setIsConnected(false);
      setIsLive(false);
      if (pollRef.current) {
        clearInterval(pollRef.current);
      }
      pollRef.current = setInterval(() => {
        fetchTrackingData();
      }, 15000);
      return () => {
        if (pollRef.current) {
          clearInterval(pollRef.current);
        }
      };
    }

    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }

    const channel = supabase
      .channel(`order-tracking-${resolvedOrderId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${resolvedOrderId}`,
        },
        () => {
          fetchTrackingData();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'order_events',
          filter: `order_id=eq.${resolvedOrderId}`,
        },
        () => {
          fetchTrackingData();
        }
      )
      .subscribe((status) => {
        const connected = status === 'SUBSCRIBED';
        setIsConnected(connected);
        setIsLive(connected);
      });

    realtimeChannelRef.current = channel;

    return () => {
      channel.unsubscribe();
      if (realtimeChannelRef.current === channel) {
        realtimeChannelRef.current = null;
      }
    };
  }, [orderId, isAuthenticated, trackingData?.order?.id, fetchTrackingData]);
  
  // Function to refresh tracking data on demand
  const refreshTracking = useCallback(() => {
    fetchTrackingData();
  }, [fetchTrackingData]);
  
  return {
    trackingData,
    isLoading,
    error,
    isConnected,
    isLive,
    refreshTracking
  };
}

// Utility function to calculate delivery ETA from trackingData
export function getDeliveryETA(trackingData: OrderTrackingData | null): number {
  if (!trackingData) return 0;
  return trackingData.tracking.eta;
}

// Utility function to get current status from trackingData
export function getCurrentStatus(trackingData: OrderTrackingData | null): string {
  if (!trackingData) return 'pending';
  return trackingData.tracking.currentStatus;
}

// Utility function to get progress percentage from trackingData
export function getProgressPercentage(trackingData: OrderTrackingData | null): number {
  if (!trackingData) return 0;
  return trackingData.tracking.progressPercentage;
}
