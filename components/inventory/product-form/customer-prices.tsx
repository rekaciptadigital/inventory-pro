'use client';

import React from 'react';
import { FormField, FormItem, FormLabel, FormControl } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { UseFormReturn } from 'react-hook-form';
import { ProductFormValues } from './form-schema';
import type { PriceCategory } from '@/types/settings';
import { usePriceCategories } from '@/lib/hooks/use-price-categories';

interface CustomerPricesProps {
  form: UseFormReturn<ProductFormValues>;
}

export function CustomerPrices({ form }: CustomerPricesProps) {
  const { categories } = usePriceCategories();
  const hbNaik = form.watch('hbNaik') || 0;
  const customerPrices = form.watch('customerPrices') || {};

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Customer Category Prices</h3>
        <div className="text-sm text-muted-foreground">
          Base Price (HB Naik): Rp {hbNaik.toLocaleString()}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {categories.map((category, index) => {
          const categoryKey = category.name.toLowerCase();
          const price = customerPrices[categoryKey] || 0;
          const previousCategory = index > 0 ? categories[index - 1] : null;

          return (
            <FormField
              key={category.id}
              control={form.control}
              name={`customerPrices.${categoryKey}`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{category.name} Price</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      value={price.toLocaleString()}
                      className="bg-muted"
                      disabled
                    />
                  </FormControl>
                  <p className="text-sm text-muted-foreground">
                    {(category.multiplier * 100 - 100).toFixed(0)}% markup from{' '}
                    {index === 0 ? 'HB Naik' : previousCategory?.name}
                  </p>
                </FormItem>
              )}
            />
          );
        })}
      </div>

      <div className="bg-muted/50 p-4 rounded-lg">
        <h4 className="font-medium mb-2">Price Calculation Formula</h4>
        <ul className="space-y-1 text-sm text-muted-foreground">
          {categories.map((category, index) => (
            <li key={category.id}>
              • {category.name}: {index === 0 
                ? `HB Naik × ${category.multiplier} (${(category.multiplier * 100 - 100).toFixed(0)}% markup)`
                : `${categories[index - 1].name} × ${category.multiplier} (${(category.multiplier * 100 - 100).toFixed(0)}% markup)`}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}