"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { PricingInfo } from "@/components/price-management/pricing-info";
import { CustomerPrices } from "@/components/price-management/customer-prices";
import { VariantPrices } from '@/components/price-management/variant-prices';
// Import the new API function
import { getPriceDetail, getInventoryProductDetail } from "@/lib/api/price-management";
import type { PriceFormFields } from '@/types/form';
// Import InventoryProduct type
import type { InventoryProduct } from '@/types/inventory';

export function EditPriceForm() {
  const { id } = useParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  // Update state type to InventoryProduct | null
  const [productDetail, setProductDetail] = useState<InventoryProduct | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<PriceFormFields>({
    defaultValues: {
      usdPrice: 0,
      exchangeRate: 0,
      hbReal: 0,
      adjustmentPercentage: 0,
      hbNaik: 0,
      customerPrices: {},
      percentages: {},
      variantPrices: {},
      pricingInformation: {
        usdPrice: 0,
        adjustmentPercentage: 0,
      },
      isManualVariantPriceEdit: false,
      isEnableVolumeDiscount: false,
      isEnableVolumeDiscountByProductVariant: false,
    },
  });

  useEffect(() => {
    async function fetchProductData() { // Renamed function
      if (!id) return;
      
      try {
        setIsLoading(true);
        
        // Fetch both price details and general product details concurrently
        const [priceResponse, productResponse] = await Promise.all([
          getPriceDetail(id as string),
          getInventoryProductDetail(id as string) // Fetch general product info
        ]);
        
        const priceData = priceResponse.data;
        const productData = productResponse.data; // General product info
        
        // Merge data: Prioritize general info from productData, pricing from priceData
        const mergedProductDetail: InventoryProduct = {
          ...productData, // Start with general product data
          id: productData.id, // Ensure correct ID
          // Override pricing-related fields with data from priceData
          usdPrice: priceData.usd_price,
          exchangeRate: priceData.exchange_rate,
          hbReal: priceData.price_hb_real,
          adjustmentPercentage: priceData.adjustment_percentage,
          hbNaik: priceData.hb_adjustment_price,
          // Keep product_by_variant from productData as it's more complete
          product_by_variant: productData.product_by_variant || [],
          // Add other fields from InventoryProduct if needed
        };

        setProductDetail(mergedProductDetail); // Set the merged data
        
        // Map variant prices (using priceData as source for variant pricing details)
        const mappedVariantPrices = mapVariantPrices(priceData.product_variant_prices);
        
        // Map API data to form values using merged data where appropriate
        form.reset({
          usdPrice: priceData.usd_price,
          exchangeRate: priceData.exchange_rate,
          hbReal: priceData.price_hb_real,
          adjustmentPercentage: priceData.adjustment_percentage,
          hbNaik: priceData.hb_adjustment_price,
          customerPrices: mapCustomerPrices(priceData.customer_category_prices),
          percentages: mapPercentages(priceData.customer_category_prices),
          variantPrices: mappedVariantPrices,
          pricingInformation: {
            usdPrice: priceData.usd_price,
            adjustmentPercentage: priceData.adjustment_percentage,
          },
          isManualVariantPriceEdit: priceData.is_manual_product_variant_price_edit,
          isEnableVolumeDiscount: priceData.is_enable_volume_discount,
          isEnableVolumeDiscountByProductVariant: priceData.is_enable_volume_discount_by_product_variant,
          marketplacePrices: priceData.marketplace_category_prices 
            ? mapMarketplacePrices(priceData.marketplace_category_prices)
            : {},
          globalVolumeDiscounts: priceData.global_volume_discounts || [],
          variantVolumeDiscounts: priceData.variant_volume_discounts || [],
        });
      } catch (err) {
        console.error("Error fetching product data:", err); // Log the actual error
        setError(err instanceof Error ? err : new Error('Failed to fetch product data'));
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchProductData(); // Call the renamed function
  }, [id, form]);

  // Helper functions to map API data to form structure
  const mapCustomerPrices = (customerCategoryPrices: any[]) => {
    const prices: Record<string, any> = {};
    customerCategoryPrices.forEach(category => {
      prices[category.price_category_id] = {
        preTaxPrice: category.pre_tax_price,
        taxInclusivePrice: category.tax_inclusive_price,
        isCustomTaxInclusivePrice: category.is_custom_tax_inclusive_price,
        taxPercentage: category.tax_percentage,
        customPercentage: category.price_category_custom_percentage || category.percentage,
        name: category.price_category_name, // Add the category name
      };
    });
    return prices;
  };

  const mapMarketplacePrices = (marketplaceCategoryPrices: any[]) => {
    const prices: Record<string, any> = {};
    marketplaceCategoryPrices.forEach(category => {
      prices[category.price_category_id] = {
        price: category.price,
        isCustomPrice: category.is_custom_price_category,
        customPercentage: category.price_category_custom_percentage,
        name: category.price_category_name, // Add the category name
      };
    });
    return prices;
  };

  const mapPercentages = (customerCategoryPrices: any[]) => {
    const percentages: Record<string, number> = {};
    customerCategoryPrices.forEach(category => {
      percentages[category.price_category_id] = 
        category.price_category_custom_percentage !== undefined 
          ? category.price_category_custom_percentage 
          : category.percentage;
    });
    return percentages;
  };

  const mapVariantPrices = (productVariantPrices: any[]) => {
    if (!Array.isArray(productVariantPrices)) {
      return {};
    }
    
    const variantPrices: Record<string, any> = {};
    
    productVariantPrices.forEach(variant => {
      if (!variant.variant_id) {
        return;
      }
      
      // Map price categories more safely
      const prices: Record<string, number> = {};
      if (Array.isArray(variant.price_categories)) {
        variant.price_categories.forEach((category: any) => {
          if (category && category.id !== undefined) {
            prices[category.id] = category.price !== null && category.price !== undefined 
              ? Number(category.price) 
              : 0;
          }
        });
      }
      
      variantPrices[variant.variant_id] = {
        usdPrice: variant.usd_price !== undefined ? Number(variant.usd_price) : undefined,
        exchangeRate: variant.exchange_rate !== undefined ? Number(variant.exchange_rate) : undefined,
        adjustmentPercentage: variant.adjustment_percentage !== undefined ? Number(variant.adjustment_percentage) : undefined,
        prices,
        status: variant.status,
        sku: variant.sku_product_variant,
        name: variant.variant_name,
      };
    });
    
    return variantPrices;
  };

  const handleSubmit = async (values: PriceFormFields) => {
    setIsSubmitting(true);
    try {
      // Add your update logic here
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      router.push('/dashboard/price-management');
    } catch (error) {
      // Handle error silently
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Loading and Error Handling ---
  if (isLoading) {
    return <div className="flex justify-center items-center h-[400px]">Loading product prices...</div>;
  }

  if (error) {
    // Consider a more user-friendly error display instead of throwing
    return <div className="text-destructive p-4 border border-destructive rounded-md">Error loading product data: {error.message}</div>;
    // throw error; // Or keep throwing if you have a higher-level error boundary
  }
  // --- End Loading and Error Handling ---


  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Edit Product Price</h1>
          <p className="text-muted-foreground">
            {/* Use full_product_name from the merged productDetail state */}
            Update pricing information for {productDetail?.full_product_name ?? 'Product'}
          </p>
        </div>
        <Button variant="outline" onClick={() => router.push('/dashboard/price-management')}>
          Back to List
        </Button>
      </div>

      {/* --- Conditionally render form content --- */}
      {productDetail && (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6"> {/* Add form element and onSubmit */}
            <PricingInfo form={form} product={productDetail} />
            <CustomerPrices form={form} />
            <VariantPrices
              form={form}
              product={productDetail}
            />

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
                type="submit" // Use standard submit
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Updating...' : 'Update Prices'}
              </Button>
            </div>
          </form> {/* Close form element */}
        </Form>
      )}
      {/* --- End Conditional Rendering --- */}

      {/* --- Show message if productDetail is null after loading --- */}
      {!productDetail && !isLoading && (
         <div className="p-4 border rounded-md text-muted-foreground">
           Product data could not be loaded or is unavailable.
         </div>
      )}
      {/* --- End Message --- */}
    </div>
  );
}