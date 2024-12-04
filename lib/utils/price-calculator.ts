import type { CustomerPrice, PriceCategory, Tax } from '@/types/pricing';

export const calculateHBNaik = (hbReal: number, adjustmentPercentage: number): number => {
  if (!hbReal || isNaN(hbReal)) return 0;
  if (!adjustmentPercentage || isNaN(adjustmentPercentage)) return hbReal;
  return Math.round(hbReal * (1 + adjustmentPercentage / 100));
};

export const calculateBasePrice = (hbNaik: number, percentage: number): number => {
  if (!hbNaik || isNaN(hbNaik)) return 0;
  if (isNaN(percentage)) return hbNaik;
  return Math.round(hbNaik * (1 + percentage / 100));
};

export const calculateTaxAmount = (basePrice: number, taxPercentage: number): number => {
  if (!basePrice || isNaN(basePrice)) return 0;
  if (!taxPercentage || isNaN(taxPercentage)) return 0;
  return Math.round(basePrice * (taxPercentage / 100));
};

export const calculateCustomerPrices = (
  hbNaik: number,
  categories: PriceCategory[],
  activeTaxes: Tax[] = []
): Record<string, CustomerPrice> => {
  if (!hbNaik || isNaN(hbNaik)) {
    return {};
  }

  const totalTaxPercentage = activeTaxes
    .filter(tax => tax.status === 'active')
    .reduce((sum, tax) => sum + tax.percentage, 0);

  return categories.reduce((prices, category) => {
    const basePrice = calculateBasePrice(hbNaik, category.percentage);
    const taxAmount = calculateTaxAmount(basePrice, totalTaxPercentage);
    const taxInclusivePrice = basePrice + taxAmount;

    prices[category.name.toLowerCase()] = {
      basePrice,
      taxAmount,
      taxInclusivePrice,
      appliedTaxPercentage: totalTaxPercentage
    };

    return prices;
  }, {} as Record<string, CustomerPrice>);
};