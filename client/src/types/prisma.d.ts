// This file contains TypeScript types that match your Prisma models
// These should be kept in sync with your server's Prisma schema

declare namespace PrismaClient {
  interface User {
    id: string;
    name: string;
    email: string;
    phoneNumber: string;
    role: string;
    createdAt: Date;
    updatedAt: Date;
    loyaltyPoints: number;
    loyaltyTier: string;
  }

  interface Address {
    id: string;
    userId: string;
    name: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    isDefault: boolean;
  }


  interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    imageUrl: string;
    category: string;
    stock: number;
  }


  interface Order {
    id: string;
    userId: string;
    addressId: string | null;
    status: string;
    totalAmount: number;
    paymentStatus: string;
    paymentMethod: string | null;
    createdAt: Date;
    updatedAt: Date;
    pointsEarned: number;
  }


  interface OrderItem {
    id: string;
    orderId: string;
    productId: string;
    quantity: number;
    price: number;
  }


  interface PaymentMethod {
    id: string;
    userId: string;
    type: string;
    cardNumber: string | null;
    cardBrand: string | null;
    expiryDate: string | null;
    isDefault: boolean;
  }


  interface LoyaltyActivity {
    id: string;
    userId: string;
    points: number;
    type: string;
    description: string;
    createdAt: Date;
  }
}

export type { User, Address, Product, Order, OrderItem, PaymentMethod, LoyaltyActivity } from '@prisma/client';
