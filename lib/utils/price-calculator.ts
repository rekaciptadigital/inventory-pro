import { PriceCategory } from '@/types/settings';

export const calculateHBNaik = (hbReal: number, adjustmentPercentage: number): number => {
  return Math.round(hbReal * (1 + adjustmentPercentage / 100));
};

export const calculateQuantityPrices = (hbNaik: number) => {
  return {
    min15: Math.round(hbNaik * 1.45), // 45% markup for 15+ pieces
    min10: Math.round(hbNaik * 1.49), // 49% markup for 10+ pieces
    min5: Math.round(hbNaik * 1.57),  // 57% markup for 5+ pieces
    single: Math.round(hbNaik * 1.65), // 65% markup for single piece
    retail: Math.round(hbNaik * 1.81), // 81% markup for retail
  };
};

export const calculateCustomerPrices = (hbNaik: number, categories: PriceCategory[]) => {
  const prices = {};
  
  categories.forEach((category) => {
    const price = Math.round(hbNaik * category.multiplier);
    prices[category.name.toLowerCase()] = price;
  });

  return prices;
};