"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from 'react';
import { useAuth as useClerkAuth, useClerk, useUser } from '@clerk/nextjs';
import { clientStorage } from '@/lib/clientStorage';
import { fetchJson } from '@/lib/apiClient';

const normalizeEndpoint = (endpoint: string) => {
  if (endpoint.startsWith('/api/')) return endpoint;
  if (endpoint.startsWith('/auth/') || endpoint.startsWith('/user/') || endpoint.startsWith('/orders/')) {
    return `/api${endpoint}`;
  }
  if (endpoint === '/users/profile' || endpoint === '/users/update') {
    return '/api/user/profile';
  }
  return endpoint;
};

const api = {
  get: (endpoint: string) => fetchJson<any>(normalizeEndpoint(endpoint)),
  post: (endpoint: string, data?: unknown) =>
    fetchJson<any>(normalizeEndpoint(endpoint), { method: 'POST', body: data ?? null }),
  patch: (endpoint: string, data?: unknown) =>
    fetchJson<any>(normalizeEndpoint(endpoint), { method: 'PATCH', body: data ?? null }),
  delete: (endpoint: string) =>
    fetchJson<any>(normalizeEndpoint(endpoint), { method: 'DELETE' }),
};

type User = {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  authUserId?: string | null;
  role?: string;
  loyaltyPoints?: number;
  loyaltyTier?: string;
  token?: string;
  profileImage?: string;
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

// Define a type for the user activity log
type UserActivity = {
  id?: string;
  userId: string;
  activityType: 'login' | 'logout' | 'password_change' | 'name_change' | 'address_update' | 'profile_update'; 
  details: string;
  timestamp: string;
  ipAddress?: string;
  location?: string;
};

type AuthContextType = {
  user: User | null;
  login: (identifier: string, password: string) => Promise<{ success: boolean; message?: string }>;
  register: (name: string, email: string, phoneNumber: string, password: string) => Promise<{ success: boolean; message?: string }>;
  signInWithGoogle: () => Promise<{ success: boolean; message?: string }>;
  sendOtp: (phoneNumber: string) => Promise<{
    success: boolean;
    message?: string;
    userExists?: boolean;
    otpRequestId?: string | null;
    expiresInSec?: number;
    retryAfterSec?: number;
    deliveryStatus?: 'sent';
  }>;
  loginWithOtp: (
    phoneNumber: string,
    otp: string,
    userData?: { name?: string; email?: string },
    otpRequestId?: string | null
  ) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => Promise<{ success: boolean; message?: string }>;
  updateUserProfile: (data: Partial<User>) => Promise<{ success: boolean; message?: string }>;
  isAuthenticated: boolean;
  loading: boolean;
  getToken: () => Promise<string>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { isLoaded: isAuthLoaded, isSignedIn, getToken: getClerkToken } = useClerkAuth();
  const { user: clerkUser, isLoaded: isUserLoaded } = useUser();
  const clerk = useClerk();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const persistSession = useCallback((
    token: string,
    userData: User,
    refreshToken?: string | null,
    expiresInSec?: number
  ) => {
    clientStorage.auth.setSession(token, {
      refreshToken: refreshToken || null,
      expiresInSec,
    });
    clientStorage.user.set(userData);
  }, []);

  const syncUserFromServer = useCallback(
    async (token: string, fallback?: Partial<User> | null): Promise<User | null> => {
      try {
        const profile = await fetchJson<any>('/api/user/profile', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const merged: User = {
          id: profile?.id || fallback?.id || '',
          name: profile?.name || fallback?.name || 'Kadal Customer',
          email: profile?.email || fallback?.email || '',
          phoneNumber: profile?.phoneNumber || profile?.phone_number || fallback?.phoneNumber || '',
          authUserId: profile?.authUserId || profile?.auth_user_id || fallback?.authUserId,
          role: profile?.role || fallback?.role,
          loyaltyPoints: profile?.loyaltyPoints || fallback?.loyaltyPoints,
          loyaltyTier: profile?.loyaltyTier || fallback?.loyaltyTier,
          profileImage: profile?.profileImage || fallback?.profileImage,
          defaultAddress: profile?.defaultAddress || fallback?.defaultAddress,
          token,
        };

        persistSession(token, merged);
        setUser(merged);
        return merged;
      } catch {
        if (!fallback) {
          return null;
        }

        const localUser: User = {
          id: fallback.id || '',
          name: fallback.name || 'Kadal Customer',
          email: fallback.email || '',
          phoneNumber: fallback.phoneNumber || '',
          authUserId: fallback.authUserId,
          role: fallback.role,
          loyaltyPoints: fallback.loyaltyPoints,
          loyaltyTier: fallback.loyaltyTier,
          profileImage: fallback.profileImage,
          defaultAddress: fallback.defaultAddress,
          token,
        };

        persistSession(token, localUser);
        setUser(localUser);
        return localUser;
      }
    },
    [persistSession]
  );

  const consumeAuthPayload = useCallback(
    async (payload: any): Promise<boolean> => {
      const token = typeof payload?.token === 'string' ? payload.token : '';
      if (!token) {
        return false;
      }

      const incomingUser = payload?.user || {};
      const fallback: Partial<User> = {
        id: incomingUser?.id || '',
        name: incomingUser?.name || 'Kadal Customer',
        email: incomingUser?.email || '',
        phoneNumber: incomingUser?.phoneNumber || incomingUser?.phone_number || '',
        authUserId: incomingUser?.authUserId || incomingUser?.auth_user_id || undefined,
      };

      const synced = await syncUserFromServer(token, fallback);
      const resolvedUser = synced || {
        id: fallback.id || '',
        name: fallback.name || 'Kadal Customer',
        email: fallback.email || '',
        phoneNumber: fallback.phoneNumber || '',
        authUserId: fallback.authUserId || undefined,
        token,
      };

      persistSession(token, resolvedUser, payload?.refreshToken || null, payload?.expiresIn);
      setUser(resolvedUser);
      return true;
    },
    [persistSession, syncUserFromServer]
  );

  const buildFallbackFromClerk = useCallback((): Partial<User> | null => {
    if (!clerkUser) {
      return null;
    }

    const firstName = clerkUser.firstName || '';
    const lastName = clerkUser.lastName || '';
    const fullName = `${firstName} ${lastName}`.trim() || clerkUser.username || 'Kadal Customer';
    const email = clerkUser.primaryEmailAddress?.emailAddress || '';
    const phoneRaw = clerkUser.primaryPhoneNumber?.phoneNumber || '';
    const normalizedPhone = phoneRaw.replace(/\D/g, '').slice(-10);

    return {
      id: clerkUser.id,
      name: fullName,
      email,
      phoneNumber: normalizedPhone,
      profileImage: clerkUser.imageUrl,
    };
  }, [clerkUser]);

  const syncClerkSession = useCallback(async (): Promise<boolean> => {
    if (!isSignedIn || !isAuthLoaded) {
      return false;
    }

    const token = await getClerkToken();
    if (!token) {
      return false;
    }

    const fallback = buildFallbackFromClerk();
    const synced = await syncUserFromServer(token, fallback);
    return !!synced;
  }, [isSignedIn, isAuthLoaded, getClerkToken, syncUserFromServer, buildFallbackFromClerk]);

  const refreshStoredSession = useCallback(async (): Promise<boolean> => {
    const refreshToken = clientStorage.auth.getRefreshToken();
    if (!refreshToken) {
      return false;
    }

    try {
      const payload = await fetchJson<any>('/api/auth/refresh', {
        method: 'POST',
        body: { refreshToken },
        authenticated: false,
      });
      return await consumeAuthPayload(payload);
    } catch (error) {
      console.error('Session refresh error:', error);
      clientStorage.clearSession();
      setUser(null);
      return false;
    }
  }, [consumeAuthPayload]);

  const restoreStoredSession = useCallback(async (): Promise<boolean> => {
    const session = clientStorage.auth.getSession();
    const storedUser = clientStorage.user.get();

    if (!session?.token) {
      return false;
    }

    if (session.expiresAt > Date.now() + 10_000) {
      if (storedUser) {
        setUser({ ...storedUser, token: session.token });
      }

      try {
        const synced = await syncUserFromServer(session.token, storedUser);
        if (synced) {
          persistSession(
            session.token,
            synced,
            session.refreshToken || null,
            Math.max(60, Math.floor((session.expiresAt - Date.now()) / 1000))
          );
          return true;
        }
      } catch (error) {
        console.error('Stored session sync error:', error);
      }

      if (storedUser) {
        return true;
      }
    }

    if (session.refreshToken) {
      return refreshStoredSession();
    }

    clientStorage.clearSession();
    setUser(null);
    return false;
  }, [persistSession, refreshStoredSession, syncUserFromServer]);

  // Function to log user activity
  const logUserActivity = async (activity: UserActivity) => {
    try {
      // In a real production environment, send this to the backend
      // For now, we'll just log it to console for demonstration
      console.log('User Activity:', activity);
      
      // Get approximate location from IP (in real app, would use geolocation or IP service)
      const mockLocation = 'Chennai, Tamil Nadu';
      
      // Create a complete activity object
      const completeActivity = {
        ...activity,
        id: `act_${Date.now()}`,
        timestamp: new Date().toISOString(),
        ipAddress: '127.0.0.1',
        location: mockLocation
      };
      
      // Store in localStorage for demonstration purposes
      clientStorage.activity.append(completeActivity);
      
      // In a real app: await api.post('/activity/log', completeActivity);
    } catch (error) {
      console.error('Failed to log user activity:', error);
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setLoading(true);

        if (!isAuthLoaded || !isUserLoaded) {
          return;
        }

        if (isSignedIn) {
          await syncClerkSession();
          return;
        }

        const restored = await restoreStoredSession();
        if (!restored) {
          clientStorage.clearSession();
          setUser(null);
        }
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [isAuthLoaded, isUserLoaded, isSignedIn, restoreStoredSession, syncClerkSession]);
  
  // Handle changes to localStorage (for multi-tab support)
  const handleStorageChange = (event: StorageEvent) => {
    if (event.key === 'kadal:auth' && !event.newValue) {
      // Token was removed in another tab
      setUser(null);
    } else if (event.key === 'kadal:user' && event.newValue) {
      // User data was updated in another tab
      try {
        const userData = JSON.parse(event.newValue);
        const token = clientStorage.auth.getToken();
        if (token) {
          setUser({ ...userData, token });
        }
      } catch (e) {
        console.error('Error parsing user data from storage event:', e);
      }
    }
  };

  useEffect(() => {
    if (!isAuthLoaded || !isSignedIn) {
      return;
    }

    const intervalId = window.setInterval(async () => {
      await syncClerkSession();
    }, 60 * 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [isAuthLoaded, isSignedIn, syncClerkSession]);

  // Login with phone and password
  const login = async (identifier: string, password: string): Promise<{ success: boolean; message?: string }> => {
    try {
      const normalized = identifier.trim();
      const payload = await fetchJson<any>('/api/auth/login', {
        method: 'POST',
        body: normalized.includes('@')
          ? { email: normalized, password }
          : { phoneNumber: normalized.replace(/\D/g, '').slice(-10), password },
        authenticated: false,
      });

      const synced = await consumeAuthPayload(payload);
      if (!synced) {
        return { success: false, message: 'Signed in, but failed to sync your profile.' };
      }

      await logUserActivity({
        userId: clientStorage.user.get()?.id || clerkUser?.id || 'unknown',
        activityType: 'login',
        details: 'User logged in successfully',
        timestamp: new Date().toISOString(),
      });

      return {
        success: true,
        message: 'Welcome to Kadal Thunai! You have successfully logged in.',
      };
    } catch (error: any) {
      console.error('Login error:', error);
      const friendly = error?.errors?.[0]?.longMessage || error?.message || 'Login failed. Please try again.';
      return { 
        success: false, 
        message: friendly
      };
    }
  };

  // Register new user
  const register = async (name: string, email: string, phoneNumber: string, password: string): Promise<{ success: boolean; message?: string }> => {
    try {
      const payload = await fetchJson<any>('/api/auth/register', {
        method: 'POST',
        body: {
          name: name.trim(),
          email: email.trim().toLowerCase(),
          phoneNumber: phoneNumber.trim(),
          password,
        },
        authenticated: false,
      });

      const synced = await consumeAuthPayload(payload);
      if (!synced) {
        return { success: false, message: 'Account created, but profile sync failed.' };
      }

      await logUserActivity({
        userId: clientStorage.user.get()?.id || clerkUser?.id || 'unknown',
        activityType: 'login',
        details: 'User registered and logged in successfully',
        timestamp: new Date().toISOString(),
      });

      return { success: true, message: 'Registration successful! Welcome to Kadal Thunai.' };
    } catch (error: any) {
      console.error('Registration error:', error);
      return { 
        success: false, 
        message: error?.message || 'Registration failed. Please try again.'
      };
    }
  };

  const signInWithGoogle = async (): Promise<{ success: boolean; message?: string }> => {
    try {
      // redirectToSignIn works in both dev and production and never triggers
      // the Clerk "cannot render modal for signed-in user" warning.
      const currentUrl = typeof window !== 'undefined' ? window.location.href : '/';
      await clerk.redirectToSignIn({
        redirectUrl: currentUrl,
      });
      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        message: error?.errors?.[0]?.longMessage || error?.message || 'Google login failed. Please try again.',
      };
    }
  };

  const sendOtp = async (phoneNumber: string) => {
    return {
      success: false,
      message: 'OTP login has been removed. Please use Email/Password or Google login.',
      userExists: false,
      otpRequestId: null,
      expiresInSec: 0,
      retryAfterSec: 0,
    };
  };

  const loginWithOtp = async (
    phoneNumber: string,
    otp: string,
    userData?: { name?: string; email?: string },
    otpRequestId?: string | null
  ) => {
    return {
      success: false,
      message: 'OTP login has been removed. Please use Email/Password or Google login.',
    };
  };

  // Update user data
  const updateUser = async (userData: Partial<User>): Promise<{ success: boolean; message?: string }> => {
    try {
      if (!user) {
        return { success: false, message: 'Not authenticated' };
      }
      
      const data = await api.patch('/api/user/profile', userData);
      
      // Create updated user data by merging current user with new data
      const updatedUser = { ...user, ...data.user };
      
      // Update local state and localStorage
      setUser(updatedUser);
      clientStorage.user.set(updatedUser);
      
      // Log activity type based on what was updated
      const activityType = 
        userData.name ? 'name_change' : 
        userData.phoneNumber ? 'profile_update' : 'profile_update';
      
      const details = 
        userData.name ? `Name updated to ${userData.name}` : 
        userData.phoneNumber ? `Phone number updated` : 'Profile information updated';
      
      // Log activity
      await logUserActivity({
        userId: user.id!,
        activityType,
        details,
        timestamp: new Date().toISOString()
      });
      
      return { success: true, message: 'Profile updated successfully' };
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
      
      console.log('Updating user profile with data:', data);
      
      // Create a proper updated user object before any API calls
      const updatedUser = { ...user, ...data };
      
      // For profile updates, we'll update the user directly and simulate API call
      try {
        // Update local state and localStorage immediately for a responsive UI experience
        setUser(updatedUser);
        clientStorage.user.set(updatedUser);
        
        // Then try the API call
        const updatedData = await api.patch('/api/user/profile', data);
        console.log('API response for profile update:', updatedData);
        
        // If API returns different data, update again with server data
        if (updatedData && Object.keys(updatedData).length > 0) {
          const serverUpdatedUser = { ...user, ...data, ...updatedData };
          setUser(serverUpdatedUser);
          clientStorage.user.set(serverUpdatedUser);
          console.log('Updated user state with server data:', serverUpdatedUser);
        }
      } catch (apiError) {
        console.warn('API update failed, but local update was successful:', apiError);
        // We already updated locally, so we don't need to do it again
        // This ensures UI is responsive even when API fails
      }
      
      // Determine activity type
      let activityType: 'password_change' | 'name_change' | 'profile_update' = 'profile_update';
      let activityDetails = 'Profile information updated';
      
      if ('name' in data && data.name !== user.name) {
        activityType = 'name_change';
        activityDetails = `Name updated to ${data.name}`;
      } else if ('email' in data && data.email !== user.email) {
        activityType = 'profile_update';
        activityDetails = `Email updated to ${data.email}`;
      } else if ('phoneNumber' in data && data.phoneNumber !== user.phoneNumber) {
        activityType = 'profile_update';
        activityDetails = `Phone number updated to ${data.phoneNumber}`;
      } else if ('newPassword' in data) {
        activityType = 'password_change';
        activityDetails = 'Password updated successfully';
      }
      
      // Log the activity
      try {
        await logUserActivity({
          userId: user.id!,
          activityType,
          details: activityDetails,
          timestamp: new Date().toISOString()
        });
      } catch (logError) {
        console.warn('Failed to log activity:', logError);
      }
      
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
    if (user?.id) {
      // Log activity before clearing user data
      logUserActivity({
        userId: user.id,
        activityType: 'logout',
        details: 'User logged out',
        timestamp: new Date().toISOString()
      });
    }
    
    if (isSignedIn) {
      clerk.signOut().catch((error: unknown) => {
        console.error('Clerk sign out failed:', error);
      });
    }

    clientStorage.clearSession();
    setUser(null);
  };

  // Get auth token
  const getToken = async (): Promise<string> => {
    if (typeof window === 'undefined') return '';

    const storedToken = clientStorage.auth.getToken();
    if (storedToken) {
      return storedToken;
    }

    const refreshed = await refreshStoredSession();
    if (refreshed) {
      return clientStorage.auth.getToken() || '';
    }

    const clerkToken = await getClerkToken();
    if (clerkToken) {
      const cachedUser = clientStorage.user.get();
      if (cachedUser) {
        persistSession(clerkToken, cachedUser, null, 60);
      }
      return clerkToken;
    }

    return '';
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        signInWithGoogle,
        sendOtp,
        loginWithOtp,
        logout,
        updateUser,
        updateUserProfile,
        isAuthenticated: !!user,
        loading,
        getToken,
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
