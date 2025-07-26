/**
 * Enhanced API utilities for the admin panel's client-side fetching
 */

import { toast } from "@/hooks/use-toast";
import { API_CONFIG } from './apiProxyUtils';

// API configuration with environment variables
export const API_CLIENT_CONFIG = {
  SERVER_API_URL: process.env.NEXT_PUBLIC_SERVER_API_URL || 'http://localhost:5001/api',
  CLIENT_API_URL: process.env.NEXT_PUBLIC_CLIENT_API_URL || '/api',
  CLIENT_URL: process.env.NEXT_PUBLIC_CLIENT_URL || 'http://localhost:3000',
  RETRY_COUNT: 2,
  RETRY_DELAY: 1000,
};

// Error types for better TypeScript support
export type ApiError = {
  message: string;
  status?: number;
  details?: any;
};

/**
 * Makes an authenticated API request to the server with enhanced error handling
 * and automatic token management.
 * 
 * @param endpoint API endpoint path (without base URL)
 * @param options Fetch options
 * @param useServerApi Whether to use server API directly or go through Next.js API routes
 * @returns Promise with the response data
 */
export async function fetchWithAuth(
  endpoint: string, 
  options: RequestInit = {}, 
  useServerApi = false
): Promise<any> {
  // Determine which base URL to use
  const baseUrl = useServerApi 
    ? API_CLIENT_CONFIG.SERVER_API_URL 
    : API_CLIENT_CONFIG.CLIENT_API_URL;
  
  // Clean up endpoint and construct full URL
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint.substring(1) : endpoint;
  const url = `${baseUrl}/${normalizedEndpoint}`.replace(/\/+/g, '/').replace(':/', '://');
  
  // Get authentication token
  let token = '';
  if (typeof window !== 'undefined') {
    try {
      token = localStorage.getItem('auth_token') || '';
    } catch (e) {
      console.warn('Could not access localStorage for auth token');
    }
  }
  
  // Prepare headers with authentication
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options.headers,
  };
  
  // Attempt the fetch with retry logic
  let lastError: any = null;
  let attempts = 0;
  
  while (attempts <= API_CLIENT_CONFIG.RETRY_COUNT) {
    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });
      
      if (response.ok) {
        // Handle successful response
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          return await response.json();
        }
        return await response.text();
      }
      
      // Handle error response
      lastError = {
        message: `API Error: ${response.status}`,
        status: response.status,
      };
      
      // Try to parse error details
      try {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          lastError.message = errorData.message || errorData.error || lastError.message;
          lastError.details = errorData;
        } else {
          const text = await response.text();
          if (text) {
            lastError.message = text;
          }
        }
      } catch (e) {
        // If parsing fails, use the default error
      }
      
      // Don't retry for client errors (4xx) except for 429 (rate limit)
      if (response.status >= 400 && response.status < 500 && response.status !== 429) {
        break;
      }
      
    } catch (error: any) {
      lastError = {
        message: error.message || 'Network error',
        details: error,
      };
    }
    
    // Retry with exponential backoff
    attempts++;
    if (attempts <= API_CLIENT_CONFIG.RETRY_COUNT) {
      await new Promise(resolve => setTimeout(
        resolve, 
        API_CLIENT_CONFIG.RETRY_DELAY * Math.pow(2, attempts - 1)
      ));
    }
  }
  
  // All attempts failed
  console.error(`API request failed after ${attempts} attempts:`, lastError);
  
  // Show error toast if appropriate
  if (typeof window !== 'undefined') {
    toast({
      title: 'API Error',
      description: lastError.message || 'Failed to communicate with the server',
      variant: 'destructive',
    });
  }
  
  throw lastError;
}

/**
 * Create a fallback fetch that tries multiple endpoints in sequence
 */
export async function fetchWithFallback(
  endpoints: string[],
  options: RequestInit = {},
  useServerApi = false
): Promise<any> {
  let lastError: any = null;
  
  for (const endpoint of endpoints) {
    try {
      return await fetchWithAuth(endpoint, options, useServerApi);
    } catch (error) {
      lastError = error;
      console.warn(`API endpoint ${endpoint} failed, trying next fallback...`);
    }
  }
  
  // If all endpoints fail, throw the last error
  throw lastError;
}

// Helper to get fallback images based on context
export function getFallbackImage(context: string): string {
  switch (context) {
    case 'trusted-badges':
      return "/images/fallback/badge-placeholder.jpg";
    case 'categories':
      return "/images/fallback/category-placeholder.jpg";
    case 'products':
      return "/images/fallback/product-placeholder.jpg";
    default:
      return "/images/fallback/placeholder.jpg";
  }
}
