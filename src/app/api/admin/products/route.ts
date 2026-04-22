import { NextResponse } from 'next/server';
import { ensureSchema, withTransaction, db } from '@/lib/server/database';
import { ensureCatalogSeeded } from '@/lib/server/catalog';
import { requireAdmin } from '@/lib/server/adminGuard';

export async function GET(request: Request) {
  const unauthorized = requireAdmin(request);
  if (unauthorized) return unauthorized;

  try {
    await ensureSchema();
    await ensureCatalogSeeded();
    const res = await db.query(
      `
      SELECT
        p.*,
        i.stock_quantity,
        i.low_stock_threshold,
        i.allow_backorder,
        i.updated_at AS inventory_updated_at
      FROM catalog_products p
      LEFT JOIN catalog_inventory i ON i.product_id = p.id
      ORDER BY p.created_at DESC
      `
    );

    const products = (res.rows || []).map((r) => ({
      id: r.id,
      slug: r.slug,
      name: r.name,
      tanglish_name: r.tanglish_name,
      category: r.category,
      type: r.type,
      description: r.description,
      image_url: r.image_url,
      base_price: Number(r.base_price || 0),
      rating: Number(r.rating || 0),
      omega3: r.omega3,
      protein: r.protein,
      calories: r.calories,
      origin: r.origin,
      tags: r.tags || [],
      available_weights: r.available_weights || [],
      is_featured: Boolean(r.is_featured),
      is_popular: Boolean(r.is_popular),
      is_premium: Boolean(r.is_premium),
      is_active: Boolean(r.is_active),
      created_at: r.created_at,
      updated_at: r.updated_at,
      catalog_inventory: r.stock_quantity === null || r.stock_quantity === undefined
        ? undefined
        : {
            stock_quantity: Number(r.stock_quantity || 0),
            low_stock_threshold: Number(r.low_stock_threshold || 5),
            allow_backorder: Boolean(r.allow_backorder),
            updated_at: r.inventory_updated_at,
          },
    }));

    return NextResponse.json(products);
  } catch (error) {
    console.error('Fetch products error:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const unauthorized = requireAdmin(request);
  if (unauthorized) return unauthorized;

  try {
    const data = await request.json();
    const { 
      name, slug, category, type, description, image_url, 
      base_price, stock_quantity, low_stock_threshold, is_featured, is_popular, is_premium 
    } = data;

    const created = await withTransaction(async (client) => {
      const id = crypto.randomUUID();
      await client.query(
        `
        INSERT INTO catalog_products
          (id, name, slug, category, type, description, image_url, base_price, is_featured, is_popular, is_premium, is_active, created_at, updated_at)
        VALUES
          ($1, $2, $3, $4, $5, $6, $7, $8::numeric, $9::boolean, $10::boolean, $11::boolean, TRUE, NOW(), NOW())
        `,
        [
          id,
          String(name || ''),
          String(slug || ''),
          String(category || ''),
          String(type || ''),
          String(description || ''),
          String(image_url || ''),
          Number(base_price || 0),
          Boolean(is_featured),
          Boolean(is_popular),
          Boolean(is_premium),
        ]
      );

      await client.query(
        `
        INSERT INTO catalog_inventory (product_id, stock_quantity, low_stock_threshold, allow_backorder, updated_at)
        VALUES ($1, $2::int, $3::int, FALSE, NOW())
        ON CONFLICT (product_id)
        DO UPDATE SET stock_quantity = EXCLUDED.stock_quantity, low_stock_threshold = EXCLUDED.low_stock_threshold, updated_at = NOW()
        `,
        [id, Number(stock_quantity || 0), Number(low_stock_threshold || 5)]
      );

      const res = await client.query(
        `
        SELECT
          p.*,
          i.stock_quantity,
          i.low_stock_threshold,
          i.allow_backorder,
          i.updated_at AS inventory_updated_at
        FROM catalog_products p
        LEFT JOIN catalog_inventory i ON i.product_id = p.id
        WHERE p.id = $1
        LIMIT 1
        `,
        [id]
      );
      return res.rows?.[0];
    });

    if (!created) throw new Error('Failed to create product');

    return NextResponse.json({
      ...created,
      base_price: Number(created.base_price || 0),
      rating: Number(created.rating || 0),
      catalog_inventory: created.stock_quantity === null || created.stock_quantity === undefined
        ? undefined
        : {
            stock_quantity: Number(created.stock_quantity || 0),
            low_stock_threshold: Number(created.low_stock_threshold || 5),
            allow_backorder: Boolean(created.allow_backorder),
            updated_at: created.inventory_updated_at,
          },
    });
  } catch (error) {
    console.error('Create product error:', error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}
