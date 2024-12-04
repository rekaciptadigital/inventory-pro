'use client';

import { VariantForm } from '@/components/inventory/variant-form/variant-form';

export default function NewVariantPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Add Product Variants</h1>
        <p className="text-muted-foreground">
          Create multiple product variants at once
        </p>
      </div>

      <div className="border rounded-lg p-6">
        <VariantForm />
      </div>
    </div>
  );
}