import { NextRequest, NextResponse } from 'next/server';
import { ensureSchema, withTransaction, db } from '@/lib/server/database';
import { requireAdmin } from '@/lib/server/adminGuard';

export const runtime = 'nodejs';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const unauthorized = requireAdmin(req);
    if (unauthorized) return unauthorized;

    await ensureSchema();
    const { orderId } = await params;

    const orderRes = await db.query(
      `
      SELECT
        o.*,
        p.id  AS profile_id,
        p.name AS profile_name,
        p.email AS profile_email,
        p.phone_number AS profile_phone_number
      FROM orders o
      JOIN profiles p ON p.id = o.profile_id
      WHERE (o.id::text = $1::text OR o.order_number = $1::text)
      LIMIT 1
      `,
      [orderId]
    );

    const o = orderRes.rows?.[0];
    if (!o) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const [itemsRes, eventsRes] = await Promise.all([
      db.query(
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
        WHERE order_id = $1::uuid
        ORDER BY created_at ASC
        `,
        [o.id]
      ),
      db.query(
        `
        SELECT
          id,
          order_id,
          status,
          description,
          location,
          created_at
        FROM order_events
        WHERE order_id = $1::uuid
        ORDER BY created_at ASC
        `,
        [o.id]
      ),
    ]);

    const payload = {
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
      items: (itemsRes.rows || []).map((it) => ({
        id: it.id,
        orderId: it.order_id,
        productId: it.product_id,
        productName: it.product_name,
        productImage: it.product_image,
        quantity: Number(it.quantity || 0),
        price: Number(it.price || 0),
        weight: it.weight ?? null,
        createdAt: it.created_at,
      })),
      events: (eventsRes.rows || []).map((ev) => ({
        id: ev.id,
        orderId: ev.order_id,
        status: ev.status,
        description: ev.description,
        location: ev.location ?? null,
        createdAt: ev.created_at,
      })),
    };

    return NextResponse.json(payload);
  } catch (error) {
    console.error('Admin order GET failed:', error);
    return NextResponse.json({ error: 'Failed to load order' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const unauthorized = requireAdmin(req);
    if (unauthorized) return unauthorized;

    const { orderId } = await params;
    const body = await req.json();

    const result = await withTransaction(async (client) => {
      const existingRes = await client.query(
        `SELECT id, status FROM orders WHERE (id::text = $1::text OR order_number = $1::text) LIMIT 1 FOR UPDATE`,
        [orderId]
      );
      const existing = existingRes.rows?.[0];
      if (!existing) {
        return { notFound: true as const };
      }

      const nextStatus = body.status ? String(body.status) : null;
      const nextPaymentStatus = body.paymentStatus ? String(body.paymentStatus) : null;
      const nextEstimatedDelivery = body.estimatedDelivery ? new Date(body.estimatedDelivery) : null;
      const nextDeliverySlot = body.deliverySlot ? String(body.deliverySlot) : null;
      const nextDeliveryPersonName = body.deliveryPersonName ? String(body.deliveryPersonName) : null;
      const nextDeliveryPersonPhone = body.deliveryPersonPhone ? String(body.deliveryPersonPhone) : null;
      const nextIsDeliveryReached =
        typeof body.isDeliveryReached === 'boolean' ? body.isDeliveryReached : null;

      await client.query(
        `
        UPDATE orders
        SET
          status = COALESCE($2::text, status),
          payment_status = COALESCE($3::text, payment_status),
          estimated_delivery = COALESCE($4::timestamptz, estimated_delivery),
          delivery_slot = COALESCE($5::text, delivery_slot),
          delivery_person_name = COALESCE($6::text, delivery_person_name),
          delivery_person_phone = COALESCE($7::text, delivery_person_phone),
          is_delivery_reached = COALESCE($8::boolean, is_delivery_reached),
          updated_at = NOW()
        WHERE id = $1::uuid
        `,
        [
          existing.id,
          nextStatus,
          nextPaymentStatus,
          nextEstimatedDelivery ? nextEstimatedDelivery.toISOString() : null,
          nextDeliverySlot,
          nextDeliveryPersonName,
          nextDeliveryPersonPhone,
          nextIsDeliveryReached,
        ]
      );

      if (nextStatus && nextStatus !== String(existing.status)) {
        await client.query(
          `
          INSERT INTO order_events (order_id, status, description, location)
          VALUES ($1::uuid, $2::text, $3::text, $4::text)
          `,
          [
            existing.id,
            nextStatus,
            `Order status updated to ${nextStatus}`,
            nextStatus === 'shipped' ? 'Out for delivery' : null,
          ]
        );
      }

      const orderRes = await client.query(
        `
        SELECT
          o.*,
          p.id  AS profile_id,
          p.name AS profile_name,
          p.email AS profile_email,
          p.phone_number AS profile_phone_number
        FROM orders o
        JOIN profiles p ON p.id = o.profile_id
        WHERE o.id = $1::uuid
        LIMIT 1
        `,
        [existing.id]
      );
      const o = orderRes.rows?.[0];

      const [itemsRes, eventsRes] = await Promise.all([
        client.query(
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
          WHERE order_id = $1::uuid
          ORDER BY created_at ASC
          `,
          [existing.id]
        ),
        client.query(
          `
          SELECT
            id,
            order_id,
            status,
            description,
            location,
            created_at
          FROM order_events
          WHERE order_id = $1::uuid
          ORDER BY created_at ASC
          `,
          [existing.id]
        ),
      ]);

      return {
        order: {
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
          items: (itemsRes.rows || []).map((it) => ({
            id: it.id,
            orderId: it.order_id,
            productId: it.product_id,
            productName: it.product_name,
            productImage: it.product_image,
            quantity: Number(it.quantity || 0),
            price: Number(it.price || 0),
            weight: it.weight ?? null,
            createdAt: it.created_at,
          })),
          events: (eventsRes.rows || []).map((ev) => ({
            id: ev.id,
            orderId: ev.order_id,
            status: ev.status,
            description: ev.description,
            location: ev.location ?? null,
            createdAt: ev.created_at,
          })),
        },
      };
    });

    if ((result as any)?.notFound) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json((result as any).order);
  } catch (error) {
    console.error('Admin order PATCH failed:', error);
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}
