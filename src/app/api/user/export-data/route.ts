import { NextRequest, NextResponse } from 'next/server';
import { withTransaction } from '@/lib/server/database';
import { getRequestUser, resolveProfile } from '@/lib/server/requestUser';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
    const result = await withTransaction(async (client) => {
      const profile = await resolveProfile(client, getRequestUser(req));

      const orders = await client.query(
        `SELECT id, order_number, status, total_amount, payment_status, payment_method, created_at
         FROM orders WHERE profile_id = $1 ORDER BY created_at DESC`,
        [profile.id]
      );

      return {
        profile,
        orders: orders.rows,
        exportedAt: new Date().toISOString(),
      };
    });

    return NextResponse.json(result, {
      headers: {
        'Content-Disposition': `attachment; filename=kadal-export-${Date.now()}.json`,
      },
    });
  } catch (error) {
    console.error('Export failed:', error);
    return NextResponse.json({ error: 'Failed to export data' }, { status: 500 });
  }
}
