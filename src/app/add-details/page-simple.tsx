'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Save, MapPin } from 'lucide-react';

export default function AddDetailsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get coordinates and address from URL
  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');
  const address = searchParams.get('address');

  const [addressLabel, setAddressLabel] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  // Handle back navigation
  const handleBack = () => {
    router.back();
  };

  // Handle save (temporary)
  const handleSave = () => {
    alert('Address saved successfully!');
    router.push('/choose-location');
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="flex items-center gap-4 p-4 border-b border-gray-200 bg-white sticky top-0 z-10">
        <button
          onClick={handleBack}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-semibold">Add Address Details</h1>
          <p className="text-sm text-gray-600">Complete your address information</p>
        </div>
      </div>

      <div className="p-4 max-w-md mx-auto">
        {/* Selected location display */}
        <div className="mb-6 p-4 bg-orange-50 border border-orange-100 rounded-lg">
          <div className="flex items-start gap-3">
            <MapPin className="text-orange-500 mt-1 flex-shrink-0" size={20} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 mb-1">Selected Location</p>
              <p className="text-sm text-gray-600 leading-relaxed">{address}</p>
              <div className="text-xs text-gray-500 mt-2">
                <p>Lat: {lat}</p>
                <p>Lng: {lng}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Simple form */}
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Address Label *
            </label>
            <input
              type="text"
              value={addressLabel}
              onChange={(e) => setAddressLabel(e.target.value)}
              placeholder="e.g., Home, Office"
              className="w-full p-3 border border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Full Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your full name"
              className="w-full p-3 border border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Phone Number *
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Enter your phone number"
              className="w-full p-3 border border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none"
            />
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSave}
            className="w-full bg-orange-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-orange-600 transition-colors flex items-center justify-center gap-2 mt-6"
          >
            <Save size={20} />
            Save Address
          </button>
        </div>

        {/* Test info */}
        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-medium mb-2">Page Test Info:</h3>
          <p className="text-sm text-gray-600">✅ Add Details page is working!</p>
          <p className="text-sm text-gray-600">✅ URL parameters received correctly</p>
          <p className="text-sm text-gray-600">✅ Navigation working</p>
        </div>
      </div>
    </div>
  );
}
