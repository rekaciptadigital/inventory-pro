import * as z from 'zod';

export const variantValueSchema = z.object({
  name: z.string().min(1, 'Value name is required'),
  details: z.string().optional(),
  order: z.number().int().min(0),
});

export const variantFormSchema = z.object({
  name: z.string().min(1, 'Variant type name is required'),
  status: z.enum(['active', 'inactive']),
  order: z.number().int().min(1, 'Order must be at least 1'),
  values: z.array(variantValueSchema),
});