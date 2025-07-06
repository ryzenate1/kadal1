import { NextRequest, NextResponse } from 'next/server';
import { getUserIdFromAuth } from '@/lib/apiUtils';

const SERVER_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

// GET /api/user/orders/[orderId]/track
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ orderId: string }> }
) {
  const params = await context.params;
  const { orderId } = params;
  try {
    // Get the user ID from auth
    const userId = await getUserIdFromAuth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Fetch the order from the server API
    const response = await fetch(`${SERVER_API_URL}/orders/${orderId}`, {
      headers: {
        'Authorization': 'Bearer admin-token',
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: errorData.error || 'Failed to fetch order tracking' },
        { status: response.status }
      );
    }

    const orderData = await response.json();

    // Check if the order belongs to the authenticated user
    if (orderData.userId !== userId) {
      return NextResponse.json({ error: 'Unauthorized access to order' }, { status: 403 });
    }

    // Return tracking information
    return NextResponse.json({
      orderId: orderData.id,
      orderNumber: orderData.orderNumber,
      status: orderData.status,
      trackingNumber: orderData.trackingNumber,
      estimatedDelivery: orderData.estimatedDelivery,
      trackingHistory: orderData.trackingHistory,
      updatedAt: orderData.updatedAt,
    });
  } catch (error) {
    console.error('Error fetching order tracking:', error);
    return NextResponse.json(
      { error: 'Failed to fetch order tracking information' },
      { status: 500 }
    );
  }
}
