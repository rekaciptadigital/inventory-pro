import { useCallback } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { ProductFormValues } from '@/components/inventory/product-form/form-schema';
import { calculateHBNaik, calculateCustomerPrices } from '@/lib/utils/price-calculator';
import type { Tax } from '@/types/pricing';

export function usePriceCalculations(form: UseFormReturn<ProductFormValues>) {
  const updateHBNaik = useCallback(() => {
    const hbReal = form.watch('hbReal') || 0;
    const adjustmentPercentage = form.watch('adjustmentPercentage') || 0;
    const hbNaik = calculateHBNaik(hbReal, adjustmentPercentage);
    
    form.setValue('hbNaik', hbNaik, { shouldValidate: true });
    return hbNaik;
  }, [form]);

  const updateHBReal = useCallback(() => {
    const usdPrice = form.watch('usdPrice') || 0;
    const exchangeRate = form.watch('exchangeRate') || 0;
    const hbReal = Math.round(usdPrice * exchangeRate);
    
    form.setValue('hbReal', hbReal, { shouldValidate: true });
    return hbReal;
  }, [form]);

  const updateCustomerPrices = useCallback((
    hbNaik: number,
    categories: Array<{ name: string; percentage: number }>,
    activeTaxes: Tax[]
  ) => {
    if (hbNaik > 0) {
      const prices = calculateCustomerPrices(hbNaik, categories, activeTaxes);
      form.setValue('customerPrices', prices, { shouldValidate: true });
    }
  }, [form]);

  return {
    updateHBNaik,
    updateHBReal,
    updateCustomerPrices,
  };
}