'use client';

import { useState, useEffect } from 'react';
import { AlertCircle, RefreshCw, MapPin } from 'lucide-react';

interface GoogleMapsErrorProps {
  onRetry?: () => void;
  fallbackMessage?: string;
}

export default function GoogleMapsError({ 
  onRetry, 
  fallbackMessage = "Google Maps is temporarily unavailable" 
}: GoogleMapsErrorProps) {
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = async () => {
    if (onRetry) {
      setIsRetrying(true);
      try {
        await onRetry();
      } catch (error) {
        console.error('Retry failed:', error);
      } finally {
        setIsRetrying(false);
      }
    }
  };

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-gray-100 text-center">
      <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <AlertCircle className="h-8 w-8 text-orange-500" />
      </div>
      
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        Connection Issue
      </h3>
      
      <p className="text-gray-600 mb-4 leading-relaxed">
        {fallbackMessage}. You can still search and add addresses manually.
      </p>
      
      {onRetry && (
        <button
          onClick={handleRetry}
          disabled={isRetrying}
          className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-orange-600 hover:to-orange-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mx-auto"
        >
          {isRetrying ? (
            <>
              <RefreshCw className="animate-spin" size={18} />
              Retrying...
            </>
          ) : (
            <>
              <RefreshCw size={18} />
              Try Again
            </>
          )}
        </button>
      )}
      
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
          <MapPin size={16} />
          <span>Manual address entry is still available</span>
        </div>
      </div>
    </div>
  );
}
