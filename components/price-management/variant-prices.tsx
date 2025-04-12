'use client';

import { useEffect, useCallback, Fragment, useRef, useMemo } from 'react';
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
  marketplacePrices: Record<string, number>; // Changed from optional to required
}

// Add interfaces for marketplace price structure
interface MarketplaceConfig {
  basePrice?: number;
  taxAmount?: number;
  taxInclusivePrice?: number;
  appliedTaxPercentage?: number;
  markup?: number;  // Add markup property that might be used
  name?: string;    // Add name property for the marketplace
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
  
  // Create combined unique categories object to prevent duplicates
  const allCategories = useMemo(() => {
    const uniqueCategories = new Map();
    
    // First, add all customer categories
    Object.entries(customerPrices).forEach(([id, data]) => {
      uniqueCategories.set(id, {
        id,
        name: data.name ?? id.charAt(0).toUpperCase() + id.slice(1),
        type: 'customer'
      });
    });
    
    // Then, add marketplace categories only if they don't overlap with customer categories
    Object.entries(marketplacePrices).forEach(([id, data]) => {
      if (!uniqueCategories.has(id)) {
        uniqueCategories.set(id, {
          id,
          name: data.name ?? id.charAt(0).toUpperCase() + id.slice(1),
          type: 'marketplace'
        });
      }
    });
    
    return Array.from(uniqueCategories.values());
  }, [customerPrices, marketplacePrices]);
  
  // Separate arrays for customer and marketplace categories for data processing
  const customerCategories = useMemo(() => 
    allCategories.filter(category => category.type === 'customer'),
    [allCategories]
  );
  
  const marketplaceCategories = useMemo(() => 
    allCategories.filter(category => category.type === 'marketplace'),
    [allCategories]
  );

  // Get pricing information for default values
  const formValues = form.watch();
  const pricingInfo = formValues.pricingInformation || { usdPrice: 0, adjustmentPercentage: 0 };
  
  // Extract values directly with fallbacks to ensure we get numbers
  const defaultUsdPrice = pricingInfo.usdPrice ?? 0;
  const defaultAdjustment = pricingInfo.adjustmentPercentage ?? 0;
  
  // Add exchange rate from form values or use default value of 1
  const exchangeRate = formValues.exchangeRate ?? 1;

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
    
