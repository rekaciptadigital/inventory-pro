import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="min-h-full flex flex-col">
      <div className="flex-none mb-6">
        <Skeleton className="h-10 w-[300px]" />
        <Skeleton className="h-4 w-[400px] mt-2" />
      </div>

      <div className="flex-1 border rounded-lg p-6">
        <div className="space-y-8">
          <div>
            <Skeleton className="h-6 w-[200px] mb-4" />
            <div className="grid grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-10" />
              ))}
            </div>
          </div>

          <div>
            <Skeleton className="h-6 w-[200px] mb-4" />
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-10" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}