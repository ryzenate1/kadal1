import { NextRequest, NextResponse } from 'next/server';
import { withTransaction } from '@/lib/server/database';
import { getRequestUser, resolveProfile } from '@/lib/server/requestUser';

export const runtime = 'nodejs';

type UpdateBody = {
  quantities?: Record<string, number>;
};

function round2(value: number) {
  return Math.round(value * 100) / 100;
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;
    const body = (await req.json()) as UpdateBody;
    const quantities = body.quantities || {};
    const entries = Object.entries(quantities);

    if (entries.length === 0) {
      return NextResponse.json({ error: 'No quantity updates provided' }, { status: 400 });
    }

    const result = await withTransaction(async (client) => {
      const profile = await resolveProfile(client, getRequestUser(req));

      const orderResult = await client.query(
        `SELECT id, status, total_amount
         FROM orders
         WHERE (id::text = $1 OR order_number = $1) AND profile_id = $2
         LIMIT 1
         FOR UPDATE`,
        [orderId, profile.id]
      );
      const order = orderResult.rows[0];
      if (!order) {
        return { error: 'Order not found', status: 404 as const };
      }

      if (!['pending', 'confirmed'].includes(String(order.status))) {
        return { error: 'Quantity can be updated only for pending/confirmed orders', status: 400 as const };
      }

      const itemRows = await client.query(
        `SELECT id, quantity, price FROM order_items WHERE order_id = $1 FOR UPDATE`,
        [order.id]
      );
      const items = itemRows.rows;
      const itemMap = new Map(items.map((item) => [String(item.id), item]));

      let additionalAmount = 0;
      for (const [itemId, nextQtyRaw] of entries) {
        const item = itemMap.get(itemId);
        if (!item) {
          return { error: 'Invalid order item selected', status: 400 as const };
        }
        const nextQty = Number(nextQtyRaw);
        const currentQty = Number(item.quantity);
        if (!Number.isInteger(nextQty) || nextQty < currentQty || nextQty > 99) {
          return { error: 'Only quantity increase is allowed (max 99)', status: 400 as const };
        }
        additionalAmount += (nextQty - currentQty) * Number(item.price);
      }

      for (const [itemId, nextQtyRaw] of entries) {
        await client.query(`UPDATE order_items SET quantity = $2 WHERE id = $1`, [itemId, Number(nextQtyRaw)]);
      }

      const nextTotal = round2(Number(order.total_amount) + additionalAmount);
      await client.query(
        `UPDATE orders SET total_amount = $2, updated_at = NOW() WHERE id = $1`,
        [order.id, nextTotal]
      );

      await client.query(
        `INSERT INTO order_events (order_id, status, description, location)
         VALUES ($1, $2, $3, 'App')`,
        [order.id, order.status, `Order quantity updated. Additional amount: ₹${round2(additionalAmount).toFixed(0)}`]
      );

      return {
        status: 200 as const,
        payload: {
          success: true,
          additionalAmount: round2(additionalAmount),
          totalAmount: nextTotal,
        },
      };
    });

    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }
    return NextResponse.json(result.payload);
  } catch (error) {
    console.error('Update quantities failed:', error);
    return NextResponse.json({ error: 'Failed to update quantities' }, { status: 500 });
  }
}
