'use client';

import React from 'react';
import { FormField, FormItem, FormLabel, FormControl } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { UseFormReturn } from 'react-hook-form';
import { ProductFormValues } from '../form-schema';
import type { PriceCategory } from '@/types/settings';

interface CustomerPricesProps {
  form: UseFormReturn<ProductFormValues>;
  categories: PriceCategory[];
}

export function CustomerPrices({ form, categories }: CustomerPricesProps) {
  const hbNaik = form.watch('hbNaik') || 0;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Customer Category Prices</h3>
        <div className="text-sm text-muted-foreground">
          Base Price (HB Naik): Rp {hbNaik.toLocaleString()}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {categories.map((category) => (
          <FormField
            key={category.id}
            control={form.control}
            name={`customerPrices.${category.name.toLowerCase()}`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{category.name} Price</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    value={field.value.toLocaleString()}
                    className="bg-muted"
                    disabled
                  />
                </FormControl>
                <p className="text-sm text-muted-foreground">
                  {category.multiplier * 100}% markup
                  {category.name === 'Platinum' 
                    ? ' from HB Naik' 
                    : ` from ${categories[categories.indexOf(category) - 1]?.name}`}
                </p>
              </FormItem>
            )}
          />
        ))}
      </div>

      <div className="bg-muted/50 p-4 rounded-lg">
        <h4 className="font-medium mb-2">Price Calculation Formula</h4>
        <ul className="space-y-1 text-sm text-muted-foreground">
          <li>• Platinum: HB Naik × 1.45 (45% markup)</li>
          <li>• Gold: Platinum × 1.03 (3% markup)</li>
          <li>• Silver: Gold × 1.05 (5% markup)</li>
          <li>• Bronze: Silver × 1.05 (5% markup)</li>
        </ul>
      </div>
    </div>
  );
}