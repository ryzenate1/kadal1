"use client";

import React, { useState, useCallback } from 'react';

interface ToastProps {
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
}

interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

// Simple toast implementation using browser notifications or console logging
export const useToast = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { ...toast, id }]);

    if (toast.duration !== 0) {
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, toast.duration || 3000);
    }
  }, []);

  const toast = ({ title, description, variant = "default" }: ToastProps) => {
    const message = title || description || 'Notification';
    
    // For now, we'll use console logging and alert for simplicity
    // In a production app, you might want to implement a proper toast system
    if (variant === "destructive") {
      console.error('Error:', message);
      // You could also show a styled error message in the UI
    } else {
      console.log('Success:', message);
      // You could also show a styled success message in the UI
    }
    
    // Simple browser notification for demonstration
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title || 'Notification', {
        body: description,
        icon: '/favicon.ico'
      });
    }
  };

  return { toasts, addToast, toast };
};
