import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <Skeleton className="h-10 w-[300px]" />
          <Skeleton className="h-4 w-[400px] mt-2" />
        </div>
        <Skeleton className="h-10 w-[150px]" />
      </div>

      <div className="flex gap-4">
        <Skeleton className="h-10 flex-1" />
      </div>

      <div className="border rounded-lg">
        <div className="p-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="flex items-center space-x-4 py-4 border-b last:border-0"
            >
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-[200px]" />
                <div className="flex gap-2 mt-2">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-6 w-[80px] rounded-full" />
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-8 w-8" />
                <Skeleton className="h-8 w-8" />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-between items-center">
        <Skeleton className="h-8 w-[200px]" />
        <Skeleton className="h-8 w-[300px]" />
      </div>
    </div>
  );
}