"use client";

import { Button } from "@/components/ui/button";
import { PricingInfo } from "@/components/price-management/pricing-info";
import { CustomerPrices } from "@/components/price-management/customer-prices";
import { useProducts } from "@/lib/hooks/use-products";
import { useParams } from "next/navigation";

export function EditPriceForm() {
  const { id } = useParams();
  const { getProductById } = useProducts();
  const product = getProductById(id as string);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Edit Product Price</h1>
          <p className="text-muted-foreground">
            Update pricing information for lalala jos
          </p>
        </div>
        <Button variant="outline" onClick={() => console.log("back")}>
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
