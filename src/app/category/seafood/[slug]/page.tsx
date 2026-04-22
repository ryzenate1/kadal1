import FishPage from '@/app/fish/[slug]/page';

export default function SeafoodDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  return <FishPage params={params} />;
}
