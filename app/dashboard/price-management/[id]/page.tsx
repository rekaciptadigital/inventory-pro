'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { PricingInfo } from '@/components/price-management/pricing-info';
import { CustomerPrices } from '@/components/price-management/customer-prices';
import { useProducts } from '@/lib/hooks/use-products';

export default function EditProductPricePage({ 
  params 
}: { 
  params: { id: string } 
}) {
  const router = useRouter();
  const { getProductById } = useProducts();
  const product = getProductById(params.id);

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
          <h1 className="text-3xl font-bold">Edit Product Price</h1>
          <p className="text-muted-foreground">
            Update pricing information for {product.productName}
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => router.back()}
        >
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