// API Response Types
export {};

declare global {
  namespace API {
    // Base response type
    interface BaseResponse<T = any> {
      success: boolean;
      data?: T;
      error?: string;
      message?: string;
    }

    // User related interfaces
    interface UserProfile {
      id: string;
      name: string;
      email: string;
      phoneNumber: string;
      role: string;
      loyaltyPoints: number;
      loyaltyTier: string;
      defaultAddress?: Address | null;
      addresses?: Address[];
      createdAt: string;
      updatedAt: string;
    }

    interface Address {
      id: string;
      userId: string;
      name: string;
      address: string;
      locality?: string;
      landmark?: string;
      city: string;
      state: string;
      pincode: string;
      isDefault: boolean;
      createdAt: string;
      updatedAt: string;
    }

    // Product related interfaces
    interface Product {
      id: string;
      name: string;
      description: string;
      price: number;
      originalPrice: number;
      discount: number;
      imageUrl: string;
      images: string[];
      category: string;
      subCategory?: string;
      tags: string[];
      stock: number;
      unit: string;
      minOrder: number;
      isFeatured: boolean;
      isAvailable: boolean;
      rating: number;
      numReviews: number;
      seller: Seller;
      specifications: Record<string, string>;
      createdAt: string;
      updatedAt: string;
    }

    interface Seller {
      id: string;
      name: string;
      rating: number;
      totalSales: number;
    }

    // Order related interfaces
    interface Order {
      id: string;
      orderNumber: string;
      userId: string;
      items: OrderItem[];
      totalAmount: number;
      discount: number;
      deliveryFee: number;
      tax: number;
      finalAmount: number;
      shippingAddress: Address;
      paymentMethod: string;
      paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
      orderStatus: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
      trackingNumber?: string;
      expectedDelivery?: string;
      deliveredAt?: string;
      cancelledAt?: string;
      cancellationReason?: string;
      createdAt: string;
      updatedAt: string;
    }

    interface OrderItem {
      productId: string;
      name: string;
      imageUrl: string;
      price: number;
      quantity: number;
      totalPrice: number;
    }

    // Cart related interfaces
    interface Cart {
      items: CartItem[];
      subtotal: number;
      discount: number;
      deliveryFee: number;
      tax: number;
      total: number;
      couponCode?: string;
      couponDiscount?: number;
    }

    interface CartItem {
      productId: string;
      name: string;
      imageUrl: string;
      price: number;
      quantity: number;
      maxQuantity: number;
      totalPrice: number;
    }

    // Auth related interfaces
    interface LoginRequest {
      phoneNumber: string;
      password: string;
    }

    interface RegisterRequest {
      name: string;
      email: string;
      phoneNumber: string;
      password: string;
    }

    interface VerifyOtpRequest {
      phoneNumber: string;
      otp: string;
    }

    interface ResetPasswordRequest {
      token: string;
      newPassword: string;
    }

    interface AuthResponse {
      token: string;
      user: UserProfile;
    }

    // API Response types
    interface ApiResponse<T = any> {
      success: boolean;
      data?: T;
      error?: string;
      message?: string;
    }

    // Pagination
    interface PaginatedResponse<T> {
      items: T[];
      total: number;
      page: number;
      limit: number;
      totalPages: number;
      hasNext: boolean;
      hasPrevious: boolean;
    }

    // Search
    interface SearchParams {
      query: string;
      category?: string;
      minPrice?: number;
      maxPrice?: number;
      sortBy?: 'price' | 'rating' | 'newest' | 'popularity';
      sortOrder?: 'asc' | 'desc';
      page?: number;
      limit?: number;
    }

    // Reviews
    interface Review {
      id: string;
      userId: string;
      userName: string;
      userAvatar?: string;
      rating: number;
      comment: string;
      images?: string[];
      createdAt: string;
      updatedAt: string;
    }

    // Notifications
    interface Notification {
      id: string;
      userId: string;
      title: string;
      message: string;
      type: 'order' | 'promotion' | 'system' | 'alert';
      isRead: boolean;
      data?: Record<string, any>;
      createdAt: string;
    }

    // Loyalty
    interface LoyaltyTier {
      name: string;
      minPoints: number;
      discount: number;
      benefits: string[];
    }

    interface LoyaltyPoints {
      currentPoints: number;
      totalEarned: number;
      totalRedeemed: number;
      nextTier: LoyaltyTier;
      pointsToNextTier: number;
    }

    // Address
    interface AddressInput {
      name: string;
      address: string;
      locality?: string;
      landmark?: string;
      city: string;
      state: string;
      pincode: string;
      isDefault?: boolean;
    }

    // Payment
    interface PaymentMethod {
      id: string;
      type: 'card' | 'netbanking' | 'upi' | 'wallet' | 'cod';
      last4?: string;
      name?: string;
      bank?: string;
      isDefault: boolean;
    }

    interface CreatePaymentIntentRequest {
      amount: number;
      currency?: string;
      paymentMethodId?: string;
      savePaymentMethod?: boolean;
    }

    interface CreatePaymentIntentResponse {
      clientSecret: string;
      paymentIntentId: string;
      requiresAction: boolean;
      paymentMethodTypes: string[];
    }

    // Wishlist
    interface WishlistItem {
      productId: string;
      name: string;
      imageUrl: string;
      price: number;
      originalPrice: number;
      discount: number;
      inStock: boolean;
      addedAt: string;
    }

    // Coupons
    interface Coupon {
      code: string;
      description: string;
      discountType: 'percentage' | 'fixed';
      discountValue: number;
      minOrderAmount?: number;
      maxDiscountAmount?: number;
      validFrom: string;
      validUntil: string;
      isActive: boolean;
      usageLimit?: number;
      usedCount: number;
      categories?: string[];
      products?: string[];
      isSingleUse: boolean;
      isNewUserOnly: boolean;
    }

    // Delivery
    interface DeliverySlot {
      date: string;
      timeSlots: {
        start: string;
        end: string;
        available: boolean;
      }[];
    }

    interface CheckDeliveryRequest {
      pincode: string;
      items: Array<{
        productId: string;
        quantity: number;
      }>;
    }

    interface CheckDeliveryResponse {
      isDeliverable: boolean;
      estimatedDelivery?: string;
      deliveryFee: number;
      minOrderForFreeDelivery?: number;
      message?: string;
    }
  }
}

export {};
