'use client';

import * as z from 'zod';

export const variantFormSchema = z.object({
  brand: z.string().min(1, 'Brand is required'),
  productTypeId: z.string().min(1, 'Product type is required'),
  productId: z.string().min(1, 'Product is required'),
  baseSku: z.string(),
  description: z.string().optional(),
  variants: z.array(z.object({
    typeId: z.string(),
    values: z.array(z.string()),
  })).default([]),
  skus: z.array(z.string()).default([]),
});

export type VariantFormValues = z.infer<typeof variantFormSchema>;