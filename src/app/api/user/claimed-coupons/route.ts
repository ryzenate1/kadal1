import { NextRequest, NextResponse } from 'next/server';
import { withTransaction } from '@/lib/server/database';
import { getRequestUser, resolveProfile } from '@/lib/server/requestUser';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
    const data = await withTransaction(async (client) => {
      const profile = await resolveProfile(client, getRequestUser(req));
      const rows = await client.query(
        `SELECT id, code, points_redeemed, discount_amount, expires_at, is_used, used_at, used_order_id, created_at
         FROM loyalty_claimed_coupons
         WHERE profile_id = $1
         ORDER BY created_at DESC`,
        [profile.id]
      );
      return rows.rows.map((row) => ({
        id: row.id,
        code: row.code,
        pointsRedeemed: Number(row.points_redeemed),
        discountAmount: Number(row.discount_amount),
        expiresAt: row.expires_at,
        isUsed: Boolean(row.is_used),
        usedAt: row.used_at,
        usedOrderId: row.used_order_id,
        createdAt: row.created_at,
      }));
    });

    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof Error && error.name === 'ACCOUNT_BLOCKED') {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error('Claimed coupons GET failed:', error);
    return NextResponse.json({ error: 'Failed to load claimed coupons' }, { status: 500 });
  }
}
