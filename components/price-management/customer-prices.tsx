'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { usePriceCategories } from '@/lib/hooks/use-price-categories';
import { useTaxes } from '@/lib/hooks/use-taxes';
import { formatCurrency } from '@/lib/utils/format';
import type { Product } from '@/types/inventory';

interface CustomerPricesProps {
  product: Product;
}

export function CustomerPrices({ product }: CustomerPricesProps) {
  const { categories } = usePriceCategories();
  const { taxes } = useTaxes();
  const form = useForm({
    defaultValues: {
      customerPrices: product.customerPrices || {},
      percentages: product.percentages || {},
    },
  });

  const activeTaxes = taxes.filter(tax => tax.status === 'active');
  const totalTaxPercentage = activeTaxes.reduce((sum, tax) => sum + tax.percentage, 0);

  return (
    <Form {...form}>
      <form className="space-y-6">
        <div className="rounded-lg border p-4">
          <h3 className="text-lg font-medium mb-4">Customer Category Prices</h3>
          
          <div className="grid grid-cols-2 gap-4">
            {categories.map((category) => {
              const categoryKey = category.name.toLowerCase();
              const price = product.customerPrices?.[categoryKey] || {
                basePrice: 0,
                taxAmount: 0,
                taxInclusivePrice: 0,
              };

              return (
                <div key={category.id} className="space-y-4 p-4 rounded-lg border">
                  <div className="flex items-center justify-between">
                    <FormLabel>{category.name} Price Settings</FormLabel>
                  </div>

                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name={`customerPrices.${categoryKey}.basePrice`}
                      render={() => (
                        <FormItem>
                          <FormLabel>Pre-tax Price</FormLabel>
                          <FormControl>
                            <Input
                              type="text"
                              value={formatCurrency(price.basePrice)}
                              className="bg-muted"
                              disabled
                            />
                          </FormControl>
                          <p className="text-sm text-muted-foreground">
                            {category.percentage}% markup from HB Naik
                          </p>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`customerPrices.${categoryKey}.taxInclusivePrice`}
                      render={() => (
                        <FormItem>
                          <FormLabel>Tax-inclusive Price</FormLabel>
                          <FormControl>
                            <Input
                              type="text"
                              value={formatCurrency(price.taxInclusivePrice)}
                              className="bg-muted font-medium"
                              disabled
                            />
                          </FormControl>
                          <p className="text-sm text-muted-foreground">
                            Including {totalTaxPercentage}% tax ({formatCurrency(price.taxAmount)})
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
        </div>
      </form>
    </Form>
  );
}