import { FormField, FormItem, FormLabel } from '@/components/ui/form';
import { VariantConfiguration } from '@/components/inventory/variant-form/sections/variant-configuration';
import type { UseFormReturn } from 'react-hook-form';
import type { ProductFormValues } from '../form-schema';

interface VariantCombinationsFormProps {
  readonly selectedVariants: Array<{ typeId: string; values: string[] }>;
  readonly onVariantsChange: (variants: Array<{ typeId: string; values: string[] }>) => void;
  readonly form: UseFormReturn<ProductFormValues>;
}

export function VariantCombinationsForm({
  selectedVariants,
  onVariantsChange,
  form,
}: VariantCombinationsFormProps) {
  return (
    <FormField
      control={form.control}
      name="variants"
      render={() => (
        <FormItem>
          <FormLabel>Variant Combinations</FormLabel>
          <VariantConfiguration
            selectedVariants={selectedVariants}
            onVariantsChange={onVariantsChange}
            form={form}
          />
        </FormItem>
      )}
    />
  );
}