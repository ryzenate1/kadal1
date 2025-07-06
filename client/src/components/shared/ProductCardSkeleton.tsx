import { Skeleton } from "@/components/ui/skeleton";

const ProductCardSkeleton = () => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-3 animate-pulse">
      <Skeleton className="h-40 w-full rounded-lg mb-3" />
      <Skeleton className="h-5 w-3/4 mb-2" />
      <Skeleton className="h-4 w-1/2 mb-2" />
      <Skeleton className="h-4 w-1/3 mb-4" />
      <Skeleton className="h-9 w-full rounded" />
    </div>
  );
};

export default ProductCardSkeleton;
