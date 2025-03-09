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
  updateVariantAdjustment,
  updateVariantMarketplacePrice
} from '@/lib/store/slices/variantPricesSlice';

interface VariantPricesProps {
  readonly form: UseFormReturn<PriceFormFields>;
  readonly product: InventoryProduct;
  readonly defaultPriceCategory?: string;
}

// Add interface for variant price structure at the top with other interfaces
interface VariantPrice {
  prices: Record<string, number>;
  usdPrice: number;
  adjustmentPercentage: number;
  status: boolean;
  marketplacePrices?: Record<string, number>; // Add this line
}

// Add interfaces for marketplace price structure
interface MarketplaceConfig {
  basePrice?: number;
  taxAmount?: number;
  taxInclusivePrice?: number;
  appliedTaxPercentage?: number;
  markup?: number;  // Add markup property that might be used
}

// Format number without currency symbol for USD Price
const formatUsdPrice = (price: number): string => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

// Perbaikan fungsi untuk menghitung harga berdasarkan kategori dengan exchange rate
const calculatePriceByCategory = (
  usdPrice: number,
  adjustment: number = 0,
  markup: number = 0, 
  exchangeRate: number = 1,
  tax: number = 0.11
): {
  baseLocalPrice: number;
  adjustmentAmount: number;
  adjustedLocalPrice: number;
  markupAmount: number;
  preTaxPrice: number;
  taxAmount: number;
  finalPrice: number;
} => {
  // 1. Konversi harga USD ke mata uang lokal
  const baseLocalPrice = usdPrice * exchangeRate;
  
  // 2. Hitung jumlah adjustment
  const adjustmentAmount = baseLocalPrice * (adjustment / 100);
  
  // 3. Tambahkan adjustment ke harga dasar lokal
  const adjustedLocalPrice = baseLocalPrice + adjustmentAmount;
  
  // 4. Hitung markup
  const markupAmount = adjustedLocalPrice * (markup / 100);
  
  // 5. Tambahkan markup ke harga yang sudah disesuaikan
  const preTaxPrice = adjustedLocalPrice + markupAmount;
  
  // 6. Hitung pajak
  const taxAmount = preTaxPrice * tax;
  
  // 7. Hitung harga akhir (setelah pajak)
  const finalPrice = preTaxPrice + taxAmount;
  
  // Return breakdown of all calculations for transparency
  return {
    baseLocalPrice,
    adjustmentAmount,
    adjustedLocalPrice,
    markupAmount,
    preTaxPrice,
    taxAmount,
    finalPrice
  };
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
  
  // Get marketplace prices from form with typing
  const marketplacePrices = form.watch('marketplacePrices') as Record<string, MarketplaceConfig> || {};
  
  // Get marketplace categories
  const marketplaceCategories = Object.keys(marketplacePrices).map(key => ({
    id: key,
    name: key.charAt(0).toUpperCase() + key.slice(1)
  }));
  
  // Get pricing information for default values
  const formValues = form.watch();
  const pricingInfo = formValues.pricingInformation || { usdPrice: 0, adjustmentPercentage: 0 };
  
  // Extract values directly with fallbacks to ensure we get numbers
  const defaultUsdPrice = pricingInfo.usdPrice ?? 0;
  const defaultAdjustment = pricingInfo.adjustmentPercentage ?? 0;
  
  // Add exchange rate from form values or use default value of 1
  const exchangeRate = formValues.exchangeRate ?? 1;
  
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
        status: true, // Add default status as true
        marketplacePrices: {} // Add empty marketplace prices object
      };
      return acc;
    }, {} as Record<string, VariantPrice>); // Use the new interface here
    
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

  // Helper function to get default markup values based on category id
  const getFallbackMarkup = useCallback((categoryId: string): number => {
    console.log(`Using hardcoded markup for ${categoryId}`);
    if (categoryId === 'gold') return 5;
    if (categoryId === 'silver') return 10;
    if (categoryId === 'super') return 15;
    return 0;
  }, []);
  
  // Helper function to check if a property exists and has the right type
  const getMarkupFromProperty = useCallback((obj: Record<string, any>, prop: string): number | null => {
    // Direct property access - check if it's a number
    if (typeof obj?.[prop] === 'number') {
      console.log(`Found markup in property '${prop}': ${obj[prop]}%`);
      return obj[prop];
    }
    
    // Nested object with value property - use optional chaining for cleaner code
    const nestedValue = obj?.[prop]?.value;
    if (typeof nestedValue === 'number') {
      console.log(`Found markup in nested property '${prop}.value': ${nestedValue}%`);
      return nestedValue;
    }
    
    return null;
  }, []);
  
  // Helper function to infer markup from basePrice
  const inferMarkupFromBasePrice = useCallback((
    basePrice: number, 
    referenceUsdPrice: number, 
    referenceAdjustment: number, 
    exchangeRate: number
  ): number | null => {
    const expectedBasePrice = referenceUsdPrice * exchangeRate * (1 + referenceAdjustment / 100);
    
    if (expectedBasePrice <= 0) return null;
    
    const inferredMarkup = ((basePrice / expectedBasePrice) - 1) * 100;
    console.log(`Calculated markup from basePrice: ${inferredMarkup.toFixed(2)}%`);
    return inferredMarkup;
  }, []);

  // Add a utility function to safely extract markup values from Customer Category Prices
  const getMarkupForCategory = useCallback((categoryId: string) => {
    const categoryConfig = formValues.customerPrices?.[categoryId] as Record<string, any>;
    
    if (!categoryConfig) {
      return getFallbackMarkup(categoryId);
    }
    
    if ('markup' in categoryConfig) {
      const directMarkup = getMarkupFromProperty(categoryConfig, 'markup');
      if (directMarkup !== null) return directMarkup;
    }
    
    const possibleMarkupProps = ['markupPercentage', 'markUp', 'margin', 'profitMargin'];
    
    for (const prop of possibleMarkupProps) {
      const propMarkup = getMarkupFromProperty(categoryConfig, prop);
      if (propMarkup !== null) return propMarkup;
    }
    
    if ('basePrice' in categoryConfig && typeof categoryConfig.basePrice === 'number') {
      const baseUsdPrice = formValues.pricingInformation?.usdPrice || defaultUsdPrice;
      const baseAdjustment = formValues.pricingInformation?.adjustmentPercentage || defaultAdjustment;
      
      const inferredMarkup = inferMarkupFromBasePrice(
        categoryConfig.basePrice,
        baseUsdPrice,
        baseAdjustment,
        exchangeRate
      );
      
      if (inferredMarkup !== null) return inferredMarkup;
    }
    
    return getFallbackMarkup(categoryId);
  }, [
    customerPrices, 
    formValues, 
    defaultUsdPrice, 
    defaultAdjustment, 
    exchangeRate, 
    getFallbackMarkup, 
    getMarkupFromProperty, 
    inferMarkupFromBasePrice
  ]);

  // Get default category price for marketplace reference with validation
  const getDefaultCategoryPrice = useCallback((variantPrice: any) => {
    const price = variantPrice.prices[defaultPriceCategory];
    console.log(`Getting default category (${defaultPriceCategory}) price:`, {
      allPrices: variantPrice.prices,
      defaultPrice: price
    });
    return price || 0;
  }, [defaultPriceCategory]);

  // Update function to calculate marketplace price with proper formula and typing
  const calculateMarketplacePrice = useCallback((
    defaultPrice: number,
    marketplaceId: string
  ): number => {
    const marketplaceConfig = marketplacePrices[marketplaceId]; // Remove unnecessary type assertion
    console.log(`\n=== Marketplace Price Calculation ===`);
    console.log(`Marketplace: ${marketplaceId}`);
    console.log(`Default Category Price: ${defaultPrice}`);
    console.log(`Marketplace Config:`, marketplaceConfig);

    // First check if we have a valid default price
    if (defaultPrice <= 0) {
      // If no valid default price, use configured price
      if (marketplaceConfig?.basePrice || marketplaceConfig?.taxInclusivePrice) {
        const configuredPrice = marketplaceConfig.basePrice ?? marketplaceConfig.taxInclusivePrice ?? 0;
        console.log(`No valid default price, using configured price: ${configuredPrice}`);
        console.log(`===============================\n`);
        return configuredPrice;
      }
      console.log(`No valid default or configured price found`);
      console.log(`===============================\n`);
      return 0;
    }

    // If we have a valid default price, calculate with markup
    if (marketplaceConfig && typeof marketplaceConfig.markup === 'number') {
      const markup: number = marketplaceConfig.markup;  // Now we're sure it's a number
      const markupAmount = defaultPrice * (markup / 100);
      const priceWithMarkup = defaultPrice + markupAmount;
      
      console.log(`Using markup calculation:`);
      console.log(`Markup: ${markup}%`);
      console.log(`Markup Amount: ${markupAmount}`);
      console.log(`Final Price: ${priceWithMarkup}`);
      console.log(`===============================\n`);

      return priceWithMarkup;
    }

    // No markup found, use default price
    console.log(`No markup found, using default price: ${defaultPrice}`);
    console.log(`===============================\n`);
    return defaultPrice;
  }, [marketplacePrices]);

  // Update the getMarketplacePrice function to use the same logic
  const getMarketplacePrice = useCallback((marketplaceId: string, referencePrice: number) => {
    // Just delegate to calculateMarketplacePrice for consistency
    return calculateMarketplacePrice(referencePrice, marketplaceId);
  }, [calculateMarketplacePrice]);

  // Update marketplace prices with validation
  const updateMarketplacePrices = useCallback((
    sku: string,
    usdPrice: number,
    adjustment: number
  ) => {
    console.log(`\n=== Updating Marketplace Prices ===`);
    console.log(`SKU: ${sku}`);
    console.log(`USD Price: ${usdPrice}`);
    console.log(`Adjustment: ${adjustment}%`);
    
    // First ensure we have the default category price calculated
    const defaultMarkup = getMarkupForCategory(defaultPriceCategory);
    const priceBreakdown = calculatePriceByCategory(
      usdPrice,
      adjustment,
      defaultMarkup,
      exchangeRate
    );
    
    const defaultCategoryPrice = priceBreakdown.finalPrice;
    console.log(`Calculated default category price:`, {
      category: defaultPriceCategory,
      markup: defaultMarkup,
      price: defaultCategoryPrice,
      breakdown: priceBreakdown
    });
    
    // Now update marketplace prices using the calculated default price
    marketplaceCategories.forEach(marketplace => {
      const newPrice = calculateMarketplacePrice(defaultCategoryPrice, marketplace.id);
      console.log(`Setting ${marketplace.name} price to: ${newPrice}`);
      
      dispatch(updateVariantMarketplacePrice({
        sku,
        marketplace: marketplace.id,
        price: newPrice
      }));
    });
  }, [
    dispatch,
    marketplaceCategories,
    calculateMarketplacePrice,
    exchangeRate,
    defaultPriceCategory,
    getMarkupForCategory
  ]);

  // Handle USD price changes
  const handleUsdPriceChange = useCallback((sku: string, value: string) => {
    const numericValue = parseFloat(value.replace(/\D/g, '')) || 0;
    dispatch(updateVariantUsdPrice({ sku, price: numericValue }));
    
    if (manualPriceEditing) {
      const variant = variantPrices[sku];
      const adjustment = variant?.adjustmentPercentage || 0;
      
      // Update customer category prices first
      customerCategories.forEach(category => {
        const markup = getMarkupForCategory(category.id);
        const priceBreakdown = calculatePriceByCategory(
          numericValue, 
          adjustment, 
          markup, 
          exchangeRate
        );
        dispatch(updateVariantPrice({ 
          sku, 
          category: category.id, 
          price: priceBreakdown.finalPrice 
        }));
      });

      // Update marketplace prices with new USD price and current adjustment
      updateMarketplacePrices(sku, numericValue, adjustment);
    }
  }, [
    dispatch, 
    manualPriceEditing, 
    customerCategories, 
    variantPrices, 
    exchangeRate, 
    getMarkupForCategory,
    defaultPriceCategory,
    updateMarketplacePrices
  ]);

  // Handle adjustment percentage changes
  const handleAdjustmentChange = useCallback((sku: string, value: string) => {
    const numericValue = parseFloat(value) || 0;
    dispatch(updateVariantAdjustment({ sku, percentage: numericValue }));
    
    if (manualPriceEditing) {
      const variant = variantPrices[sku];
      const usdPrice = variant?.usdPrice || 0;
      
      // Update customer category prices first
      customerCategories.forEach(category => {
        const markup = getMarkupForCategory(category.id);
        const priceBreakdown = calculatePriceByCategory(
          usdPrice, 
          numericValue, 
          markup, 
          exchangeRate
        );
        dispatch(updateVariantPrice({ 
          sku, 
          category: category.id, 
          price: priceBreakdown.finalPrice 
        }));
      });

      // Update marketplace prices with current USD price and new adjustment
      updateMarketplacePrices(sku, usdPrice, numericValue);
    }
  }, [
    dispatch, 
    manualPriceEditing, 
    customerCategories, 
    variantPrices, 
    exchangeRate, 
    getMarkupForCategory,
    defaultPriceCategory,
    updateMarketplacePrices
  ]);

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
                  {/* Add marketplace price columns */}
                  {marketplaceCategories.map((marketplace) => (
                    <th key={marketplace.id} className="p-4 text-right whitespace-nowrap">
                      {marketplace.name} Price
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
                    adjustmentPercentage: variantData.adjustmentPercentage ?? defaultAdjustment,
                    marketplacePrices: variantData.marketplacePrices || {}
                  };

                  // Get reference price for marketplace calculations
                  const defaultPrice = getDefaultCategoryPrice(variantPrice);

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
                              onChange={(e) => {/* Tidak perlu handler karena selalu disabled */}}
                              disabled={true}
                              className="text-right bg-muted"
                            />
                          </td>
                        ))}
                        {/* Add marketplace price inputs */}
                        {marketplaceCategories.map((marketplace) => {
                          const marketplacePrice = variantPrice.marketplacePrices?.[marketplace.id] || 
                            getMarketplacePrice(marketplace.id, defaultPrice);
                          
                          return (
                            <td key={`${variantSku}-${marketplace.name}`} className="p-4">
                              <Input
                                type="text"
                                value={formatCurrency(marketplacePrice)}
                                onChange={(e) => {/* Disabled for now */}}
                                disabled={true}
                                className="text-right bg-muted"
                              />
                            </td>
                          );
                        })}
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