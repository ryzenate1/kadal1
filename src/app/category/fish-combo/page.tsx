import CategoryPage from '@/app/category/[slug]/page';

export default function FishComboPage() {
  return <CategoryPage params={Promise.resolve({ slug: 'fish-combo' })} />;
}
