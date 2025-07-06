import { NextRequest, NextResponse } from 'next/server';
import { getUserIdFromAuth } from '@/lib/apiUtils';

// Server API URL
const SERVER_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

// GET /api/user/orders - Get all orders for a user
export async function GET(request: NextRequest) {
  try {    // Get userId from auth token
    const userId = await getUserIdFromAuth(request);
    
    if (!userId) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
    }
    
    // Use a fixed token for now (this would normally come from the request)
    const token = 'admin-test-token';
    
    const response = await fetch(`${SERVER_API_URL}/orders/user/${userId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      cache: 'no-store'
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: `Error: ${response.statusText}` }));
      throw new Error(errorData.message || `Failed to fetch orders: ${response.status}`);
    }
    
    const orders = await response.json();
    
    // If no orders, return mock data for testing
    if (orders.length === 0) {
      return NextResponse.json([
        {
          id: "ord_001",
          orderNumber: "KT2025001",
          status: "delivered",
          totalAmount: 899,
          paymentStatus: "paid",
          paymentMethod: "UPI",
          trackingNumber: "TRK123456789",
          estimatedDelivery: "2025-06-10",
          createdAt: "2025-06-08T10:30:00Z",
          updatedAt: "2025-06-10T15:45:00Z",
          pointsEarned: 45,
          items: [
            {
              id: "item_001",
              productId: "prod_001",
              productName: "Fresh Pomfret",
              productImage: "/images/fish/pomfret.jpg",
              quantity: 1,
              price: 549,
              weight: "500g"
            },
            {
              id: "item_002",
              productId: "prod_002",
              productName: "King Fish Steaks",
              productImage: "/images/fish/kingfish.jpg",
              quantity: 1,
              price: 350,
              weight: "300g"
            }
          ],
          address: {
            name: "Test User",
            address: "123 Main Street, Apartment 4B",
            city: "Chennai",
            state: "Tamil Nadu",
            pincode: "600001"
          },
          trackingHistory: [
            {
              status: "delivered",
              description: "Order delivered successfully",
              timestamp: "2025-06-10T15:45:00Z"
            },
            {
              status: "shipped",
              description: "Order has been shipped with courier",
              timestamp: "2025-06-09T10:15:00Z"
            },
            {
              status: "processing",
              description: "Order is being prepared for shipping",
              timestamp: "2025-06-08T14:30:00Z"
            },
            {
              status: "confirmed",
              description: "Order has been confirmed",
              timestamp: "2025-06-08T11:20:00Z"
            },
            {
              status: "pending",
              description: "Order received",
              timestamp: "2025-06-08T10:30:00Z"
            }
          ]
        }
      ]);
    }
    
    return NextResponse.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

// POST /api/user/orders - Create a new order
export async function POST(request: NextRequest) {
  try {
    const userId = await getUserIdFromAuth(request);
    
    if (!userId) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });    }
    
    const data = await request.json();
    const token = 'admin-test-token';
    
    // Create real order on the server
    const response = await fetch(`${SERVER_API_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        ...data,
        userId
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: `Error: ${response.statusText}` }));
      throw new Error(errorData.message || `Failed to create order: ${response.status}`);
    }
    
    const result = await response.json();
    
    // Log the order creation in admin logs
    await fetch(`${SERVER_API_URL}/admin/logs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        action: 'create_order',
        userId,
        orderId: result.order.id,
        details: 'New order created'
      })
    }).catch(err => console.error('Failed to log order creation:', err));
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}
