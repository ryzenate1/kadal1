'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Save, MapPin, Home, Building, User, Phone, Tag, CheckCircle } from 'lucide-react';

import { Suspense } from 'react';

function AddDetailsPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get coordinates and address from URL
  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');
  const address = searchParams.get('address');

  const [addressLabel, setAddressLabel] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [addressType, setAddressType] = useState('home');
  const [landmark, setLandmark] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Handle back navigation
  const handleBack = () => {
    router.back();
  };

  // Handle save with validation
  const handleSave = async () => {
    if (!addressLabel.trim() || !name.trim() || !phone.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      alert('Address saved successfully!');
      router.push('/choose-location');
    }, 1500);
  };

  const addressTypes = [
    { id: 'home', label: 'Home', icon: Home, color: 'bg-blue-100 text-blue-600 border-blue-200' },
    { id: 'office', label: 'Office', icon: Building, color: 'bg-green-100 text-green-600 border-green-200' },
    { id: 'other', label: 'Other', icon: MapPin, color: 'bg-purple-100 text-purple-600 border-purple-200' }
  ];

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-orange-50 via-white to-blue-50 z-50 flex flex-col">
      {/* Header - Floating style */}
      <div className="absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-white/95 to-transparent backdrop-blur-sm">
        <div className="flex items-center gap-4 p-4 pt-8">
          <button
            onClick={handleBack}
            className="p-3 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-all duration-200 border border-gray-100"
          >
            <ArrowLeft size={24} className="text-gray-700" />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-gray-900">Complete Address</h1>
            <p className="text-sm text-gray-600">Add details for precise delivery</p>
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto pt-24 pb-32">
        <div className="max-w-md mx-auto px-4">
          {/* Selected Location Card */}
          <div className="mb-6 bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-gray-100">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-orange-100 rounded-full">
                <MapPin className="text-orange-600" size={24} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 mb-2">Selected Location</h3>
                <p className="text-sm text-gray-700 leading-relaxed mb-3">{address}</p>
                <div className="flex gap-4 text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
                  <span>📍 {lat}</span>
                  <span>🌐 {lng}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Address Type Selection */}
          <div className="mb-6 bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Tag className="text-orange-500" size={20} />
              Address Type
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {addressTypes.map((type) => {
                const IconComponent = type.icon;
                const isSelected = addressType === type.id;
                return (
                  <button
                    key={type.id}
                    onClick={() => setAddressType(type.id)}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                      isSelected 
                        ? `${type.color} border-current scale-105` 
                        : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    <IconComponent size={24} className="mx-auto mb-2" />
                    <p className="text-xs font-medium">{type.label}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            {/* Address Label */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-gray-100">
              <label className="text-sm font-semibold text-gray-900 mb-3 block flex items-center gap-2">
                <Tag className="text-orange-500" size={16} />
                Address Label *
              </label>
              <input
                type="text"
                value={addressLabel}
                onChange={(e) => setAddressLabel(e.target.value)}
                placeholder="e.g., Home, Office, Mom's Place"
                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none transition-colors bg-gray-50 focus:bg-white"
              />
            </div>

            {/* Full Name */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-gray-100">
              <label className="text-sm font-semibold text-gray-900 mb-3 block flex items-center gap-2">
                <User className="text-orange-500" size={16} />
                Full Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none transition-colors bg-gray-50 focus:bg-white"
              />
            </div>

            {/* Phone Number */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-gray-100">
              <label className="text-sm font-semibold text-gray-900 mb-3 block flex items-center gap-2">
                <Phone className="text-orange-500" size={16} />
                Phone Number *
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter your phone number"
                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none transition-colors bg-gray-50 focus:bg-white"
              />
            </div>

            {/* Landmark (Optional) */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-gray-100">
              <label className="text-sm font-semibold text-gray-900 mb-3 block flex items-center gap-2">
                <MapPin className="text-orange-500" size={16} />
                Landmark (Optional)
              </label>
              <input
                type="text"
                value={landmark}
                onChange={(e) => setLandmark(e.target.value)}
                placeholder="e.g., Near Central Mall, Opposite Bus Stop"
                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none transition-colors bg-gray-50 focus:bg-white"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Bottom Action */}
      <div className="absolute bottom-0 left-0 right-0 z-20">
        <div className="bg-gradient-to-t from-white/95 to-transparent backdrop-blur-sm pb-4">
          <div className="px-4 pt-4">
            <button
              onClick={handleSave}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-4 px-6 rounded-2xl font-semibold text-lg shadow-xl hover:from-orange-600 hover:to-orange-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 transform hover:scale-[0.98]"
            >
              {isLoading ? (
                <>
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Saving Address...
                </>
              ) : (
                <>
                  <CheckCircle size={24} />
                  Save & Continue
                </>
              )}
            </button>
            
            <p className="text-xs text-gray-600 text-center mt-3 px-4">
              Your address will be saved for future orders
            </p>
          </div>
        </div>
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-30">
          <div className="bg-white rounded-2xl shadow-2xl p-8 text-center max-w-sm mx-4 border border-gray-100">
            <div className="w-16 h-16 mx-auto mb-4 relative">
              <div className="absolute inset-0 border-4 border-orange-200 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-orange-500 rounded-full border-t-transparent animate-spin"></div>
              <Save className="absolute inset-0 m-auto text-orange-500" size={24} />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Saving Your Address</h3>
            <p className="text-sm text-gray-600">
              Setting up your delivery location...
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AddDetailsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AddDetailsPageInner />
    </Suspense>
  );
}
