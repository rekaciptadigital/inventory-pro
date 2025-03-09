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
  marketplacePrices: Record<string, number>; // Changed from optional to required
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
    console.log(`Getting fallback markup for ${categoryId}`);
    // Set appropriate default markups based on category ID
    switch(categoryId) {
      case 'retail':
        return 20; // Set retail default markup to 20%
      case 'gold':
        return 5;
      case 'silver':
        return 10;
      case 'super':
        return 15;
      case 'bronze':
        return 20;
      default:
        return 20; // Default markup is 20%
    }
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
  const getDefaultCategoryPrice = useCallback((variantPrice: VariantPrice) => {
    const price = variantPrice.prices[defaultPriceCategory];
    console.log(`Getting default category (${defaultPriceCategory}) price:`, {
      allPrices: variantPrice.prices,
      defaultPrice: price
    });
    return price || 0;
  }, [defaultPriceCategory]);

  // Update function to calculate marketplace price with proper formula and typing
  // ...
  // Simplified marketplace price calculation
  const calculateMarketplacePrice = useCallback((
    defaultPrice: number,
    marketplaceId: string
  ): number => {
    // Get marketplace config
    const marketplaceConfig = marketplacePrices[marketplaceId];
    
    console.group(`Calculating price for marketplace: ${marketplaceId}`);
    
    // Log the inputs we're using
    console.log(`Default price from customer category: ${defaultPrice}`);
    console.log(`Marketplace config:`, marketplaceConfig);
    
    // Check if we have a specific price configured
    if (marketplaceConfig?.taxInclusivePrice) {
      console.log(`Using configured taxInclusivePrice: ${marketplaceConfig.taxInclusivePrice}`);
      console.groupEnd();
      return marketplaceConfig.taxInclusivePrice;
    }
    
    // Fallback to basePrice
    if (marketplaceConfig?.basePrice) {
      console.log(`Using configured basePrice: ${marketplaceConfig.basePrice}`);
      console.groupEnd();
      return marketplaceConfig.basePrice;
    }
    
    console.log(`No price configured, returning 0`);
    console.groupEnd();
    return 0;
  }, [marketplacePrices]);

  // Simplified getMarketplaceMarkup function that focuses on marketplacePercentages
const getMarketplaceMarkup = useCallback((marketplaceId: string): number => {
  console.group(`Getting markup for ${marketplaceId}`);
  
  // First check if we have marketplacePercentages directly from the form
  const marketplacePercentages = formValues.marketplacePercentages || {};
  
  // Log marketplacePercentages for debugging purposes
  console.log('Available marketplacePercentages:', marketplacePercentages);
  
  // Check if this marketplace has a percentage defined
  if (marketplaceId in marketplacePercentages) {
    const percentage = marketplacePercentages[marketplaceId];
    console.log(`Found percentage in marketplacePercentages: ${percentage}%`);
    console.groupEnd();
    return percentage;
  }
  
  // If not found in marketplacePercentages, print warning
  console.warn(`No markup found in marketplacePercentages for ${marketplaceId}!`);
  console.log('marketplacePercentages object:', marketplacePercentages);
  
  // Get all marketplace percentages the right way
  // Add explicit manual lookup in the form for marketplace percentages
  if (formValues.percentages && typeof formValues.percentages === 'object') {
    console.log('Looking in formValues.percentages:', formValues.percentages);
    
    // Try to find the marketplaceId in percentages
    if (marketplaceId in formValues.percentages) {
      const percentage = formValues.percentages[marketplaceId];
      console.log(`Found percentage in formValues.percentages: ${percentage}%`);
      console.groupEnd();
      return percentage;
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
          console.log(`Found in formValues.marketplaces[${marketplaceId}].percentage: ${marketplace.percentage}%`);
          console.groupEnd();
          return marketplace.percentage;
        }
        
        if ('markup' in marketplace && typeof marketplace.markup === 'number') {
          console.log(`Found in formValues.marketplaces[${marketplaceId}].markup: ${marketplace.markup}%`);
          console.groupEnd();
          return marketplace.markup;
        }
      }
    }
  }
  
  // Gather all form values for thorough analysis
  console.log("Analyzing full form data to find marketplace percentages:");
  const formData = form.getValues();
  console.log('Form data:', formData);
  
  // Add debug logging for marketplace section
  if (formData.marketplacePrices && marketplaceId in formData.marketplacePrices) {
    console.log('MarketplacePrices for this ID:', formData.marketplacePrices[marketplaceId]);
  }
  
  // Get default values from customer-prices.tsx that would have been used
  // Look at customer-prices.tsx:handleMarketplacePercentageChange implementation
  const knownDefaults = {
    'tokopedia': 5,
    'shopee': 8,
    'lazada': 10,
    'bukalapak': 7,
    'blibli': 9,
    'tiktok': 6
  };
  
  console.log(`Using known default for ${marketplaceId}: ${knownDefaults[marketplaceId] || 5}%`);
  console.groupEnd();
  return knownDefaults[marketplaceId] || 5; // Default to 5% if not found
}, [formValues, form]);

