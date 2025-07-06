'use client';

import { usePathname } from 'next/navigation';
import SmoothScrollProvider from './SmoothScrollProvider-new';
import { ReactNode } from 'react';

interface ConditionalSmoothScrollProviderProps {
  children: ReactNode;
}

export default function ConditionalSmoothScrollProvider({ children }: ConditionalSmoothScrollProviderProps) {
  const pathname = usePathname();
  
  // Disable SmoothScrollProvider entirely on map pages
  const isMapPage = pathname?.includes('/map-picker') || 
                    pathname?.includes('/debug-map') ||
                    pathname?.includes('/choose-location');

  if (isMapPage) {
    // Return children without SmoothScrollProvider wrapper
    return <>{children}</>;
  }

  // For non-map pages, use SmoothScrollProvider
  return <SmoothScrollProvider>{children}</SmoothScrollProvider>;
}
