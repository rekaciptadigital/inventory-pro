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
  
  const formValues = form.watch();
  const hbNaik = formValues.hbNaik || 0;
  const percentages = formValues.percentages || {};

  const calculatePrices = (category: any, customPercentage?: number) => {
    const categoryKey = category.name.toLowerCase();
    const markup = customPercentage ?? percentages[categoryKey] ?? category.percentage;
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

  // Update prices whenever hbNaik or percentages change
  useEffect(() => {
    categories.forEach(category => {
      const categoryKey = category.name.toLowerCase();
      const prices = calculatePrices(category);
      form.setValue(`customerPrices.${categoryKey}`, prices);
    });
  }, [hbNaik, percentages, categories, form]);

  const handlePercentageChange = (category: any, value: string) => {
    const categoryKey = category.name.toLowerCase();
    const numValue = parseFloat(value);
    
    if (!isNaN(numValue)) {
      form.setValue(`percentages.${categoryKey}`, numValue);
      const prices = calculatePrices(category, numValue);
      form.setValue(`customerPrices.${categoryKey}`, prices);
    }
  };

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

                  {/* Price settings container */}
                  <div className="flex gap-4">
                    {/* New Percentage Input */}
                    <div className="flex-1">
                      <FormField
                        control={form.control}
                        name={`percentages.${categoryKey}`}
                        render={() => (
                          <FormItem>
                            <FormLabel>Markup Percentage (%)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                value={currentPercentage}
                                onChange={(e) => handlePercentageChange(category, e.target.value)}
                                disabled={!isManual}
                                className={!isManual ? "bg-muted" : ""}
                              />
                            </FormControl>
                            <p className="text-sm text-muted-foreground">
                              {isManual ? "Custom markup percentage" : "Default category markup"}
                            </p>
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Pre-tax Price */}
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

                    {/* Tax-inclusive Price */}
                    <div className="flex-1">
                      <FormField
                        control={form.control}
                        name={`customerPrices.${categoryKey}.taxInclusivePrice`}
                        render={() => (
                          <FormItem>
                            <FormLabel>Tax-inclusive Price</FormLabel>
                            <FormControl>
                              <Input
                                type="text"
                                value={formatCurrency(prices.taxInclusivePrice)}
                                className="bg-muted font-medium"
                                disabled
                              />
                            </FormControl>
                            <p className="text-sm text-muted-foreground">
                              Including 11% tax ({formatCurrency(prices.taxAmount)})
                            </p>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </form>
    </Form>
  );
}
