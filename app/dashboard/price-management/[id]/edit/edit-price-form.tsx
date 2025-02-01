"use client";

import { useState } from 'react';
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PricingInfo } from "@/components/price-management/pricing-info";
import { CustomerPrices } from "@/components/price-management/customer-prices";
import { useProducts } from "@/lib/hooks/use-products";

export function EditPriceForm() {
  const { id } = useParams();
  const router = useRouter();
  const { getProductById } = useProducts();
  const product = getProductById(id as string);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Add your update logic here
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      router.push('/dashboard/price-management');
    } catch (error) {
      console.error('Failed to update prices:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Edit Product Price</h1>
          <p className="text-muted-foreground">
            Update pricing information for lalala jos
          </p>
        </div>
        <Button variant="outline" onClick={() => router.push('/dashboard/price-management')}>
          Back to List
        </Button>
      </div>

      <div className="space-y-6">
        <PricingInfo product={product} />
        <CustomerPrices product={product} />

        <div className="flex justify-end space-x-4">
          <Button
            variant="outline"
            onClick={() => router.push('/dashboard/price-management')}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Updating...' : 'Update Prices'}
          </Button>
        </div>
      </div>
    </div>
  );
}