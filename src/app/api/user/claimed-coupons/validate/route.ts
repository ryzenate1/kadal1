import { NextRequest, NextResponse } from 'next/server';
import { withTransaction } from '@/lib/server/database';
import { getRequestUser, resolveProfile } from '@/lib/server/requestUser';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { code?: string; subtotal?: number };
    const code = String(body.code || '').trim().toUpperCase();
    const subtotal = Number(body.subtotal || 0);

    if (!code) {
      return NextResponse.json({ error: 'Coupon code is required' }, { status: 400 });
    }

    const result = await withTransaction(async (client) => {
      const profile = await resolveProfile(client, getRequestUser(req));
      const row = await client.query(
        `SELECT id, code, discount_amount, expires_at, is_used
         FROM loyalty_claimed_coupons
         WHERE profile_id = $1 AND code = $2
         LIMIT 1`,
        [profile.id, code]
      );
      const coupon = row.rows[0];
      if (!coupon) return { error: 'Coupon not found', status: 404 as const };
      if (coupon.is_used) return { error: 'Coupon already used', status: 400 as const };
      if (new Date(coupon.expires_at).getTime() < Date.now()) {
        return { error: 'Coupon expired', status: 400 as const };
      }

      const discountAmount = Math.max(0, Number(coupon.discount_amount || 0));
      const appliedDiscount = Math.min(discountAmount, Math.max(0, subtotal));
      return {
        status: 200 as const,
        payload: {
          valid: true,
          code: coupon.code,
          discountAmount: appliedDiscount,
          expiresAt: coupon.expires_at,
          oneTimeUse: true,
        },
      };
    });

    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }
    return NextResponse.json(result.payload);
  } catch (error) {
    if (error instanceof Error && error.name === 'ACCOUNT_BLOCKED') {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error('Claimed coupon validate failed:', error);
    return NextResponse.json({ error: 'Failed to validate coupon' }, { status: 500 });
  }
}
