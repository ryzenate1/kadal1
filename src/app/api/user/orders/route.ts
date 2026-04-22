import { NextRequest, NextResponse } from 'next/server';
import { withTransaction } from '@/lib/server/database';
import { getRequestUser, resolveProfile } from '@/lib/server/requestUser';

export const runtime = 'nodejs';

type OrderRow = {
  id: string;
  order_number: string;
  status: string;
  total_amount: number | string;
  payment_status: string;
  payment_method: string;
  tracking_number: string | null;
  estimated_delivery: string | null;
  created_at: string;
  updated_at: string;
  points_earned: number | string | null;
  shipping_name: string;
  shipping_address: string;
  shipping_city: string;
  shipping_state: string;
  shipping_pincode: string;
  processing_video_url: string | null;
  delivery_person_name: string | null;
  delivery_person_phone: string | null;
  is_delivery_reached: boolean | null;
};

type OrderItemRow = {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  product_image: string | null;
  quantity: number | string;
  price: number | string;
  weight: string | null;
};

type OrderItem = {
  id: string;
  productId: string | null;
  productName: string;
  productImage: string | null;
  quantity: number;
  price: number;
  weight: string | null;
};

export async function GET(req: NextRequest) {
  try {
    const orders = await withTransaction(async (client) => {
      const profile = await resolveProfile(client, getRequestUser(req));

      const orderRows = await client.query(
        `SELECT * FROM orders
         WHERE profile_id = $1
         ORDER BY created_at DESC`,
        [profile.id]
      );

      const orderIds = orderRows.rows.map((row: OrderRow) => row.id);
      if (!orderIds.length) {
        return [];
      }

      const itemRows = await client.query(
        `SELECT * FROM order_items WHERE order_id = ANY($1::uuid[]) ORDER BY created_at ASC`,
        [orderIds]
      );

      const itemsByOrder = new Map<string, OrderItem[]>();
      for (const item of itemRows.rows as OrderItemRow[]) {
        const current = itemsByOrder.get(item.order_id) || [];
        current.push({
          id: item.id,
          productId: item.product_id,
          productName: item.product_name,
          productImage: item.product_image,
          quantity: Number(item.quantity),
          price: Number(item.price),
          weight: item.weight,
        });
        itemsByOrder.set(item.order_id, current);
      }

      return orderRows.rows.map((order: OrderRow) => ({
        id: order.id,
        orderNumber: order.order_number,
        status: order.status,
        totalAmount: Number(order.total_amount),
        paymentStatus: order.payment_status,
        paymentMethod: order.payment_method,
        trackingNumber: order.tracking_number,
        estimatedDelivery: order.estimated_delivery,
        createdAt: order.created_at,
        updatedAt: order.updated_at,
        pointsEarned: Number(order.points_earned || 0),
        processingVideoUrl: order.processing_video_url,
        deliveryPersonName: order.delivery_person_name,
        deliveryPersonPhone: order.delivery_person_phone,
        isDeliveryReached: Boolean(order.is_delivery_reached),
        items: itemsByOrder.get(order.id) || [],
        address: {
          name: order.shipping_name,
          address: order.shipping_address,
          city: order.shipping_city,
          state: order.shipping_state,
          pincode: order.shipping_pincode,
        },
      }));
    });

    return NextResponse.json(orders);
  } catch (error) {
    if (error instanceof Error && error.name === 'ACCOUNT_BLOCKED') {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error('Orders GET failed:', error);
    return NextResponse.json({ error: 'Failed to load orders' }, { status: 500 });
  }
}
