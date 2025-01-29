import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";

export default function Loading() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-10 w-[200px]" />
        <Skeleton className="h-4 w-[300px] mt-2" />
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-[150px]" />
            <Skeleton className="h-4 w-[250px] mt-2" />
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="grid gap-2">
                  <Skeleton className="h-4 w-[100px]" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
            </div>
            <Skeleton className="h-[1px] w-full" />
            <div className="grid gap-2">
              <Skeleton className="h-4 w-[100px]" />
              <Skeleton className="h-10 w-full" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-[150px]" />
            <Skeleton className="h-4 w-[250px] mt-2" />
          </CardHeader>
          <CardContent className="space-y-4">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Skeleton className="h-4 w-[150px]" />
                  <Skeleton className="h-4 w-[200px]" />
                </div>
                <Skeleton className="h-6 w-10" />
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="flex justify-end space-x-4">
          <Skeleton className="h-10 w-[100px]" />
          <Skeleton className="h-10 w-[100px]" />
        </div>
      </div>
    </div>
  );
}