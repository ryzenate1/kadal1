import { NextRequest, NextResponse } from 'next/server';
import { withTransaction } from '@/lib/server/database';
import { getRequestUser, resolveProfile } from '@/lib/server/requestUser';

export const runtime = 'nodejs';

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

    const order = await withTransaction(async (client) => {
      const profile = await resolveProfile(client, requestUser);

      const orderResult = await client.query(
        `SELECT *
         FROM orders
         WHERE profile_id = $1
           AND (id::text = $2 OR order_number = $2 OR tracking_number = $2)
         LIMIT 1`,
        [profile.id, orderId]
      );

      const row = orderResult.rows[0];
      if (!row) {
        return null;
      }

      const items = await client.query(
        `SELECT id, product_id, product_name, product_image, quantity, price, weight
         FROM order_items
         WHERE order_id = $1
         ORDER BY created_at ASC`,
        [row.id]
      );

      return {
        id: row.id,
        orderNumber: row.order_number,
        status: row.status,
        totalAmount: Number(row.total_amount),
        paymentStatus: row.payment_status,
        paymentMethod: row.payment_method,
        trackingNumber: row.tracking_number,
        estimatedDelivery: row.estimated_delivery,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        pointsEarned: Number(row.points_earned || 0),
        deliverySlot: row.delivery_slot,
        address: {
          name: row.shipping_name,
          phone: row.shipping_phone,
          address: row.shipping_address,
          city: row.shipping_city,
          state: row.shipping_state,
          pincode: row.shipping_pincode,
        },
        items: items.rows.map((item) => ({
          id: item.id,
          productId: item.product_id,
          productName: item.product_name,
          productImage: item.product_image,
          quantity: Number(item.quantity),
          price: Number(item.price),
          weight: item.weight,
        })),
      };
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error('Order details GET failed:', error);
    return NextResponse.json({ error: 'Failed to load order details' }, { status: 500 });
  }
}
