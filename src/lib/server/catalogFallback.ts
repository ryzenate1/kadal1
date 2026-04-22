import { fishProducts, type FishProduct } from '@/data/additionalFishData';
import { getCatalogProductsByCategorySlug, type CatalogProduct as LocalCatalogProduct } from '@/lib/catalogData';

export type CatalogWeightOption = {
  value: string;
  label: string;
  multiplier: number;
};

export type CatalogProductView = {
  id: string;
  slug: string;
  name: string;
  tanglishName: string | null;
  category: string;
  type: string;
  description: string;
  image: string;
  price: number;
  rating: number;
  omega3: string | null;
  protein: string | null;
  calories: string | null;
  origin: string | null;
  tags: string[];
  availableWeights: CatalogWeightOption[];
  featured: boolean;
  popular: boolean;
  premium: boolean;
  isActive: boolean;
  stockQuantity: number;
  lowStockThreshold: number;
  inStock: boolean;
  allowBackorder: boolean;
};

type CatalogFilters = {
  slug: string;
  category: string;
  featured: boolean;
  query: string;
  limit: number;
};

function inferCategory(type: string, tags: string[]) {
  const normalizedType = type.toLowerCase();
  const normalizedTags = tags.map((tag) => tag.toLowerCase());

  if (normalizedType.includes('shellfish') || normalizedTags.some((tag) => tag.includes('prawn') || tag.includes('crab'))) {
    return 'Seafood';
  }
  if (normalizedType.includes('dried')) return 'Dried Fish';
  if (normalizedType.includes('freshwater')) return 'Freshwater Fish';
  if (normalizedType.includes('premium')) return 'Premium Fish';
  return 'Fresh Fish';
}

function matchesQuery(product: CatalogProductView, query: string) {
  const normalizedQuery = query.toLowerCase();
  if (!normalizedQuery) return true;

  const haystack = [
    product.name,
    product.tanglishName ?? '',
    product.description,
    product.category,
    product.type,
    product.tags.join(' '),
  ]
    .join(' ')
    .toLowerCase();

  return haystack.includes(normalizedQuery);
}

function mapFishProduct(product: FishProduct): CatalogProductView {
  const category = inferCategory(product.type, product.tags);

  return {
    id: product.id,
    slug: product.slug,
    name: `${product.tanglishName}${product.englishName ? ` (${product.englishName})` : ''}`,
    tanglishName: product.tanglishName,
    category,
    type: product.type,
    description: product.description,
    image: product.imagePath,
    price: product.basePrice,
    rating: product.rating,
    omega3: product.omega3,
    protein: product.protein,
    calories: product.calories,
    origin: product.origin,
    tags: product.tags,
    availableWeights: product.availableWeights,
    featured: product.isPopular || product.isPremium,
    popular: product.isPopular,
    premium: product.isPremium,
    isActive: true,
    stockQuantity: product.isPopular || product.isPremium ? 30 : 18,
    lowStockThreshold: 5,
    inStock: true,
    allowBackorder: false,
  };
}

function mapComboProduct(product: LocalCatalogProduct, category: string): CatalogProductView {
  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    tanglishName: null,
    category,
    type: product.type,
    description: product.description,
    image: product.image,
    price: product.price,
    rating: product.rating,
    omega3: null,
    protein: null,
    calories: null,
    origin: 'Kadal curated',
    tags: [product.categorySlug, product.type],
    availableWeights: [{ value: product.quantity, label: product.quantity, multiplier: 1 }],
    featured: true,
    popular: true,
    premium: Boolean(product.originalPrice),
    isActive: true,
    stockQuantity: 30,
    lowStockThreshold: 5,
    inStock: true,
    allowBackorder: false,
  };
}

export function getFallbackCatalogProducts(): CatalogProductView[] {
  return [
    ...fishProducts.map(mapFishProduct),
    ...getCatalogProductsByCategorySlug('fish-combo').map((product) => mapComboProduct(product, 'Fish Combo')),
    ...getCatalogProductsByCategorySlug('seafood').map((product) => mapComboProduct(product, 'Seafood')),
  ];
}

export function queryFallbackCatalogProducts(filters: CatalogFilters): CatalogProductView[] {
  const products = getFallbackCatalogProducts();
  const normalizedCategory = filters.category.toLowerCase();

  return products
    .filter((product) => {
      if (filters.slug && product.slug !== filters.slug && product.id !== filters.slug) {
        return false;
      }

      if (normalizedCategory && product.category.toLowerCase() !== normalizedCategory) {
        return false;
      }

      if (filters.featured && !product.featured) {
        return false;
      }

      return matchesQuery(product, filters.query);
    })
    .sort((left, right) => {
      if (left.featured !== right.featured) return Number(right.featured) - Number(left.featured);
      if (left.popular !== right.popular) return Number(right.popular) - Number(left.popular);
      return right.rating - left.rating;
    })
    .slice(0, filters.limit);
}
