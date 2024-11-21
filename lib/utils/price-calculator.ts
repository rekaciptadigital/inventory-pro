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

export const calculateCustomerPrices = (hbNaik: number) => {
  // Base multiplier for Platinum
  const platinumMultiplier = 1.45;
  const platinumPrice = Math.round(hbNaik * platinumMultiplier);
  
  // Each tier adds a percentage to the previous tier
  const goldMultiplier = 1.03; // 3% more than Platinum
  const silverMultiplier = 1.05; // 5% more than Gold
  const bronzeMultiplier = 1.05; // 5% more than Silver

  const goldPrice = Math.round(platinumPrice * goldMultiplier);
  const silverPrice = Math.round(goldPrice * silverMultiplier);
  const bronzePrice = Math.round(silverPrice * bronzeMultiplier);

  return {
    platinum: platinumPrice,
    gold: goldPrice,
    silver: silverPrice,
    bronze: bronzePrice,
  };
};