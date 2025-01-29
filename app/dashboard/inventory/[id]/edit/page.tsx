import { Suspense } from 'react';
import { EditProductForm } from './edit-product-form';
import Loading from './loading';

export function generateStaticParams() {
  // Generate an array of possible IDs
  return Array.from({ length: 20 }, (_, i) => ({
    id: (i + 1).toString()
  }));
}

export const dynamicParams = false;

export default function EditProductPage() {
  return (
    <Suspense fallback={<Loading />}>
      <EditProductForm />
    </Suspense>
  );
}