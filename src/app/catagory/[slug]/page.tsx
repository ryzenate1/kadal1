"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

// This handles misspelled URLs like '/catagory/fish-combo' and redirects to '/category/fish-combo'
export default function CatagorySlugRedirect({ params }: { params: Promise<{ slug: string }> }) {
  const router = useRouter();

  useEffect(() => {
    const getSlugAndRedirect = async () => {
      const { slug } = await params;
      // Redirect to the correct category page with the slug
      router.replace(`/category/${slug}`);
    };
    
    getSlugAndRedirect();
  }, [router, params]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh]">
      <Loader2 className="h-10 w-10 animate-spin text-kadal-red" />
      <h2 className="mt-4 text-lg font-medium">Redirecting to the correct category...</h2>
    </div>
  );
}
