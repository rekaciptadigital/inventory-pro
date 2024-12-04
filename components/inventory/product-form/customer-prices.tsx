'use client';

import { useState } from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { UseFormReturn } from 'react-hook-form';
import { ProductFormValues } from './form-schema';
import { usePriceCategories } from '@/lib/hooks/use-price-categories';
import { useTaxes } from '@/lib/hooks/use-taxes';
import { calculateCustomerPrices } from '@/lib/utils/price-calculator';

interface CustomerPricesProps {
  form: UseFormReturn<ProductFormValues>;
}

export function CustomerPrices({ form }: CustomerPricesProps) {
  const { categories } = usePriceCategories();
  const { taxes } = useTaxes();
  const activeTaxes = taxes.filter(tax => tax.status === 'active');
  const [useCustomMultipliers, setUseCustomMultipliers] = useState<{ [key: string]: boolean }>({});
  
  const hbNaik = form.watch('hbNaik') || 0;
  const customerPrices = form.watch('customerPrices');
  const percentages = form.watch('percentages') || {};

  const handlePercentageChange = (categoryKey: string, value: string) => {
    const numValue = value === '' ? 0 : parseInt(value);
    form.setValue(`percentages.${categoryKey}`, numValue);
    
    const prices = calculateCustomerPrices(hbNaik, [{
      id: '1',
      name: categoryKey,
      percentage: numValue,
      order: 0
    }], activeTaxes);
    
    form.setValue(`customerPrices.${categoryKey}`, prices[categoryKey]);
  };

  const totalTaxPercentage = activeTaxes.reduce((sum, tax) => sum + tax.percentage, 0);

  return (
    <div className="rounded-lg border p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Customer Category Prices</h3>
        <div className="text-sm text-muted-foreground">
          Base Price (HB Naik): Rp {hbNaik.toLocaleString()}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {categories.map((category) => {
          const categoryKey = category.name.toLowerCase();
          const price = customerPrices?.[categoryKey];
          const currentPercentage = percentages[categoryKey] || category.percentage;
          const isCustom = useCustomMultipliers[categoryKey];

          return (
            <div key={category.id} className="space-y-4 p-4 rounded-lg border">
              <div className="flex items-center justify-between">
                <FormLabel>{category.name} Price Settings</FormLabel>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground">Custom Percentage</span>
                  <Switch
                    checked={isCustom}
                    onCheckedChange={(checked) => {
                      const newState = { ...useCustomMultipliers, [categoryKey]: checked };
                      setUseCustomMultipliers(newState);
                      if (!checked) {
                        handlePercentageChange(categoryKey, category.percentage.toString());
                      }
                    }}
                  />
                </div>
              </div>

              {isCustom && (
                <FormField
                  control={form.control}
                  name={`percentages.${categoryKey}`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Custom Percentage</FormLabel>
                      <FormControl>
                        <Input 
                          type="text"
                          inputMode="decimal"
                          pattern="[0-9]*"
                          placeholder={category.percentage.toString()}
                          value={field.value || category.percentage}
                          onChange={(e) => handlePercentageChange(categoryKey, e.target.value.replace(/[^0-9]/g, ''))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name={`customerPrices.${categoryKey}.basePrice`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pre-tax Price</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          value={price?.basePrice?.toLocaleString() || '0'}
                          className="bg-muted"
                          disabled
                        />
                      </FormControl>
                      <p className="text-sm text-muted-foreground">
                        {currentPercentage}% markup from HB Naik
                      </p>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`customerPrices.${categoryKey}.taxInclusivePrice`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tax-inclusive Price</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          value={price?.taxInclusivePrice?.toLocaleString() || '0'}
                          className="bg-muted font-medium"
                          disabled
                        />
                      </FormControl>
                      <p className="text-sm text-muted-foreground">
                        Including {totalTaxPercentage}% tax
                      </p>
                    </FormItem>
                  )}
                />
              </div>

              {activeTaxes.length > 0 && (
                <div className="mt-2 text-sm text-muted-foreground">
                  <Separator className="my-2" />
                  <p>Applied Taxes:</p>
                  {activeTaxes.map(tax => (
                    <p key={tax.id}>• {tax.name}: {tax.percentage}%</p>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-4 bg-muted/50 p-4 rounded-lg">
        <h4 className="font-medium mb-2">Price Calculation Formula</h4>
        <ul className="space-y-1 text-sm text-muted-foreground">
          {categories.map((category) => {
            const categoryKey = category.name.toLowerCase();
            const currentPercentage = percentages[categoryKey] || category.percentage;
            const isCustom = useCustomMultipliers[categoryKey];

            return (
              <li key={category.id}>
                <div>
                  • {category.name}: HB Naik + {currentPercentage}% markup
                  {isCustom && ' (Custom)'}
                </div>
                {activeTaxes.length > 0 && (
                  <div className="ml-4 text-muted-foreground">
                    + {totalTaxPercentage}% tax
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}