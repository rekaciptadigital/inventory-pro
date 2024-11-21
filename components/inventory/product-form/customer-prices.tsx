'use client';

import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { UseFormReturn } from 'react-hook-form';
import { ProductFormValues } from './form-schema';

interface CustomerPricesProps {
  form: UseFormReturn<ProductFormValues>;
}

export function CustomerPrices({ form }: CustomerPricesProps) {
  return (
    <div className="rounded-lg border p-4">
      <h3 className="text-lg font-medium mb-4">Customer Category Prices</h3>
      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="customerPrices.platinum"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Platinum Price</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  value={field.value.toLocaleString()}
                  className="bg-muted"
                  disabled
                />
              </FormControl>
              <p className="text-sm text-muted-foreground">Base tier - 45% markup from HB Naik</p>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="customerPrices.gold"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Gold Price</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  value={field.value.toLocaleString()}
                  className="bg-muted"
                  disabled
                />
              </FormControl>
              <p className="text-sm text-muted-foreground">3% markup from Platinum</p>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="customerPrices.silver"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Silver Price</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  value={field.value.toLocaleString()}
                  className="bg-muted"
                  disabled
                />
              </FormControl>
              <p className="text-sm text-muted-foreground">5% markup from Gold</p>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="customerPrices.bronze"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bronze Price</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  value={field.value.toLocaleString()}
                  className="bg-muted"
                  disabled
                />
              </FormControl>
              <p className="text-sm text-muted-foreground">5% markup from Silver</p>
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}