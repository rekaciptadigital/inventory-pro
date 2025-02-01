'use client';

import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { PriceHistory } from '@/components/price-management/price-history';
import { useInventory } from '@/lib/hooks/inventory/use-inventory';

export function PriceManagementDetail() {
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
          <h1 className="text-2xl font-semibold tracking-tight">Price Management</h1>
          <p className="text-sm text-muted-foreground">
            Manage pricing for {product.full_product_name}
          </p>
        </div>
        <Button variant="outline" onClick={() => router.back()}>
          Back to List
        </Button>
      </div>

      <div className="grid gap-6">
        {/* Price Information Card */}
        <div className="border rounded-lg p-6 bg-card">
          <h2 className="text-lg font-semibold mb-4">Current Price Information</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">SKU</p>
              <p className="text-sm font-medium">{product.sku}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Brand</p>
              <p className="text-sm font-medium">{product.brand_name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Product Type</p>
              <p className="text-sm font-medium">{product.product_type_name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Category</p>
              <p className="text-sm font-medium">
                {product.categories.map(cat => cat.product_category_name).join(' > ')}
              </p>
            </div>
          </div>
        </div>

        {/* Price History */}
        <PriceHistory product={product} />
      </div>
    </div>
  );
}