// Add this code at the top level of the component to extract and set marketplace percentages
useEffect(() => {
  // This effect should run once after initial form data is loaded
  if (form.formState.isSubmitted || Object.keys(marketplacePrices).length === 0) return;
  
  console.log("Extracting marketplacePercentages from form data");
  
  // Initialize marketplacePercentages if not already present
  let marketplacePercentages = formValues.marketplacePercentages;
  if (!marketplacePercentages) {
    marketplacePercentages = {};
    form.setValue('marketplacePercentages', marketplacePercentages);
  }
  
  // For each marketplace, set a default percentage if not already set
  Object.keys(marketplacePrices).forEach(marketplaceId => {
    // If this marketplace doesn't have a percentage set
    if (!(marketplaceId in marketplacePercentages)) {
      // Use default percentages based on marketplace name
      let defaultPercentage = 5; // Default for unknown marketplaces
      
      // Lookup table for common marketplaces
      if (marketplaceId === 'tokopedia') defaultPercentage = 5;
      if (marketplaceId === 'shopee') defaultPercentage = 8;
      if (marketplaceId === 'lazada') defaultPercentage = 10;
      if (marketplaceId === 'bukalapak') defaultPercentage = 7;
      if (marketplaceId === 'blibli') defaultPercentage = 9;
      
      // Set the default percentage in the form
      console.log(`Setting default percentage for ${marketplaceId}: ${defaultPercentage}%`);
      form.setValue(`marketplacePercentages.${marketplaceId}`, defaultPercentage);
    }
  });
}, [form, marketplacePrices, formValues.marketplacePercentages]);

