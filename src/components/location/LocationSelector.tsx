'use client';

import { useState } from 'react';
import { MapPin, ChevronDown, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLocation } from '@/context/LocationContext';
import { cn } from '@/lib/utils';
import dynamic from 'next/dynamic';
import { LocationSheet } from '@/components/location/LocationSheet';

// Dynamically import the EnhancedLocationPicker with no SSR
const EnhancedLocationPicker = dynamic(
  () => import('@/components/location/EnhancedLocationPicker'),
  { ssr: false }
);

interface LocationSelectorProps {
  className?: string;
  variant?: 'desktop' | 'mobile';
}

export function LocationSelector({ 
  className, 
  variant = 'desktop' 
}: LocationSelectorProps) {
  const { currentAddress, isLoading } = useLocation();
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  // Format the address for display
  const formatAddress = () => {
    if (isLoading) return 'Loading...';
    if (!currentAddress) return 'Select delivery location';
    
    const parts = [];
    if (currentAddress.door_no) parts.push(currentAddress.door_no);
    if (currentAddress.building) parts.push(currentAddress.building);
    if (currentAddress.landmark) parts.push(currentAddress.landmark);
    
    return parts.length > 0 
      ? parts.join(', ')
      : currentAddress.address_string || 'Select delivery location';
  };

  return (
    <>
      <Button
        variant="ghost"
        onClick={() => setIsPickerOpen(true)}
        className={cn(
          "flex items-center gap-1 px-2 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md transition-colors",
          variant === 'mobile' && "w-full justify-start px-3 py-2 text-base",
          className
        )}
      >
        <MapPin className={cn(
          "h-4 w-4 text-red-600",
          variant === 'mobile' && "h-5 w-5"
        )} />
        <span className={cn(
          "max-w-[180px] truncate",
          variant === 'mobile' && "max-w-none flex-1 text-left"
        )}>
          {isLoading ? (
            <span className="flex items-center gap-1.5">
              <Loader2 className="h-3 w-3 animate-spin" />
              <span>Loading...</span>
            </span>
          ) : (
            formatAddress()
          )}
        </span>
        <ChevronDown className={cn(
          "h-4 w-4 text-gray-500",
          variant === 'mobile' && "h-5 w-5"
        )} />
      </Button>

      <LocationSheet
        open={isPickerOpen}
        onOpenChange={setIsPickerOpen}
        title="Choose delivery location"
        className={cn(variant === 'mobile' ? "sm:w-[680px]" : undefined)}
      >
        <EnhancedLocationPicker
          isOpen={isPickerOpen}
          onClose={() => setIsPickerOpen(false)}
          isMobile={variant === 'mobile'}
        />
      </LocationSheet>
    </>
  );
}

export default LocationSelector;
