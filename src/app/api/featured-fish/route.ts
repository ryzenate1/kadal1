import { NextResponse } from 'next/server';
import { db } from '@/lib/server/database';
import { mapCatalogProduct, type CatalogProductRecord } from '@/lib/server/catalog';
import { queryFallbackCatalogProducts } from '@/lib/server/catalogFallback';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const premiumResult = await db.query(
      `SELECT
         pc.id AS premium_id,
         pc.tag,
         pc.discount_percent,
         pc.default_weight,
         pc.display_order,
         p.*,
         i.stock_quantity,
         i.low_stock_threshold,
         i.allow_backorder
       FROM premium_collections pc
       JOIN catalog_products p ON p.id = pc.product_id
       LEFT JOIN catalog_inventory i ON i.product_id = p.id
       WHERE pc.is_active = TRUE AND p.is_active = TRUE
       ORDER BY pc.display_order ASC, pc.created_at DESC
       LIMIT 24`
    );

    if ((premiumResult.rows || []).length > 0) {
      return NextResponse.json({
        products: premiumResult.rows.map((row: any) => {
          const base = mapCatalogProduct(row as CatalogProductRecord);
          return {
            ...base,
            imageUrl: base.image,
            featured: true,
            tag: row.tag || undefined,
            discount: Number(row.discount_percent || 0),
            weight: row.default_weight || '500g',
            premiumCollectionId: row.premium_id,
            displayOrder: Number(row.display_order || 0),
          };
        }),
      });
    }

    const fallbackFeatured = await db.query(
      `SELECT p.*, i.stock_quantity, i.low_stock_threshold, i.allow_backorder
       FROM catalog_products p
       LEFT JOIN catalog_inventory i ON i.product_id = p.id
       WHERE p.is_active = TRUE AND p.is_featured = TRUE
       ORDER BY p.is_popular DESC, p.rating DESC, p.updated_at DESC
       LIMIT 12`
    );

    return NextResponse.json({
      products: fallbackFeatured.rows.map((row: CatalogProductRecord) => mapCatalogProduct(row)),
    });
  } catch (error) {
    console.error('[featured-fish] GET failed:', {
      message: (error as Error)?.message,
      stack: (error as Error)?.stack,
    });

    return NextResponse.json({
      products: queryFallbackCatalogProducts({
        slug: '',
        category: '',
        featured: true,
        query: '',
        limit: 12,
      }),
      source: 'local-fallback',
    });
  }
}
