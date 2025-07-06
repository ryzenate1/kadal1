"use client";

import { useState, useEffect } from "react";
import { Wifi, WifiOff, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "./button";
import { checkServerHealth } from "@/lib/apiUtils";

export function NetworkStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [isServerConnected, setIsServerConnected] = useState(true);
  const [isChecking, setIsChecking] = useState(false);
  const [isDevelopment, setIsDevelopment] = useState(false);
  
  // Check if we're in development mode
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      setIsDevelopment(true);
      setIsServerConnected(true); // Always assume connected in development
    }
  }, []);
  
  // Check network status on mount and when online/offline events occur
  useEffect(() => {
    const checkConnection = async () => {
      // First check if browser is online
      const browserOnline = navigator.onLine;
      setIsOnline(browserOnline);
      
      // In development mode, always assume server is connected
      if (process.env.NODE_ENV === 'development') {
        setIsServerConnected(true);
        return;
      }
      
      if (browserOnline) {
        setIsChecking(true);
        // Then check if server is reachable
        const serverConnected = await checkServerHealth();
        setIsServerConnected(serverConnected);
        setIsChecking(false);
      } else {
        setIsServerConnected(false);
      }
    };
    
    // Initial check
    checkConnection();
    
    // Set up event listeners for online/offline events
    const handleOnline = () => {
      setIsOnline(true);
      checkConnection();
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      setIsServerConnected(false);
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Set up interval to periodically check server connection
    const intervalId = setInterval(checkConnection, 30000); // Check every 30 seconds
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(intervalId);
    };
  }, []);
  
  // Only show when there's a connection issue and we're not in development mode
  // REMOVE all UI/toast for server connection issues (as requested)
  return null;
}
