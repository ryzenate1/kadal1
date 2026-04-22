'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { MapPin, X, Loader2, Home, Briefcase, MapPinned } from 'lucide-react';
import { toast } from 'sonner';
import dynamic from 'next/dynamic';

const GoogleMapAddress = dynamic(
  () => import('@/components/address/GoogleMapAddress').then((mod) => mod.GoogleMapAddress),
  { ssr: false, loading: () => <div className="h-64 flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div> }
);

type LocationModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (location: {
    coordinates: { lat: number; lng: number };
    address: {
      doorNumber: string;
      notes: string;
      type: 'Home' | 'Work' | 'Other';
    };
  }) => void;
  initialLocation?: {
    coordinates: { lat: number; lng: number };
    address?: {
      doorNumber: string;
      notes: string;
      type: 'Home' | 'Work' | 'Other';
    };
  };
};

export function LocationModal({ open, onOpenChange, onSave, initialLocation }: LocationModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number }>(
    initialLocation?.coordinates || { lat: 13.0827, lng: 80.2707 } // Default to Chennai
  );
  const [addressType, setAddressType] = useState<'Home' | 'Work' | 'Other'>(
    initialLocation?.address?.type || 'Home'
  );
  const [doorNumber, setDoorNumber] = useState(initialLocation?.address?.doorNumber || '');
  const [notes, setNotes] = useState(initialLocation?.address?.notes || '');

  // Reset form when dialog opens
  useEffect(() => {
    if (open && initialLocation) {
      setCoordinates(initialLocation.coordinates);
      setDoorNumber(initialLocation.address?.doorNumber || '');
      setNotes(initialLocation.address?.notes || '');
      setAddressType(initialLocation.address?.type || 'Home');
    } else if (open) {
      // Default values for new location
      setCoordinates({ lat: 13.0827, lng: 80.2707 });
    }
  }, [open, initialLocation]);

  const getCurrentLocation = () => {
    setIsLoading(true);
    if (!navigator.geolocation) {
      toast?.error?.("Location not supported by your browser");
      setIsLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setCoordinates({ lat, lng });
        setIsLoading(false);
        toast?.success?.("Location updated successfully");
      },
      (error) => {
        console.error("Error getting location:", error);
        toast?.error?.("Could not access your location");
        setIsLoading(false);
      }
    );
  };

  // Handle location selection from map
  const handleLocationSelect = (address: string, location: { lat: number; lng: number }) => {
    setCoordinates(location);
  };

  const handleSave = () => {
    if (!doorNumber.trim()) {
      toast?.error?.("Please enter your door number/flat number");
      return;
    }

    onSave({
      coordinates,
      address: {
        doorNumber: doorNumber.trim(),
        notes: notes.trim(),
        type: addressType
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogTitle className="sr-only">Set your location</DialogTitle>
        <div className="flex items-center justify-between border-b pb-3">
          <h3 className="text-lg font-semibold flex items-center">
            <MapPin className="h-5 w-5 mr-2 text-red-500" />
            Set Your Location
          </h3>
          <button
            onClick={() => onOpenChange(false)}
            className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4 py-2">
          {/* Map Section with Reduced Height */}
          <div className="w-full h-[250px] bg-gray-100 rounded-lg mb-4 relative overflow-hidden">
            <div className="mb-4">
              <GoogleMapAddress
                onSelect={handleLocationSelect}
                initialPosition={coordinates}
                apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''}
                className="rounded-lg overflow-hidden border"
              />
            </div>
          </div>

          {/* Current Location Button */}
          <Button 
            type="button" 
            variant="outline" 
            className="w-full flex items-center justify-center" 
            onClick={getCurrentLocation}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <MapPin className="h-4 w-4 mr-2" />
            )}
            Use Current Location
          </Button>

          {/* Address Form */}
          <div className="space-y-3 mt-4">
            <div>
              <label htmlFor="doorNumber" className="text-sm font-medium text-gray-700">
                Door Number / Flat Number <span className="text-red-500">*</span>
              </label>
              <Input
                id="doorNumber"
                value={doorNumber}
                onChange={(e) => setDoorNumber(e.target.value)}
                placeholder="e.g., 123, Flat 4B"
                className="mt-1"
              />
            </div>

            <div>
              <label htmlFor="notes" className="text-sm font-medium text-gray-700">
                Apartment Name & Additional Notes
              </label>
              <Input
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g., Green Valley Apartments, Near Hospital"
                className="mt-1"
              />
            </div>

            <div className="pt-2">
              <label className="text-sm font-medium text-gray-700 mb-2 block">Tag as</label>
              <div className="grid grid-cols-3 gap-2">
                {(['Home', 'Work', 'Other'] as const).map((type) => (
                  <Button
                    key={type}
                    type="button"
                    variant={addressType === type ? "default" : "outline"}
                    className={`w-full ${addressType === type ? 'bg-tendercuts-red hover:bg-tendercuts-red/90' : ''}`}
                    onClick={() => setAddressType(type)}
                  >
                    {type === 'Home' && <Home className="h-4 w-4 mr-1" />}
                    {type === 'Work' && <Briefcase className="h-4 w-4 mr-1" />}
                    {type === 'Other' && <MapPinned className="h-4 w-4 mr-1" />}
                    {type}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-between pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={!doorNumber.trim() || isLoading}
            className="bg-tendercuts-red hover:bg-tendercuts-red/90"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Location'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
