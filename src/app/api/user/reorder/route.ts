import { NextRequest, NextResponse } from 'next/server';
import { withTransaction } from '@/lib/server/database';
import { getRequestUser, resolveProfile } from '@/lib/server/requestUser';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const orderId = body.orderId as string;

    if (!orderId) {
      return NextResponse.json({ error: 'orderId is required' }, { status: 400 });
    }

    const result = await withTransaction(async (client) => {
      const profile = await resolveProfile(client, getRequestUser(req));

      const sourceOrder = await client.query(
        `SELECT * FROM orders
         WHERE (id::text = $1 OR order_number = $1) AND profile_id = $2
         LIMIT 1`,
        [orderId, profile.id]
      );

      if (!sourceOrder.rows[0]) return null;
      const src = sourceOrder.rows[0];

      const sourceItems = await client.query(
        `SELECT * FROM order_items WHERE order_id = $1 ORDER BY created_at ASC`,
        [src.id]
      );

      const now = Date.now();
      const orderNumber = `KT${now}`;
      const trackingNumber = `TRK${String(now).slice(-8)}`;

      const created = await client.query(
        `INSERT INTO orders (
          order_number, profile_id, status, total_amount, payment_status, payment_method,
          tracking_number, estimated_delivery, shipping_name, shipping_phone,
          shipping_address, shipping_city, shipping_state, shipping_pincode,
          points_earned
        ) VALUES (
          $1, $2, 'confirmed', $3, 'pending', $4,
          $5, $6, $7, $8,
          $9, $10, $11, $12,
          $13
        ) RETURNING id, order_number`,
        [
          orderNumber,
          profile.id,
          src.total_amount,
          src.payment_method,
          trackingNumber,
          new Date(now + 45 * 60 * 1000).toISOString(),
          src.shipping_name,
          src.shipping_phone,
          src.shipping_address,
          src.shipping_city,
          src.shipping_state,
          src.shipping_pincode,
          Math.floor(Number(src.total_amount) / 20),
        ]
      );

      for (const item of sourceItems.rows) {
        await client.query(
          `INSERT INTO order_items (order_id, product_id, product_name, product_image, quantity, price, weight)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [created.rows[0].id, item.product_id, item.product_name, item.product_image, item.quantity, item.price, item.weight]
        );
      }

      await client.query(
        `INSERT INTO order_events (order_id, status, description, location)
         VALUES ($1, 'confirmed', 'Reorder created', 'App')`,
        [created.rows[0].id]
      );

      return created.rows[0];
    });

    if (!result) {
      return NextResponse.json({ error: 'Original order not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, newOrderId: result.order_number });
  } catch (error) {
    console.error('Reorder failed:', error);
    return NextResponse.json({ error: 'Failed to create reorder' }, { status: 500 });
  }
}
