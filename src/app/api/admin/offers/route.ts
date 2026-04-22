import { NextRequest, NextResponse } from 'next/server';
import { withTransaction } from '@/lib/server/database';
import { requireAdmin } from '@/lib/server/adminGuard';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const unauthorized = requireAdmin(req);
  if (unauthorized) return unauthorized;

  try {
    const data = await withTransaction(async (client) => {
      const rows = await client.query(
        `SELECT id, code, title, description, type, discount_value, discount_label, min_order, valid_until, usage_limit, used_count, is_active, created_at, updated_at
         FROM coupons
         ORDER BY created_at DESC`
      );
      return rows.rows;
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error('Admin offers GET failed:', error);
    return NextResponse.json({ error: 'Failed to load offers' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const unauthorized = requireAdmin(req);
  if (unauthorized) return unauthorized;

  try {
    const body = await req.json();
    if (!body.code || !body.title) {
      return NextResponse.json({ error: 'code and title are required' }, { status: 400 });
    }

    const created = await withTransaction(async (client) => {
      const result = await client.query(
        `INSERT INTO coupons (code, title, description, type, discount_value, discount_label, min_order, valid_until, usage_limit, is_active)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
         RETURNING id, code, title, description, type, discount_value, discount_label, min_order, valid_until, usage_limit, used_count, is_active, created_at, updated_at`,
        [
          String(body.code).toUpperCase().trim(),
          body.title,
          body.description || '',
          body.type || 'percentage',
          body.discount_value ?? null,
          body.discount_label || null,
          body.min_order ?? 0,
          body.valid_until || null,
          body.usage_limit ?? null,
          body.is_active ?? true,
        ]
      );
      return result.rows[0];
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error('Admin offers POST failed:', error);
    return NextResponse.json({ error: 'Failed to create offer' }, { status: 500 });
  }
}
