import { NextRequest, NextResponse } from 'next/server';
import { ensureSchema, db, withTransaction } from '@/lib/server/database';
import { requireAdmin } from '@/lib/server/adminGuard';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const unauthorized = requireAdmin(req);
  if (unauthorized) return unauthorized;

  try {
    await ensureSchema();
    const result = await db.query(
      `SELECT
         pc.id,
         pc.product_id,
         pc.tag,
         pc.discount_percent,
         pc.default_weight,
         pc.display_order,
         pc.is_active,
         pc.created_at,
         pc.updated_at,
         p.name,
         p.slug,
         p.image_url,
         p.base_price,
         p.category,
         p.type
       FROM premium_collections pc
       JOIN catalog_products p ON p.id = pc.product_id
       ORDER BY pc.display_order ASC, pc.created_at DESC`
    );
    return NextResponse.json(result.rows || []);
  } catch (error) {
    console.error('Premium collections GET failed:', error);
    return NextResponse.json({ error: 'Failed to load premium collections' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const unauthorized = requireAdmin(req);
  if (unauthorized) return unauthorized;

  try {
    const body = await req.json();
    const productId = String(body.productId || '').trim();
    if (!productId) return NextResponse.json({ error: 'productId is required' }, { status: 400 });

    const created = await withTransaction(async (client) => {
      const exists = await client.query(`SELECT id FROM catalog_products WHERE id = $1::text LIMIT 1`, [productId]);
      if (!exists.rows?.[0]) return { notFound: true as const };

      const res = await client.query(
        `INSERT INTO premium_collections
           (product_id, tag, discount_percent, default_weight, display_order, is_active, created_at, updated_at)
         VALUES
           ($1, $2, $3::int, $4, $5::int, COALESCE($6::boolean, TRUE), NOW(), NOW())
         ON CONFLICT (product_id)
         DO UPDATE SET
           tag = EXCLUDED.tag,
           discount_percent = EXCLUDED.discount_percent,
           default_weight = EXCLUDED.default_weight,
           display_order = EXCLUDED.display_order,
           is_active = EXCLUDED.is_active,
           updated_at = NOW()
         RETURNING id`,
        [
          productId,
          body.tag ? String(body.tag) : null,
          Number(body.discountPercent || 0),
          String(body.defaultWeight || '500g'),
          Number(body.displayOrder || 0),
          typeof body.isActive === 'boolean' ? body.isActive : true,
        ]
      );
      return { id: res.rows?.[0]?.id as string };
    });

    if ((created as any).notFound) return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    return NextResponse.json({ success: true, id: (created as any).id });
  } catch (error) {
    console.error('Premium collections POST failed:', error);
    return NextResponse.json({ error: 'Failed to create premium collection item' }, { status: 500 });
  }
}

