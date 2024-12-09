import * as z from 'zod';
import type { CustomerPrice } from '@/types/pricing';

const customerPriceSchema = z.object({
  basePrice: z.number(),
  taxAmount: z.number(),
  taxInclusivePrice: z.number(),
  appliedTaxPercentage: z.number()
});

export const productFormSchema = z.object({
  brand: z.string().min(1, 'Brand is required'),
  productTypeId: z.string().min(1, 'Product type is required'),
  sku: z.string(),
  uniqueCode: z.string().optional(),
  fullProductName: z.string(),
  vendorSku: z.string().optional(),
  productName: z.string().min(1, 'Product name is required'),
  description: z.string().optional(),
  unit: z.enum(['PC', 'PACK', 'SET']),
  hbReal: z.number().min(0, 'HB Real must be greater than or equal to 0').optional(),
  adjustmentPercentage: z.number().min(0, 'Adjustment percentage must be greater than or equal to 0').optional(),
  hbNaik: z.number().optional(),
  usdPrice: z.number().min(0, 'USD Price must be greater than or equal to 0').optional(),
  exchangeRate: z.number().min(0, 'Exchange rate must be greater than or equal to 0').optional(),
  customerPrices: z.record(customerPriceSchema).optional(),
  percentages: z.record(z.number()).optional(),
  variants: z.array(z.object({
    typeId: z.string(),
    values: z.array(z.string()),
  })).optional(),
});

export type ProductFormValues = z.infer<typeof productFormSchema>;