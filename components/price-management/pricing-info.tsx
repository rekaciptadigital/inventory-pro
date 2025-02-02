"use client";

import { useEffect } from "react";
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
import { formatCurrency } from "@/lib/utils/format";
import { usePriceCalculations } from '@/lib/hooks/use-price-calculations';

interface PricingInfoProps {
  readonly form: UseFormReturn<PriceFormFields>;
  readonly product?: any;
}

export function PricingInfo({ form, product }: Readonly<PricingInfoProps>) {

  const { updateHBNaik, updateHBReal } = usePriceCalculations(form);

  // Calculate HB Real when USD Price or Exchange Rate changes
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "usdPrice" || name === "exchangeRate") {
        updateHBReal();
      }
    });
    return () => subscription.unsubscribe();
  }, [form, updateHBReal]);

  // Calculate HB Naik when HB Real or Adjustment Percentage changes
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "hbReal" || name === "adjustmentPercentage") {
        updateHBNaik();
      }
    });
    return () => subscription.unsubscribe();
  }, [form, updateHBNaik]);

  return (
    <Form {...form}>
      <div className="rounded-lg border p-4">
        <h3 className="text-lg font-medium mb-4">Pricing Information</h3>

        <div className="flex flex-col space-y-4">
          {/* First row: USD Price, Exchange Rate (KURS) and Adjustment Percentage */}
          <div className="flex gap-4">
            <div className="flex-1">
              <FormField
                control={form.control}
                name="usdPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>USD Price</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="Enter USD price"
                        value={field.value || 0}
                        onChange={(e) =>
                          field.onChange(parseFloat(e.target.value) || 0)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex-1">
              <FormField
                control={form.control}
                name="exchangeRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Exchange Rate (KURS)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        placeholder="Enter exchange rate"
                        value={field.value || 0}
                        onChange={(e) =>
                          field.onChange(parseFloat(e.target.value) || 0)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex-1">
              <FormField
                control={form.control}
                name="adjustmentPercentage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Adjustment Percentage (%)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        placeholder="Enter adjustment percentage"
                        value={field.value || 0}
                        onChange={(e) =>
                          field.onChange(parseFloat(e.target.value) || 0)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Second row: HB Real (Base Price) and HB Naik (Adjusted Price) */}
          <div className="flex gap-4">
            <div className="flex-1 bg-muted/50 p-4 rounded-lg">
              <div className="flex items-center gap-2">
                <FormLabel>HB Real (Base Price)</FormLabel>
                <div className="text-lg font-medium">
                  {formatCurrency(form.watch("hbReal"))}
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Automatically calculated: USD Price × Exchange Rate
              </p>
            </div>
            <div className="flex-1 bg-muted/50 p-4 rounded-lg">
              <div className="flex items-center gap-2">
                <FormLabel>HB Naik (Adjusted Price)</FormLabel>
                <div className="text-lg font-medium">
                  {formatCurrency(form.watch("hbNaik"))}
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Automatically calculated: HB Real × (1 + Adjustment/100)
              </p>
            </div>
          </div>
        </div>
      </div>
    </Form>
  );
}