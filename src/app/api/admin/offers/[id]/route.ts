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
        `UPDATE coupons
         SET code = COALESCE($2, code),
             title = COALESCE($3, title),
             description = COALESCE($4, description),
             type = COALESCE($5, type),
             discount_value = COALESCE($6, discount_value),
             discount_label = COALESCE($7, discount_label),
             min_order = COALESCE($8, min_order),
             valid_until = COALESCE($9, valid_until),
             usage_limit = COALESCE($10, usage_limit),
             is_active = COALESCE($11, is_active),
             updated_at = NOW()
         WHERE id = $1
         RETURNING id, code, title, description, type, discount_value, discount_label, min_order, valid_until, usage_limit, used_count, is_active, created_at, updated_at`,
        [
          id,
          body.code ? String(body.code).toUpperCase().trim() : null,
          body.title ?? null,
          body.description ?? null,
          body.type ?? null,
          body.discount_value ?? null,
          body.discount_label ?? null,
          body.min_order ?? null,
          body.valid_until ?? null,
          body.usage_limit ?? null,
          typeof body.is_active === 'boolean' ? body.is_active : null,
        ]
      );
      return result.rows[0] || null;
    });

    if (!updated) return NextResponse.json({ error: 'Offer not found' }, { status: 404 });
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: 'Failed to update offer' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const unauthorized = requireAdmin(req);
  if (unauthorized) return unauthorized;

  try {
    const { id } = await params;

    const deleted = await withTransaction(async (client) => {
      const result = await client.query(`DELETE FROM coupons WHERE id = $1 RETURNING id`, [id]);
      return result.rows[0] || null;
    });

    if (!deleted) return NextResponse.json({ error: 'Offer not found' }, { status: 404 });
    return NextResponse.json({ success: true, id });
  } catch {
    return NextResponse.json({ error: 'Failed to delete offer' }, { status: 500 });
  }
}
