"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { PricingInfo } from "@/components/price-management/pricing-info";
import { CustomerPrices } from "@/components/price-management/customer-prices";
import { VariantPrices } from '@/components/price-management/variant-prices';
import { getPriceDetail, getInventoryProductDetail, updatePriceDetail } from "@/lib/api/price-management";
import { useToast } from '@/components/ui/use-toast';
import type { PriceFormFields } from '@/types/form';
import type { InventoryProduct } from '@/types/inventory';

// Update the helper function to properly handle nullable inputs
const safeParseId = (id?: string | null): number | null => {
  if (!id) return null;
  return /^\d+$/.test(id) ? parseInt(id, 10) : null;
};

export function EditPriceForm() {
  // Add null checking when accessing params.id
  const params = useParams<{ id: string }>();
  const id = params?.id ?? ''; // Use nullish coalescing instead of logical OR
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
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
          getPriceDetail(id),  // Remove unnecessary type assertion
          getInventoryProductDetail(id) // Remove unnecessary type assertion
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

  // Transform form data to API format
  const transformFormToApiData = (values: PriceFormFields) => {
    // Base price data
    const apiData = {
      id: parseInt(id ?? '0', 10),
      usd_price: values.usdPrice,
      exchange_rate: values.exchangeRate,
      adjustment_percentage: values.adjustmentPercentage,
      price_hb_real: values.hbReal,
      hb_adjustment_price: values.hbNaik,
      is_manual_product_variant_price_edit: values.isManualVariantPriceEdit,
      is_enable_volume_discount: values.isEnableVolumeDiscount,
      is_enable_volume_discount_by_product_variant: values.isEnableVolumeDiscountByProductVariant,
      
      // Transform customer prices to array format - FIXED to avoid duplications
      customer_category_prices: Object.entries(values.customerPrices ?? {})
        .filter(([categoryId, priceData]) => {
          // Only include entries with proper price data and name
          return priceData?.name && 
                 (priceData?.taxInclusivePrice > 0 || priceData?.preTaxPrice > 0);
        })
        .map(([categoryId, priceData]) => {
          // Parse ID to number if possible
          const numericId = parseInt(categoryId);
          const isNumericId = !isNaN(numericId);
          
          return {
            price_category_id: isNumericId ? numericId : categoryId,
            price_category_name: priceData.name ?? categoryId,
            formula: `Formula: HB Naik + ${priceData.markup ?? 0}% markup`,
            percentage: parseFloat(String(priceData.markup ?? 0)),
            set_default: categoryId === values.defaultPriceCategoryId,
            pre_tax_price: priceData.preTaxPrice ?? 0,
            tax_inclusive_price: priceData.taxInclusivePrice ?? 0,
            tax_id: 2,
            tax_percentage: priceData.taxPercentage ?? 11,
            is_custom_tax_inclusive_price: !!priceData.isCustomTaxInclusivePrice,
            price_category_custom_percentage: parseFloat(String((values.percentages ?? {})[categoryId] ?? priceData.markup ?? 0))
          };
        }),
      
      // Transform marketplace prices to array format - FIXED to avoid duplications
      marketplace_category_prices: Object.entries(values.marketplacePrices ?? {})
        .filter(([categoryId, priceData]) => {
          // Only include entries with proper price data and name
          return priceData && 
                 priceData.name && 
                 (priceData.price > 0);
        })
        .map(([categoryId, priceData]) => {
          // Parse ID to number if possible
          const numericId = parseInt(categoryId);
          const isNumericId = !isNaN(numericId);
          
          return {
            price_category_id: isNumericId ? numericId : categoryId,
            price_category_name: priceData.name ?? categoryId,
            price_category_percentage: parseFloat(String(priceData.customPercentage ?? 0)),
            price_category_set_default: false,
            price: priceData.price ?? 0,
            price_category_custom_percentage: parseFloat(String((values.marketplacePercentages ?? {})[categoryId] ?? priceData.customPercentage ?? 0)),
            is_custom_price_category: !!priceData.isCustomPrice
          };
        }),
      
      // Transform variant prices with proper type assertion to fix error
      product_variant_prices: Object.entries(values.variantPrices ?? {})
        .map(([variantId, variantData]) => {
          // Find the variant info
          const variant = productDetail?.product_by_variant?.find(
            v => v.sku_product_variant === variantId
          );
          
          if (!variant) return null;
          
          const allCategories = [
            ...Object.entries(values.customerPrices ?? {})
              .filter(([_, data]) => data && data.name) // Only include entries with name
              .map(([id, data]) => ({
                id: parseInt(id) || id,
                name: data.name ?? '',
                type: 'customer',
                set_default: id === values.defaultPriceCategoryId
              })),
            ...Object.entries(values.marketplacePrices ?? {})
              .filter(([_, data]) => data && data.name) // Only include entries with name
              .map(([id, data]) => ({
                id: parseInt(id) || id,
                name: data.name ?? '',
                type: 'marketplace',
                set_default: false
              }))
          ];
          
          // Prepare price categories data
          const priceCategories = allCategories.map(category => {
            let price = 0;
            
            // For customer prices
            if (category.type === 'customer') {
              const customerPrice = (variantData.customerPrices ?? {})[category.id as string];
              price = customerPrice?.rounded ?? 
                    (values.customerPrices ?? {})[category.id as string]?.taxInclusivePrice ?? 0;
            } 
            // For marketplace prices
            else {
              const marketplacePrice = (variantData.marketplacePrices ?? {})[category.id as string];
              price = marketplacePrice?.rounded ?? 
                    (values.marketplacePrices ?? {})[category.id as string]?.price ?? 0;
            }
            
            return {
              id: category.id,
              price,
              price_category_name: category.name,
              percentage: parseFloat(String(
                category.type === 'customer' 
                  ? ((values.percentages ?? {})[category.id as string] ?? 0)
                  : ((values.marketplacePercentages ?? {})[category.id as string] ?? 0)
              )),
              type: category.type,
              set_default: category.set_default
            };
          });
          
          return {
            variant_id: variant.id,
            variant_name: variant.full_product_name,
            sku_product_variant: variant.sku_product_variant,
            usd_price: variantData.usdPrice ?? values.usdPrice,
            exchange_rate: variantData.exchangeRate ?? values.exchangeRate,
            adjustment_percentage: variantData.adjustmentPercentage ?? values.adjustmentPercentage,
            status: true,
            price_categories: priceCategories
          };
        })
        .filter((item): item is NonNullable<typeof item> => item !== null),
      
      // Transform volume discounts - ensure this is always a valid array
      global_volume_discounts: !values.isEnableVolumeDiscount ? [] : 
        mapGlobalVolumeDiscounts(values, productDetail?.product_by_variant ?? []), // Use ?? instead of ||
      
      // Transform variant volume discounts - ensure this is always a valid array
      variant_volume_discounts: !values.isEnableVolumeDiscount || !values.isEnableVolumeDiscountByProductVariant ? [] :
        mapVariantVolumeDiscounts(values, productDetail?.product_by_variant ?? []) // Use ?? instead of ||
          .filter((item): item is NonNullable<typeof item> => item !== null)
    };
    
    return apiData;
  };

  // Handle form submission with API integration
  const handleSubmit = async (values: PriceFormFields) => {
    setIsSubmitting(true);
    try {
      // Transform form data to API format
      const apiData = transformFormToApiData(values);
      
      // Add detailed error logging to debug the API request
      console.log("Submitting payload to API:", JSON.stringify(apiData, null, 2));
      
      // Send update request (add null check for id)
      if (!id) {
        throw new Error('Product ID is missing');
      }
      
      // Add API error inspection
      try {
        const response = await updatePriceDetail(id, apiData);
        console.log("API response:", response);
        
        // Show success message
        toast({
          title: "Success",
          description: "Product prices have been updated successfully",
        });
        
        // Navigate back to price management list
        router.push('/dashboard/price-management');
      } catch (apiError: any) {
        // Log detailed API error information
        console.error("API Error:", apiError);
        console.error("API Error response data:", apiError.response?.data);
        console.error("API Error status:", apiError.response?.status);
        
        // More descriptive error message based on API response
        let errorMessage = "Failed to update product prices. Please check your data and try again.";
        
        if (apiError.response?.data?.message) {
          errorMessage = apiError.response.data.message;
        } else if (apiError.response?.data?.error) {
          errorMessage = apiError.response.data.error;
        } else if (typeof apiError.response?.data === 'string') {
          errorMessage = apiError.response.data;
        }
        
        toast({
          variant: 'destructive',
          title: `Error (${apiError.response?.status || 'Unknown'})`,
          description: errorMessage,
          duration: 5000,
        });
      }
    } catch (error) {
      console.error("Error preparing form data:", error);
      
      // Show error message
      toast({
        variant: 'destructive',
        title: "Error",
        description: "Failed to prepare form data. Please check your inputs and try again.",
        duration: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper function to map global volume discounts
  const mapGlobalVolumeDiscounts = (values: PriceFormFields, variants: any[]) => {
    if (!values.isEnableVolumeDiscount) return [];
    
    // Get the global tiers data from the form
    const globalTiers = values.globalVolumeDiscounts ?? [];
    
    return globalTiers.map((tier: any) => {
      // Get all category prices for this tier
      const priceCategories = [];
      
      // Add customer categories - only include those with valid names
      for (const [categoryId, priceData] of Object.entries(values.customerPrices ?? {})) {
        if (!priceData || !priceData.name) continue;
        
        // Parse ID to number if possible
        const categoryIdNum = parseInt(categoryId);
        const isNumericId = !isNaN(categoryIdNum);
        
        priceCategories.push({
          id: null,
          inventory_product_global_discount_id: null,
          price_category_id: isNumericId ? categoryIdNum : categoryId,
          price_category_name: priceData.name,
          price_category_type: 'customer',
          price_category_percentage: parseFloat(String(priceData.markup ?? 0)),
          price_category_set_default: categoryId === values.defaultPriceCategoryId,
          price: calculateDiscountedPrice(priceData.taxInclusivePrice, tier.discount_percentage)
        });
      }
      
      // Add marketplace categories - only include those with valid names
      for (const [categoryId, priceData] of Object.entries(values.marketplacePrices ?? {})) {
        if (!priceData || !priceData.name) continue;
        
        // Parse ID to number if possible
        const categoryIdNum = parseInt(categoryId);
        const isNumericId = !isNaN(categoryIdNum);
        
        priceCategories.push({
          id: null,
          inventory_product_global_discount_id: null,
          price_category_id: isNumericId ? categoryIdNum : categoryId,
          price_category_name: priceData.name,
          price_category_type: 'marketplace',
          price_category_percentage: parseFloat(String(priceData.customPercentage ?? 0)),
          price_category_set_default: false,
          price: calculateDiscountedPrice(priceData.price, tier.discount_percentage)
        });
      }
      
      return {
        id: tier.id ?? null,
        inventory_product_pricing_information_id: safeParseId(id),
        quantity: tier.quantity,
        discount_percentage: parseFloat(String(tier.discount_percentage)),
        global_volume_discount_price_categories: priceCategories
      };
    });
  };
    
  // Helper function to map variant volume discounts
  const mapVariantVolumeDiscounts = (values: PriceFormFields, variants: any[]) => {
    if (!values.isEnableVolumeDiscount || !values.isEnableVolumeDiscountByProductVariant) return [];
    
    // Get the variant volume discount data
    const variantDiscounts = values.variantVolumeDiscounts ?? [];
    
    return variantDiscounts.map((variantDiscount: any) => {
      // Find the variant info
      const variant = variants.find(v => v.id === variantDiscount.variant_id);
      
      if (!variant) return null;
      
      return {
        id: variantDiscount.id ?? null,
        inventory_product_pricing_information_id: safeParseId(id),
        inventory_product_by_variant_id: variant.id,
        inventory_product_by_variant_full_product_name: variant.full_product_name,
        inventory_product_by_variant_sku: variant.sku_product_variant,
        inventory_product_volume_discount_variant_quantities: (
          variantDiscount.inventory_product_volume_discount_variant_quantities ?? []
        ).map((qtyItem: any) => {
          // Get all category prices for this tier
          const priceCategories = [];
          
          // Add customer categories - only include those with valid names
          for (const [categoryId, priceData] of Object.entries(values.customerPrices ?? {})) {
            if (!priceData || !priceData.name) continue;
            
            // Parse ID to number if possible
            const categoryIdNum = parseInt(categoryId);
            const isNumericId = !isNaN(categoryIdNum);
            
            priceCategories.push({
              id: null,
              inventory_product_vol_disc_variant_qty_id: null,
              price_category_id: isNumericId ? categoryIdNum : categoryId,
              price_category_name: priceData.name,
              price_category_type: 'customer',
              price_category_percentage: parseFloat(String(priceData.markup ?? 0)),
              price_category_set_default: categoryId === values.defaultPriceCategoryId,
              price: calculateDiscountedPrice(priceData.taxInclusivePrice, qtyItem.discount_percentage)
            });
          }
          
          // Add marketplace categories - only include those with valid names
          for (const [categoryId, priceData] of Object.entries(values.marketplacePrices ?? {})) {
            if (!priceData || !priceData.name) continue;
            
            // Parse ID to number if possible
            const categoryIdNum = parseInt(categoryId);
            const isNumericId = !isNaN(categoryIdNum);
            
            priceCategories.push({
              id: null,
              inventory_product_vol_disc_variant_qty_id: null,
              price_category_id: isNumericId ? categoryIdNum : categoryId,
              price_category_name: priceData.name,
              price_category_type: 'marketplace',
              price_category_percentage: parseFloat(String(priceData.customPercentage ?? 0)),
              price_category_set_default: false,
              price: calculateDiscountedPrice(priceData.price, qtyItem.discount_percentage)
            });
          }
          
          return {
            id: qtyItem.id ?? null,
            inventory_product_volume_discount_variant_id: variantDiscount.id ?? null,
            quantity: qtyItem.quantity,
            discount_percentage: parseFloat(String(qtyItem.discount_percentage)),
            status: true,
            inventory_product_volume_discount_variant_price_categories: priceCategories
          };
        }),
        status: true
      };
    }).filter((item): item is NonNullable<typeof item> => item !== null);
  };
  
  // Helper function to calculate discounted price
  const calculateDiscountedPrice = (basePrice: number, discountPercentage: number): number => {
    return Math.round(basePrice * (1 - discountPercentage / 100));
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
                type="submit"
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