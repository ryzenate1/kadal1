import { NextResponse } from 'next/server';
import { createApiProxyHandler, createFallbackApiHandler } from '@/lib/apiProxyUtils';

/**
 * Users API Handlers
 * Handles user management operations (list, create, update)
 */

// Get all users/customers
export async function GET(request: Request) {
  // Try both users and admin/users endpoints with fallback
  return createFallbackApiHandler(
    ['users', 'admin/users'],
    request
  );
}

// Create new user
export async function POST(request: Request) {
  return createApiProxyHandler('admin/users', request);
}
