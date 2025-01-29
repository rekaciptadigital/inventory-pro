'use client';

import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PricingInfo } from "@/components/price-management/pricing-info";
import { CustomerPrices } from "@/components/price-management/customer-prices";
import { useProducts } from "@/lib/hooks/use-products";

export function generateStaticParams() {
  // Generate static paths for catch-all route
  return [
    { slug: ['edit'] },
    { slug: ['view'] }
  ];
}

export const dynamicParams = false;

export default function EditProductPricePage() {
  const { id } = useParams();
  const router = useRouter();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Edit Product Price</h1>
          <p className="text-muted-foreground">
            Update pricing information
          </p>
        </div>
        <Button variant="outline" onClick={() => router.back()}>
          Back to List
        </Button>
      </div>

      <div className="space-y-6">
        {/* Dynamic content will be loaded client-side */}
      </div>
    </div>
  );
}