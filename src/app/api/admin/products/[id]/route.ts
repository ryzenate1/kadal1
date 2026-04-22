import { NextResponse } from 'next/server';
import { withTransaction } from '@/lib/server/database';
import { requireAdmin } from '@/lib/server/adminGuard';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const unauthorized = requireAdmin(request);
  if (unauthorized) return unauthorized;

  try {
    const data = await request.json();
    const { 
      name, slug, category, type, description, image_url, 
      base_price, stock_quantity, low_stock_threshold, is_featured, is_popular, is_premium, is_active 
    } = data;

    const updated = await withTransaction(async (client) => {
      const updateResult = await client.query(
        `
        UPDATE catalog_products
        SET
          name = COALESCE($2::text, name),
          slug = COALESCE($3::text, slug),
          category = COALESCE($4::text, category),
          type = COALESCE($5::text, type),
          description = COALESCE($6::text, description),
          image_url = COALESCE($7::text, image_url),
          base_price = COALESCE($8::numeric, base_price),
          is_featured = COALESCE($9::boolean, is_featured),
          is_popular = COALESCE($10::boolean, is_popular),
          is_premium = COALESCE($11::boolean, is_premium),
          is_active = COALESCE($12::boolean, is_active),
          updated_at = NOW()
        WHERE id = $1::text
        `,
        [
          id,
          name !== undefined ? String(name) : null,
          slug !== undefined ? String(slug) : null,
          category !== undefined ? String(category) : null,
          type !== undefined ? String(type) : null,
          description !== undefined ? String(description) : null,
          image_url !== undefined ? String(image_url) : null,
          base_price !== undefined ? Number(base_price) : null,
          is_featured !== undefined ? Boolean(is_featured) : null,
          is_popular !== undefined ? Boolean(is_popular) : null,
          is_premium !== undefined ? Boolean(is_premium) : null,
          is_active !== undefined ? Boolean(is_active) : null,
        ]
      );
      if (!updateResult.rowCount) return null;

      if (stock_quantity !== undefined) {
        await client.query(
          `
          INSERT INTO catalog_inventory (product_id, stock_quantity, low_stock_threshold, allow_backorder, updated_at)
          VALUES ($1, $2::int, $3::int, FALSE, NOW())
          ON CONFLICT (product_id)
          DO UPDATE SET
            stock_quantity = EXCLUDED.stock_quantity,
            low_stock_threshold = EXCLUDED.low_stock_threshold,
            updated_at = NOW()
          `,
          [id, Number(stock_quantity), Number(low_stock_threshold || 5)]
        );
      }

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

    if (!updated) return NextResponse.json({ error: 'Product not found' }, { status: 404 });

    return NextResponse.json({
      ...updated,
      base_price: Number(updated.base_price || 0),
      rating: Number(updated.rating || 0),
      catalog_inventory: updated.stock_quantity === null || updated.stock_quantity === undefined
        ? undefined
        : {
            stock_quantity: Number(updated.stock_quantity || 0),
            low_stock_threshold: Number(updated.low_stock_threshold || 5),
            allow_backorder: Boolean(updated.allow_backorder),
            updated_at: updated.inventory_updated_at,
          },
    });
  } catch (error) {
    console.error('Update product error:', error);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const unauthorized = requireAdmin(request);
  if (unauthorized) return unauthorized;

  try {
    const deleted = await withTransaction(async (client) => {
      // catalog_inventory will be deleted via ON DELETE CASCADE
      const result = await client.query(`DELETE FROM catalog_products WHERE id = $1::text`, [id]);
      return result.rowCount || 0;
    });
    if (!deleted) return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete product error:', error);
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
