'use client';

import React, { useEffect } from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { UseFormReturn } from 'react-hook-form';
import { ProductFormValues } from './form-schema';

interface PricingInfoProps {
  form: UseFormReturn<ProductFormValues>;
}

export function PricingInfo({ form }: PricingInfoProps) {
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

  // Calculate HB Real when USD Price or Exchange Rate changes
  useEffect(() => {
    const usdPrice = form.watch('usdPrice');
    const exchangeRate = form.watch('exchangeRate');
    
    if (usdPrice > 0 && exchangeRate > 0) {
      const hbReal = Math.round(usdPrice * exchangeRate);
      form.setValue('hbReal', hbReal);
    }
  }, [form.watch('usdPrice'), form.watch('exchangeRate')]);

  const hbReal = form.watch('hbReal') || 0;
  const hbNaik = form.watch('hbNaik') || 0;

  return (
    <div className="rounded-lg border p-4">
      <h3 className="text-lg font-medium mb-4">Pricing Information</h3>
      
      <div className="grid gap-6">
        {/* USD and Exchange Rate Section */}
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
                    step="0.01"
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

        {/* HB Real Display */}
        <div className="bg-muted/50 p-4 rounded-lg">
          <FormLabel>HB Real (Base Price)</FormLabel>
          <div className="text-2xl font-bold mt-1">
            Rp {hbReal.toLocaleString()}
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Automatically calculated: USD Price × Exchange Rate
          </p>
        </div>

        {/* Adjustment Section */}
        <FormField
          control={form.control}
          name="adjustmentPercentage"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Adjustment Percentage (%)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
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

        {/* HB Naik Display */}
        <div className="bg-muted/50 p-4 rounded-lg">
          <FormLabel>HB Naik (Adjusted Price)</FormLabel>
          <div className="text-2xl font-bold mt-1">
            Rp {hbNaik.toLocaleString()}
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Automatically calculated: HB Real × (1 + Adjustment/100)
          </p>
        </div>
      </div>
    </div>
  );
}