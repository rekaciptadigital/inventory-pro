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
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Customer Categories</h3>
      </div>
      <div className="space-y-2">
        {categories.map((category) => (
          <FormField
            key={category.id}
            control={form.control}
            name={`customerCategories.${category.name.toLowerCase()}`}
            render={({ field }) => (
              <FormItem className="mb-0">
                <div className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-50">
                  <FormLabel className="min-w-[120px] mb-0">{category.name}</FormLabel>
                  <FormControl>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        step="0.01"
                        placeholder={`Enter price for ${category.name}`}
                        value={field.value || ''}
                        onChange={(e) => handleNumericChange(e, field)}
                        onBlur={field.onBlur}
                        className="w-32"
                      />
                      <span className="text-sm text-gray-500">IDR</span>
                    </div>
                  </FormControl>
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />
        ))}
      </div>
    </div>
  );
}