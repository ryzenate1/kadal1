import { NextRequest, NextResponse } from 'next/server';
import { withTransaction } from '@/lib/server/database';
import { requireAdmin } from '@/lib/server/adminGuard';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const unauthorized = requireAdmin(req);
  if (unauthorized) return unauthorized;

  try {
    const data = await withTransaction(async (client) => {
      const rows = await client.query(
        `SELECT c.id, c.code, c.points_redeemed, c.discount_amount, c.expires_at, c.is_used, c.used_at, c.created_at,
                p.id AS profile_id, p.name AS profile_name, p.email AS profile_email, p.phone_number AS profile_phone,
                o.order_number AS used_order_number
         FROM loyalty_claimed_coupons c
         INNER JOIN profiles p ON p.id = c.profile_id
         LEFT JOIN orders o ON o.id = c.used_order_id
         ORDER BY c.created_at DESC`
      );
      return rows.rows;
    });
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Failed to load claimed coupons' }, { status: 500 });
  }
}
