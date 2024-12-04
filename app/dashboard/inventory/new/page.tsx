'use client';

import { SingleProductForm } from '@/components/inventory/product-form/single-product-form';

export default function NewProductPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Add New Product</h1>
        <p className="text-muted-foreground">
          Add a new single product to your inventory
        </p>
      </div>

      <div className="border rounded-lg p-6">
        <SingleProductForm />
      </div>
    </div>
  );
}