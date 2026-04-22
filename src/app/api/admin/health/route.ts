import { NextRequest, NextResponse } from 'next/server';
import { ensureSchema, db } from '@/lib/server/database';
import { requireAdmin } from '@/lib/server/adminGuard';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  // SECURITY: Health endpoint leaks DB connectivity info — restrict to admins only.
  const unauthorized = requireAdmin(req);
  if (unauthorized) return unauthorized;

  try {
    await ensureSchema();
    await db.query('SELECT 1');
    return NextResponse.json({ status: 'connected' });
  } catch {
    // Do not expose the raw error message — it may contain connection strings,
    // schema details or other sensitive backend information.
    return NextResponse.json({ status: 'error', message: 'Database connection failed' }, { status: 500 });
  }
}
