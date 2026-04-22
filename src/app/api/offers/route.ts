import { NextResponse } from 'next/server';
import { db, ensureSchema } from '@/lib/server/database';

export const runtime = 'nodejs';

export async function GET() {
  try {
    await ensureSchema();

    const nowIso = new Date().toISOString();
    const rows = await db.query(
      `
      SELECT
        id,
        title,
        description,
        discount_label,
        discount_value,
        valid_until,
        code,
        min_order,
        type,
        is_active,
        created_at
      FROM coupons
      WHERE is_active = TRUE
        AND (valid_until IS NULL OR valid_until >= $1::timestamptz)
      ORDER BY created_at DESC
      `,
      [nowIso]
    );

    return NextResponse.json(
      (rows.rows || []).map((c) => ({
        id: c.id,
        title: c.title,
        description: c.description || '',
        discount: c.discount_label || (c.discount_value ? `${c.discount_value}` : 'Offer'),
        validUntil: c.valid_until,
        code: c.code,
        minOrder: c.min_order,
        type: c.type || 'percentage',
        active: c.is_active,
      }))
    );
  } catch (error) {
    console.error('Offers fetch failed:', error);
    return NextResponse.json([]);
  }
}
