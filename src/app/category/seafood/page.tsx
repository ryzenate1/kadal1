import CategoryPage from '@/app/category/[slug]/page';

export default function SeafoodPage() {
  return <CategoryPage params={Promise.resolve({ slug: 'seafood' })} />;
}