// Add this effect to explicitly set marketplacePercentages from marketplacePrices
useEffect(() => {
  // Only run if we have marketplace prices and haven't run this before
  if (Object.keys(marketplacePrices).length === 0) return;
  
  console.log('Setting marketplacePercentages directly from configured values');
  
  // Create marketplacePercentages object if it doesn't exist
  const marketplacePercentagesObj = form.getValues('marketplacePercentages') || {};
  let updated = false;
  
  // Set default percentages for each marketplace 
  // These match the default values in customer-prices.tsx
  const defaultPercentages = {
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
      console.log(`Setting ${marketplaceId} percentage to ${marketplacePercentagesObj[marketplaceId]}%`);
    }
  });
  
  // Only update the form if we made changes
  if (updated) {
    form.setValue('marketplacePercentages', marketplacePercentagesObj);
  }
  
  // Print current marketplacePercentages for verification
  console.log('Current marketplacePercentages:', marketplacePercentagesObj);
  
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
    
    console.group(`=== MARKETPLACE PRICE CALCULATION FOR SKU: ${sku} ===`);
    console.log(`Initial values: USD Price=${usdPrice}, Adjustment=${adjustment}%, Exchange Rate=${exchangeRate}`);
    
    // Step 1: Calculate base price in local currency with adjustment
    const baseLocalPrice = usdPrice * exchangeRate;
    console.log(`Base local price: ${usdPrice} × ${exchangeRate} = ${baseLocalPrice.toLocaleString('id')}`);
    
    const adjustmentAmount = baseLocalPrice * (adjustment / 100);
    console.log(`Adjustment amount: ${baseLocalPrice.toLocaleString('id')} × ${adjustment}% = ${adjustmentAmount.toLocaleString('id')}`);
    
    const adjustedLocalPrice = baseLocalPrice + adjustmentAmount;
    console.log(`Adjusted local price: ${baseLocalPrice.toLocaleString('id')} + ${adjustmentAmount.toLocaleString('id')} = ${adjustedLocalPrice.toLocaleString('id')}`);
    
    // Step 2: Apply customer category markup (from form values)
    // Get the markup percentage for the default/retail category
    const retailMarkup = getMarkupForCategory(defaultPriceCategory);
    console.log(`Using ${defaultPriceCategory} category markup from form: ${retailMarkup}%`);
    
    const categoryMarkupAmount = adjustedLocalPrice * (retailMarkup / 100);
    console.log(`Category markup amount: ${adjustedLocalPrice.toLocaleString('id')} × ${retailMarkup}% = ${categoryMarkupAmount.toLocaleString('id')}`);
    
    const afterCategoryMarkup = adjustedLocalPrice + categoryMarkupAmount;
    console.log(`Price after category markup: ${adjustedLocalPrice.toLocaleString('id')} + ${categoryMarkupAmount.toLocaleString('id')} = ${afterCategoryMarkup.toLocaleString('id')}`);
    
    // Step 3: Apply tax (fixed 11%)
    const taxRate = 0.11;
    console.log(`Applying standard tax rate: ${(taxRate * 100).toFixed(1)}%`);
    
    const taxAmount = afterCategoryMarkup * taxRate;
    console.log(`Tax amount: ${afterCategoryMarkup.toLocaleString('id')} × ${(taxRate * 100)}% = ${taxAmount.toLocaleString('id')}`);
    
    const afterTax = afterCategoryMarkup + taxAmount;
    console.log(`Price after tax: ${afterCategoryMarkup.toLocaleString('id')} + ${taxAmount.toLocaleString('id')} = ${afterTax.toLocaleString('id')}`);
    
    // For each marketplace, apply marketplace-specific markup
    marketplaceCategories.forEach(marketplace => {
      console.group(`Processing ${marketplace.name}`);
      
      // Get marketplace markup dynamically from the form values
      const marketplaceMarkup = getMarketplaceMarkup(marketplace.id);
      console.log(`Using marketplace markup from form/config for ${marketplace.id}: ${marketplaceMarkup}%`);
      
      // Apply marketplace markup
      const marketplaceMarkupAmount = afterTax * (marketplaceMarkup / 100);
      console.log(`Marketplace markup amount: ${afterTax.toLocaleString('id')} × ${marketplaceMarkup}% = ${marketplaceMarkupAmount.toLocaleString('id')}`);
      
      // Calculate final price
      const finalPrice = Math.round(afterTax + marketplaceMarkupAmount);
      console.log(`Final marketplace price: ${afterTax.toLocaleString('id')} + ${marketplaceMarkupAmount.toLocaleString('id')} = ${finalPrice.toLocaleString('id')}`);
      
      // Update price in Redux
      dispatch(updateVariantMarketplacePrice({
        sku,
        marketplace: marketplace.id,
        price: finalPrice
      }));
      
      console.groupEnd(); // End marketplace processing
    });
    
    console.groupEnd(); // End SKU calculation
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
    console.log(`handleUsdPriceChange called: SKU=${sku}, value=${value}, parsed=${numericValue}`);
    
    dispatch(updateVariantUsdPrice({ sku, price: numericValue }));
    
    if (manualPriceEditing) {
      console.log(`Manual price editing is ON - updating all related prices`);
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
    } else {
      console.log(`Manual price editing is OFF - not updating related prices`);
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
    console.log(`handleAdjustmentChange called: SKU=${sku}, value=${value}, parsed=${numericValue}`);
    
    dispatch(updateVariantAdjustment({ sku, percentage: numericValue }));
    
    if (manualPriceEditing) {
      console.log(`Manual price editing is ON - updating all related prices`);
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
    } else {
      console.log(`Manual price editing is OFF - not updating related prices`);
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

  // Add this at the top level of your component to inspect what's coming from Redux
  useEffect(() => {
    if (Object.keys(variantPrices).length > 0) {
      const firstKey = Object.keys(variantPrices)[0];
      console.log('Redux variant price structure:', variantPrices[firstKey]);
    }
  }, [variantPrices]);

  // Add this debug code to help identify the structure
  useEffect(() => {
    if (form.formState.isReady) {
      console.group('Form Data Structure');
      console.log('marketplacePrices:', formValues.marketplacePrices);
      console.log('marketplacePercentages:', formValues.marketplacePercentages);
      console.log('customerPrices:', formValues.customerPrices);
      console.log('percentages:', formValues.percentages);
      
      // Test markup extraction for each marketplace
      if (marketplaceCategories.length > 0) {
        console.group('Marketplace Markup Tests');
        marketplaceCategories.forEach(marketplace => {
          const markup = getMarketplaceMarkup(marketplace.id);
          console.log(`${marketplace.name} markup: ${markup}%`);
        });
        console.groupEnd();
      }
      console.groupEnd();
    }
  }, [form.formState.isReady, formValues, marketplaceCategories, getMarketplaceMarkup]);

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
                  <th className="p-4 text-right whitespace-nowrap w-[8%]">USD Price</th>
                  <th className="p-4 text-right whitespace-nowrap w-[8%]">Markup (%)</th>
                  {/* Remove "Price" from category column headers */}
                  {customerCategories.map((category) => (
                    <th 
                      key={category.id} 
                      className="p-4 text-right whitespace-nowrap"
                    >
                      {category.name}
                    </th>
                  ))}
                  {/* Remove "Price" from marketplace column headers */}
                  {marketplaceCategories.map((marketplace) => (
                    <th 
                      key={marketplace.id} 
                      className="p-4 text-right whitespace-nowrap"
                    >
                      {marketplace.name}
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
                    status: true // Add status property which is required by the interface
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
                        {/* Make input cells narrower with fixed widths */}
                        <td className="p-4 w-[8%]">
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
                        <td className="p-4 w-[8%]">
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
                          const marketplacePrice = variantPrice.marketplacePrices[marketplace.id] || 
                            calculateMarketplacePrice(defaultPrice, marketplace.id);
                          
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