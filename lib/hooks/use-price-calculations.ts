import { UseFormReturn } from 'react-hook-form';
import { ProductFormValues } from '@/components/inventory/product-form/form-schema';

interface Category {
  id: number;
  name: string;
  percentage: number;
}

export function usePriceCalculations(form: UseFormReturn<ProductFormValues>) {
  const updateHBReal = () => {
    const values = form.getValues();
    const hbReal = (values.usdPrice || 0) * (values.exchangeRate || 0);
    form.setValue('hbReal', hbReal);
    return hbReal;
  };

  const updateHBNaik = () => {
    const values = form.getValues();
    const hbReal = values.hbReal || 0;
    const adjustmentPercentage = values.adjustmentPercentage || 0;
    const hbNaik = hbReal * (1 + (adjustmentPercentage / 100));
    form.setValue('hbNaik', hbNaik);
    return hbNaik;
  };

  const updateCustomerPrices = (hbNaik: number, categories: Category[]) => {
    if (!categories?.length) return;

    const customerPrices: PriceFormValues['customerPrices'] = {};
    
    categories.forEach(category => {
      const categoryKey = category.name.toLowerCase();
      const markup = parseFloat(category.percentage?.toString() || '0');
      const basePrice = hbNaik * (1 + (markup / 100));
      const taxAmount = basePrice * 0.11;

      customerPrices[categoryKey] = {
        basePrice: Number(basePrice.toFixed(2)),
        taxAmount: Number(taxAmount.toFixed(2)),
        taxInclusivePrice: Number((basePrice + taxAmount).toFixed(2))
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