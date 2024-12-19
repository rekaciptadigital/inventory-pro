import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { taxFormSchema } from '@/lib/validations/tax';
import type { Tax, TaxFormData } from '@/types/tax';

export function useTaxForm(
  initialData?: Tax,
  onSubmit?: (data: TaxFormData) => Promise<void>
) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<TaxFormData>({
    resolver: zodResolver(taxFormSchema),
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
      percentage: initialData?.percentage || 0,
      status: initialData?.status || 'active',
    },
  });

  const handleSubmit = async (data: TaxFormData) => {
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