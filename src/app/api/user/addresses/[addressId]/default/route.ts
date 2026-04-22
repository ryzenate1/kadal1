import { NextRequest, NextResponse } from 'next/server';
import { withTransaction } from '@/lib/server/database';
import { getRequestUser, resolveProfile } from '@/lib/server/requestUser';

export const runtime = 'nodejs';

function isAuthenticatedRequest(req: NextRequest) {
  const reqUser = getRequestUser(req);
  return Boolean(reqUser.id || reqUser.authUserId || reqUser.email || reqUser.accessToken);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ addressId: string }> }
) {
  try {
    if (!isAuthenticatedRequest(req)) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { addressId } = await params;

    const payload = await withTransaction(async (client) => {
      const profile = await resolveProfile(client, getRequestUser(req));

      await client.query(`UPDATE addresses SET is_default = FALSE WHERE profile_id = $1`, [profile.id]);

      const updated = await client.query(
        `UPDATE addresses
         SET is_default = TRUE, updated_at = NOW()
         WHERE id = $1 AND profile_id = $2
         RETURNING id`,
        [addressId, profile.id]
      );

      if (!updated.rows[0]) return null;
      return { success: true, addressId };
    });

    if (!payload) {
      return NextResponse.json({ error: 'Address not found' }, { status: 404 });
    }

    return NextResponse.json(payload);
  } catch (error) {
    console.error('Set default address failed:', error);
    return NextResponse.json({ error: 'Failed to set default address' }, { status: 500 });
  }
}
