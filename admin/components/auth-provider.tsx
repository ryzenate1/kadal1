"use client";

import { createContext, useContext, useState, useEffect } from 'react';
import { authenticateDirectly } from '@/lib/directAuth';

type User = {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'manager' | 'editor';
};

type AuthContextType = {
  user: User | null;
  login: (phoneNumber: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Hardcoded API URL for testing
const API_URL = 'http://localhost:5001/api';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for user session
    const checkAuth = async () => {
      try {
        const savedUser = localStorage.getItem('oceanFreshUser');
        const token = localStorage.getItem('oceanFreshToken');
        
        if (savedUser && token) {
          // Verify token with server
          const res = await fetch(`${API_URL}/auth/verify`, {
            headers: { Authorization: `Bearer ${token}` }
          }).catch(() => null);
          
          if (res && res.ok) {
            setUser(JSON.parse(savedUser));
          } else {
            // Token invalid, clear storage
            localStorage.removeItem('oceanFreshUser');
            localStorage.removeItem('oceanFreshToken');
          }
        }
      } catch (error) {
        console.error('Authentication error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);
  const login = async (phoneNumber: string, password: string) => {
    setIsLoading(true);
    try {
      console.log('Attempting login for admin panel with phone:', phoneNumber);
      
      // First, try the API login
      try {
        // Make the API call to the real server endpoint
        console.log('Making API request to:', `${API_URL}/auth/login`);
        const res = await fetch(`${API_URL}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phoneNumber, password })
        });
        
        console.log('API response status:', res.status);
        
        if (res.ok) {
          const data = await res.json();
          console.log('Login successful, received data:', data);
          
          // Check if the response contains user data in the expected format
          const userData = data.user || data;
            
          // Check if the user has admin role
          if (!userData.role || userData.role !== 'admin') {
            console.error('User is not an admin, role:', userData.role);
            return false;
          }
          
          // Store the user data and token
          setUser(userData);
          localStorage.setItem('oceanFreshUser', JSON.stringify(userData));
          localStorage.setItem('oceanFreshToken', data.token || userData.token);
          
          return true;
        }
        
        // If API login fails, log the error
        const errorData = await res.text();
        console.error('API login failed:', res.status, errorData);
      } catch (apiError) {
        console.error('API login error:', apiError);
      }
      
      // If API login fails, try direct database authentication as fallback
      console.log('Trying direct database authentication as fallback...');
      const authResult = await authenticateDirectly(phoneNumber, password);
        if (authResult) {
        console.log('Direct authentication successful');
        // Ensure role is properly typed
        const user: User = {
          id: authResult.user.id,
          email: authResult.user.email,
          name: authResult.user.name,
          role: (authResult.user.role as 'admin' | 'manager' | 'editor') || 'admin'
        };
        setUser(user);
        localStorage.setItem('oceanFreshUser', JSON.stringify(user));
        localStorage.setItem('oceanFreshToken', authResult.token);
        return true;
      }
      
      console.error('Both API and direct authentication failed');
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('oceanFreshUser');
    localStorage.removeItem('oceanFreshToken');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};