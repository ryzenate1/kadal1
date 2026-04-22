import { NextRequest, NextResponse } from 'next/server';
import { withTransaction } from '@/lib/server/database';
import { requireAdmin } from '@/lib/server/adminGuard';

export const runtime = 'nodejs';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const unauthorized = requireAdmin(req);
  if (unauthorized) return unauthorized;

  try {
    const { id } = await params;
    const body = await req.json();

    const updated = await withTransaction(async (client) => {
      const res = await client.query(
        `UPDATE premium_collections
         SET
           product_id = COALESCE($2::text, product_id),
           tag = COALESCE($3::text, tag),
           discount_percent = COALESCE($4::int, discount_percent),
           default_weight = COALESCE($5::text, default_weight),
           display_order = COALESCE($6::int, display_order),
           is_active = COALESCE($7::boolean, is_active),
           updated_at = NOW()
         WHERE id = $1::uuid
         RETURNING id`,
        [
          id,
          body.productId ? String(body.productId) : null,
          body.tag !== undefined ? String(body.tag || '') : null,
          body.discountPercent !== undefined ? Number(body.discountPercent) : null,
          body.defaultWeight !== undefined ? String(body.defaultWeight) : null,
          body.displayOrder !== undefined ? Number(body.displayOrder) : null,
          typeof body.isActive === 'boolean' ? body.isActive : null,
        ]
      );
      return res.rows?.[0]?.id as string | undefined;
    });

    if (!updated) return NextResponse.json({ error: 'Premium collection item not found' }, { status: 404 });
    return NextResponse.json({ success: true, id: updated });
  } catch (error) {
    console.error('Premium collections PATCH failed:', error);
    return NextResponse.json({ error: 'Failed to update premium collection item' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const unauthorized = requireAdmin(req);
  if (unauthorized) return unauthorized;

  try {
    const { id } = await params;
    const deleted = await withTransaction(async (client) => {
      const res = await client.query(`DELETE FROM premium_collections WHERE id = $1::uuid`, [id]);
      return (res.rowCount || 0) > 0;
    });
    if (!deleted) return NextResponse.json({ error: 'Premium collection item not found' }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Premium collections DELETE failed:', error);
    return NextResponse.json({ error: 'Failed to delete premium collection item' }, { status: 500 });
  }
}

