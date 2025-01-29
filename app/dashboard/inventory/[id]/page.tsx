import { Suspense } from 'react';
import { ProductDetail } from './product-detail';
import Loading from './loading';

export function generateStaticParams() {
  // Generate an array of possible IDs
  return Array.from({ length: 20 }, (_, i) => ({
    id: (i + 1).toString()
  }));
}

export const dynamicParams = false;

export default function ProductDetailPage() {
  return (
    <Suspense fallback={<Loading />}>
      <ProductDetail />
    </Suspense>
  );
}