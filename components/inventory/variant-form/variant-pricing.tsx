'use client';

import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { UseFormReturn } from 'react-hook-form';
import { VariantFormValues } from './variant-form-schema';
import { useVariantTypes } from '@/lib/hooks/use-variant-types';
import { formatCurrency } from '@/lib/utils/format';

interface VariantPricingProps {
  form: UseFormReturn<VariantFormValues>;
  selectedVariants: Array<{ typeId: string; values: string[] }>;
}

export function VariantPricing({ form, selectedVariants }: VariantPricingProps) {
  const { variantTypes } = useVariantTypes();

  const handlePriceChange = (sku: string, value: string) => {
    const numericValue = value === '' ? 0 : parseFloat(value);
    form.setValue(`prices.${sku}`, numericValue);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Variant Pricing</h3>

      <FormField
        control={form.control}
        name="basePrice"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Base Price</FormLabel>
            <FormControl>
              <Input
                type="number"
                placeholder="Enter base price"
                {...field}
                onChange={(e) => field.onChange(parseFloat(e.target.value))}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {selectedVariants.length > 0 && (
        <div className="mt-4 border rounded-lg divide-y">
          {selectedVariants.map((variant, index) => {
            const variantType = variantTypes.find(vt => vt.id === variant.typeId);
            const values = variant.values
              .map(valueId => {
                const value = variantType?.values.find(v => v.id === valueId);
                return value?.name;
              })
              .filter(Boolean)
              .join(', ');

            const sku = `${form.watch('parentSku')}-${index + 1}`;
            const price = form.watch(`prices.${sku}`) || form.watch('basePrice');

            return (
              <div key={sku} className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{variantType?.name}: {values}</p>
                    <p className="text-sm text-muted-foreground">SKU: {sku}</p>
                  </div>
                  <FormField
                    control={form.control}
                    name={`prices.${sku}`}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            type="number"
                            value={price}
                            onChange={(e) => handlePriceChange(sku, e.target.value)}
                            className="w-[200px]"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}