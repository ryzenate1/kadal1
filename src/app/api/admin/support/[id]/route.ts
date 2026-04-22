import { NextRequest, NextResponse } from 'next/server';
import { withTransaction } from '@/lib/server/database';
import { requireAdmin } from '@/lib/server/adminGuard';

export const runtime = 'nodejs';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const unauthorized = requireAdmin(req);
  if (unauthorized) return unauthorized;

  try {
    const { id } = await params;
    const body = await req.json();

    const updated = await withTransaction(async (client) => {
      const result = await client.query(
        `UPDATE support_tickets
         SET status = COALESCE($2, status),
             admin_response = COALESCE($3, admin_response),
             updated_at = NOW()
         WHERE id = $1
         RETURNING *`,
        [id, body.status ?? null, body.admin_response ?? null]
      );
      return result.rows[0] || null;
    });

    if (!updated) return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: 'Failed to update ticket' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const unauthorized = requireAdmin(req);
  if (unauthorized) return unauthorized;

  try {
    const { id } = await params;
    const deleted = await withTransaction(async (client) => {
      const result = await client.query(`DELETE FROM support_tickets WHERE id = $1 RETURNING id`, [id]);
      return result.rows[0] || null;
    });

    if (!deleted) return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    return NextResponse.json({ success: true, id });
  } catch {
    return NextResponse.json({ error: 'Failed to delete ticket' }, { status: 500 });
  }
}
