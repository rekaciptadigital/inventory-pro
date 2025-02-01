import { Suspense } from 'react';
import { EditPriceForm } from './edit-price-form';
import Loading from './loading';

export function generateStaticParams() {
  return Array.from({ length: 20 }, (_, i) => ({
    id: (i + 1).toString()
  }));
}

export const dynamicParams = false;

export default function EditProductPricePage() {
  return (
    <Suspense fallback={<Loading />}>
      <EditPriceForm />
    </Suspense>
  );
}