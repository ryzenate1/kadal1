import { NextResponse } from 'next/server';
import { createApiProxyHandler, createFallbackApiHandler } from '@/lib/apiProxyUtils';

/**
 * Dashboard Stats API Handler
 * Fetches dashboard statistics from the server API
 */
export async function GET(request: Request) {
  // Try multiple endpoints with fallback for better reliability
  return createFallbackApiHandler(
    ['dashboard/stats', 'analytics/dashboard', 'stats/dashboard'],
    request
  );
}
