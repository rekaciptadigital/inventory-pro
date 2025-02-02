'use client';

import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { UseFormReturn } from 'react-hook-form';
import type { PriceFormFields } from '@/types/form';

interface PricingInfoProps {
  readonly form: UseFormReturn<PriceFormFields>;
}

export function PricingInfo({ form }: Readonly<PricingInfoProps>) {
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

  const hbNaik = form.watch('hbNaik') || 0;

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Pricing Information</h3>
      
      <div className="grid gap-6">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="hbReal"
            render={({ field }) => (
              <FormItem>
                <FormLabel>HB Real (Base Price)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Enter base price"
                    value={field.value || ''}
                    onChange={(e) => handleNumericChange(e, field)}
                    onBlur={field.onBlur}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="adjustmentPercentage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Adjustment Percentage (%)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Enter adjustment %"
                    value={field.value || ''}
                    onChange={(e) => handleNumericChange(e, field)}
                    onBlur={field.onBlur}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="bg-muted/50 p-4 rounded-lg">
          <FormLabel>HB Naik (Adjusted Base Price)</FormLabel>
          <div className="text-2xl font-bold mt-1">
            Rp {hbNaik.toLocaleString()}
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Automatically calculated from HB Real + Adjustment
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="usdPrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>USD Price</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Enter USD price"
                    value={field.value || ''}
                    onChange={(e) => handleNumericChange(e, field)}
                    onBlur={field.onBlur}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="exchangeRate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Exchange Rate (KURS)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Enter exchange rate"
                    value={field.value || ''}
                    onChange={(e) => handleNumericChange(e, field)}
                    onBlur={field.onBlur}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
    </div>
  );
}