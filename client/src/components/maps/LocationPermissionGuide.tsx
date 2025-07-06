'use client';

import { MapPin, Smartphone, Settings, CheckCircle } from 'lucide-react';

interface LocationPermissionGuideProps {
  onClose?: () => void;
  onRetry?: () => void;
}

export default function LocationPermissionGuide({ onClose, onRetry }: LocationPermissionGuideProps) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <MapPin className="h-8 w-8 text-orange-500" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Enable Location Access
          </h3>
          <p className="text-gray-600">
            We need location permission to find restaurants near you
          </p>
        </div>

        <div className="space-y-4 mb-6">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
              <span className="text-blue-600 font-semibold text-sm">1</span>
            </div>
            <div>
              <p className="font-medium text-gray-900">Allow Location</p>
              <p className="text-sm text-gray-600">Click "Allow" when your browser asks for location permission</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
              <span className="text-blue-600 font-semibold text-sm">2</span>
            </div>
            <div>
              <p className="font-medium text-gray-900">Check Browser Settings</p>
              <p className="text-sm text-gray-600">If blocked, click the location icon in your address bar</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
              <span className="text-blue-600 font-semibold text-sm">3</span>
            </div>
            <div>
              <p className="font-medium text-gray-900">Reload if Needed</p>
              <p className="text-sm text-gray-600">Refresh the page after changing permissions</p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {onRetry && (
            <button
              onClick={onRetry}
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 px-4 rounded-xl font-semibold hover:from-orange-600 hover:to-orange-700 transition-all duration-200 flex items-center justify-center gap-2"
            >
              <MapPin size={18} />
              Try Again
            </button>
          )}

          {onClose && (
            <button
              onClick={onClose}
              className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-xl font-medium hover:bg-gray-200 transition-colors"
            >
              I'll Enter Address Manually
            </button>
          )}
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
            <CheckCircle size={14} />
            <span>Your privacy is protected - location is only used for delivery</span>
          </div>
        </div>
      </div>
    </div>
  );
}
