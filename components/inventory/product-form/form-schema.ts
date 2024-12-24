import * as z from 'zod';

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
});

export type ProductFormValues = z.infer<typeof productFormSchema>;