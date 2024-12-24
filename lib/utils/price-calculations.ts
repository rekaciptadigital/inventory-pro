import type { Product } from '@/types/inventory';
import type { PriceCategory } from '@/types/settings';
import type { Tax } from '@/types/tax';

export function calculateProductPrices(
  product: Product,
  categories: PriceCategory[],
  taxes: Tax[]
) {
  const hbNaik = product.hbNaik || 0;
  const activeTaxes = taxes.filter(tax => tax.status === 'active');
  const totalTaxPercentage = activeTaxes.reduce((sum, tax) => sum + tax.percentage, 0);

  const customerPrices = categories.reduce((acc, category) => {
    const basePrice = Math.round(hbNaik * (1 + category.percentage / 100));
    const taxAmount = Math.round(basePrice * (totalTaxPercentage / 100));
    
    acc[category.name.toLowerCase()] = {
      basePrice,
      taxAmount,
      taxInclusivePrice: basePrice + taxAmount,
      appliedTaxPercentage: totalTaxPercentage,
    };
    
    return acc;
  }, {} as Record<string, any>);

  return customerPrices;
}