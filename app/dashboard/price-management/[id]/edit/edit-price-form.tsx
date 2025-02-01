'use client';

import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { PricingInfo } from '@/components/price-management/pricing-info';
import { CustomerPrices } from '@/components/price-management/customer-prices';
import { useInventory } from '@/lib/hooks/inventory/use-inventory';

export function EditPriceForm() {
  const { id } = useParams();
  const router = useRouter();
  const { products } = useInventory();
  const product = products.find(p => p.id.toString() === id);

  if (!product) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Product not found
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Edit Product Price</h1>
          <p className="text-sm text-muted-foreground">
            Update pricing information for {product.full_product_name}
          </p>
        </div>
        <Button variant="outline" onClick={() => router.back()}>
          Back to List
        </Button>
      </div>

      <div className="space-y-6">
        <PricingInfo product={product} />
        <CustomerPrices product={product} />
      </div>
    </div>
  );
}