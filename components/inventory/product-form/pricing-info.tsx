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

  // Calculate Base Price when USD Price or Exchange Rate changes
  useEffect(() => {
    const usdPrice = form.watch('usdPrice');
    const exchangeRate = form.watch('exchangeRate');
    
    if (usdPrice > 0 && exchangeRate > 0) {
      const basePrice = Math.round(usdPrice * exchangeRate);
      form.setValue('basePrice', basePrice);
    }
  }, [form.watch('usdPrice'), form.watch('exchangeRate')]);

  const basePrice = form.watch('basePrice') || 0;
  const basePriceAdjusted = form.watch('basePriceAdjusted') || 0;

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

        {/* Base Price Display */}
        <div className="bg-muted/50 p-4 rounded-lg">
          <FormLabel>Base Price</FormLabel>
          <div className="text-2xl font-bold mt-1">
            Rp {basePrice.toLocaleString()}
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

        {/* Base Price Adjusted Display */}
        <div className="bg-muted/50 p-4 rounded-lg">
          <FormLabel>Base Price Adjusted</FormLabel>
          <div className="text-2xl font-bold mt-1">
            Rp {basePriceAdjusted.toLocaleString()}
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Automatically calculated: Base Price × (1 + Adjustment/100)
          </p>
        </div>
      </div>
    </div>
  );
}