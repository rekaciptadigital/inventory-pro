'use client';

import * as z from 'zod';

export const variantFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  displayOrder: z.number().min(1, 'Display order must be at least 1'),
  status: z.boolean().default(true),
  values: z.array(z.string()).min(1, 'At least one value is required')
});

export type VariantFormValues = z.infer<typeof variantFormSchema>;