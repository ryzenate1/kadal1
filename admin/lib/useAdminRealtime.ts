'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

// Define types for admin real-time data
export interface AdminRealtimeData {
  type: 'order_update' | 'admin_stats' | 'notification' | 'connected' | 'error';
  data?: any;
  message?: string;
}

export interface AdminOrderStats {
  total: number;
  pending: number;
  processing: number;
  ready_for_pickup: number;
  out_for_delivery: number;
  delivered: number;
  cancelled: number;
  totalRevenue: number;
  averageOrderValue: number;
  recentOrders: any[];
}

/**
 * Custom hook for admin real-time updates via WebSocket
 */
export function useAdminRealtime() {
  const { toast } = useToast();
  const [isConnected, setIsConnected] = useState(false);
  const [orderStats, setOrderStats] = useState<AdminOrderStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [latestOrderUpdate, setLatestOrderUpdate] = useState<any>(null);
  
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Function to connect to WebSocket
  const connectWebSocket = useCallback(async () => {
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
      
      // Get admin token from localStorage
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.error('No admin token found');
        return;
      }
      
      const wsUrl = `${process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:5001'}/ws?token=${token}&admin=true`;
      
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;
      
      ws.onopen = () => {
        setIsConnected(true);
        console.log('Admin WebSocket connected');
      };
      
      ws.onmessage = (event) => {
        try {
          const data: AdminRealtimeData = JSON.parse(event.data);
          
          switch (data.type) {
            case 'admin_stats':
              setOrderStats(data.data);
              break;
            case 'order_update':
              setLatestOrderUpdate(data.data);
              // Add to recent orders if not already there
              setRecentOrders(prev => {
                const exists = prev.some(order => order.id === data.data.order.id);
                if (!exists) {
                  return [data.data.order, ...prev].slice(0, 10); // Keep only 10 most recent
                }
                return prev.map(order => 
                  order.id === data.data.order.id ? data.data.order : order
                );
              });
              break;
            case 'notification':
              setNotifications(prev => [data.data, ...prev].slice(0, 20)); // Keep only 20 most recent
              toast({
                title: data.data.title || 'New Notification',
                description: data.data.message,
                variant: data.data.type === 'error' ? 'destructive' : 'default',
              });
              break;
            case 'error':
              console.error('WebSocket error:', data.message);
              toast({
                title: 'Connection Error',
                description: data.message,
                variant: 'destructive',
              });
              break;
          }
        } catch (err) {
          console.error('Error parsing WebSocket message:', err, event.data);
        }
      };
      
      ws.onerror = (event) => {
        console.error('WebSocket error:', event);
        setIsConnected(false);
      };
      
      ws.onclose = () => {
        setIsConnected(false);
        
        // Try to reconnect after a delay
        reconnectTimeoutRef.current = setTimeout(() => {
          console.log('Attempting to reconnect Admin WebSocket...');
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
      console.error('Error connecting to Admin WebSocket:', err);
      setIsConnected(false);
    }
  }, [toast]);
  
  // Initialize WebSocket connection on component mount
  useEffect(() => {
    connectWebSocket();
    
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
  }, [connectWebSocket]);
  
  // Function to send a message to the WebSocket server
  const sendMessage = useCallback((message: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
      return true;
    }
    return false;
  }, []);
  
  return {
    isConnected,
    orderStats,
    recentOrders,
    notifications,
    latestOrderUpdate,
    sendMessage
  };
}
