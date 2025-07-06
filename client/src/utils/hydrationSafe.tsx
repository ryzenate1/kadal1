'use client';

import React, { useEffect, useState } from 'react';

/**
 * A hook that returns true after hydration is complete.
 * Use this to conditionally render components that may cause hydration mismatches.
 */
export function useHydrationSafe() {
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  return isMounted;
}

/**
 * HOC that makes a component hydration-safe by adding suppressHydrationWarning
 * and only rendering the actual component after hydration
 */
export function withHydrationSafe<P extends object>(Component: React.ComponentType<P>) {
  const WithHydrationSafe = (props: P) => {
    const isMounted = useHydrationSafe();
    
    if (!isMounted) {
      // Return a placeholder that won't cause hydration errors
      // Using the same tag as the wrapped component helps maintain layout
      const Comp = Component as any;
      const displayName = Component.displayName || Component.name || 'Component';
      
      // For common HTML elements, try to return the same element type to maintain layout
      if (displayName.toLowerCase() === 'button') {
        return <button suppressHydrationWarning style={{ visibility: 'hidden' }} />;
      }
      if (displayName.toLowerCase() === 'input') {
        return <input suppressHydrationWarning style={{ visibility: 'hidden' }} />;
      }
      
      // For other components, return a div
      return <div suppressHydrationWarning style={{ visibility: 'hidden' }} />;
    }
    
    return <Component {...props} />;
  };
  
  WithHydrationSafe.displayName = `WithHydrationSafe(${Component.displayName || Component.name || 'Component'})`;
  
  return WithHydrationSafe;
}

/**
 * A component that renders its children only after hydration is complete
 */
export function HydrationSafeWrapper({ children }: { children: React.ReactNode }) {
  const isMounted = useHydrationSafe();
  
  if (!isMounted) {
    return <div suppressHydrationWarning />;
  }
  
  return <>{children}</>;
}

/**
 * A hook that returns props to prevent hydration mismatches
 */
export function useHydrationSuppression() {
  const isMounted = useHydrationSafe();
  
  return {
    suppressHydrationWarning: !isMounted,
  };
}

/**
 * Input component that suppresses hydration warnings
 */
export function SafeInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <input suppressHydrationWarning {...props} />;
  }

  return <input {...props} />;
}

/**
 * Select component that suppresses hydration warnings
 */
export function SafeSelect(props: React.SelectHTMLAttributes<HTMLSelectElement> & { children: React.ReactNode }) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <select suppressHydrationWarning {...props}>{props.children}</select>;
  }

  return <select {...props}>{props.children}</select>;
}

/**
 * Textarea component that suppresses hydration warnings
 */
export function SafeTextarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <textarea suppressHydrationWarning {...props} />;
  }

  return <textarea {...props} />;
}
