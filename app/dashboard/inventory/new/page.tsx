'use client';

import { useRouter } from 'next/navigation';
import { SingleProductForm } from '@/components/inventory/product-form/single-product-form';

export default function NewProductPage() {
  const router = useRouter();

  const handleSuccess = () => {
    router.push('/dashboard/inventory');
  };

  return (
    <div className="min-h-full flex flex-col">
      <div className="flex-none mb-6">
        <h1 className="text-3xl font-bold">Add New Product</h1>
        <p className="text-muted-foreground">
          Add a new single product to your inventory
        </p>
      </div>

      <div className="flex-1 border rounded-lg">
        <SingleProductForm onSuccess={handleSuccess} />
      </div>
    </div>
  );
}