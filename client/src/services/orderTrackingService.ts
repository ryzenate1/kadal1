'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

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
  const { user, isAuthenticated, getToken } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [trackingData, setTrackingData] = useState<OrderTrackingData | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLive, setIsLive] = useState(false);
  
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Function to fetch tracking data via REST API
  const fetchTrackingData = useCallback(async () => {
    if (!orderId || !isAuthenticated) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const token = await getToken();
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/${orderId}/tracking`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch tracking data: ${response.status}`);
      }
      
      const data = await response.json();
      setTrackingData(data);
    } catch (err) {
      console.error('Error fetching order tracking:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch tracking data');
      toast.error('Failed to load tracking information');
    } finally {
      setIsLoading(false);
    }
  }, [orderId, isAuthenticated, getToken]);
  
  // Function to connect to WebSocket
  const connectWebSocket = useCallback(async () => {
    if (!orderId || !isAuthenticated) return;
    
    try {
      // Close existing connection if any
      if (wsRef.current) {
        wsRef.current.close();
      }
      
      // Clear any pending reconnect timeout
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      
      const token = await getToken();
      const wsUrl = `${process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:5001'}/ws?token=${token}&orderId=${orderId}`;
      
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;
      
      ws.onopen = () => {
        setIsConnected(true);
        setIsLive(true);
        console.log('WebSocket connected for order tracking');
      };
      
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === 'order_update') {
            setTrackingData(data.data);
            setIsLoading(false);
          } else if (data.type === 'error') {
            console.error('WebSocket error:', data.message);
            setError(data.message);
            toast.error(data.message);
          } else if (data.type === 'connected') {
            console.log('WebSocket connected:', data);
          }
        } catch (err) {
          console.error('Error parsing WebSocket message:', err, event.data);
        }
      };
      
      ws.onerror = (event) => {
        console.error('WebSocket error:', event);
        setIsConnected(false);
        setError('WebSocket connection error');
      };
      
      ws.onclose = () => {
        setIsConnected(false);
        setIsLive(false);
        
        // Try to reconnect after a delay
        reconnectTimeoutRef.current = setTimeout(() => {
          console.log('Attempting to reconnect WebSocket...');
          connectWebSocket();
        }, 5000);
      };
      
      // Set up ping interval to keep connection alive
      const pingInterval = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: 'ping' }));
        }
      }, 30000);
      
      // Clean up ping interval when component unmounts
      return () => {
        clearInterval(pingInterval);
      };
    } catch (err) {
      console.error('Error connecting to WebSocket:', err);
      setError(err instanceof Error ? err.message : 'WebSocket connection failed');
      setIsConnected(false);
    }
  }, [orderId, isAuthenticated, getToken]);
  
  // Initialize tracking on component mount
  useEffect(() => {
    if (orderId && isAuthenticated) {
      // First get data via REST API
      fetchTrackingData();
      
      // Then connect to WebSocket for real-time updates
      connectWebSocket();
    }
    
    return () => {
      // Clean up WebSocket connection on unmount
      if (wsRef.current) {
        wsRef.current.close();
      }
      
      // Clear any pending reconnect timeout
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [orderId, isAuthenticated, fetchTrackingData, connectWebSocket]);
  
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
