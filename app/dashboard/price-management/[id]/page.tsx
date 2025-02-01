import { Suspense } from 'react';
import { PriceManagementDetail } from './price-management-detail';
import { Skeleton } from '@/components/ui/skeleton';

export function generateStaticParams() {
  return Array.from({ length: 20 }, (_, i) => ({
    id: (i + 1).toString()
  }));
}

export const dynamicParams = false;

export default function PriceManagementDetailPage() {
  return (
    <Suspense fallback={<Skeleton className="h-[400px]" />}>
      <PriceManagementDetail />
    </Suspense>
  );
}