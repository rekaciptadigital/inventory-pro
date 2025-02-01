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
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { usePriceCategories } from "@/lib/hooks/use-price-categories";
import { useTaxes } from "@/lib/hooks/use-taxes";
import { formatCurrency } from "@/lib/utils/format";

interface CustomerPricesProps {
  readonly form: UseFormReturn<PriceFormFields>;
}

export function CustomerPrices({ form }: Readonly<CustomerPricesProps>) {
  const { categories } = usePriceCategories();
  const { taxes } = useTaxes();
  const [manualModes, setManualModes] = useState<Record<string, boolean>>({});
  
  // Get form values with proper defaults
  const formValues = form.watch();
  const hbNaik = formValues.hbNaik || 0;
  const percentages = formValues.percentages || {};

  const calculatePrices = (category: any) => {
    const categoryKey = category.name.toLowerCase();
    const markup = percentages[categoryKey] ?? category.percentage;
    const basePrice = hbNaik * (1 + (markup / 100));
    const taxAmount = basePrice * 0.11;

    return {
      basePrice: Number(basePrice.toFixed(2)),
      taxAmount: Number(taxAmount.toFixed(2)),
      taxInclusivePrice: Number((basePrice + taxAmount).toFixed(2))
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

  const activeTaxes = taxes.filter((tax) => tax.status === "active");

  return (
    <Form {...form}>
      <form className="space-y-6">
        <div className="rounded-lg border p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Customer Category Prices</h3>
            <div className="text-sm text-muted-foreground">
              Base Price (HB Naik): {formatCurrency(hbNaik)}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
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
                    <div className="flex items-center gap-2">
                      <FormLabel>{category.name} Price Settings</FormLabel>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Manual Edit</span>
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

                  {activeTaxes.length > 0 && (
                    <div className="mt-2 text-sm text-muted-foreground">
                      <Separator className="my-2" />
                      <p>Applied Taxes:</p>
                      {activeTaxes.map((tax) => (
                        <p key={tax.id}>
                          • {tax.name}: {tax.percentage}%
                        </p>
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
