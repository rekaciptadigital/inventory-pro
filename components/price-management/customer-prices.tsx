"use client";

import { useState, useEffect } from "react";
import { UseFormReturn } from "react-hook-form";
import { PriceFormFields } from '@/types/form';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { usePriceCategories } from "@/lib/hooks/use-price-categories";
import { formatCurrency } from "@/lib/utils/format";

interface CustomerPricesProps {
  readonly form: UseFormReturn<PriceFormFields>;
}

export function CustomerPrices({ form }: Readonly<CustomerPricesProps>) {
  const { categories } = usePriceCategories();
  const [manualModes, setManualModes] = useState<Record<string, boolean>>({});
  
  // Get form values with proper defaults
  const formValues = form.watch();
  const hbNaik = formValues.hbNaik || 0;
  const percentages = formValues.percentages || {};

  const calculatePrices = (category: any) => {
    const categoryKey = category.name.toLowerCase();
    const markup = percentages[categoryKey] ?? category.percentage;
    const basePrice = hbNaik * (1 + (markup / 100));
    const taxPercentage = 11; // Fixed tax rate
    const taxAmount = basePrice * (taxPercentage / 100);

    return {
      basePrice: Number(basePrice.toFixed(2)),
      taxAmount: Number(taxAmount.toFixed(2)),
      taxInclusivePrice: Number((basePrice + taxAmount).toFixed(2)),
      appliedTaxPercentage: taxPercentage
    };
  };

  // Update prices whenever hbNaik changes
  useEffect(() => {
    categories.forEach(category => {
      const categoryKey = category.name.toLowerCase();
      const prices = calculatePrices(category);
      
      form.setValue(`customerPrices.${categoryKey}`, prices);
    });
  }, [hbNaik, categories, form]);

  return (
    <Form {...form}>
      <form className="space-y-6">
        <div className="rounded-lg border p-4 space-y-4">
          <h3 className="text-lg font-medium">Customer Category Prices</h3>
          <div className="flex flex-col gap-4">
            {categories.map((category) => {
              const categoryKey = category.name.toLowerCase();
              const isManual = manualModes[categoryKey] || false;
              const prices = calculatePrices(category);
              const currentPercentage = percentages[categoryKey] ?? category.percentage;

              return (
                <div
                  key={category.id}
                  className="space-y-4 p-4 rounded-lg border"
                >
                  <div className="flex items-center justify-between">
                    <FormLabel>{category.name} Price Settings</FormLabel>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Custom Tax-inclusive Price</span>
                      <Switch
                        checked={isManual}
                        onCheckedChange={(checked) => {
                          setManualModes(prev => ({
                            ...prev,
                            [categoryKey]: checked
                          }));
                        }}
                      />
                    </div>
                  </div>

                  {/* Changed container to display Pre-tax Price and Tax-inclusive Price side by side */}
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <FormField
                        control={form.control}
                        name={`customerPrices.${categoryKey}.basePrice`}
                        render={() => (
                          <FormItem>
                            <FormLabel>Pre-tax Price</FormLabel>
                            <FormControl>
                              <Input
                                type="text"
                                value={formatCurrency(prices.basePrice)}
                                className="bg-muted"
                                disabled
                              />
                            </FormControl>
                            <p className="text-sm text-muted-foreground">
                              {currentPercentage}% markup from HB Naik ({formatCurrency(hbNaik)})
                            </p>
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="flex-1">
                      <FormField
                        control={form.control}
                        name={`customerPrices.${categoryKey}.taxInclusivePrice`}
                        render={() => (
                          <FormItem>
                            <FormLabel>Tax-inclusive Price</FormLabel>
                            <FormControl>
                              {isManual ? (
                                <Input
                                  type="number"
                                  value={form.watch(`customerPrices.${categoryKey}.taxInclusivePrice`) || 0}
                                  onChange={(e) => {
                                    form.setValue(
                                      `customerPrices.${categoryKey}.taxInclusivePrice`,
                                      parseFloat(e.target.value) || 0
                                    );
                                  }}
                                />
                              ) : (
                                <Input
                                  type="text"
                                  value={formatCurrency(prices.taxInclusivePrice)}
                                  className="bg-muted font-medium"
                                  disabled
                                />
                              )}
                            </FormControl>
                            <FormMessage />
                            <p className="text-sm text-muted-foreground">
                              Including 11% tax ({formatCurrency(prices.taxAmount)})
                            </p>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                  {/* Removed the Applied Taxes section */}
                </div>
              );
            })}
          </div>
        </div>
      </form>
    </Form>
  );
}
