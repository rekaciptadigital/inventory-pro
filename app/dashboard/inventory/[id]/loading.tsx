import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-10 w-[300px]" />
        <Skeleton className="h-4 w-[200px] mt-2" />
      </div>

      <div className="grid gap-6">
        <div className="border rounded-lg p-6">
          <Skeleton className="h-6 w-[200px] mb-4" />
          <div className="grid grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i}>
                <Skeleton className="h-4 w-[100px] mb-2" />
                <Skeleton className="h-6 w-[150px]" />
              </div>
            ))}
          </div>
        </div>

        <div className="border rounded-lg p-6">
          <Skeleton className="h-6 w-[200px] mb-4" />
          <Skeleton className="h-20 w-full" />
        </div>

        <div className="border rounded-lg p-6">
          <Skeleton className="h-6 w-[200px] mb-4" />
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="border-b pb-4 last:border-0">
                <Skeleton className="h-5 w-[150px] mb-2" />
                <div className="flex gap-2">
                  {Array.from({ length: 3 }).map((_, j) => (
                    <Skeleton key={j} className="h-6 w-[80px] rounded-full" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}