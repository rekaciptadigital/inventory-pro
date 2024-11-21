'use client';

import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { UseFormReturn } from 'react-hook-form';
import { ProductFormValues } from './form-schema';
import { usePriceCategories } from '@/lib/hooks/use-price-categories';

interface CustomerCategoriesProps {
  form: UseFormReturn<ProductFormValues>;
}

export function CustomerCategories({ form }: CustomerCategoriesProps) {
  const { categories } = usePriceCategories();

  const handleNumericChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: {
      onChange: (value: number) => void;
      onBlur: () => void;
    }
  ) => {
    const value = e.target.value;
    const numberValue = value === '' ? 0 : parseFloat(value);
    field.onChange(numberValue);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Customer Categories</h3>
      <div className="grid grid-cols-2 gap-4">
        {categories.map((category) => (
          <FormField
            key={category.id}
            control={form.control}
            name={`customerCategories.${category.name.toLowerCase()}`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{category.name} Price</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder={`Enter ${category.name} price`}
                    value={field.value || ''}
                    onChange={(e) => handleNumericChange(e, field)}
                    onBlur={field.onBlur}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ))}
      </div>
    </div>
  );
}