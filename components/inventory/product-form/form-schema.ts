import * as z from 'zod';

export const productFormSchema = z.object({
  brand: z.string().min(1, 'Brand is required'),
  productTypeId: z.string().min(1, 'Product type is required'),
  categoryId: z.string().min(1, 'Product category is required'),
  subCategory1: z.string().optional(),
  subCategory2: z.string().optional(),
  subCategory3: z.string().optional(),
  sku: z.string(),
  uniqueCode: z.string().optional(),
  fullProductName: z.string(),
  vendorSku: z.string().optional(),
  productName: z.string().min(1, 'Product name is required'),
  description: z.string().optional(),
  unit: z.enum(['PC', 'PACK', 'SET']),
  variants: z.array(z.any()).optional(),
  variantPrices: z.record(z.number()).optional(),
});

export type ProductFormValues = z.infer<typeof productFormSchema> & {
  usdPrice?: number;
};