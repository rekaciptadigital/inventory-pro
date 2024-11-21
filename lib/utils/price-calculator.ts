export const calculateHBNaik = (hbReal: number, adjustmentPercentage: number): number => {
  return hbReal * (1 + adjustmentPercentage / 100);
};

export const calculateCustomerPrices = (
  hbNaik: number,
  categories: { name: string; multiplier: number }[],
  customMultipliers?: Record<string, number>
) => {
  let prices: Record<string, number> = {};
  let previousPrice = hbNaik;

  categories.forEach((category) => {
    const multiplier = customMultipliers?.[category.name.toLowerCase()] ?? category.multiplier;
    const price = Math.round(previousPrice * multiplier);
    prices[category.name.toLowerCase()] = price;
    previousPrice = price;
  });

  return prices;
};

export const calculateQuantityPrices = (hbNaik: number) => {
  const quantityFactors = {
    min15: 1.15,
    min10: 1.2,
    min5: 1.25,
    single: 1.3,
    retail: 1.4,
  };

  return {
    min15: Math.round(hbNaik * quantityFactors.min15),
    min10: Math.round(hbNaik * quantityFactors.min10),
    min5: Math.round(hbNaik * quantityFactors.min5),
    single: Math.round(hbNaik * quantityFactors.single),
    retail: Math.round(hbNaik * quantityFactors.retail),
  };
};