import { db, ensureSchema } from '@/lib/server/database';
import { fishProducts } from '@/data/additionalFishData';
import { getCatalogProductsByCategorySlug } from '@/lib/catalogData';

export type CatalogProductRecord = {
  id: string;
  slug: string;
  name: string;
  tanglish_name: string | null;
  category: string;
  type: string;
  description: string;
  image_url: string;
  base_price: number | string;
  rating: number | string;
  omega3: string | null;
  protein: string | null;
  calories: string | null;
  origin: string | null;
  tags: string[] | null;
  available_weights: Array<{ value: string; label: string; multiplier: number }> | null;
  is_featured: boolean;
  is_popular: boolean;
  is_premium: boolean;
  is_active: boolean;
  stock_quantity?: number | string | null;
  low_stock_threshold?: number | string | null;
  allow_backorder?: boolean | null;
};

function inferCategory(type: string, tags: string[]) {
  const t = type.toLowerCase();
  const tg = tags.map(x => x.toLowerCase());
  if (t.includes('shellfish') || tg.some(x => x.includes('prawn') || x.includes('crab'))) return 'Seafood';
  if (t.includes('dried')) return 'Dried Fish';
  if (t.includes('freshwater')) return 'Freshwater Fish';
  if (t.includes('premium')) return 'Premium Fish';
  return 'Fresh Fish';
}

const PRODUCT_SEED = [
  ...fishProducts.map(p => ({
    id: p.id,
    slug: p.slug,
    name: `${p.tanglishName}${p.englishName ? ` (${p.englishName})` : ''}`,
    tanglishName: p.tanglishName,
    category: inferCategory(p.type, p.tags),
    type: p.type,
    description: p.description,
    imageUrl: p.imagePath,
    basePrice: p.basePrice,
    rating: p.rating,
    omega3: p.omega3,
    protein: p.protein,
    calories: p.calories,
    origin: p.origin,
    tags: p.tags,
    availableWeights: p.availableWeights,
    isFeatured: p.isPopular || p.isPremium,
    isPopular: p.isPopular,
    isPremium: p.isPremium,
  })),
  ...getCatalogProductsByCategorySlug('fish-combo').map(p => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    tanglishName: null,
    category: 'Fish Combo',
    type: p.type,
    description: p.description,
    imageUrl: p.image,
    basePrice: p.price,
    rating: p.rating,
    omega3: null, protein: null, calories: null,
    origin: 'Kadal curated',
    tags: [p.categorySlug, p.type],
    availableWeights: [{ value: p.quantity, label: p.quantity, multiplier: 1 }],
    isFeatured: true, isPopular: true, isPremium: !!p.originalPrice,
  })),
  ...getCatalogProductsByCategorySlug('seafood').map(p => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    tanglishName: null,
    category: 'Seafood',
    type: p.type,
    description: p.description,
    imageUrl: p.image,
    basePrice: p.price,
    rating: p.rating,
    omega3: null, protein: null, calories: null,
    origin: 'Kadal curated',
    tags: [p.categorySlug, p.type],
    availableWeights: [{ value: p.quantity, label: p.quantity, multiplier: 1 }],
    isFeatured: true, isPopular: true, isPremium: !!p.originalPrice,
  })),
];

// ---------- seed tracking ----------
// Stored on globalThis so Next.js hot-reload (which re-evaluates modules)
// does NOT reset this back to null and trigger a redundant re-seed every
// time a file changes during development.
const globalForSeed = globalThis as unknown as {
  kadalSeedPromise?: Promise<void> | null;
};

