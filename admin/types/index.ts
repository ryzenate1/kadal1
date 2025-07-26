// Global type definitions for Kadal Thunai Admin Panel

export interface User {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  role: string;
  createdAt: string;
  updatedAt: string;
  loyaltyPoints?: number;
  loyaltyTier?: 'bronze' | 'silver' | 'gold' | 'platinum';
  totalOrders?: number;
  totalSpent?: number;
  lastOrderDate?: string;
  customerTags?: string[];
  isActive?: boolean;
  joinedDate?: string;
}

export interface CustomerStats {
  totalCustomers: number;
  activeCustomers: number;
  trustedCustomers: number;
  dailyCustomers: number;
  vipCustomers: number;
}

export interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalUsers: number;
  pendingOrders: number;
  activeProducts: number;
  completedOrders: number;
  revenueGrowth: number;
  orderGrowth: number;
  conversionRate: number;
  averageOrderValue: number;
}

export interface RecentOrder {
  id: string;
  customer: string;
  amount: number;
  status: string;
  date: string;
  trackingId?: string;
}

export interface Order {
  id: string;
  userId: string;
  user?: UserInfo;
  addressId?: string;
  address?: {
    id: string;
    address: string;
    city?: string;
    state?: string;
    pincode?: string;
  };
  status: 'pending' | 'processing' | 'ready_for_pickup' | 'out_for_delivery' | 'delivered' | 'cancelled' | 'received' | 'packed' | 'shipped';
  totalAmount: number;
  paymentStatus: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded' | 'paid';
  paymentMethod?: string;
  createdAt: string;
  updatedAt: string;
  pointsEarned?: number;
  loyaltyPoints?: number;
  orderItems?: OrderItem[];
  trackingNumber?: string;
  estimatedDelivery?: string;
  trackingId?: string;
}

export interface UserInfo {
  id: string;
  name?: string;
  email: string;
  phoneNumber?: string;
}

export interface OrderStats {
  total: number;
  pending: number;
  processing: number;
  shipped: number;
  delivered: number;
  cancelled: number;
  totalRevenue: number;
  averageOrderValue: number;
}

export interface OrderItem {
  id: string;
  productName: string;
  quantity: number;
  price: number;
  image?: string;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
  category: string;
  images?: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  image?: string;
  order: number;
  isActive: boolean;
  type?: string;
  icon?: string;
}

export interface ApiStatus {
  server: 'connected' | 'disconnected' | 'checking';
  client: 'connected' | 'disconnected' | 'checking';
}

// Constants
export const CUSTOMER_TAGS = ['trusted', 'daily-customer', 'vip', 'new', 'inactive', 'high-value'] as const;
export const LOYALTY_TIERS = ['bronze', 'silver', 'gold', 'platinum'] as const;
export const USER_ROLES = ['admin', 'customer', 'moderator'] as const;
export const ORDER_STATUSES = ['received', 'processing', 'packed', 'shipped', 'delivered', 'cancelled'] as const;
export const PAYMENT_STATUSES = ['pending', 'paid', 'failed', 'refunded'] as const;

// API URLs
export const SERVER_API_URL = 'http://localhost:5001/api';
export const CLIENT_API_URL = 'http://localhost:3000/api';
