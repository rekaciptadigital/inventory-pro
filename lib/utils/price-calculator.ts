import { PriceCategory } from '@/types/settings';
import { Tax } from '@/types/tax';

export const calculateHBNaik = (hbReal: number, adjustmentPercentage: number): number => {
  return Math.round(hbReal * (1 + adjustmentPercentage / 100));
};

export const calculateCustomerPrices = (
  hbNaik: number, 
  categories: PriceCategory[],
  activeTaxes: Tax[] = []
) => {
  const prices = {};
  const totalTaxPercentage = activeTaxes
    .filter(tax => tax.status === 'active')
    .reduce((sum, tax) => sum + tax.percentage, 0);
  
  categories.forEach((category) => {
    // Calculate base price with markup
    const basePrice = Math.round(hbNaik * (1 + category.percentage / 100));
    
    // Calculate tax-inclusive price
    const taxMultiplier = 1 + (totalTaxPercentage / 100);
    const taxInclusivePrice = Math.round(basePrice * taxMultiplier);
    
    prices[category.name.toLowerCase()] = {
      basePrice,
      taxInclusivePrice,
      appliedTaxPercentage: totalTaxPercentage
    };
  });

  return prices;
};