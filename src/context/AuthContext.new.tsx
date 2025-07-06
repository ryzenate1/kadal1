"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { fetchWithRetry, getAuthHeaders } from '@/lib/apiUtils';

type User = {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  role?: string;
  loyaltyPoints?: number;
  loyaltyTier?: string;
  token?: string;
  defaultAddress?: {
    id: string;
    name: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    isDefault: boolean;
  }
};

type AuthContextType = {
  user: User | null;
  login: (phoneNumber: string, password: string) => Promise<{ success: boolean; message?: string }>;
  register: (name: string, email: string, phoneNumber: string, password: string) => Promise<{ success: boolean; message?: string }>;
  loginWithOtp: (phoneNumber: string, otp: string, userData?: { name?: string; email?: string }) => Promise<{ success: boolean; message?: string }>;
  sendOtp: (phoneNumber: string) => Promise<{ success: boolean; message?: string; userExists?: boolean }>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => Promise<{ success: boolean; message?: string }>;
  updateUserProfile: (data: Partial<User>) => Promise<{ success: boolean; message?: string }>;
  isAuthenticated: boolean;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for token in localStorage on initial load
    const token = localStorage.getItem('token');
    if (token) {
      fetchUserProfile(token);
    } else {
      setLoading(false);
    }
  }, []);

  // Fetch user profile with token
  const fetchUserProfile = async (token: string) => {
    try {
      const userData = await fetchWithRetry('/users/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }, 3); // Retry up to 3 times
      
      setUser({ ...userData, token });
    } catch (error) {
      console.error('Error fetching user profile:', error);
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Login with phone and password
  const login = async (phoneNumber: string, password: string): Promise<{ success: boolean; message?: string }> => {
    try {
      console.log(`Attempting to login with phone: ${phoneNumber}`);
      
      // For testing purposes, let's use the test credentials from our seed data
      if (phoneNumber === '9876543210' && password === 'password123') {
        console.log('Using test credentials - bypassing API for now');
        const testUser = {
          id: '88e49eec-e6fb-404a-93da-6fa7740ad944', // This should match the ID from your seed data
          name: 'Test User',
          email: 'test@example.com',
          phoneNumber: '9876543210',
          loyaltyPoints: 1250,
          loyaltyTier: 'Silver',
          token: 'test-token-for-development'
        };
        
        localStorage.setItem('token', testUser.token);
        setUser(testUser);
        return { success: true };
      }
      
      const data = await fetchWithRetry('/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ phoneNumber, password })
      }, 3);

      localStorage.setItem('token', data.token);
      setUser({ ...data.user, token: data.token });
      return { success: true };
    } catch (error: any) {
      console.error('Login error:', error);
      return { 
        success: false, 
        message: error.message || 'Network error. Please check your connection and try again.'
      };
    }
  };

  // Register new user
  const register = async (name: string, email: string, phoneNumber: string, password: string): Promise<{ success: boolean; message?: string }> => {
    try {
      const data = await fetchWithRetry('/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, email, phoneNumber, password })
      }, 3);

      localStorage.setItem('token', data.token);
      setUser({ ...data.user, token: data.token });
      return { success: true };
    } catch (error: any) {
      console.error('Registration error:', error);
      return { 
        success: false, 
        message: error.message || 'Network error. Please check your connection and try again.'
      };
    }
  };

  // Send OTP for phone verification
  const sendOtp = async (phoneNumber: string): Promise<{ success: boolean; message?: string; userExists?: boolean }> => {
    try {
      const data = await fetchWithRetry('/auth/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ phoneNumber })
      }, 3);

      return { 
        success: true, 
        message: data.message,
        userExists: data.userExists 
      };
    } catch (error: any) {
      console.error('Send OTP error:', error);
      return { 
        success: false, 
        message: error.message || 'Network error. Please check your connection and try again.'
      };
    }
  };

  // Login with OTP
  const loginWithOtp = async (
    phoneNumber: string, 
    otp: string, 
    userData?: { name?: string; email?: string }
  ): Promise<{ success: boolean; message?: string }> => {
    try {
      const data = await fetchWithRetry('/auth/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          phoneNumber, 
          otp,
          ...userData // Include name and email for new user registration
        })
      }, 3);

      localStorage.setItem('token', data.token);
      setUser({ ...data.user, token: data.token });
      return { success: true };
    } catch (error: any) {
      console.error('OTP verification error:', error);
      return { 
        success: false, 
        message: error.message || 'Network error. Please check your connection and try again.'
      };
    }
  };

  // Update user data
  const updateUser = async (userData: Partial<User>): Promise<{ success: boolean; message?: string }> => {
    try {
      if (!user) {
        return { success: false, message: 'Not authenticated' };
      }
      
      const data = await fetchWithRetry('/users/update', {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(userData)
      }, 3);
      
      setUser(prev => prev ? { ...prev, ...data.user } : null);
      return { success: true };
    } catch (error: any) {
      console.error('Update user error:', error);
      return { 
        success: false, 
        message: error.message || 'Network error. Please check your connection and try again.'
      };
    }
  };

  // Update user profile
  const updateUserProfile = async (data: Partial<User>): Promise<{ success: boolean; message?: string }> => {
    try {
      if (!user) {
        return { success: false, message: 'Not authenticated' };
      }
      
      const updatedData = await fetchWithRetry('/users/profile', {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
      }, 3);
      
      setUser(prev => prev ? { ...prev, ...updatedData } : null);
      return { success: true, message: 'Profile updated successfully' };
    } catch (error: any) {
      console.error('Update profile error:', error);
      return { 
        success: false, 
        message: error.message || 'Network error. Please check your connection and try again.'
      };
    }
  };

  // Logout
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        loginWithOtp,
        sendOtp,
        logout,
        updateUser,
        updateUserProfile,
        isAuthenticated: !!user,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
