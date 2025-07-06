'use client';

import { useState } from 'react';
import { AlertCircle, CheckCircle, ExternalLink, Key } from 'lucide-react';

export default function GoogleMapsAPITester() {
  const [testResult, setTestResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const testAPIKey = async () => {
    setIsLoading(true);
    setTestResult(null);

    try {
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
      
      if (!apiKey) {
        setTestResult('❌ API key not found in environment variables');
        setIsLoading(false);
        return;
      }

      // Test 1: Basic API key format
      if (!apiKey.startsWith('AIza')) {
        setTestResult('❌ Invalid API key format (should start with AIza)');
        setIsLoading(false);
        return;
      }

      // Test 2: Try to load a simple geocoding request
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=Chennai&key=${apiKey}`
      );

      const data = await response.json();

      if (data.status === 'OK') {
        setTestResult('✅ API key is working correctly!');
      } else if (data.status === 'REQUEST_DENIED') {
        setTestResult(`❌ API Request Denied: ${data.error_message || 'Check API restrictions'}`);
      } else if (data.status === 'OVER_QUERY_LIMIT') {
        setTestResult('❌ API quota exceeded. Check your billing settings.');
      } else {
        setTestResult(`❌ API Error: ${data.status} - ${data.error_message || 'Unknown error'}`);
      }

    } catch (error: any) {
      setTestResult(`❌ Network Error: ${error.message}`);
    }

    setIsLoading(false);
  };

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl p-4 border border-gray-200 max-w-sm">
        <div className="flex items-center gap-2 mb-3">
          <Key className="text-orange-500" size={20} />
          <h3 className="font-semibold text-gray-900">API Key Tester</h3>
        </div>
        
        <button
          onClick={testAPIKey}
          disabled={isLoading}
          className="w-full bg-orange-500 text-white py-2 px-4 rounded-lg font-medium hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-3"
        >
          {isLoading ? 'Testing...' : 'Test API Key'}
        </button>

        {testResult && (
          <div className={`p-3 rounded-lg text-sm ${
            testResult.startsWith('✅') 
              ? 'bg-green-50 text-green-800 border border-green-200' 
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {testResult}
          </div>
        )}

        <div className="mt-3 pt-3 border-t border-gray-200">
          <h4 className="font-medium text-gray-900 mb-2 text-xs">Quick Fixes:</h4>
          <ul className="text-xs text-gray-600 space-y-1">
            <li>• Enable Maps JavaScript API</li>
            <li>• Enable Geocoding API</li>
            <li>• Enable Places API</li>
            <li>• Check billing account</li>
            <li>• Remove domain restrictions</li>
          </ul>
          
          <a
            href="https://console.cloud.google.com/apis/credentials"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-orange-600 hover:text-orange-700 mt-2"
          >
            <ExternalLink size={12} />
            Google Cloud Console
          </a>
        </div>
      </div>
    </div>
  );
}
