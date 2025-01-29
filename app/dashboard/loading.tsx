import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="space-y-8">
      <div>
        <Skeleton className="h-10 w-[300px]" />
        <Skeleton className="h-4 w-[400px] mt-2" />
      </div>

      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="border rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <Skeleton className="h-4 w-[100px]" />
              <Skeleton className="h-4 w-4" />
            </div>
            <Skeleton className="h-8 w-[120px] mb-2" />
            <Skeleton className="h-4 w-[150px]" />
          </div>
        ))}
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="border rounded-lg p-6">
            <Skeleton className="h-6 w-[200px] mb-2" />
            <Skeleton className="h-4 w-[300px] mb-6" />
            <div className="h-[200px] flex items-center justify-center">
              <Skeleton className="h-full w-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}