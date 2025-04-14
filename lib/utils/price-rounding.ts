/**
 * Helper function to round prices in the million+ range
 */
function roundMillionPlusPrice(price: number): number {
  // Special case for prices just above a million
  if (price % 1000000 < 1000) {
    return Math.floor(price / 1000000) * 1000000 + Math.ceil((price % 1000000) / 100) * 100;
  }
  
  // If already rounded to thousands, keep as is
  if (price % 1000 === 0) return price;
  
  // Round up to the nearest thousand
  return Math.ceil(price / 1000) * 1000;
}

/**
 * Helper function to round prices in the 10,000 - 999,999 range
 */
function roundTenThousandPlusPrice(price: number): number {
  // If already rounded to hundreds, keep as is
  if (price % 100 === 0) return price;
  
  // Round up to the nearest hundred
  return Math.ceil(price / 100) * 100;
}

/**
 * Helper function to round prices in the 1,000 - 9,999 range
 */
function roundThousandPrice(price: number): number {
  // If already ends with 0, keep as is
  if (price % 10 === 0) return price;
  
  // Round up to the nearest 10
  return Math.ceil(price / 10) * 10;
}

/**
 * Helper function to round prices in the 100 - 999 range
 */
function roundHundredPrice(price: number): number {
  // If already ends with 0 or 5
  if (price % 10 === 0 || price % 10 === 5) return price;
  
  // If the ones digit is < 5, round to next 5
  if (price % 10 < 5) {
    return Math.floor(price / 10) * 10 + 5;
  }
  
  // Otherwise round to next 10
  return Math.ceil(price / 10) * 10;
}

/**
 * Helper function to round prices under 100
 */
function roundSmallPrice(price: number): number {
  // If already ends with 0 or 5
  if (price % 5 === 0) return price;
  
  // Round up to nearest 5
  return Math.ceil(price / 5) * 5;
}

/**
 * Rounds a price according to specific markup rules based on the price magnitude
 * @param price The price to round
 * @returns The rounded price according to markup rules
 */
export function roundPriceMarkup(price: number): number {
  // Handle negative or zero prices
  if (price <= 0) return price;
  
  // Choose the appropriate rounding function based on price range
  if (price >= 1000000) {
    return roundMillionPlusPrice(price);
  }
  
  if (price >= 10000) {
    return roundTenThousandPlusPrice(price);
  }
  
  if (price >= 1000) {
    return roundThousandPrice(price);
  }
  
  if (price >= 100) {
    return roundHundredPrice(price);
  }
  
  return roundSmallPrice(price);
}

/**
 * Rounds a price and returns both original and rounded values
 * @param price The price to round
 * @returns An object containing both original and rounded prices
 */
export function getRoundedPrice(price: number): { 
  original: number; 
  rounded: number;
  difference: number;
} {
  const rounded = roundPriceMarkup(price);
  return {
    original: price,
    rounded: rounded,
    difference: rounded - price
  };
}
