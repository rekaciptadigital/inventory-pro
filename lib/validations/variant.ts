import * as z from 'zod';

export const variantFormSchema = z.object({
  name: z.string().min(1, 'Variant name is required'),
  display_order: z.number().min(1, 'Display order must be at least 1'),
  status: z.boolean(),
  values: z.string().min(1, 'Values are required').transform(str => 
    str.split(',')
      .map(s => s.trim())
      .filter(Boolean)
  ),
});

export type VariantFormData = z.infer<typeof variantFormSchema>;