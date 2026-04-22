import { NextRequest, NextResponse } from 'next/server';
import { withTransaction } from '@/lib/server/database';
import { getRequestUser, resolveProfile } from '@/lib/server/requestUser';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const points = Number(body?.points || 0);

    if (!Number.isFinite(points) || points <= 0) {
      return NextResponse.json({ error: 'points must be greater than zero' }, { status: 400 });
    }

    const payload = await withTransaction(async (client) => {
      const profile = await resolveProfile(client, getRequestUser(req));

      const earnedRow = await client.query(
        `SELECT COALESCE(SUM(points_earned), 0)::int AS earned
         FROM orders WHERE profile_id = $1 AND status <> 'cancelled'`,
        [profile.id]
      );

      const redeemedRow = await client.query(
        `SELECT COALESCE(SUM(ABS(points)), 0)::int AS redeemed
         FROM loyalty_activities
         WHERE profile_id = $1 AND type = 'redeemed'`,
        [profile.id]
      );

      const currentPoints = Number(earnedRow.rows[0]?.earned || 0) - Number(redeemedRow.rows[0]?.redeemed || 0);
      if (points > currentPoints) {
        return null;
      }

      await client.query(
        `INSERT INTO loyalty_activities (profile_id, type, points, description)
         VALUES ($1, 'redeemed', $2, $3)`,
        [profile.id, -Math.abs(points), `Redeemed ${points} points for one-time coupon`] 
      );

      const discountAmount = Math.max(1, Math.floor(points / 10));
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      const code = `LOYAL-${Math.random().toString(36).slice(2, 8).toUpperCase()}${String(Date.now()).slice(-3)}`;

      await client.query(
        `INSERT INTO loyalty_claimed_coupons
          (profile_id, code, points_redeemed, discount_amount, expires_at, is_used)
         VALUES ($1, $2, $3, $4, $5, FALSE)`,
        [profile.id, code, points, discountAmount, expiresAt.toISOString()]
      );

      const remaining = currentPoints - points;
      await client.query(
        `UPDATE profiles SET loyalty_points = $2, updated_at = NOW() WHERE id = $1`,
        [profile.id, remaining]
      );

      return {
        success: true,
        redeemedPoints: points,
        remainingPoints: remaining,
        coupon: {
          code,
          discountAmount,
          expiresAt: expiresAt.toISOString(),
          oneTimeUse: true,
        },
      };
    });

    if (!payload) {
      return NextResponse.json({ error: 'Insufficient loyalty points' }, { status: 400 });
    }

    return NextResponse.json(payload);
  } catch (error) {
    console.error('Loyalty redeem failed:', error);
    return NextResponse.json({ error: 'Failed to redeem loyalty points' }, { status: 500 });
  }
}
