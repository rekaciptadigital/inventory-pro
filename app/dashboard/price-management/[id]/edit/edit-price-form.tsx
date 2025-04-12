"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { PricingInfo } from "@/components/price-management/pricing-info";
import { CustomerPrices } from "@/components/price-management/customer-prices";
import { VariantPrices } from '@/components/price-management/variant-prices';
import { getPriceDetail } from "@/lib/api/price-management";
import type { PriceFormFields } from '@/types/form';

export function EditPriceForm() {
  const { id } = useParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [productDetail, setProductDetail] = useState<any>(null);
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
    async function fetchProductPrices() {
      if (!id) return;
      
      try {
        setIsLoading(true);
        const response = await getPriceDetail(id as string);
        const priceData = response.data;
        
        // Create an enhanced product detail object with all needed properties
        const enhancedProductDetail = {
          ...priceData,
          // Essential ID and name
          id: priceData.inventory_product_id,
          product_id: priceData.inventory_product_id,
          product_name: priceData.product_name || `Product ${priceData.inventory_product_id}`,
          
          // Ensure variant data is properly structured for the component
          product_variants: priceData.product_variant_prices.map((variant: any) => ({
            id: variant.variant_id,
            variant_id: variant.variant_id, // Both formats for safety
            name: variant.variant_name,
            variant_name: variant.variant_name, // Both formats for safety
            sku: variant.sku_product_variant,
            status: variant.status !== undefined ? variant.status : true,
          })),
          
          // Keep original arrays accessible too
          variants: priceData.product_variant_prices,
          product_variant_prices: priceData.product_variant_prices,
          // Add these for compatibility with VariantPrices component
          product_by_variant: priceData.product_variant_prices.map((variant: any) => ({
            ...variant,
            sku_product_variant: variant.sku_product_variant || variant.variant_id,
            full_product_name: variant.variant_name
          }))
        };

        setProductDetail(enhancedProductDetail);
        
        // Map variant prices
        const mappedVariantPrices = mapVariantPrices(priceData.product_variant_prices);
        
        // Map API data to form values
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
        setError(err instanceof Error ? err : new Error('Failed to fetch product prices'));
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchProductPrices();
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

  if (isLoading) {
    return <div className="flex justify-center items-center h-[400px]">Loading product prices...</div>;
  }

  if (error) {
    throw error; // This will trigger the error boundary
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Edit Product Price</h1>
          <p className="text-muted-foreground">
            Update pricing information for {productDetail?.product_name || 'Product'}
          </p>
        </div>
        <Button variant="outline" onClick={() => router.push('/dashboard/price-management')}>
          Back to List
        </Button>
      </div>

      <Form {...form}>
        <div className="space-y-6">
          <PricingInfo form={form} product={productDetail} />
          <CustomerPrices form={form} />

          {productDetail ? (
            <VariantPrices 
              form={form}
              product={productDetail}
            />
          ) : (
            <div className="p-4 border rounded-md text-muted-foreground">
              Product data not available
            </div>
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