'use client';

import { useEffect, useCallback, Fragment, useRef } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { PriceFormFields } from '@/types/form';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { formatCurrency } from '@/lib/utils/format';
import type { InventoryProduct } from '@/types/inventory';
import { VolumeDiscount } from './volume-discount';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import {
  setManualPriceEditing,
  initializeVariantPrices,
  updateVariantPrices,
  updateVariantPrice,
  updateVariantUsdPrice,
  updateVariantAdjustment
} from '@/lib/store/slices/variantPricesSlice';

interface VariantPricesProps {
  readonly form: UseFormReturn<PriceFormFields>;
  readonly product: InventoryProduct;
  readonly defaultPriceCategory?: string;
}

// Format number without currency symbol for USD Price
const formatUsdPrice = (price: number): string => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

export function VariantPrices({ form, product, defaultPriceCategory = 'retail' }: Readonly<VariantPricesProps>) {
  const dispatch = useAppDispatch();
  const { manualPriceEditing, prices: variantPrices } = useAppSelector(state => state.variantPrices);
  const variants = product?.product_by_variant || [];
  
  // Refs to prevent infinite loops
  const initializedRef = useRef(false);
  const pricingInfoRef = useRef<{ usdPrice: number; adjustmentPercentage: number } | null>(null);
  
  // Get customer price categories from the form
  const customerPrices = form.watch('customerPrices') || {};
  
  // Get pricing information for default values
  const formValues = form.watch();
  const pricingInfo = formValues.pricingInformation || { usdPrice: 0, adjustmentPercentage: 0 };
  
  // Extract values directly with fallbacks to ensure we get numbers
  const defaultUsdPrice = pricingInfo.usdPrice ?? 0;
  const defaultAdjustment = pricingInfo.adjustmentPercentage ?? 0;
  
  // Log the pricing info values to verify what we're getting
  useEffect(() => {
    console.log('Pricing Info Values:', { 
      pricingInfo,
      defaultUsdPrice, 
      defaultAdjustment 
    });
  }, [pricingInfo, defaultUsdPrice, defaultAdjustment]);
  
  // Use customer price categories to ensure consistency
  const customerCategories = Object.keys(customerPrices).map(key => ({
    id: key,
    name: key.charAt(0).toUpperCase() + key.slice(1) // Capitalize first letter
  }));

  // Update form values from Redux state (separated from Redux update logic)
  useEffect(() => {
    if (!variants.length || !customerCategories.length) return;
    
    // Map Redux state to form structure (adding status field)
    const formattedPrices = Object.entries(variantPrices).reduce((acc, [sku, data]) => {
      acc[sku] = {
        prices: data.prices,
        usdPrice: data.usdPrice ?? defaultUsdPrice,
        adjustmentPercentage: data.adjustmentPercentage ?? defaultAdjustment,
        status: true // Add default status as true
      };
      return acc;
    }, {} as Record<string, { 
      prices: Record<string, number>; 
      usdPrice: number;
      adjustmentPercentage: number;
      status: boolean 
    }>);
    
    // Update the form values with the mapped structure
    form.setValue('variantPrices', formattedPrices, { shouldDirty: true });
    
  }, [variantPrices, customerCategories.length, defaultUsdPrice, defaultAdjustment, form]);

  // Initial setup and customer prices update
  useEffect(() => {
    if (!variants.length || !customerCategories.length) return;
    
    if (!initializedRef.current) {
      dispatch(initializeVariantPrices({
        variants,
        categories: customerCategories,
        customerPrices,
        pricingInfo: {
          usdPrice: defaultUsdPrice,
          adjustmentPercentage: defaultAdjustment
        }
      }));
      initializedRef.current = true;
    } else {
      // Only update prices, not recreate everything
      dispatch(updateVariantPrices({
        variants,
        categories: customerCategories,
        customerPrices,
        pricingInfo: {
          usdPrice: defaultUsdPrice,
          adjustmentPercentage: defaultAdjustment
        }
      }));
    }
  }, [customerCategories.length, customerPrices, dispatch, variants, defaultUsdPrice, defaultAdjustment]);

  // Handle pricing info changes separately to avoid loops
  useEffect(() => {
    const currentInfo = {
      usdPrice: defaultUsdPrice,
      adjustmentPercentage: defaultAdjustment
    };
    
    // Log the current pricing info to verify what we're updating with
    console.log('Updating variants with:', currentInfo);
    
    // Only process if pricing info has actually changed
    if (!pricingInfoRef.current || 
        pricingInfoRef.current.usdPrice !== currentInfo.usdPrice ||
        pricingInfoRef.current.adjustmentPercentage !== currentInfo.adjustmentPercentage) {
      
      // Update ref to new values
      pricingInfoRef.current = currentInfo;
      
      // Don't update if no variants or not initialized
      if (!variants.length || !initializedRef.current) return;
      
      console.log('Applying pricing info to variants:', {
        variants: variants.length,
        usdPrice: defaultUsdPrice,
        adjustmentPercentage: defaultAdjustment
      });
      
      // Apply pricing info to all variants
      variants.forEach(variant => {
        const sku = variant.sku_product_variant;
        dispatch(updateVariantUsdPrice({ sku, price: defaultUsdPrice }));
        dispatch(updateVariantAdjustment({ sku, percentage: defaultAdjustment }));
      });
    }
  }, [defaultUsdPrice, defaultAdjustment, variants, dispatch]);

  // Handle manual price changes
  const handlePriceChange = useCallback((sku: string, category: string, value: string) => {
    const numericValue = parseFloat(value.replace(/\D/g, '')) || 0;
    dispatch(updateVariantPrice({ sku, category, price: numericValue }));
  }, [dispatch]);

  // Handle USD price changes
  const handleUsdPriceChange = useCallback((sku: string, value: string) => {
    const numericValue = parseFloat(value.replace(/\D/g, '')) || 0;
    dispatch(updateVariantUsdPrice({ sku, price: numericValue }));
  }, [dispatch]);

  // Handle adjustment percentage changes
  const handleAdjustmentChange = useCallback((sku: string, value: string) => {
    const numericValue = parseFloat(value) || 0;
    dispatch(updateVariantAdjustment({ sku, percentage: numericValue }));
  }, [dispatch]);

  const handleManualEditingChange = useCallback((checked: boolean) => {
    dispatch(setManualPriceEditing(checked));
  }, [dispatch]);

  return (
    <div className="space-y-8">
      <div className="rounded-lg border p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium">Product Variant Prices</h3>
            <p className="text-sm text-muted-foreground">
              Manage pricing for individual product variants
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Manual Price Editing</span>
            <Switch
              checked={manualPriceEditing}
              onCheckedChange={handleManualEditingChange}
            />
          </div>
        </div>

        <div className="border rounded-lg">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-muted/50">
                  <th className="p-4 text-left whitespace-nowrap">Variant</th>
                  <th className="p-4 text-right whitespace-nowrap">USD Price</th>
                  <th className="p-4 text-right whitespace-nowrap">Adjustment (%)</th>
                  {customerCategories.map((category) => (
                    <th key={category.id} className="p-4 text-right whitespace-nowrap">
                      {category.name} Price
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {variants.map((variant) => {
                  const variantSku = variant.sku_product_variant;
                  const variantData = variantPrices[variantSku] || {};
                  
                  const variantPrice = {
                    prices: variantData.prices || {},
                    usdPrice: variantData.usdPrice ?? defaultUsdPrice,
                    adjustmentPercentage: variantData.adjustmentPercentage ?? defaultAdjustment
                  };

                  return (
                    <Fragment key={variantSku}>
                      <tr className="hover:bg-muted/30">
                        <td className="p-4">
                          <div className="font-medium">{variant.full_product_name}</div>
                          <div className="text-sm text-muted-foreground">
                            SKU: {variant.sku_product_variant}
                          </div>
                        </td>
                        <td className="p-4">
                          <Input
                            type="text"
                            value={formatUsdPrice(variantPrice.usdPrice || 0)}
                            onChange={(e) => handleUsdPriceChange(
                              variant.sku_product_variant,
                              e.target.value
                            )}
                            disabled={!manualPriceEditing}
                            className={`text-right ${!manualPriceEditing ? 'bg-muted' : ''}`}
                          />
                        </td>
                        <td className="p-4">
                          <Input
                            type="number"
                            value={variantPrice.adjustmentPercentage || 0}
                            onChange={(e) => handleAdjustmentChange(
                              variant.sku_product_variant,
                              e.target.value
                            )}
                            disabled={!manualPriceEditing}
                            className={`text-right ${!manualPriceEditing ? 'bg-muted' : ''}`}
                          />
                        </td>
                        {customerCategories.map((category) => (
                          <td key={`${variant.sku_product_variant}-${category.name}`} className="p-4">
                            <Input
                              type="text"
                              value={formatCurrency(variantPrice.prices[category.id] || 0)}
                              onChange={(e) => handlePriceChange(
                                variant.sku_product_variant,
                                category.id,
                                e.target.value
                              )}
                              disabled={!manualPriceEditing}
                              className={`text-right ${!manualPriceEditing ? 'bg-muted' : ''}`}
                            />
                          </td>
                        ))}
                      </tr>
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {manualPriceEditing && (
          <p className="text-sm text-muted-foreground">
            Manual price editing is enabled. Prices will not automatically update when customer category prices change.
          </p>
        )}
      </div>

      <VolumeDiscount form={form} product={product} />
    </div>
  );
}