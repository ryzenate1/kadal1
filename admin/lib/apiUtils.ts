/**
 * API utilities for the admin panel
 */

import { toast } from "@/hooks/use-toast";

// Define the base API URL - configured based on environment
// For production, these will be set in the .env file
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
const SERVER_API_URL = process.env.NEXT_PUBLIC_SERVER_API_URL || 'http://localhost:5001/api';
const CLIENT_URL = process.env.NEXT_PUBLIC_CLIENT_URL || 'http://localhost:3000';

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

// Helper to parse error responses
export async function parseErrorResponse(response: Response): Promise<string> {
  try {
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const errorData = await response.json();
      return errorData.message || errorData.error || `API Error: ${response.status}`;
    } else {
      const text = await response.text();
      return text || `API Error: ${response.status}`;
    }
  } catch (e) {
    return `API Error: ${response.status}`;
  }
}

/**
 * Makes an authenticated API request to the server
 * Automatically adds the authorization token from localStorage
 */
export async function fetchWithAuth(endpoint: string, options: RequestInit = {}): Promise<any> {
  // Get token from localStorage or use fallback admin token
  let token = '';
  
  if (typeof window !== 'undefined') {
    token = localStorage.getItem('oceanFreshToken') || '';
    
    // If no token is found and we're not on the login page, redirect to login
    if (!token && typeof window !== 'undefined' && !window.location.pathname.includes('login')) {
      console.error('No authentication token found');
      toast({
        title: "Authentication Required",
        description: "Please login to continue.",
        variant: "destructive",
      });
      
      setTimeout(() => {
        window.location.href = '/login';
      }, 1500);
      
      return null;
    }
  }
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const url = endpoint.startsWith('http') 
    ? endpoint 
    : `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  
  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });
    
    // Automatically handle 401/403 errors
    if (response.status === 401 || response.status === 403) {
      // Show toast notification
      toast({
        title: "Authentication Error",
        description: "Please login again to continue.",
        variant: "destructive",
      });
      
      // If we're not on the login page, redirect to login
      if (typeof window !== 'undefined' && !window.location.pathname.includes('login')) {
        // Clear the stored token since it's invalid
        localStorage.removeItem('oceanFreshToken');
        localStorage.removeItem('oceanFreshUser');
        
        // Wait a moment before redirecting to allow toast to show
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
        
        return null;
      }
    }
      // Parse JSON if possible
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      try {
        const data = await response.json();
        
        // Handle server error messages
        if (!response.ok) {
          const errorMessage = data.message || data.error || `API Error: ${response.status}`;
          
          // Show toast notification for errors
          toast({
            title: "API Error",
            description: errorMessage,
            variant: "destructive",
          });
          
          throw new Error(errorMessage);
        }
        
        return data;
      } catch (e) {
        console.error("Error parsing JSON response:", e);
        
        if (!response.ok) {
          const errorMessage = `API Error: ${response.status}`;
          
          // Show toast notification for errors
          toast({
            title: "API Error",
            description: errorMessage,
            variant: "destructive",
          });
          
          throw new Error(errorMessage);
        }
        
        return {};
      }
    } else {
      const text = await response.text();
      
      if (!response.ok) {
        const errorMessage = `API Error: ${response.status} - ${text}`;
        
        // Show toast notification for errors
        toast({
          title: "API Error",
          description: errorMessage,
          variant: "destructive",
        });
        
        throw new Error(errorMessage);
      }
      
      return text;
    }  } catch (error: any) {
    console.error('API request failed:', error);
    
    // If not already handled by specific error cases above
    if (error.message && !error.message.includes('API Error')) {
      toast({
        title: "Connection Error",
        description: "Failed to connect to the server. Please check your connection.",
        variant: "destructive",
      });
    }
    
    throw error;
  }
}

/**
 * API client for admin panel
 */
export const adminApi = {
  // Fetch data from API endpoints with authentication
  async get<T>(endpoint: string): Promise<T> {
    try {
      return await fetchWithAuth(endpoint, { method: 'GET' });
    } catch (error: any) {
      console.error(`Error fetching from ${endpoint}:`, error);
      throw error;
    }
  },
  
  // Create new resources with authentication
  async post<T>(endpoint: string, data: any): Promise<T> {
    try {
      return await fetchWithAuth(endpoint, {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch (error: any) {
      console.error(`Error posting to ${endpoint}:`, error);
      throw error;
    }
  },
  
  // Update existing resources with authentication
  async put<T>(endpoint: string, data: any): Promise<T> {
    try {
      return await fetchWithAuth(endpoint, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    } catch (error: any) {
      console.error(`Error updating ${endpoint}:`, error);
      throw error;
    }
  },
  
  // Delete resources with authentication
  async delete(endpoint: string): Promise<void> {
    try {
      await fetchWithAuth(endpoint, { method: 'DELETE' });
    } catch (error: any) {
      console.error(`Error deleting from ${endpoint}:`, error);
      throw error;
    }  },
  
  // Upload a file (image)
  async uploadImage(file: File, context: string = 'general'): Promise<string> {
    try {
      // Create a FormData object
      const formData = new FormData();
      formData.append('file', file);
      formData.append('context', context);
      
      // Get token from localStorage or use fallback admin token
      let token = 'admin-test-token'; // Default fallback
      
      if (typeof window !== 'undefined') {
        token = localStorage.getItem('oceanFreshToken') || token;
      }
      
      // Send the file to the upload API
      const response = await fetch(`${API_BASE_URL}/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
      });
      
      if (!response.ok) {
        console.warn('Image upload failed, using fallback image');
        toast({
          title: "Upload Failed",
          description: "Could not upload image. Using fallback image instead.",
          variant: "destructive",
        });
        return Promise.resolve(getFallbackImage(context));
      }
      
      const data = await response.json();
      
      // For our demo, we'll just use an immediate URL
      // In a real app, you'd use the URL from the storage service
      if (!data.url) {
        toast({
          title: "Upload Issue",
          description: "Server didn't return image URL. Using fallback image.",
          variant: "destructive",
        });
        return Promise.resolve(getFallbackImage(context));
      }
      
      return Promise.resolve(data.url);
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Upload Error",
        description: "Failed to upload image. Using fallback image.",
        variant: "destructive",
      });
      return Promise.resolve(getFallbackImage(context));
    }
  },
  
  /**
   * Uploads a file with authentication
   * @param endpoint API endpoint for the upload
   * @param file File to upload
   * @param additionalData Additional form data to include
   * @returns Upload response
   */
  async uploadFileWithAuth(
    endpoint: string,
    file: File,
    additionalData: Record<string, any> = {}
  ): Promise<any> {
    let token = '';
    
    if (typeof window !== 'undefined') {
      token = localStorage.getItem('oceanFreshToken') || '';
      
      if (!token) {
        console.error('No authentication token found for file upload');
        toast({
          title: "Authentication Required",
          description: "Please login to upload files.",
          variant: "destructive",
        });
        
        if (!window.location.pathname.includes('login')) {
          setTimeout(() => {
            window.location.href = '/login';
          }, 1500);
        }
        
        throw new Error('Authentication required');
      }
    }
    
    const formData = new FormData();
    formData.append('file', file);
    
    // Add any additional data to the form
    Object.entries(additionalData).forEach(([key, value]) => {
      formData.append(key, String(value));
    });
    
    const url = endpoint.startsWith('http') 
      ? endpoint 
      : `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          // Note: Don't set Content-Type here as it will be set automatically with the boundary for FormData
        },
        body: formData,
      });
      
      // Handle authentication errors
      if (response.status === 401 || response.status === 403) {
        toast({
          title: "Authentication Error",
          description: "Please login again to upload files.",
          variant: "destructive",
        });
        
        if (typeof window !== 'undefined' && !window.location.pathname.includes('login')) {
          localStorage.removeItem('oceanFreshToken');
          localStorage.removeItem('oceanFreshUser');
          
          setTimeout(() => {
            window.location.href = '/login';
          }, 1500);
        }
        
        throw new Error('Authentication failed');
      }
      
      if (!response.ok) {
        const errorMessage = await parseErrorResponse(response);
        throw new Error(errorMessage);
      }
      
      return await response.json();
    } catch (error) {
      console.error('File upload error:', error);
      throw error;
    }
  }
};

// Helpers for common API operations with toast notifications
export const apiHelpers = {
  // Fetch data with loading toast
  async fetchWithToast<T>(endpoint: string, loadingMessage: string, errorMessage: string): Promise<T | null> {
    try {
      toast({
        title: "Loading",
        description: loadingMessage,
      });
      
      const data = await adminApi.get<T>(endpoint);
      
      return data;
    } catch (error) {
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return null;
    }
  },
  
  // Create with success/error toasts
  async createWithToast<T>(endpoint: string, data: any, successMessage: string, errorMessage: string): Promise<T | null> {
    try {
      const result = await adminApi.post<T>(endpoint, data);
      
      toast({
        title: "Success",
        description: successMessage,
      });
      
      return result;
    } catch (error) {
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return null;
    }
  },
  
  // Update with success/error toasts
  async updateWithToast<T>(endpoint: string, data: any, successMessage: string, errorMessage: string): Promise<T | null> {
    try {
      const result = await adminApi.put<T>(endpoint, data);
      
      toast({
        title: "Success",
        description: successMessage,
      });
      
      return result;
    } catch (error) {
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return null;
    }
  },
  
  // Delete with success/error toasts
  async deleteWithToast(endpoint: string, successMessage: string, errorMessage: string): Promise<boolean> {
    try {
      await adminApi.delete(endpoint);
      
      toast({
        title: "Success",
        description: successMessage,
      });
      
      return true;
    } catch (error) {
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return false;
    }
  }
};