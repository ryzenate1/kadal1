'use client';

import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { LocationFlow } from '@/components/location/LocationFlow';
import { useLocation, type Address } from '@/context/LocationContext';

function ChooseLocationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setLocation } = useLocation();

  const returnTo = searchParams.get('returnTo') || '/';

  const handleLocationSelect = (location: Address) => {
    setLocation(location);
    router.push(returnTo.startsWith('/') ? returnTo : '/');
  };

  return (
    <div className="min-h-[100dvh] bg-white">
      <LocationFlow onClose={() => router.back()} onLocationSelect={handleLocationSelect} />
    </div>
  );
}

export default function ChooseLocationPage() {
  return (
    <Suspense fallback={<div className="min-h-[100dvh] bg-white" />}>
      <ChooseLocationContent />
    </Suspense>
  );
}
