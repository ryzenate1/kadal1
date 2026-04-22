import { NextRequest, NextResponse } from 'next/server';
import { withTransaction } from '@/lib/server/database';
import { getRequestUser, resolveProfile } from '@/lib/server/requestUser';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
    const user = await withTransaction(async (client) => {
      const profile = await resolveProfile(client, getRequestUser(req));

      const stats = await client.query(
        `SELECT COUNT(*)::int AS total_orders, COALESCE(SUM(total_amount), 0)::numeric AS spent
         FROM orders WHERE profile_id = $1`,
        [profile.id]
      );

      const loyalty = await client.query(
        `SELECT
          COALESCE((SELECT SUM(points_earned) FROM orders WHERE profile_id = $1 AND status <> 'cancelled'), 0)::int AS earned,
          COALESCE((SELECT SUM(ABS(points)) FROM loyalty_activities WHERE profile_id = $1 AND type = 'redeemed'), 0)::int AS redeemed`,
        [profile.id]
      );

      const notif = await client.query(
        `SELECT notifications_enabled, profile_image, created_at FROM profiles WHERE id = $1`,
        [profile.id]
      );
      const profileRow = notif.rows[0];

      const row = stats.rows[0];
      const earned = Number(loyalty.rows[0]?.earned || 0);
      const redeemed = Number(loyalty.rows[0]?.redeemed || 0);
      const loyaltyPoints = Math.max(0, earned - redeemed);

      await client.query(
        `UPDATE profiles SET loyalty_points = $2, updated_at = NOW() WHERE id = $1`,
        [profile.id, loyaltyPoints]
      );

      return {
        id: profile.id,
        name: profile.name,
        email: profile.email,
        phoneNumber: profile.phone_number,
        profileImage: profileRow?.profile_image || null,
        memberSince: new Date(profileRow?.created_at || Date.now()).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        totalOrders: Number(row.total_orders || 0),
        savedAmount: Math.floor(Number(row.spent || 0) * 0.05),
        loyaltyPoints,
        notificationsEnabled: profileRow?.notifications_enabled ?? true,
        isActive: true,
      };
    });

    return NextResponse.json(user);
  } catch (error) {
    if (error instanceof Error && error.name === 'ACCOUNT_BLOCKED') {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error('Profile GET failed:', error);
    return NextResponse.json({ error: 'Failed to load profile' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();

    const updated = await withTransaction(async (client) => {
      const profile = await resolveProfile(client, getRequestUser(req));

      const result = await client.query(
        `UPDATE profiles
         SET
          name = COALESCE($2, name),
          email = COALESCE($3, email),
          phone_number = COALESCE($4, phone_number),
          profile_image = COALESCE($5, profile_image),
          updated_at = NOW()
         WHERE id = $1
         RETURNING id, name, email, phone_number, profile_image, loyalty_points, notifications_enabled, created_at`,
        [
          profile.id,
          body.name ?? null,
          body.email ?? null,
          body.phoneNumber ?? null,
          body.profileImage ?? null,
        ]
      );

      const row = result.rows[0];
      return {
        id: row.id,
        name: row.name,
        email: row.email,
        phoneNumber: row.phone_number,
        profileImage: row.profile_image,
        loyaltyPoints: Number(row.loyalty_points || 0),
        notificationsEnabled: !!row.notifications_enabled,
      };
    });

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof Error && error.name === 'ACCOUNT_BLOCKED') {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error('Profile PATCH failed:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
