export interface CatalogCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  isActive: boolean;
}

export interface CatalogProduct {
  id: string;
  categorySlug: string;
  name: string;
  slug: string;
  image: string;
  description: string;
  price: number;
  originalPrice?: number;
  quantity: string;
  type: string;
  netWeight: string;
  rating: number;
}

const CATEGORIES: CatalogCategory[] = [
  {
    id: 'cat-1',
    name: 'Fish Combo',
    slug: 'fish-combo',
    description: 'Curated fish combos cleaned and ready to cook.',
    image: '/images/categories/fish-combo.jpg',
    isActive: true,
  },
  {
    id: 'cat-2',
    name: 'Seafood',
    slug: 'seafood',
    description: 'Fresh seafood selections sourced daily.',
    image: '/images/categories/seafood.jpg',
    isActive: true,
  },
];

const PRODUCTS: CatalogProduct[] = [
  {
    id: 'prd-1',
    categorySlug: 'fish-combo',
    name: 'Family Fish Combo',
    slug: 'family-fish-combo',
    image: '/images/fish/vanjaram.jpg',
    description: 'A balanced fish combo for family meals.',
    price: 699,
    originalPrice: 799,
    quantity: '1 pack',
    type: 'Combo',
    netWeight: '1kg',
    rating: 4.5,
  },
  {
    id: 'prd-2',
    categorySlug: 'fish-combo',
    name: 'Weekend Grill Combo',
    slug: 'weekend-grill-combo',
    image: '/images/fish/red-snapper.jpg',
    description: 'Premium cuts suited for grilling.',
    price: 899,
    quantity: '1 pack',
    type: 'Combo',
    netWeight: '1kg',
    rating: 4.6,
  },
  {
    id: 'prd-3',
    categorySlug: 'seafood',
    name: 'Tiger Prawns',
    slug: 'tiger-prawns',
    image: '/images/fish/sea-prawn.webp',
    description: 'Large tiger prawns, cleaned and chilled.',
    price: 599,
    originalPrice: 699,
    quantity: '250g',
    type: 'Shellfish',
    netWeight: '250g',
    rating: 4.4,
  },
  {
    id: 'prd-4',
    categorySlug: 'seafood',
    name: 'Blue Crab',
    slug: 'blue-crab',
    image: '/images/fish/blue-crabs.jpg',
    description: 'Fresh blue crab cleaned for easy cooking.',
    price: 499,
    quantity: '300g',
    type: 'Shellfish',
    netWeight: '300g',
    rating: 4.3,
  },
];

export function getCatalogCategories(): CatalogCategory[] {
  return CATEGORIES;
}

export function getCatalogProductsByCategorySlug(slug: string): CatalogProduct[] {
  return PRODUCTS.filter((product) => product.categorySlug === slug);
}
