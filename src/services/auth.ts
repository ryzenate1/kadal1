import { api } from '@/lib/api';

// Define the API response types locally since we're having issues with the module
type UserProfile = {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  role: string;
  loyaltyPoints: number;
  loyaltyTier: string;
  defaultAddress?: any | null;
  addresses?: any[];
  createdAt: string;
  updatedAt: string;
};

type AuthResponse = {
  token: string;
  user: UserProfile;
};

type RegisterRequest = {
  name: string;
  email: string;
  phoneNumber: string;
  password: string;
};

class AuthService {
  // Login with phone number and password
  static async login(phoneNumber: string, password: string) {
    try {
      const response = await api.post<AuthResponse>('/auth/login', { phoneNumber, password });

      return {
        success: true,
        token: response.token,
        user: response.user,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed',
      };
    }
  }

  // Fetch user profile using token
  static async fetchUserProfile(token: string): Promise<UserProfile> {
    try {
      const response = await api.get<UserProfile>('/auth/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response;
    } catch (error: any) {
      console.error('Failed to fetch user profile:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch user profile');
    }
  }

  // Register a new user
  static async register(data: RegisterRequest) {
    try {
      const response = await api.post<AuthResponse>('/auth/register', data);

      return {
        success: true,
        user: response.user,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed',
      };
    }
  }

  // Send OTP to phone number
  static async sendOtp(phoneNumber: string) {
    try {
      const response = await api.post<{ userExists: boolean }>('/auth/send-otp', { phoneNumber });

      return {
        success: true,
        userExists: response.userExists,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to send OTP. Please try again.',
      };
    }
  }

  // Verify OTP and login/register
  static async verifyOtp(
    phoneNumber: string,
    otp: string,
    userData?: { name?: string; email?: string }
  ) {
    try {
      const response = await api.post<{
        token: string;
        user: UserProfile;
      }>('/auth/verify-otp', { phoneNumber, otp, ...userData });

      return {
        success: true,
        token: response.token,
        user: response.user,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'OTP verification failed. Please try again.',
      };
    }
  }

  // Get current user profile
  static async getProfile(token?: string) {
    try {
      const response = await api.get<{ user: UserProfile }>(
        '/users/profile',
        {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        }
      );

      return {
        success: true,
        user: response.user,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch user profile.',
      };
    }
  }

  // Update user profile
  static async updateProfile(
    data: Partial<UserProfile>,
    token?: string
  ) {
    try {
      const response = await api.put<{ user: UserProfile }>(
        '/users/profile',
        data,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        }
      );

      return {
        success: true,
        user: response.user,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update profile.',
      };
    }
  }

  // Logout (handled client-side)
  static logout() {
    // No API call needed as this is handled client-side
    return { success: true };
  }
}

export default AuthService;
