import { PriceCategory } from '@/types/settings';

export const calculateHBNaik = (hbReal: number, adjustmentPercentage: number): number => {
  return Math.round(hbReal * (1 + adjustmentPercentage / 100));
};

export const calculateCustomerPrices = (hbNaik: number, categories: PriceCategory[]) => {
  const prices = {};
  
  categories.forEach((category) => {
    const price = Math.round(hbNaik * category.multiplier);
    prices[category.name.toLowerCase()] = price;
  });

  return prices;
};