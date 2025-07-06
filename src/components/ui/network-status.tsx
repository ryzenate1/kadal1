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
  if (isOnline && (isServerConnected || isDevelopment)) {
    return null;
  }
  
  const handleRetry = async () => {
    setIsChecking(true);
    const serverConnected = await checkServerHealth();
    setIsServerConnected(serverConnected);
    setIsChecking(false);
  };
  
  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 50, opacity: 0 }}
        className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 bg-white dark:bg-gray-800 shadow-lg rounded-lg px-4 py-3 flex items-center space-x-3 border border-red-200 dark:border-red-800"
      >
        {!isOnline ? (
          <WifiOff className="h-5 w-5 text-red-500" />
        ) : !isServerConnected ? (
          <Wifi className="h-5 w-5 text-amber-500" />
        ) : (
          <Wifi className="h-5 w-5 text-green-500" />
        )}
        
        <div>
          {!isOnline ? (
            <p className="text-sm font-medium">You are offline. Please check your internet connection.</p>
          ) : !isServerConnected ? (
            <p className="text-sm font-medium">Cannot connect to server. Some features may not work.</p>
          ) : null}
        </div>
        
        <Button 
          size="sm" 
          variant="outline" 
          onClick={handleRetry} 
          disabled={isChecking}
          className="ml-2"
        >
          {isChecking ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          <span className="ml-1">Retry</span>
        </Button>
      </motion.div>
    </AnimatePresence>
  );
}
