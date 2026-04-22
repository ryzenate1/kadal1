import { NextRequest, NextResponse } from 'next/server';
import { withTransaction } from '@/lib/server/database';
import { getRequestUser, resolveProfile } from '@/lib/server/requestUser';

export const runtime = 'nodejs';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;
    let body: { reason?: string; cancelNote?: string } = {};
    try { body = await req.json(); } catch { /* no body is fine */ }

    const reason = body.reason || 'No reason provided';
    const cancelNote = body.cancelNote || '';

    const result = await withTransaction(async (client) => {
      const profile = await resolveProfile(client, getRequestUser(req));

      const updated = await client.query(
        `UPDATE orders
         SET status = 'cancelled', updated_at = NOW(),
             cancel_reason = $3, cancel_note = $4
         WHERE (id::text = $1 OR order_number = $1) AND profile_id = $2
         RETURNING id, order_number`,
        [orderId, profile.id, reason, cancelNote]
      );

      if (!updated.rows[0]) {
        return null;
      }

      await client.query(
        `INSERT INTO order_events (order_id, status, description, location)
         VALUES ($1, 'cancelled', $2, 'App')
         ON CONFLICT DO NOTHING`,
        [updated.rows[0].id, `Order cancelled: ${reason}${cancelNote ? ` - ${cancelNote}` : ''}`]
      );

      return updated.rows[0];
    });

    if (!result) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, orderNumber: result.order_number });
  } catch (error) {
    console.error('Cancel order failed:', error);
    return NextResponse.json({ error: 'Failed to cancel order' }, { status: 500 });
  }
}
