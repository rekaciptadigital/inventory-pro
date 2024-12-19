import * as z from 'zod';

export const taxFormSchema = z.object({
  name: z.string().min(1, 'Tax name is required'),
  description: z.string().optional(),
  percentage: z.number()
    .min(0, 'Percentage must be at least 0')
    .max(100, 'Percentage cannot exceed 100'),
  status: z.enum(['active', 'inactive']),
});