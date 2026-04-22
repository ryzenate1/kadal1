import { NextRequest, NextResponse } from 'next/server';
import { withTransaction } from '@/lib/server/database';
import { getRequestUser, resolveProfile } from '@/lib/server/requestUser';

export const runtime = 'nodejs';

export async function DELETE(req: NextRequest) {
  try {
    await withTransaction(async (client) => {
      const profile = await resolveProfile(client, getRequestUser(req));
      await client.query(`DELETE FROM user_search_history WHERE profile_id = $1`, [profile.id]).catch(() => null);
      return true;
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Clear search history failed:', error);
    return NextResponse.json({ error: 'Failed to clear search history' }, { status: 500 });
  }
}
