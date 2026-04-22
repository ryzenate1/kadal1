import { NextRequest, NextResponse } from 'next/server';
import { withTransaction } from '@/lib/server/database';
import { getRequestUser, resolveProfile } from '@/lib/server/requestUser';

export const runtime = 'nodejs';

type LoyaltyActivityRow = {
  id: string;
  type: 'earned' | 'redeemed' | 'expired';
  points: number;
  description: string;
  order_id: string | null;
  created_at: string;
};

function resolveTier(points: number) {
  if (points >= 3000) return { currentTier: 'Platinum', nextTier: null, pointsToNextTier: 0 };
  if (points >= 1500) return { currentTier: 'Gold', nextTier: 'Platinum', pointsToNextTier: 3000 - points };
  if (points >= 500) return { currentTier: 'Silver', nextTier: 'Gold', pointsToNextTier: 1500 - points };
  return { currentTier: 'Bronze', nextTier: 'Silver', pointsToNextTier: 500 - points };
}

export async function GET(req: NextRequest) {
  try {
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

      const activities = await client.query(
        `SELECT id, type, points, description, order_id, created_at
         FROM loyalty_activities
         WHERE profile_id = $1
         ORDER BY created_at DESC
         LIMIT 40`,
        [profile.id]
      );

      const totalEarned = Number(earnedRow.rows[0]?.earned || 0);
      const totalRedeemed = Number(redeemedRow.rows[0]?.redeemed || 0);
      const currentPoints = Math.max(0, totalEarned - totalRedeemed);
      const tier = resolveTier(currentPoints);

      await client.query(
        `UPDATE profiles SET loyalty_points = $2, updated_at = NOW() WHERE id = $1`,
        [profile.id, currentPoints]
      );

      return {
        summary: {
          currentPoints,
          totalEarned,
          totalRedeemed,
          currentTier: tier.currentTier,
          nextTier: tier.nextTier,
          pointsToNextTier: tier.pointsToNextTier,
        },
        activities: activities.rows.map((row: LoyaltyActivityRow) => ({
          id: row.id,
          type: row.type,
          points: Number(row.points),
          description: row.description,
          createdAt: row.created_at,
          orderId: row.order_id || undefined,
        })),
      };
    });

    return NextResponse.json(payload);
  } catch (error) {
    console.error('Loyalty GET failed:', error);
    return NextResponse.json({ error: 'Failed to load loyalty data' }, { status: 500 });
  }
}
