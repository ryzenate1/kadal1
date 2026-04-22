'use client';

import { use, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

// Redirect old /categories/[fishName] URLs to new /category/[slug] route
export default function CategoryFishRedirect({ params }: { params: Promise<{ fishName: string }> }) {
  const { fishName } = use(params);
  const router = useRouter();

  useEffect(() => {
    // Map known fish names to proper category slugs
    const fishNameLower = fishName.toLowerCase();

    let targetSlug = fishNameLower;

    // If it looks like a category keyword, map it
    if (fishNameLower.includes('dried')) targetSlug = 'dried-fish';
    else if (fishNameLower.includes('prawn') || fishNameLower.includes('crab') || fishNameLower.includes('lobster') || fishNameLower.includes('squid')) targetSlug = 'seafood';
    else if (fishNameLower.includes('combo')) targetSlug = 'fish-combo';
    else if (fishNameLower.includes('premium')) targetSlug = 'premium-fish';

    router.replace(`/category/${targetSlug}`);
  }, [fishName, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-red-500" />
        <p className="text-gray-500 text-sm">Redirecting...</p>
      </div>
    </div>
  );
}
