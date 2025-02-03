import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  // Create static skeleton items with predefined IDs
  const skeletonItems = [
    'header',
    'main',
    'secondary',
    'footer',
    'extra',
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <Skeleton className="h-10 w-[200px]" />
          <Skeleton className="h-4 w-[300px] mt-2" />
        </div>
        <Skeleton className="h-10 w-[150px]" />
      </div>

      <div className="flex gap-4">
        <Skeleton className="h-10 flex-1" />
        <Skeleton className="h-10 w-[180px]" />
      </div>

      <div className="border rounded-lg">
        <div className="p-4">
          {skeletonItems.map((item) => (
            <div
              key={`location-skeleton-${item}`}
              className="flex items-center space-x-4 py-4 border-b last:border-0"
            >
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-[100px]" />
                <Skeleton className="h-4 w-[200px]" />
              </div>
              <Skeleton className="h-6 w-[100px]" />
              <div className="flex gap-2">
                <Skeleton className="h-8 w-8" />
                <Skeleton className="h-8 w-8" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}