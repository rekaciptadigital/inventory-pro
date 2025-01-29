import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <Skeleton className="h-10 w-[300px]" />
          <Skeleton className="h-4 w-[400px] mt-2" />
        </div>
        <Skeleton className="h-10 w-[100px]" />
      </div>

      <div className="space-y-6">
        {/* Pricing Info Section */}
        <div className="border rounded-lg p-6">
          <Skeleton className="h-6 w-[200px] mb-6" />
          <div className="grid gap-6">
            <div className="grid grid-cols-2 gap-4">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-[100px]" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
            </div>
            <Skeleton className="h-24 w-full" />
          </div>
        </div>

        {/* Customer Prices Section */}
        <div className="border rounded-lg p-6">
          <Skeleton className="h-6 w-[200px] mb-6" />
          <div className="grid grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-4 p-4 border rounded-lg">
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-[150px]" />
                  <Skeleton className="h-4 w-[100px]" />
                </div>
                <div className="space-y-4">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}