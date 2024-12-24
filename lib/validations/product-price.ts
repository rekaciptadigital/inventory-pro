import * as z from 'zod';

export const productPriceSchema = z.object({
  usdPrice: z.number().min(0, 'USD Price must be greater than or equal to 0'),
  exchangeRate: z.number().min(0, 'Exchange rate must be greater than or equal to 0'),
  hbReal: z.number(),
  adjustmentPercentage: z.number().min(0, 'Adjustment percentage must be greater than or equal to 0'),
  hbNaik: z.number(),
});