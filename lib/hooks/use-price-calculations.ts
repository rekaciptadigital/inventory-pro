import { UseFormReturn } from "react-hook-form";
import type { PriceFormFields } from "@/types/form";

interface Category {
  id: number;
  name: string;
  percentage: number;
}

export function usePriceCalculations(form: UseFormReturn<PriceFormFields>) {
  const updateHBReal = () => {
    const usdPrice = form.getValues("usdPrice");
    const exchangeRate = form.getValues("exchangeRate");
    const hbReal = usdPrice * exchangeRate;
    form.setValue("hbReal", hbReal);
  };

  const updateHBNaik = () => {
    const hbReal = form.getValues("hbReal");
    const adjustmentPercentage = form.getValues("adjustmentPercentage");
    const hbNaik = hbReal * (1 + adjustmentPercentage / 100);
    form.setValue("hbNaik", hbNaik);
  };

  const updateCustomerPrices = (hbNaik: number, categories: Category[]) => {
    if (!categories?.length) return;

    const customerPrices: PriceFormFields['customerPrices'] = {};
    
    categories.forEach(category => {
      const categoryKey = category.name.toLowerCase();
      const markup = parseFloat(category.percentage?.toString() || '0');
      const basePrice = hbNaik * (1 + (markup / 100));
      const taxAmount = basePrice * 0.11;

      customerPrices[categoryKey] = {
        basePrice: Number(basePrice.toFixed(2)),
        taxAmount: Number(taxAmount.toFixed(2)),
        taxInclusivePrice: Number((basePrice + taxAmount).toFixed(2)),
        appliedTaxPercentage: 11 // Add missing property
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