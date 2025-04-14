'use client';

import { useCallback } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import type { PriceFormFields } from '@/types/form';
import { roundPriceMarkup } from '@/lib/utils/price-rounding';

interface Category {
  id: number;
  name: string;
  percentage: number;
}

/**
 * Hook to handle price calculations across the application
 * Provides consistent calculation methods for HB Real and HB Naik values
 */
export function usePriceCalculations(form: UseFormReturn<PriceFormFields>) {
  /**
   * Calculate HB Real (Base Price) from USD Price and Exchange Rate
   * Formula: HB Real = USD Price × Exchange Rate
   */
  const updateHBReal = useCallback(() => {
    const usdPrice = form.getValues('usdPrice') || 0;
    const exchangeRate = form.getValues('exchangeRate') || 0;
    const hbReal = Math.round(usdPrice * exchangeRate);
    
    form.setValue('hbReal', hbReal);
    
    // Since HB Real has changed, we should also update HB Naik
    updateHBNaik(hbReal);
    
    return hbReal;
  }, [form]);

  /**
   * Calculate HB Naik (Adjusted Price) from HB Real and Adjustment Percentage
   * Formula: HB Naik = HB Real × (1 + Adjustment/100)
   */
  const updateHBNaik = useCallback((providedHBReal?: number) => {
    const hbReal = providedHBReal ?? (form.getValues('hbReal') || 0);
    const adjustmentPercentage = form.getValues('adjustmentPercentage') || 0;
    
    // Calculate HB Naik (adjusted price)
    const hbNaik = Math.round(hbReal * (1 + (adjustmentPercentage / 100)));
    
    // Update form value
    form.setValue('hbNaik', hbNaik);
    
    // Update pricingInformation object for consistency
    form.setValue('pricingInformation', {
      usdPrice: form.getValues('usdPrice') || 0,
      adjustmentPercentage: adjustmentPercentage
    });
    
    return hbNaik;
  }, [form]);

  const updateCustomerPrices = (hbNaik: number, categories: Category[]) => {
    if (!categories?.length) return;

    const customerPrices: PriceFormFields['customerPrices'] = {};
    
    categories.forEach(category => {
      const categoryKey = category.name.toLowerCase();
      const markup = parseFloat(category.percentage?.toString() || '0');
      const basePrice = hbNaik * (1 + (markup / 100));
      const tax = basePrice * 0.11;
      
      // Apply rounding rules to the final tax-inclusive price
      const rawTaxInclusivePrice = basePrice + tax;
      const taxInclusivePrice = roundPriceMarkup(rawTaxInclusivePrice);

      customerPrices[categoryKey] = {
        basePrice: Number(basePrice.toFixed(2)),
        preTaxPrice: Number(basePrice.toFixed(2)),
        taxInclusivePrice: taxInclusivePrice,
        taxPercentage: 11,
        isCustomTaxInclusivePrice: false,
        markup: markup,
        name: category.name
      };
    });

    form.setValue('customerPrices', customerPrices);
  };

  return {
    updateHBReal,
    updateHBNaik,
    updateCustomerPrices
  };
}