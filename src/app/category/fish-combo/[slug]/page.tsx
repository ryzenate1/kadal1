import FishPage from '@/app/fish/[slug]/page';

export default function FishComboDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  return <FishPage params={params} />;
}
