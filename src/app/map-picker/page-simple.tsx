'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, MapPin, Check } from 'lucide-react';

export default function MapPickerPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Get URL parameters
  const mode = searchParams.get('mode');
  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');
  const placeId = searchParams.get('placeId');

  const [currentAddress, setCurrentAddress] = useState('Loading address...');

  // Handle back navigation
  const handleBack = () => {
    router.back();
  };

  // Handle confirm and proceed (temporary)
  const handleConfirmAndProceed = () => {
    const params = new URLSearchParams({
      lat: lat || '13.0827',
      lng: lng || '80.2707',
      address: currentAddress
    });
    
    router.push(`/add-details?${params.toString()}`);
  };

  useEffect(() => {
    // Simulate loading address
    setTimeout(() => {
      setCurrentAddress('Test Address - 123 Main Street, Chennai, Tamil Nadu');
    }, 1000);
  }, []);

  return (
    <div className="h-screen flex flex-col bg-white">
      {/* Header */}
      <div className="flex items-center gap-4 p-4 border-b border-gray-200 bg-white z-10">
        <button
          onClick={handleBack}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-semibold">Select Location</h1>
          <p className="text-sm text-gray-600">
            {mode === 'current' ? 'Confirm your current location' : 'Choose delivery location'}
          </p>
        </div>
      </div>

      {/* Map Placeholder */}
      <div className="flex-1 relative bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <MapPin size={48} className="text-orange-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Map Picker Page</h2>
          <p className="text-gray-600 mb-4">Google Maps will load here</p>
          <div className="bg-white p-4 rounded-lg shadow-md max-w-md">
            <p className="text-sm"><strong>Mode:</strong> {mode}</p>
            <p className="text-sm"><strong>Lat:</strong> {lat}</p>
            <p className="text-sm"><strong>Lng:</strong> {lng}</p>
            <p className="text-sm"><strong>Place ID:</strong> {placeId}</p>
          </div>
        </div>
      </div>

      {/* Bottom address panel */}
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="mb-4">
          <div className="flex items-start gap-3">
            <MapPin className="text-orange-500 mt-1 flex-shrink-0" size={20} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 mb-1">Delivery Location</p>
              <p className="text-sm text-gray-600 leading-relaxed">{currentAddress}</p>
            </div>
          </div>
        </div>

        {/* Confirm button */}
        <button
          onClick={handleConfirmAndProceed}
          className="w-full bg-orange-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-orange-600 transition-colors flex items-center justify-center gap-2"
        >
          <Check size={20} />
          Confirm & Proceed
        </button>
      </div>
    </div>
  );
}