export async function ensureCatalogSeeded() {
  await ensureSchema();

  if (!globalForSeed.kadalSeedPromise) {
    globalForSeed.kadalSeedPromise = (async () => {
      try {
        // Compare actual count with expected count.
        // If they differ (or DB is empty) run the full upsert pass so that
        // new products are never silently missing.
        const { rows } = await db.query('SELECT COUNT(*)::int AS total FROM catalog_products');
        const dbCount = Number(rows[0]?.total ?? 0);

        if (dbCount === PRODUCT_SEED.length) {
          // All products already present — nothing to do.
          return;
        }

        // Upsert every product. ON CONFLICT ensures existing rows are updated
        // and new rows are inserted — fully idempotent.
        for (const product of PRODUCT_SEED) {
          await db.query(
            `INSERT INTO catalog_products (
              id, slug, name, tanglish_name, category, type, description, image_url,
              base_price, rating, omega3, protein, calories, origin, tags, available_weights,
              is_featured, is_popular, is_premium, is_active
            ) VALUES (
              $1,$2,$3,$4,$5,$6,$7,$8,
              $9,$10,$11,$12,$13,$14,$15,$16::jsonb,
              $17,$18,$19,TRUE
            )
            ON CONFLICT (id) DO UPDATE SET
              slug            = EXCLUDED.slug,
              name            = EXCLUDED.name,
              tanglish_name   = EXCLUDED.tanglish_name,
              category        = EXCLUDED.category,
              type            = EXCLUDED.type,
              description     = EXCLUDED.description,
              image_url       = EXCLUDED.image_url,
              base_price      = EXCLUDED.base_price,
              rating          = EXCLUDED.rating,
              omega3          = EXCLUDED.omega3,
              protein         = EXCLUDED.protein,
              calories        = EXCLUDED.calories,
              origin          = EXCLUDED.origin,
              tags            = EXCLUDED.tags,
              available_weights = EXCLUDED.available_weights,
              is_featured     = EXCLUDED.is_featured,
              is_popular      = EXCLUDED.is_popular,
              is_premium      = EXCLUDED.is_premium,
              is_active       = TRUE,
              updated_at      = NOW()`,
            [
              product.id, product.slug, product.name, product.tanglishName,
              product.category, product.type, product.description, product.imageUrl,
              product.basePrice, product.rating,
              product.omega3, product.protein, product.calories, product.origin,
              product.tags, JSON.stringify(product.availableWeights),
              product.isFeatured, product.isPopular, product.isPremium,
            ]
          );

          await db.query(
            `INSERT INTO catalog_inventory (product_id, stock_quantity, low_stock_threshold, allow_backorder)
             VALUES ($1, $2, 5, FALSE)
             ON CONFLICT (product_id) DO NOTHING`,
            [product.id, product.isFeatured ? 30 : 18]
          );
        }
      } catch (err) {
        globalForSeed.kadalSeedPromise = null; // allow retry on next request
        throw err;
      }
    })();
  }

  await globalForSeed.kadalSeedPromise;
}

export function mapCatalogProduct(row: CatalogProductRecord) {
  // stock_quantity is null when the LEFT JOIN finds no inventory row (product
  // exists but was never seeded into catalog_inventory). Treat null as the
  // table default (25) so the product is shown as in-stock rather than
  // being permanently disabled with an "Out of stock" badge.
  const stockQty = row.stock_quantity != null ? Number(row.stock_quantity) : 25;
  const lowThreshold = row.low_stock_threshold != null ? Number(row.low_stock_threshold) : 5;
  const allowBackorder = Boolean(row.allow_backorder);

  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    tanglishName: row.tanglish_name,
    category: row.category,
    type: row.type,
    description: row.description,
    image: row.image_url,
    price: Number(row.base_price),
    rating: Number(row.rating || 0),
    omega3: row.omega3,
    protein: row.protein,
    calories: row.calories,
    origin: row.origin,
    tags: row.tags || [],
    availableWeights: row.available_weights || [],
    featured: row.is_featured,
    popular: row.is_popular,
    premium: row.is_premium,
    isActive: row.is_active,
    stockQuantity: stockQty,
    lowStockThreshold: lowThreshold,
    inStock: stockQty > 0 || allowBackorder,
    allowBackorder,
  };
}
