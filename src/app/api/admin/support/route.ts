import { NextRequest, NextResponse } from 'next/server';
import { withTransaction } from '@/lib/server/database';
import { requireAdmin } from '@/lib/server/adminGuard';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const unauthorized = requireAdmin(req);
  if (unauthorized) return unauthorized;

  try {
    const data = await withTransaction(async (client) => {
      const rows = await client.query(`SELECT * FROM support_tickets ORDER BY created_at DESC`);
      return rows.rows;
    });
    return NextResponse.json(data || []);
  } catch {
    return NextResponse.json({ error: 'Failed to load tickets' }, { status: 500 });
  }
}
