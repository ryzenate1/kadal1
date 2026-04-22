"use client";

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function AddNewAddressPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (!params.get('returnTo')) {
      params.set('returnTo', 'choose-location');
    }
    router.replace(`/add-details?${params.toString()}`);
  }, [router, searchParams]);

  return null;
}

export default function AddNewAddressPage() {
  return (
    <Suspense fallback={null}>
      <AddNewAddressPageInner />
    </Suspense>
  );
}
