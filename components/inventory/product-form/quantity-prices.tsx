'use client';

import React from 'react';
import { FormField, FormItem, FormLabel, FormControl } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { UseFormReturn } from 'react-hook-form';
import { ProductFormValues } from './form-schema';

interface QuantityPricesProps {
  form: UseFormReturn<ProductFormValues>;
}

export function QuantityPrices({ form }: QuantityPricesProps) {
  const quantities = form.watch('quantities');

  return (
    <div className="rounded-lg border p-4">
      <h3 className="text-lg font-medium mb-4">Quantity-based Prices</h3>
      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="quantities.min15"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Min 15 pcs Price</FormLabel>
              <FormControl>
                <Input
                  type="text"
                  value={(quantities?.min15 || 0).toLocaleString()}
                  className="bg-muted"
                  disabled
                />
              </FormControl>
              <p className="text-sm text-muted-foreground">45% markup from HB Naik</p>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="quantities.min10"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Min 10 pcs Price</FormLabel>
              <FormControl>
                <Input
                  type="text"
                  value={(quantities?.min10 || 0).toLocaleString()}
                  className="bg-muted"
                  disabled
                />
              </FormControl>
              <p className="text-sm text-muted-foreground">49% markup from HB Naik</p>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="quantities.min5"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Min 5 pcs Price</FormLabel>
              <FormControl>
                <Input
                  type="text"
                  value={(quantities?.min5 || 0).toLocaleString()}
                  className="bg-muted"
                  disabled
                />
              </FormControl>
              <p className="text-sm text-muted-foreground">57% markup from HB Naik</p>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="quantities.single"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Single pc Price</FormLabel>
              <FormControl>
                <Input
                  type="text"
                  value={(quantities?.single || 0).toLocaleString()}
                  className="bg-muted"
                  disabled
                />
              </FormControl>
              <p className="text-sm text-muted-foreground">65% markup from HB Naik</p>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="quantities.retail"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Retail Price</FormLabel>
              <FormControl>
                <Input
                  type="text"
                  value={(quantities?.retail || 0).toLocaleString()}
                  className="bg-muted"
                  disabled
                />
              </FormControl>
              <p className="text-sm text-muted-foreground">81% markup from HB Naik</p>
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}