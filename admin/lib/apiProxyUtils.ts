/**
 * Centralized API utilities for the admin panel
 * This file provides standardized functions for API interactions
 */

import { NextResponse } from 'next/server';

// Environment configuration with fallbacks
export const API_CONFIG = {
  SERVER_API_URL: process.env.NEXT_PUBLIC_SERVER_API_URL || 'http://localhost:5001/api',
  CLIENT_API_URL: process.env.NEXT_PUBLIC_CLIENT_API_URL || '/api',
  CLIENT_URL: process.env.NEXT_PUBLIC_CLIENT_URL || 'http://localhost:3000',
};

// Error response types for better type safety
export type ApiErrorResponse = {
  message: string;
  error?: string;
  status?: number;
  details?: any;
};

/**
 * Standard API response handler with improved error parsing
 */
export async function handleApiResponse(response: Response): Promise<any> {
  try {
    // Handle successful responses
    if (response.ok) {
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      }
      return await response.text();
    }

    // Handle error responses
    const errorResponse: ApiErrorResponse = {
      message: `API Error: ${response.status}`,
      status: response.status,
    };

    try {
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const errorData = await response.json();
        errorResponse.message = errorData.message || errorData.error || errorResponse.message;
        errorResponse.details = errorData;
      } else {
        const text = await response.text();
        if (text) {
          errorResponse.message = text;
        }
      }
    } catch (e) {
      // If parsing fails, use the default error message
    }

    throw errorResponse;
  } catch (error) {
    throw error;
  }
}

/**
 * Create standardized Next.js API route handlers with proper error handling
 * @param endpoint Server API endpoint (without the base URL)
 * @param options Additional fetch options
 */
export async function createApiProxyHandler(
  endpoint: string, 
  request: Request,
  options: RequestInit = {}
) {
  try {
    const url = new URL(request.url);
    const searchParams = url.searchParams.toString();
    const queryString = searchParams ? `?${searchParams}` : '';
    
    const token = request.headers.get('Authorization');
    const fullEndpoint = `${API_CONFIG.SERVER_API_URL}/${endpoint}${queryString}`.replace(/\/+/g, '/').replace(':/', '://');
    
    const response = await fetch(fullEndpoint, {
      method: options.method || request.method,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': token }),
        ...options.headers,
      },
      body: options.body || (request.method !== 'GET' && request.method !== 'HEAD' ? await request.text() : undefined),
      ...options,
    });

    const data = await handleApiResponse(response);
    return NextResponse.json(data);
  } catch (error: any) {
    console.error(`Error in API route ${endpoint}:`, error);
    
    // Structured error response
    return NextResponse.json(
      {
        message: error.message || 'Internal server error',
        error: error.error || error.toString(),
        details: error.details || undefined,
      },
      { status: error.status || 500 }
    );
  }
}

/**
 * Creates a fallback handler that tries multiple endpoints in sequence
 * Useful for handling API changes or backward compatibility
 */
export async function createFallbackApiHandler(
  endpoints: string[],
  request: Request,
  options: RequestInit = {}
) {
  let lastError: any = null;
  
  for (const endpoint of endpoints) {
    try {
      return await createApiProxyHandler(endpoint, request, options);
    } catch (error) {
      lastError = error;
      console.warn(`API endpoint ${endpoint} failed, trying next fallback...`);
    }
  }
  
  // If all endpoints fail, return the last error
  console.error('All API fallbacks failed:', lastError);
  return NextResponse.json(
    {
      message: lastError?.message || 'All API endpoints failed',
      error: lastError?.error || lastError?.toString() || 'Fallback error',
      details: lastError?.details || undefined,
    },
    { status: lastError?.status || 500 }
  );
}
