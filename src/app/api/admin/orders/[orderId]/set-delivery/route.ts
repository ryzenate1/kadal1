import { NextRequest, NextResponse } from 'next/server';
import { withTransaction } from '@/lib/server/database';
import { requireAdmin } from '@/lib/server/adminGuard';

export const runtime = 'nodejs';

// PATCH /api/admin/orders/[orderId]/set-delivery
// Admin sets delivery person info and marks package as reached
// Body: { deliveryPersonName, deliveryPersonPhone, isDeliveryReached }
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const unauthorized = requireAdmin(req);
    if (unauthorized) return unauthorized;

    const { orderId } = await params;

    const body = await req.json();
    const { deliveryPersonName, deliveryPersonPhone, isDeliveryReached } = body;

    const result = await withTransaction(async (client) => {
      const orderRes = await client.query(
        `SELECT id, order_number FROM orders WHERE (id::text = $1::text OR order_number = $1::text) LIMIT 1 FOR UPDATE`,
        [orderId]
      );
      const order = orderRes.rows?.[0];
      if (!order) return { notFound: true as const };

      const nextName = deliveryPersonName ? String(deliveryPersonName) : null;
      const nextPhone = deliveryPersonPhone ? String(deliveryPersonPhone) : null;
      const nextReached = typeof isDeliveryReached === 'boolean' ? isDeliveryReached : null;

      await client.query(
        `
        UPDATE orders
        SET
          delivery_person_name = COALESCE($2::text, delivery_person_name),
          delivery_person_phone = COALESCE($3::text, delivery_person_phone),
          is_delivery_reached = COALESCE($4::boolean, is_delivery_reached),
          updated_at = NOW()
        WHERE id = $1::uuid
        `,
        [order.id, nextName, nextPhone, nextReached]
      );

      if (nextReached === true) {
        await client.query(
          `
          INSERT INTO order_events (order_id, status, description, location)
          VALUES ($1::uuid, 'shipped', $2::text, $3::text)
          `,
          [order.id, 'Delivery partner has reached your location', 'Near your address']
        );
      }

      const updatedRes = await client.query(
        `
        SELECT
          order_number,
          delivery_person_name,
          delivery_person_phone,
          is_delivery_reached
        FROM orders
        WHERE id = $1::uuid
        LIMIT 1
        `,
        [order.id]
      );

      const updated = updatedRes.rows?.[0];
      return {
        orderNumber: updated.order_number as string,
        deliveryPersonName: (updated.delivery_person_name ?? null) as string | null,
        deliveryPersonPhone: (updated.delivery_person_phone ?? null) as string | null,
        isDeliveryReached: (updated.is_delivery_reached ?? false) as boolean,
      };
    });

    if ((result as any)?.notFound) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

    return NextResponse.json({
      success: true,
      orderNumber: (result as any).orderNumber,
      deliveryPersonName: (result as any).deliveryPersonName,
      deliveryPersonPhone: (result as any).deliveryPersonPhone,
      isDeliveryReached: (result as any).isDeliveryReached,
    });
  } catch (error) {
    console.error('Set delivery failed:', error);
    return NextResponse.json({ error: 'Failed to update delivery info' }, { status: 500 });
  }
}
