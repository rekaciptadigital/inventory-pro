import { PriceCategory } from '@/types/settings';

export const calculateBasePriceAdjusted = (basePrice: number, adjustmentPercentage: number): number => {
  return Math.round(basePrice * (1 + adjustmentPercentage / 100));
};

export const calculateCustomerPrices = (basePriceAdjusted: number, categories: PriceCategory[]) => {
  const prices = {};
  
  categories.forEach((category) => {
    const price = Math.round(basePriceAdjusted * category.multiplier);
    prices[category.name.toLowerCase()] = price;
  });

  return prices;
};