    // Only process if pricing info has actually changed
    if (!pricingInfoRef.current || 
        pricingInfoRef.current.usdPrice !== currentInfo.usdPrice ||
        pricingInfoRef.current.adjustmentPercentage !== currentInfo.adjustmentPercentage) {
      
      // Update ref to new values
      pricingInfoRef.current = currentInfo;
      
      // Don't update if no variants or not initialized
      if (!variants.length || !initializedRef.current) return;
      
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
    // Get customer prices from form
    const formCustomerPrices = form.watch('customerPrices') || {};
    
    const defaultCategoryId = form.watch('defaultPriceCategoryId') ?? defaultPriceCategory;
    
    // Check if we have pricing info for this category
    if (formCustomerPrices[categoryId]) {
      // Try to extract markup percentage from the customer price data
      const categoryData = formCustomerPrices[categoryId];
      
      // Look for markup in different possible fields
      if (categoryData.markup !== undefined) {
        return categoryData.markup;
      }
      
      // If basePrice and taxInclusivePrice are available, calculate the implied markup
      if (categoryData.basePrice && defaultUsdPrice > 0) {
        // Calculate implied markup from base price vs USD price with exchange rate
        const impliedBasePrice = defaultUsdPrice * exchangeRate * (1 + (defaultAdjustment / 100));
        if (impliedBasePrice > 0) {
          const impliedMarkup = ((categoryData.basePrice / impliedBasePrice) - 1) * 100;
          return impliedMarkup;
        }
      }
    }
    
    // Look for the markup in the percentages object
    const percentages = form.watch('percentages') || {};
    if (percentages[categoryId] !== undefined) {
      return percentages[categoryId];
    }
    
    // If we have a default category in formValues, use that category's markup for others
    if (categoryId !== defaultCategoryId && formCustomerPrices[defaultCategoryId]) {
      // Get default category data
      const defaultCategoryData = formCustomerPrices[defaultCategoryId];
      if (defaultCategoryData.markup !== undefined) {
        return defaultCategoryData.markup;
      }
    }
    
    // Fallback based on common values if nothing else is available
    const fallbackValues: Record<string, number> = {
      'retail': 20,
      'gold': 5,
      'silver': 10,
      'super': 15,
      'bronze': 20
    };
    
    return fallbackValues[categoryId] || 20; // Default to 20% if no other info is available
  }, [form, defaultPriceCategory, defaultUsdPrice, defaultAdjustment, exchangeRate]);

  // Helper function to check if a property exists and has the right type
  const getMarkupFromProperty = useCallback((obj: Record<string, any>, prop: string): number | null => {
    // Direct property access - check if it's a number
    if (typeof obj?.[prop] === 'number') {
      return obj[prop];
    }
    
    // Nested object with value property - use optional chaining for cleaner code
    const nestedValue = obj?.[prop]?.value;
    if (typeof nestedValue === 'number') {
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
  const getDefaultCategoryPrice = useCallback((variantPrice: VariantPrice) => {
    const price = variantPrice.prices[defaultPriceCategory];
    return price || 0;
  }, [defaultPriceCategory]);

  // Update function to calculate marketplace price with proper formula and typing
  const calculateMarketplacePrice = useCallback((
    defaultPrice: number,
    marketplaceId: string
  ): number => {
    // Get marketplace config
    const marketplaceConfig = marketplacePrices[marketplaceId];
    
    // Check if we have a specific price configured
    if (marketplaceConfig?.taxInclusivePrice) {
      return marketplaceConfig.taxInclusivePrice;
    }
    
    // Fallback to basePrice
    if (marketplaceConfig?.basePrice) {
      return marketplaceConfig.basePrice;
    }
    
    return 0;
  }, [marketplacePrices]);

  // Simplified getMarketplaceMarkup function that focuses on marketplacePercentages
  const getMarketplaceMarkup = useCallback((marketplaceId: string): number => {
    // First check if we have marketplacePercentages directly from the form
    const marketplacePercentages = formValues.marketplacePercentages || {};
    
    // Check if this marketplace has a percentage defined
    if (marketplaceId in marketplacePercentages) {
      return marketplacePercentages[marketplaceId];
    }
    
    // Get all marketplace percentages the right way
    // Add explicit manual lookup in the form for marketplace percentages
    if (formValues.percentages && typeof formValues.percentages === 'object') {
      // Try to find the marketplaceId in percentages
      if (marketplaceId in formValues.percentages) {
        return formValues.percentages[marketplaceId];
      }
    }
    
    // Try the right location for marketplace percentages
    if (formValues.marketplaces && typeof formValues.marketplaces === 'object') {
      // Check if we have this marketplace in the marketplaces object
      if (marketplaceId in formValues.marketplaces) {
        // Try to get percentage or markup
        const marketplace = formValues.marketplaces[marketplaceId];
        if (typeof marketplace === 'object') {
          if ('percentage' in marketplace && typeof marketplace.percentage === 'number') {
            return marketplace.percentage;
          }
          
          if ('markup' in marketplace && typeof marketplace.markup === 'number') {
            return marketplace.markup;
          }
        }
      }
    }
    
    // Get default values from customer-prices.tsx that would have been used
    // Look at customer-prices.tsx:handleMarketplacePercentageChange implementation
    const knownDefaults: Record<string, number> = {
      'tokopedia': 5,
      'shopee': 8,
      'lazada': 10,
      'bukalapak': 7,
      'blibli': 9,
      'tiktok': 6
    };
    
    return knownDefaults[marketplaceId] || 5; // Default to 5% if not found
  }, [formValues, form]);

  // Add this code at the top level of the component to extract and set marketplace percentages
  useEffect(() => {
    // This effect should run once after initial form data is loaded
    if (form.formState.isSubmitted || Object.keys(marketplacePrices).length === 0) return;
    
    // Initialize marketplacePercentages if not already present
    let marketplacePercentages = formValues.marketplacePercentages;
    if (!marketplacePercentages) {
      marketplacePercentages = {};
      form.setValue('marketplacePercentages', marketplacePercentages);
    }
    
    // Define default percentages for common marketplaces
    const marketplaceDefaultPercentages: Record<string, number> = {
      'tokopedia': 5,
      'shopee': 8,
      'lazada': 10,
      'bukalapak': 7,
      'blibli': 9,
      'tiktok': 6
    };
    
    // For each marketplace, set a default percentage if not already set
    Object.keys(marketplacePrices).forEach(marketplaceId => {
      // If this marketplace doesn't have a percentage set
      if (!(marketplaceId in marketplacePercentages)) {
        // Use default percentage from lookup table or default to 5%
        const defaultPercentage = marketplaceDefaultPercentages[marketplaceId] || 5;
        
        // Set the default percentage in the form
        form.setValue(`marketplacePercentages.${marketplaceId}`, defaultPercentage);
      }
    });
  }, [form, marketplacePrices, formValues.marketplacePercentages]);

  // Add this effect to explicitly set marketplacePercentages from marketplacePrices
  useEffect(() => {
    // Only run if we have marketplace prices and haven't run this before
    if (Object.keys(marketplacePrices).length === 0) return;
    
    // Create marketplacePercentages object if it doesn't exist
    const marketplacePercentagesObj = form.getValues('marketplacePercentages') || {};
    let updated = false;
    
    // Set default percentages for each marketplace 
    // These match the default values in customer-prices.tsx
    const defaultPercentages: Record<string, number> = {
      'tokopedia': 5,
      'shopee': 8,
      'lazada': 10,
      'bukalapak': 7,
      'blibli': 9,
      'tiktok': 6
    };
    
    // For each marketplace, ensure we have a percentage
    Object.keys(marketplacePrices).forEach(marketplaceId => {
      if (!marketplacePercentagesObj[marketplaceId]) {
        // Use the default for this marketplace ID if available, otherwise use 5%
        marketplacePercentagesObj[marketplaceId] = defaultPercentages[marketplaceId] || 5;
        updated = true;
      }
    });
    
    // Only update the form if we made changes
    if (updated) {
      form.setValue('marketplacePercentages', marketplacePercentagesObj);
    }
  }, [marketplacePrices, form]);

  // Fungsi untuk menghitung ulang harga marketplace dengan formula yang benar dan lengkap
  const updateMarketplacePrices = useCallback((
    sku: string,
    usdPrice: number,
    adjustment: number
  ) => {
    // Get the variant data for calculations
    const variant = variantPrices[sku];
    if (!variant) return;
    
    // Step 1: Calculate base price in local currency with adjustment
    const baseLocalPrice = usdPrice * exchangeRate;
    const adjustmentAmount = baseLocalPrice * (adjustment / 100);
    const adjustedLocalPrice = baseLocalPrice + adjustmentAmount;
    
    // Step 2: Apply customer category markup (from form values)
    // Get the markup percentage for the default/retail category
    const retailMarkup = getMarkupForCategory(defaultPriceCategory);
    const categoryMarkupAmount = adjustedLocalPrice * (retailMarkup / 100);
    const afterCategoryMarkup = adjustedLocalPrice + categoryMarkupAmount;
    
    // Step 3: Apply tax (fixed 11%)
    const taxRate = 0.11;
    const taxAmount = afterCategoryMarkup * taxRate;
    const afterTax = afterCategoryMarkup + taxAmount;
    
    // For each marketplace, apply marketplace-specific markup
    marketplaceCategories.forEach(marketplace => {
      // Get marketplace markup dynamically from the form values
      const marketplaceMarkup = getMarketplaceMarkup(marketplace.id);
      
      // Apply marketplace markup
      const marketplaceMarkupAmount = afterTax * (marketplaceMarkup / 100);
      
      // Calculate final price
      const finalPrice = Math.round(afterTax + marketplaceMarkupAmount);
      
      // Update price in Redux
      dispatch(updateVariantMarketplacePrice({
        sku,
        marketplace: marketplace.id,
        price: finalPrice
      }));
    });
  }, [
    dispatch,
    marketplaceCategories,
    marketplacePrices,
    variantPrices,
    exchangeRate,
    getMarkupForCategory,
    defaultPriceCategory,
    getMarketplaceMarkup
  ]);

  // Handle USD price changes
  const handleUsdPriceChange = useCallback((sku: string, value: string) => {
    const numericValue = parseFloat(value.replace(/\D/g, '')) || 0;
    
    dispatch(updateVariantUsdPrice({ sku, price: numericValue }));
    
    if (manualPriceEditing) {
      const variant = variantPrices[sku];
      const adjustment = variant?.adjustmentPercentage ?? 0;
      
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
    updateMarketplacePrices
  ]);

  // Handle adjustment percentage changes
  const handleAdjustmentChange = useCallback((sku: string, value: string) => {
    const numericValue = parseFloat(value) || 0;
    
    dispatch(updateVariantAdjustment({ sku, percentage: numericValue }));
    
    if (manualPriceEditing) {
      const variant = variantPrices[sku];
      const usdPrice = variant?.usdPrice ?? 0;
      
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
    <div className="space-y-4">
      {/* Comment out the debug helper temporarily until we fix the Code component */}
      {/*
      {process.env.NODE_ENV === 'development' && (
        <DebugHelper 
          title="VariantPrices Input Debug" 
          data={{
            product,
            formVariantPrices: form.getValues().variantPrices,
            product_variant_prices: product?.product_variant_prices,
            product_variants: product?.product_variants
          }}
        />
      )}
      */}
      
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
                  <th className="p-4 text-center whitespace-nowrap w-[8%]">USD Price</th>
                  <th className="p-4 text-center whitespace-nowrap w-[8%]">Markup (%)</th>
                  
                  {/* Use allCategories to ensure unique columns */}
                  {allCategories.map((category) => (
                    <th 
                      key={`category-${category.type}-${category.id}`} 
                      className="p-4 text-center whitespace-nowrap"
                    >
                      {category.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {variants.map((variant) => {
                  const variantSku = variant.sku_product_variant;
                  const variantData = variantPrices[variantSku] || {};
                  
                  const variantPrice: VariantPrice = {
                    prices: variantData.prices || {},
                    usdPrice: variantData.usdPrice ?? defaultUsdPrice,
                    adjustmentPercentage: variantData.adjustmentPercentage ?? defaultAdjustment,
                    marketplacePrices: variantData.marketplacePrices || {},
                    status: true
                  };

                  // Get reference price for marketplace calculations
                  const defaultPrice = getDefaultCategoryPrice(variantPrice);

                  return (
                    <Fragment key={variantSku}>
                      {/* Add variant name as a subheader row */}
                      <tr className="bg-muted/20">
                        <td colSpan={2 + customerCategories.length + marketplaceCategories.length} className="p-3">
                          <div className="flex items-center gap-3">
                            <div className="font-medium">{variant.full_product_name}</div>
                            <div className="text-sm text-muted-foreground whitespace-nowrap">
                              (SKU: {variant.sku_product_variant})
                            </div>
                          </div>
                        </td>
                      </tr>
                      
                      {/* Data row with price fields */}
                      <tr className="hover:bg-muted/30">
                        {/* Make input cells narrower with fixed widths */}
                        <td className="p-3 w-[8%]">
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
                        <td className="p-3 w-[8%]">
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
                        {/* Render all category cells with type distinction */}
                        {allCategories.map((category) => {
                          // Choose the right data source based on category type
                          const value = category.type === 'customer' 
                            ? (variantPrice.prices[category.id] || 0)
                            : (variantPrice.marketplacePrices[category.id] || 
                               calculateMarketplacePrice(defaultPrice, category.id));
                          
                          return (
                            <td key={`${category.type}-${variantSku}-${category.id}`} className="p-3">
                              <Input
                                type="text"
                                value={formatCurrency(value)}
                                onChange={(e) => {/* Disabled handler */}}
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