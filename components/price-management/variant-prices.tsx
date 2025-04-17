'use client';

import { useEffect, useCallback, Fragment, useRef, useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { AlertTriangle } from 'lucide-react'; // Add import for the AlertTriangle icon
import { PriceFormFields } from '@/types/form';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { roundPriceMarkup } from '@/lib/utils/price-rounding';
import { PriceComparison } from '@/components/ui/price-comparison';
import type { InventoryProduct } from '@/types/inventory';
import { VolumeDiscount } from './volume-discount';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import {
  setManualPriceEditing,
  updateVariantUsdPrice,
  updateVariantAdjustment,
  initializeVariantData
} from '@/lib/store/slices/variantPricesSlice';

interface VariantPricesProps {
  readonly form: UseFormReturn<PriceFormFields>;
  readonly product: InventoryProduct;
  readonly defaultPriceCategory?: string;
}

// Define a type for variant data record to avoid index signature errors
type VariantDataRecord = Record<string, {
  usdPrice: number;
  adjustmentPercentage: number;
}>;

// Format USD Price for display
const formatUsdPrice = (price: number): string => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

// Calculate price with markup and tax, with rounding applied, store both original and rounded values
const calculatePrice = (basePrice: number, markup: number, tax: number = 0.11): { 
  original: number; 
  rounded: number; 
} => {
  const priceWithMarkup = basePrice * (1 + markup / 100);
  const rawFinalPrice = priceWithMarkup * (1 + tax);
  // Apply rounding rules but keep original
  return {
    original: rawFinalPrice,
    rounded: roundPriceMarkup(rawFinalPrice)
  };
};

export function VariantPrices({ form, product, defaultPriceCategory = 'retail' }: Readonly<VariantPricesProps>) {
  const dispatch = useAppDispatch();
  // Since we provide a default empty object here, there's no need for an additional null check
  const { manualPriceEditing, variantData = {} } = useAppSelector(state => state.variantPrices);
  
  // Fix: Just use a simple type cast without the redundant null/undefined check
  const typedVariantData = variantData as VariantDataRecord;
  
  // Get variants from product data
  const variants = product?.product_by_variant || [];
  
  // Use refs to track previous values and prevent unnecessary updates
  const initializedRef = useRef(false);
  const formChangingRef = useRef(false);
  const prevPricingInfoRef = useRef({ usdPrice: 0, adjustmentPercentage: 0 });
  
  // Get form values
  const formValues = form.watch();
  const customerPrices = formValues.customerPrices || {};
  const marketplacePrices = formValues.marketplacePrices || {};
  const pricingInfo = formValues.pricingInformation || { usdPrice: 0, adjustmentPercentage: 0 };
  const exchangeRate = formValues.exchangeRate || 0;
  
  // NEW: Track if prices have been initialized
  const [pricesInitialized, setPricesInitialized] = useState(false);
  
  // Helper function to check if a string is purely numeric
  const isNumeric = (str: string) => /^\d+$/.test(str);
  
  // Extract customer categories, filtering out numeric IDs and sort by percentage
  const customerCategories = Object.entries(customerPrices)
    .filter(([id]) => !isNumeric(id)) // Keep only non-numeric string IDs
    .map(([id, data]) => ({
      id,
      name: data.name ?? id.charAt(0).toUpperCase() + id.slice(1),
      type: 'customer',
      markup: data.markup ?? 0
    }))
    .sort((a, b) => a.markup - b.markup); // Sort by markup percentage from lowest to highest
  
  // Extract marketplace categories, filtering out numeric IDs
  const marketplaceCategories = Object.entries(marketplacePrices)
    .filter(([id]) => !isNumeric(id)) // Keep only non-numeric string IDs
    .map(([id, data]) => ({
      id,
      name: data.name ?? id.charAt(0).toUpperCase() + id.slice(1),
      type: 'marketplace',
      markup: (data as any).markup ?? 0
    }));
  
  // Initialize Redux state with variant data (run only once)
  useEffect(() => {
    if (variants.length && !initializedRef.current) {
      const variantPriceData = form.getValues('variantPrices') || {};
      
      // Map variant data for redux initialization - ensure we initialize with empty object if needed
      const initialVariants = variants.reduce((acc, variant) => {
        if (!variant) return acc; // Skip if variant is undefined
        
        const sku = variant.sku_product_variant;
        if (!sku) return acc; // Skip if sku is undefined
        
        const existingData = variantPriceData[sku] || {};
        
        acc[sku] = {
          usdPrice: existingData.usdPrice ?? pricingInfo.usdPrice,
          adjustmentPercentage: existingData.adjustmentPercentage ?? pricingInfo.adjustmentPercentage
        };
        return acc;
      }, {} as Record<string, { usdPrice: number; adjustmentPercentage: number; }>);
      
      // Initialize Redux with variant data - removed unnecessary try-catch
      dispatch(initializeVariantData(initialVariants));
      
      initializedRef.current = true;
      
      // Save initial pricing info to ref for comparison
      prevPricingInfoRef.current = { ...pricingInfo };
    }
  }, [variants, form, pricingInfo, dispatch]);
  
  // Set pricesInitialized to true once data is loaded
  useEffect(() => {
    if (Object.keys(customerPrices).length > 0 || Object.keys(marketplacePrices).length > 0) {
      setPricesInitialized(true);
    }
  }, [customerPrices, marketplacePrices]); // Add dependency to react to price changes
  
  // Update prices in the form when manual editing occurs
  const updatePricesInForm = useCallback((sku: string, usdPrice: number, adjustment: number) => {
    if (!manualPriceEditing || formChangingRef.current) return;
    
    formChangingRef.current = true;
    
    try {
      // Calculate HB Real and HB Naik for this variant
      const hbReal = usdPrice * exchangeRate;
      const hbNaik = hbReal * (1 + adjustment / 100);
      
      // Initialize variant prices object if needed
      const currentVariantPrices = form.getValues(`variantPrices.${sku}`) || {};
      const variantPrices = {
        ...currentVariantPrices,
        usdPrice,
        adjustmentPercentage: adjustment,
        // Fix the always-truthy expressions by properly checking for undefined
        customerPrices: currentVariantPrices.customerPrices ? { ...currentVariantPrices.customerPrices } : {},
        marketplacePrices: currentVariantPrices.marketplacePrices ? { ...currentVariantPrices.marketplacePrices } : {}
      };
      
      // Update customer category prices for this variant only
      customerCategories.forEach(category => {
        const priceResult = calculatePrice(hbNaik, category.markup);
        variantPrices.customerPrices[category.id] = {
          rounded: priceResult.rounded,
          original: priceResult.original
        };
      });
      
      // Get the default category price as base for marketplace prices
      const defaultCategory = customerCategories.find(c => c.id === defaultPriceCategory) || customerCategories[0];
      if (defaultCategory) {
        // Use the variant-specific default category price
        const defaultPrice = variantPrices.customerPrices[defaultCategory.id]?.rounded || 0;
        
        // Update marketplace prices for this variant only
        marketplaceCategories.forEach(marketplace => {
          const rawMarketplacePrice = defaultPrice * (1 + marketplace.markup / 100);
          const marketplacePrice = roundPriceMarkup(rawMarketplacePrice);
          variantPrices.marketplacePrices[marketplace.id] = {
            rounded: marketplacePrice,
            original: rawMarketplacePrice
          };
        });
      }
      
      // Update the form's variantPrices with all the variant-specific data
      form.setValue(`variantPrices.${sku}`, variantPrices, { shouldDirty: true });
      
      // Only when in manual mode, we need to update the displayed prices
      // This is needed because the UI reads from customerPrices and marketplacePrices
      if (manualPriceEditing) {
        // Store the current variant's sku in the form so we know which prices to display
        form.setValue('currentEditingVariantSku', sku);
      }
    } finally {
      formChangingRef.current = false;
    }
  }, [form, manualPriceEditing, exchangeRate, customerCategories, marketplaceCategories, defaultPriceCategory]);
  
  // Handle USD Price change
  const handleUsdPriceChange = useCallback((sku: string, value: string) => {
    if (!manualPriceEditing) return;
    
    const numericValue = parseFloat(value.replace(/\D/g, '')) || 0;
    const currentAdjustment = typedVariantData[sku]?.adjustmentPercentage ?? pricingInfo.adjustmentPercentage;
    
    // Update Redux
    dispatch(updateVariantUsdPrice({ sku, price: numericValue }));
    
    // Update form prices
    updatePricesInForm(sku, numericValue, currentAdjustment);
  }, [dispatch, manualPriceEditing, updatePricesInForm, typedVariantData, pricingInfo.adjustmentPercentage]);
  
  // Handle Adjustment Percentage change
  const handleAdjustmentChange = useCallback((sku: string, value: string) => {
    if (!manualPriceEditing) return;
    
    const numericValue = parseFloat(value) || 0;
    const currentUsdPrice = typedVariantData[sku]?.usdPrice ?? pricingInfo.usdPrice;
    
    // Update Redux
    dispatch(updateVariantAdjustment({ sku, percentage: numericValue }));
    
    // Update form prices
    updatePricesInForm(sku, currentUsdPrice, numericValue);
  }, [dispatch, manualPriceEditing, updatePricesInForm, typedVariantData, pricingInfo.usdPrice]);
  
  // Handle manual editing toggle - use a stable callback
  const handleManualEditingChange = useCallback((checked: boolean) => {
    // Toggle the Redux state
    dispatch(setManualPriceEditing(checked));
    
    // Reset prices to global values when turning off manual mode
    if (!checked && initializedRef.current) {
      formChangingRef.current = true;
      
      try {
        variants.forEach(variant => {
          const sku = variant.sku_product_variant;
          
          // Update form values
          form.setValue(`variantPrices.${sku}.usdPrice`, pricingInfo.usdPrice);
          form.setValue(`variantPrices.${sku}.adjustmentPercentage`, pricingInfo.adjustmentPercentage);
          
          // Also update redux
          dispatch(updateVariantUsdPrice({ sku, price: pricingInfo.usdPrice }));
          dispatch(updateVariantAdjustment({ sku, percentage: pricingInfo.adjustmentPercentage }));
        });
        
        // Recalculate all prices
        const sku = variants[0]?.sku_product_variant;
        if (sku) {
          updatePricesInForm(sku, pricingInfo.usdPrice, pricingInfo.adjustmentPercentage);
        }
      } finally {
        formChangingRef.current = false;
      }
    }
  }, [dispatch, variants, form, pricingInfo, updatePricesInForm]);
  
  // Update prices when pricing info changes and manual editing is OFF
  useEffect(() => {
    // Only run if pricing info has actually changed and manual editing is OFF
    if (
      !manualPriceEditing &&
      initializedRef.current &&
      variants.length &&
      (prevPricingInfoRef.current.usdPrice !== pricingInfo.usdPrice ||
       prevPricingInfoRef.current.adjustmentPercentage !== pricingInfo.adjustmentPercentage)
    ) {
      // Update ref to avoid unnecessary recalculations
      prevPricingInfoRef.current = { ...pricingInfo };
      
      formChangingRef.current = true;
      
      try {
        // Update all variant data in Redux and form
        variants.forEach(variant => {
          const sku = variant.sku_product_variant;
          
          // Update Redux state
          dispatch(updateVariantUsdPrice({ sku, price: pricingInfo.usdPrice }));
          dispatch(updateVariantAdjustment({ sku, percentage: pricingInfo.adjustmentPercentage }));
          
          // Update form values
          form.setValue(`variantPrices.${sku}.usdPrice`, pricingInfo.usdPrice);
          form.setValue(`variantPrices.${sku}.adjustmentPercentage`, pricingInfo.adjustmentPercentage);
        });
        
        // Recalculate dependent prices once
        const sku = variants[0]?.sku_product_variant;
        if (sku) {
          updatePricesInForm(sku, pricingInfo.usdPrice, pricingInfo.adjustmentPercentage);
        }
      } finally {
        formChangingRef.current = false;
      }
    }
  }, [
    pricingInfo.usdPrice,
    pricingInfo.adjustmentPercentage,
    manualPriceEditing,
    variants,
    dispatch,
    form,
    updatePricesInForm
  ]);
  
  // Add a function to get the correct price for a variant and category
  const getVariantCategoryPrice = useCallback((variantSku: string, categoryId: string, priceType: 'customer' | 'marketplace') => {
    if (!manualPriceEditing) {
      // If not in manual mode, use global prices
      if (priceType === 'customer') {
        return customerPrices[categoryId]?.taxInclusivePrice ?? 0;
      } else {
        return (marketplacePrices[categoryId] as any)?.price ?? 
               (marketplacePrices[categoryId] as any)?.taxInclusivePrice ?? 0;
      }
    }
    
    // In manual mode, get variant-specific prices
    const variantData = form.getValues(`variantPrices.${variantSku}`) || {};
    
    if (priceType === 'customer') {
      return variantData.customerPrices?.[categoryId]?.rounded ?? customerPrices[categoryId]?.taxInclusivePrice ?? 0;
    } else {
      return variantData.marketplacePrices?.[categoryId]?.rounded ?? 
             (marketplacePrices[categoryId] as any)?.price ?? 
             (marketplacePrices[categoryId] as any)?.taxInclusivePrice ?? 0;
    }
  }, [manualPriceEditing, customerPrices, marketplacePrices, form]);

  // Similarly for raw prices
  const getVariantCategoryRawPrice = useCallback((variantSku: string, categoryId: string, priceType: 'customer' | 'marketplace') => {
    if (!manualPriceEditing) {
      // If not in manual mode, use global prices
      if (priceType === 'customer') {
        return customerPrices[categoryId]?.rawTaxInclusivePrice ?? customerPrices[categoryId]?.taxInclusivePrice ?? 0;
      } else {
        return (marketplacePrices[categoryId] as any)?.rawPrice ?? 
               (marketplacePrices[categoryId] as any)?.price ?? 0;
      }
    }
    
    // In manual mode, get variant-specific prices
    const variantData = form.getValues(`variantPrices.${variantSku}`) || {};
    
    if (priceType === 'customer') {
      return variantData.customerPrices?.[categoryId]?.original ?? 
             customerPrices[categoryId]?.rawTaxInclusivePrice ?? 
             customerPrices[categoryId]?.taxInclusivePrice ?? 0;
    } else {
      return variantData.marketplacePrices?.[categoryId]?.original ?? 
             (marketplacePrices[categoryId] as any)?.rawPrice ?? 
             (marketplacePrices[categoryId] as any)?.price ?? 0;
    }
  }, [manualPriceEditing, customerPrices, marketplacePrices, form]);

  // Show loading state or no variants message as appropriate
  if (!customerCategories.length) {
    // This is true loading state - no price categories loaded yet
    return (
      <div className="space-y-4">
        <div className="rounded-lg border p-4">
          <h3 className="text-lg font-medium mb-2">Product Variant Prices</h3>
          <div className="p-4 border rounded bg-muted/20 text-muted-foreground">
            Loading product variant pricing data...
          </div>
        </div>
        <VolumeDiscount
          form={form}
          product={product}
          initialCustomerPrices={customerPrices}
          initialMarketplacePrices={marketplacePrices}
          pricesInitialized={pricesInitialized}
        />
      </div>
    );
  }
  
  if (!variants.length) {
    // No variants case - show informative message
    return (
      <div className="space-y-4">
        <div className="rounded-lg border p-4">
          <h3 className="text-lg font-medium mb-2">Product Variant Prices</h3>
          <div className="p-4 border rounded bg-yellow-50/50 border-yellow-200">
            <div className="flex items-center gap-2 text-yellow-800">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              <span className="font-medium">This product doesn't have any variants.</span>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Pricing will be applied to the main product directly. You can manage product variants 
              in the product details section.
            </p>
          </div>
        </div>
        <VolumeDiscount
          form={form}
          product={product}
          initialCustomerPrices={customerPrices}
          initialMarketplacePrices={marketplacePrices}
          pricesInitialized={pricesInitialized}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium">Product Variant Prices</h3>
            <p className="text-sm text-muted-foreground">
              {manualPriceEditing 
                ? "Edit individual variant prices manually" 
                : "Prices automatically calculated from base values"}
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
                  <th className="p-4 text-center whitespace-nowrap w-[8%]">USD Price</th>
                  <th className="p-4 text-center whitespace-nowrap w-[8%]">Adjustment (%)</th>
                  
                  {/* Customer Categories */}
                  {customerCategories.map((category) => (
                    <th 
                      key={`category-customer-${category.id}`} 
                      className="p-4 text-center whitespace-nowrap"
                    >
                      {category.name}
                    </th>
                  ))}
                  
                  {/* Marketplace Categories */}
                  {marketplaceCategories.map((category) => (
                    <th 
                      key={`category-marketplace-${category.id}`} 
                      className="p-4 text-center whitespace-nowrap"
                    >
                      {category.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {variants.map((variant) => {
                  if (!variant) return null; // Skip rendering if variant is undefined
        
                  const sku = variant.sku_product_variant;
                  if (!sku) return null; // Skip rendering if sku is undefined
        
                  // Safely access variant info with fallback
                  const variantInfo = typedVariantData[sku] || {
                    usdPrice: pricingInfo.usdPrice,
                    adjustmentPercentage: pricingInfo.adjustmentPercentage
                  };
                  
                  return (
                    <Fragment key={sku}>
                      {/* Variant name row */}
                      <tr className="bg-muted/20">
                        <td colSpan={2 + customerCategories.length + marketplaceCategories.length} className="p-3">
                          <div className="flex items-center gap-3">
                            <div className="font-medium">{variant.full_product_name}</div>
                            <div className="text-sm text-muted-foreground whitespace-nowrap">
                              (SKU: {sku})
                            </div>
                          </div>
                        </td>
                      </tr>
                      
                      {/* Prices row */}
                      <tr className="hover:bg-muted/30">
                        {/* USD Price */}
                        <td className="p-3 w-[8%]">
                          <Input
                            type="text"
                            value={formatUsdPrice(manualPriceEditing 
                              ? variantInfo.usdPrice 
                              : pricingInfo.usdPrice)}
                            onChange={(e) => handleUsdPriceChange(sku, e.target.value)}
                            disabled={!manualPriceEditing}
                            className={`text-right ${!manualPriceEditing ? 'bg-muted' : ''}`}
                          />
                        </td>
                        
                        {/* Adjustment percentage */}
                        <td className="p-3 w-[8%]">
                          <Input
                            type="number"
                            value={manualPriceEditing 
                              ? variantInfo.adjustmentPercentage 
                              : pricingInfo.adjustmentPercentage}
                            onChange={(e) => handleAdjustmentChange(sku, e.target.value)}
                            disabled={!manualPriceEditing}
                            className={`text-right ${!manualPriceEditing ? 'bg-muted' : ''}`}
                          />
                        </td>
                        
                        {/* Customer category prices - with price comparison */}
                        {customerCategories.map(category => {
                          // Get variant-specific price data
                          const price = getVariantCategoryPrice(sku, category.id, 'customer');
                          const rawPrice = getVariantCategoryRawPrice(sku, category.id, 'customer');
                          
                          return (
                            <td key={`customer-${sku}-${category.id}`} className="p-3">
                              <div className="bg-muted rounded-md px-3 py-2 border text-right">
                                <PriceComparison 
                                  originalPrice={rawPrice} 
                                  roundedPrice={price}
                                  showTooltip={true}
                                  tooltipPosition="top"
                                />
                              </div>
                            </td>
                          );
                        })}
                        
                        {/* Marketplace prices - with price comparison */}
                        {marketplaceCategories.map(category => {
                          // Get variant-specific marketplace price data
                          const price = getVariantCategoryPrice(sku, category.id, 'marketplace');
                          const rawPrice = getVariantCategoryRawPrice(sku, category.id, 'marketplace');
                          
                          return (
                            <td key={`marketplace-${sku}-${category.id}`} className="p-3">
                              <div className="bg-muted rounded-md px-3 py-2 border text-right">
                                <PriceComparison 
                                  originalPrice={rawPrice} 
                                  roundedPrice={price}
                                  showTooltip={true}
                                  tooltipPosition="top"
                                />
                              </div>
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

        <p className="text-sm text-muted-foreground">
          {manualPriceEditing
            ? "Manual price editing is enabled. Update USD Price and Adjustment values for each variant."
            : "Prices are automatically calculated based on base price settings. Toggle Manual Price Editing to modify individual variants."}
        </p>
        
        <div className="bg-muted/20 p-3 rounded border border-dashed">
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            <span className="h-3 w-3 bg-blue-500 rounded-full inline-block"></span>
            <span>Prices shown include automatic rounding based on price magnitude for easier transactions.</span>
          </p>
          <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
            <span className="h-3 w-3 bg-blue-500/30 rounded-full inline-block"></span>
            <span>Hover over prices with an info icon to see the original pre-rounding value and rounding difference.</span>
          </p>
        </div>
      </div>

      <VolumeDiscount
        form={form}
        product={product}
        initialCustomerPrices={customerPrices}
        initialMarketplacePrices={marketplacePrices}
        pricesInitialized={pricesInitialized}
      />
    </div>
  );
}