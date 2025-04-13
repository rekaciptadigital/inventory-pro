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
import { Badge } from '@/components/ui/badge';

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

  // Get current values for calculation display
  const usdPrice = form.watch("usdPrice") || 0;
  const exchangeRate = form.watch("exchangeRate") || 0;
  const hbReal = form.watch("hbReal") || 0;
  const adjustmentPercentage = form.watch("adjustmentPercentage") || 0;
  const adjustmentValue = (hbReal * adjustmentPercentage) / 100;
  const hbNaik = form.watch("hbNaik") || 0;

  return (
    <Form {...form}>
      <div className="rounded-lg border p-4">
        <div className="flex items-center gap-2 mb-4">
          <h3 className="text-lg font-medium">Pricing Information</h3>
          <Badge variant="outline" className="ml-2">Base Prices</Badge>
        </div>

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
            <div className="flex-1">
              <FormItem>
                <FormLabel>Adjustment Value</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    disabled
                    value={formatCurrency(adjustmentValue)}
                    className="bg-muted/30"
                  />
                </FormControl>
                <p className="text-xs text-muted-foreground mt-1">
                  HB Real × {adjustmentPercentage}% = {formatCurrency(adjustmentValue)}
                </p>
              </FormItem>
            </div>
          </div>

          {/* Second row: HB Real (Base Price) and HB Naik (Adjusted Price) */}
          <div className="flex gap-4">
            <div className="flex-1 bg-muted/50 p-4 rounded-lg">
              <div className="flex flex-col">
                <FormLabel className="mb-1">HB Real (Base Price)</FormLabel>
                <div className="text-lg font-medium">
                  {formatCurrency(hbReal)}
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Calculated: {usdPrice} USD × {formatCurrency(exchangeRate)} = {formatCurrency(hbReal)}
                </p>
                <div className="text-xs text-muted-foreground mt-1">
                  This is the base price in local currency before adjustments
                </div>
              </div>
            </div>
            <div className="flex-1 bg-muted/50 p-4 rounded-lg">
              <div className="flex flex-col">
                <FormLabel className="mb-1">HB Naik (Adjusted Price)</FormLabel>
                <div className="text-lg font-medium">
                  {formatCurrency(hbNaik)}
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Calculated: {formatCurrency(hbReal)} + {formatCurrency(adjustmentValue)} = {formatCurrency(hbNaik)}
                </p>
                <div className="text-xs text-muted-foreground mt-1">
                  This price is the basis for all customer category price calculations
                </div>
              </div>
            </div>
          </div>
          
          {/* Add a visual price flow diagram */}
          <div className="bg-muted/20 p-3 rounded border border-dashed">
            <div className="text-sm font-medium mb-2">Price Flow:</div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div>USD Price</div>
              <div>→</div>
              <div>HB Real<br/>(USD × Exchange)</div>
              <div>→</div>
              <div>HB Naik<br/>(+ Adjustment %)</div>
              <div>→</div>
              <div>Customer Prices<br/>(+ Markup + Tax)</div>
              <div>→</div>
              <div>Marketplace Prices<br/>(+ MP Markup)</div>
            </div>
          </div>
        </div>
      </div>
    </Form>
  );
}