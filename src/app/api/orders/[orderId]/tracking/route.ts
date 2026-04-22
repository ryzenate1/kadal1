import { NextRequest, NextResponse } from 'next/server';
import { withTransaction } from '@/lib/server/database';
import { getRequestUser, resolveProfile } from '@/lib/server/requestUser';

export const runtime = 'nodejs';

type OrderItemRow = {
  id: string;
  product_id: string;
  product_name: string;
  product_image: string | null;
  quantity: number | string;
  price: number | string;
};

type OrderEventRow = {
  status: string;
  description: string;
  location: string | null;
  created_at: string;
};

function statusProgress(status: string) {
  const map: Record<string, number> = {
    pending: 10,
    confirmed: 25,
    processing: 50,
    shipped: 75,
    delivered: 100,
    cancelled: 0,
  };
  return map[status] ?? 0;
}

function estimateEtaMinutes(estimatedDelivery: string | null) {
  if (!estimatedDelivery) return 0;
  const diff = new Date(estimatedDelivery).getTime() - Date.now();
  return Math.max(0, Math.round(diff / 60000));
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;
    const requestUser = getRequestUser(req);

    if (!requestUser.id && !requestUser.accessToken) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const response = await withTransaction(async (client) => {
      const profile = await resolveProfile(client, requestUser);

      const orderResult = await client.query(
        `SELECT o.*, p.id AS profile_id, p.name AS profile_name, p.phone_number, p.email
         FROM orders o
         JOIN profiles p ON p.id = o.profile_id
         WHERE o.profile_id = $1
           AND (o.id::text = $2 OR o.order_number = $2 OR o.tracking_number = $2)
         LIMIT 1`,
        [profile.id, orderId]
      );

      if (!orderResult.rows[0]) {
        return null;
      }

      const order = orderResult.rows[0];

      const itemResult = await client.query(
        `SELECT id, product_id, product_name, product_image, quantity, price, weight
         FROM order_items WHERE order_id = $1 ORDER BY created_at ASC`,
        [order.id]
      );

      const eventsResult = await client.query(
        `SELECT status, description, location, created_at
         FROM order_events WHERE order_id = $1 ORDER BY created_at ASC`,
        [order.id]
      );

      return {
        order: {
          id: order.id,
          status: order.status,
          createdAt: order.created_at,
          estimatedDelivery: order.estimated_delivery,
          totalAmount: Number(order.total_amount),
          paymentMethod: order.payment_method,
          paymentStatus: order.payment_status,
          user: {
            id: order.profile_id,
            name: order.profile_name,
            phoneNumber: order.phone_number,
            email: order.email,
          },
          address: {
            id: order.id,
            address: order.shipping_address,
            city: order.shipping_city,
            state: order.shipping_state,
            pincode: order.shipping_pincode,
          },
          orderItems: itemResult.rows.map((it: OrderItemRow) => ({
            id: it.id,
            quantity: Number(it.quantity),
            price: Number(it.price),
            product: {
              id: it.product_id,
              name: it.product_name,
              imageUrl: it.product_image,
            },
          })),
        },
        tracking: {
          eta: estimateEtaMinutes(order.estimated_delivery),
          progressPercentage: statusProgress(order.status),
          currentStatus: order.status,
          locationUpdates: eventsResult.rows.map((ev: OrderEventRow) => ({
            status: ev.status,
            description: ev.description,
            timestamp: ev.created_at,
            metadata: ev.location ? { location: ev.location } : undefined,
          })),
        },
      };
    });

    if (!response) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json(response);
  } catch (error) {
    if (error instanceof Error && error.name === 'ACCOUNT_BLOCKED') {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error('Fetch tracking failed:', error);
    return NextResponse.json({ error: 'Failed to fetch tracking' }, { status: 500 });
  }
}
