import { NextRequest, NextResponse } from 'next/server';
import { getUserIdFromAuth } from '@/lib/apiUtils';

// Server API URL
const SERVER_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

interface RouteParams {
  params: Promise<{
    orderId: string;
  }>;
}

export async function PATCH(
  request: NextRequest,
  context: RouteParams
) {
  try {
    const params = await context.params;
    const { orderId } = params;
    const userId = await getUserIdFromAuth(request);

    if (!userId) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
    }

    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      );
    }

    const requestData = await request.json();
    const token = request.headers.get('Authorization') || `Bearer admin-test-token`;
    
    // Call the real backend to cancel the order
    const response = await fetch(`${SERVER_API_URL}/orders/${orderId}/cancel`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token
      },
      body: JSON.stringify({
        reason: requestData.reason || 'Cancelled by customer'
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: `Error: ${response.statusText}` }));
      throw new Error(errorData.message || `Failed to cancel order: ${response.status}`);
    }

    const result = await response.json();
    
    // Log the order cancellation in admin logs
    await fetch(`${SERVER_API_URL}/admin/logs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token
      },
      body: JSON.stringify({
        action: 'cancel_order',
        userId,
        orderId,
        details: `Order cancelled. Reason: ${requestData.reason || 'Not provided'}`
      })
    }).catch(err => console.error('Failed to log order cancellation:', err));

    return NextResponse.json({
      success: true,
      orderId,
      status: 'cancelled',
      message: 'Order has been cancelled successfully',
      refundStatus: 'initiated',
      estimatedRefundDays: 3,
      ...result
    });
  } catch (error) {
    console.error('Error cancelling order:', error);
    return NextResponse.json(
      { error: 'Failed to cancel order' },
      { status: 500 }
    );
  }
}
