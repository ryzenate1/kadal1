import { NextRequest, NextResponse } from 'next/server';
import { ensureSchema, db } from '@/lib/server/database';
import { requireAdmin } from '@/lib/server/adminGuard';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
    const unauthorized = requireAdmin(req);
    if (unauthorized) return unauthorized;

    await ensureSchema();

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || 'all';

    const ordersRes = await db.query(
      `
      SELECT
        o.*,
        p.id  AS profile_id,
        p.name AS profile_name,
        p.email AS profile_email,
        p.phone_number AS profile_phone_number
      FROM orders o
      JOIN profiles p ON p.id = o.profile_id
      WHERE ($1::text = 'all' OR o.status = $1::text)
      ORDER BY o.created_at DESC
      `,
      [status]
    );

    const orderRows = ordersRes.rows || [];
    const orderIds = orderRows.map((r) => r.id).filter(Boolean);

    const [itemsRes, eventsRes] = await Promise.all([
      orderIds.length
        ? db.query(
            `
            SELECT
              id,
              order_id,
              product_id,
              product_name,
              product_image,
              quantity,
              price,
              weight,
              created_at
            FROM order_items
            WHERE order_id = ANY($1::uuid[])
            ORDER BY created_at ASC
            `,
            [orderIds]
          )
        : Promise.resolve({ rows: [] as any[] }),
      orderIds.length
        ? db.query(
            `
            SELECT
              id,
              order_id,
              status,
              description,
              location,
              created_at
            FROM order_events
            WHERE order_id = ANY($1::uuid[])
            ORDER BY created_at ASC
            `,
            [orderIds]
          )
        : Promise.resolve({ rows: [] as any[] }),
    ]);

    const itemsByOrderId = new Map<string, any[]>();
    for (const it of itemsRes.rows || []) {
      const key = String(it.order_id);
      const arr = itemsByOrderId.get(key) || [];
      arr.push({
        id: it.id,
        orderId: it.order_id,
        productId: it.product_id,
        productName: it.product_name,
        productImage: it.product_image,
        quantity: Number(it.quantity || 0),
        price: Number(it.price || 0),
        weight: it.weight ?? null,
        createdAt: it.created_at,
      });
      itemsByOrderId.set(key, arr);
    }

    const eventsByOrderId = new Map<string, any[]>();
    for (const ev of eventsRes.rows || []) {
      const key = String(ev.order_id);
      const arr = eventsByOrderId.get(key) || [];
      arr.push({
        id: ev.id,
        orderId: ev.order_id,
        status: ev.status,
        description: ev.description,
        location: ev.location ?? null,
        createdAt: ev.created_at,
      });
      eventsByOrderId.set(key, arr);
    }

    const payload = orderRows.map((o) => ({
      id: o.id,
      orderNumber: o.order_number,
      profileId: o.profile_id,
      status: o.status,
      totalAmount: Number(o.total_amount || 0),
      paymentStatus: o.payment_status,
      paymentMethod: o.payment_method,
      trackingNumber: o.tracking_number ?? null,
      estimatedDelivery: o.estimated_delivery ?? null,
      shippingName: o.shipping_name,
      shippingPhone: o.shipping_phone ?? null,
      shippingAddress: o.shipping_address,
      shippingCity: o.shipping_city ?? null,
      shippingState: o.shipping_state ?? null,
      shippingPincode: o.shipping_pincode ?? null,
      deliverySlot: o.delivery_slot ?? null,
      pointsEarned: Number(o.points_earned || 0),
      processingVideoUrl: o.processing_video_url ?? null,
      deliveryPersonName: o.delivery_person_name ?? null,
      deliveryPersonPhone: o.delivery_person_phone ?? null,
      isDeliveryReached: o.is_delivery_reached ?? null,
      createdAt: o.created_at,
      updatedAt: o.updated_at,
      profile: {
        id: o.profile_id,
        name: o.profile_name,
        email: o.profile_email ?? null,
        phoneNumber: o.profile_phone_number ?? null,
      },
      items: itemsByOrderId.get(String(o.id)) || [],
      events: eventsByOrderId.get(String(o.id)) || [],
    }));

    return NextResponse.json(payload);
  } catch (error) {
    console.error('Admin orders GET failed:', error);
    return NextResponse.json({ error: 'Failed to load orders' }, { status: 500 });
  }
}
