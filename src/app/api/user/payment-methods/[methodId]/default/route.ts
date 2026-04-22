import { NextRequest, NextResponse } from 'next/server';
import { withTransaction } from '@/lib/server/database';
import { getRequestUser, resolveProfile } from '@/lib/server/requestUser';

export const runtime = 'nodejs';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ methodId: string }> }
) {
  try {
    const { methodId } = await params;

    const updated = await withTransaction(async (client) => {
      const profile = await resolveProfile(client, getRequestUser(req));

      const existing = await client.query(
        `SELECT id FROM payment_methods WHERE id = $1 AND profile_id = $2 LIMIT 1`,
        [methodId, profile.id]
      );

      if (!existing.rows[0]) {
        throw new Error('Payment method not found');
      }

      await client.query(`UPDATE payment_methods SET is_default = FALSE WHERE profile_id = $1`, [profile.id]);
      const result = await client.query(
        `UPDATE payment_methods
         SET is_default = TRUE, updated_at = NOW()
         WHERE id = $1 AND profile_id = $2
         RETURNING id, is_default`,
        [methodId, profile.id]
      );

      return result.rows[0];
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Payment method default POST failed:', error);
    const message = error instanceof Error ? error.message : 'Failed to update default payment method';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
