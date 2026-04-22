import ProductDetailPage from '@/app/fish/[slug]/page';

export default function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  return <ProductDetailPage params={params} />;
}
