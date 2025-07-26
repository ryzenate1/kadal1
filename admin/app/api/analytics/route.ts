import { NextResponse } from 'next/server';
import { createApiProxyHandler } from '@/lib/apiProxyUtils';

/**
 * Analytics API Handler
 * Provides analytics data for the admin dashboard
 */
export async function GET(request: Request) {
  return createApiProxyHandler('analytics/dashboard', request);
}
