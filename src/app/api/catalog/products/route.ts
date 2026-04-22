import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/server/database';
import { ensureCatalogSeeded, mapCatalogProduct, type CatalogProductRecord } from '@/lib/server/catalog';
import { queryFallbackCatalogProducts } from '@/lib/server/catalogFallback';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
    await ensureCatalogSeeded();
    const searchParams = req.nextUrl.searchParams;
    const query = searchParams.get('q')?.trim() || '';
    const category = searchParams.get('category')?.trim() || '';
    const featured = searchParams.get('featured') === 'true';
    const slug = searchParams.get('slug')?.trim() || '';
    const limit = Math.min(Number(searchParams.get('limit') || '24'), 100);

    const conditions: string[] = ['p.is_active = TRUE'];
    const values: Array<string | number | boolean> = [];

    if (slug) {
      values.push(slug);
      conditions.push(`(p.slug = $${values.length} OR p.id = $${values.length})`);
    }

    if (category) {
      values.push(category);
      conditions.push(`LOWER(p.category) = LOWER($${values.length})`);
    }

    if (featured) {
      conditions.push('p.is_featured = TRUE');
    }

    if (query) {
      const likeVal = `%${query.toLowerCase()}%`;
      values.push(likeVal);
      const index = values.length;
      conditions.push(`(
        LOWER(p.name) LIKE $${index}
        OR LOWER(COALESCE(p.tanglish_name, '')) LIKE $${index}
        OR LOWER(p.description) LIKE $${index}
        OR LOWER(p.category) LIKE $${index}
        OR LOWER(p.type) LIKE $${index}
        OR EXISTS (
          SELECT 1 FROM unnest(p.tags) AS tag WHERE LOWER(tag) LIKE $${index}
        )
      )`);
    }

    values.push(limit);

    const result = await db.query(
      `SELECT p.*, i.stock_quantity, i.low_stock_threshold, i.allow_backorder
       FROM catalog_products p
       LEFT JOIN catalog_inventory i ON i.product_id = p.id
       WHERE ${conditions.join(' AND ')}
       ORDER BY p.is_featured DESC, p.is_popular DESC, p.rating DESC, p.updated_at DESC
       LIMIT $${values.length}`,
      values
    );

    const products = result.rows.map((row: CatalogProductRecord) => mapCatalogProduct(row));
    return NextResponse.json({ products });
  } catch (error) {
    console.error('[catalog/products] GET failed:', {
      message: (error as Error)?.message,
      stack: (error as Error)?.stack,
    });

    const searchParams = req.nextUrl.searchParams;
    const fallbackProducts = queryFallbackCatalogProducts({
      slug: searchParams.get('slug')?.trim() || '',
      category: searchParams.get('category')?.trim() || '',
      featured: searchParams.get('featured') === 'true',
      query: searchParams.get('q')?.trim() || '',
      limit: Math.min(Number(searchParams.get('limit') || '24'), 100),
    });

    return NextResponse.json(
      { products: fallbackProducts, source: 'local-fallback' }
    );
  }
}
