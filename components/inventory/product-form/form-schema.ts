import * as z from 'zod';
import { usePriceCategories } from '@/lib/hooks/use-price-categories';

// Dynamic schema for customer prices based on categories
const createCustomerPricesSchema = () => {
  const { categories } = usePriceCategories();
  const priceFields = {};
  
  categories.forEach(category => {
    priceFields[category.name.toLowerCase()] = z.number();
  });

  return z.object(priceFields);
};

export const productFormSchema = z.object({
  brand: z.string().min(1, 'Brand is required'),
  sku: z.string().min(1, 'SKU is required'),
  productName: z.string().min(1, 'Product name is required'),
  unit: z.enum(['PC', 'PACK', 'SET']),
  hbReal: z.number().min(0, 'HB Real must be greater than 0'),
  adjustmentPercentage: z.number().min(0, 'Adjustment percentage must be greater than or equal to 0'),
  hbNaik: z.number(),
  usdPrice: z.number().min(0, 'USD Price must be greater than 0'),
  exchangeRate: z.number().min(0, 'Exchange rate must be greater than 0'),
  quantities: z.object({
    min15: z.number(),
    min10: z.number(),
    min5: z.number(),
    single: z.number(),
    retail: z.number(),
  }),
  customerPrices: z.record(z.string(), z.number()),
});

export type ProductFormValues = z.infer<typeof productFormSchema>;