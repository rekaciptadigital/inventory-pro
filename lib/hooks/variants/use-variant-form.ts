import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { variantFormSchema } from '@/lib/validations/variant';
import type { VariantType, VariantTypeFormData } from '@/types/variant';

export function useVariantForm(
  initialData?: VariantType,
  onSubmit?: (data: VariantTypeFormData) => Promise<void>
) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<VariantTypeFormData>({
    resolver: zodResolver(variantFormSchema),
    defaultValues: {
      name: initialData?.name || '',
      status: initialData?.status || 'active',
      order: initialData?.order || 1,
      values: initialData?.values.map(v => ({
        name: v.name,
        details: v.details || '',
        order: v.order,
      })) || [],
    },
  });

  const handleSubmit = async (data: VariantTypeFormData) => {
    try {
      setIsSubmitting(true);
      if (onSubmit) {
        await onSubmit(data);
      }
      form.reset();
    } catch (error) {
      // Error handling is done in the mutation hook
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    form,
    isSubmitting,
    handleSubmit: form.handleSubmit(handleSubmit),
  };
}