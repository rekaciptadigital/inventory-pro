'use client';

import { useParams } from 'next/navigation';
import { useInventory } from '@/lib/hooks/inventory/use-inventory';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils/format';

export function ProductDetail() {
  const { id } = useParams();
  const { products } = useInventory();
  
  const product = products.find(p => p.id === Number(id));

  if (!product) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Product not found
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{product.full_product_name}</h1>
        <p className="text-muted-foreground">SKU: {product.sku}</p>
      </div>

      <div className="grid gap-6">
        <div className="border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
          <dl className="grid grid-cols-2 gap-4">
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Brand</dt>
              <dd>{product.brand_name}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Type</dt>
              <dd>{product.product_type_name}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Unit</dt>
              <dd>{product.unit}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Vendor SKU</dt>
              <dd>{product.vendor_sku || '-'}</dd>
            </div>
          </dl>
        </div>

        {product.description && (
          <div className="border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Description</h2>
            <p className="text-muted-foreground">{product.description}</p>
          </div>
        )}

        {product.variants.length > 0 && (
          <div className="border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Variants</h2>
            <div className="space-y-4">
              {product.variants.map((variant) => (
                <div key={variant.id} className="border-b pb-4 last:border-0">
                  <h3 className="font-medium">{variant.variant_name}</h3>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {variant.values.map((value) => (
                      <Badge key={value.id} variant="secondary">
                        {value.variant_value_name}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}