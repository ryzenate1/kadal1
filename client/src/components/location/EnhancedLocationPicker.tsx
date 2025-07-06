'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { LocationFlow } from './LocationFlow';
import { useLocation } from '@/context/LocationContext';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EnhancedLocationPickerProps {
  isOpen: boolean;
  onClose: () => void;
  isMobile?: boolean;
}

// For mobile, we use a full-screen page instead of a dialog
// So we only need to handle the desktop case here
export function EnhancedLocationPicker({ isOpen, onClose, isMobile = false }: EnhancedLocationPickerProps) {
  const { setLocation } = useLocation();
  const [apiKey, setApiKey] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  
  // Load Google Maps API key from environment
  useEffect(() => {
    if (isOpen) {
      const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';
      setApiKey(key);
      setIsLoading(false);
    }
  }, [isOpen]);
  
  // If it's mobile, we don't need to render anything here
  // as the mobile version is handled by the page component
  if (isMobile) {
    return null;
  }

  const handleLocationSelect = (location: any) => {
    setLocation(location);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col p-0 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : apiKey ? (
          <LocationFlow 
            onClose={onClose} 
            onLocationSelect={handleLocationSelect}
            apiKey={apiKey}
          />
        ) : (
          <div className="p-6 text-center">
            <h3 className="text-lg font-medium mb-2">Google Maps API Key Required</h3>
            <p className="text-sm text-gray-500 mb-4">
              Please set the NEXT_PUBLIC_GOOGLE_MAPS_API_KEY environment variable to enable map functionality.
            </p>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// Add a default export for dynamic imports
export default EnhancedLocationPicker;
