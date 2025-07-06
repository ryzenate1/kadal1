import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-primary/10", className)}
      {...props}
    />
  )
}

export { Skeleton }

export const ProductCardSkeleton = () => (
  <div className="animate-pulse">
    <div className="aspect-square bg-gray-200 rounded-lg mb-4" />
    <div className="h-4 bg-gray-200 rounded mb-2" />
    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
    <div className="h-8 bg-gray-200 rounded" />
  </div>
)

export const ProductGridSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
    {Array.from({ length: 8 }).map((_, i) => (
      <ProductCardSkeleton key={i} />
    ))}
  </div>
)
