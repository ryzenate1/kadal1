'use client';

import { LocationFlow } from './LocationFlow';
import { useLocation } from '@/context/LocationContext';

interface EnhancedLocationPickerProps {
  isOpen: boolean;
  onClose: () => void;
  isMobile?: boolean;
}

// For mobile, we use a full-screen page instead of a dialog
// So we only need to handle the desktop case here
export function EnhancedLocationPicker({ isOpen, onClose, isMobile = false }: EnhancedLocationPickerProps) {
  const { setLocation } = useLocation();
  if (!isOpen) {
    return null;
  }
  
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
    <div className={isMobile ? 'h-[100dvh]' : 'h-[80vh]'}>
      <LocationFlow onClose={onClose} onLocationSelect={handleLocationSelect} />
    </div>
  );
}

// Add a default export for dynamic imports
export default EnhancedLocationPicker;
