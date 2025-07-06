"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

// This page handles misspelled URL '/catagory' and redirects to the correct '/category' URL
export default function CatagoryRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the correct category page
    router.replace("/category");
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh]">
      <Loader2 className="h-10 w-10 animate-spin text-kadal-red" />
      <h2 className="mt-4 text-lg font-medium">Redirecting to categories...</h2>
    </div>
  );
}
