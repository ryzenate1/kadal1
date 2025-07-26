import { NextResponse } from 'next/server';
import { createApiProxyHandler } from '@/lib/apiProxyUtils';

/**
 * Content API Handlers
 * Handles content management operations (list, create, update)
 */

// Get content data
export async function GET(request: Request) {
  return createApiProxyHandler('content', request);
}

// Create new content
export async function POST(request: Request) {
  return createApiProxyHandler('content', request);
}

// Update existing content
export async function PUT(request: Request) {
  return createApiProxyHandler('content', request);
}

// Delete content
export async function DELETE(request: Request) {
  return createApiProxyHandler('content', request);
}
