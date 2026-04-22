import { NextRequest, NextResponse } from 'next/server';
import { withTransaction } from '@/lib/server/database';
import { getRequestUser, resolveProfile } from '@/lib/server/requestUser';

export const runtime = 'nodejs';

type InvoiceItemRow = {
  product_name: string;
  quantity: number | string;
  price: number | string;
  weight: string | null;
};

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;

    const payload = await withTransaction(async (client) => {
      const profile = await resolveProfile(client, getRequestUser(req));

      const orderResult = await client.query(
        `SELECT * FROM orders WHERE (id::text = $1 OR order_number = $1) AND profile_id = $2 LIMIT 1`,
        [orderId, profile.id]
      );

      const order = orderResult.rows[0];
      if (!order) return null;

      const itemsResult = await client.query(
        `SELECT product_name, quantity, price, weight
         FROM order_items WHERE order_id = $1 ORDER BY created_at ASC`,
        [order.id]
      );

      const lines = [
        `Invoice for ${order.order_number}`,
        `Date: ${new Date(order.created_at).toLocaleString('en-IN')}`,
        `Status: ${order.status}`,
        `Payment: ${order.payment_method} (${order.payment_status})`,
        '',
        ...itemsResult.rows.map((it: InvoiceItemRow) => `${it.product_name} x${it.quantity} ${it.weight ? `(${it.weight})` : ''} - INR ${Number(it.price) * Number(it.quantity)}`),
        '',
        `Total: INR ${Number(order.total_amount)}`,
        `Ship To: ${order.shipping_name}, ${order.shipping_address}, ${order.shipping_city} - ${order.shipping_pincode}`,
      ].join('\n');

      return { lines, orderNumber: order.order_number };
    });

    if (!payload) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return new NextResponse(payload.lines, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Content-Disposition': `attachment; filename=invoice-${payload.orderNumber}.txt`,
      },
    });
  } catch (error) {
    console.error('Invoice generation failed:', error);
    return NextResponse.json({ error: 'Failed to generate invoice' }, { status: 500 });
  }
}
