"use client";

import { useState, useMemo } from 'react';
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { PricingInfo } from "@/components/price-management/pricing-info";
import { CustomerPrices } from "@/components/price-management/customer-prices";
import { VariantPrices } from '@/components/price-management/variant-prices';
import { useProducts } from "@/lib/hooks/use-products";
import type { PriceFormFields } from '@/types/form';

export function EditPriceForm() {
  const { id } = useParams();
  const router = useRouter();
  const { getProductById } = useProducts();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Get product once and memoize it
  const product = useMemo(() => 
    id ? getProductById(id as string) : undefined,
    [id, getProductById]
  );

  // Initialize form with product values
  const form = useForm<PriceFormFields>({
    defaultValues: {
      usdPrice: product?.usdPrice ?? 0,
      exchangeRate: product?.exchangeRate ?? 0,
      hbReal: product?.hbReal ?? 0,
      adjustmentPercentage: product?.adjustmentPercentage ?? 0,
      hbNaik: product?.hbNaik ?? 0,
      customerPrices: product?.customerPrices || {},
      percentages: product?.percentages || {},
      variantPrices: {},
    },
  });

  const handleSubmit = async (values: PriceFormFields) => {
    setIsSubmitting(true);
    try {
      // Add your update logic here
      console.log('Submitting values:', values);
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
            Update pricing information for {product?.product_name ?? 'Loading...'}
          </p>
        </div>
        <Button variant="outline" onClick={() => router.push('/dashboard/price-management')}>
          Back to List
        </Button>
      </div>

      <Form {...form}>
        <div className="space-y-6">
          <PricingInfo form={form} product={product} />
          <CustomerPrices form={form} />

          {/* Product Variant Prices - always show */}
          {product && (
            <VariantPrices 
              form={form}
              product={product}
              defaultPriceCategory="retail"
            />
          )}

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/dashboard/price-management')}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              onClick={form.handleSubmit(handleSubmit)}
            >
              {isSubmitting ? 'Updating...' : 'Update Prices'}
            </Button>
          </div>
        </div>
      </Form>
    </div>
  );
}