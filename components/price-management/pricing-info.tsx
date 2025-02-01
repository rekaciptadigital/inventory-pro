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
import { useToast } from "@/components/ui/use-toast";
import { useProductPrices } from "@/lib/hooks/use-product-prices";
import { formatCurrency } from "@/lib/utils/format";
import { usePriceCalculations } from '@/lib/hooks/use-price-calculations';

interface PricingInfoProps {
  readonly form: UseFormReturn<PriceFormFields>;
  readonly product?: any; // Add product prop
}

export function PricingInfo({ form, product }: Readonly<PricingInfoProps>) {
  const { toast } = useToast();
  const { updateProductPrices } = useProductPrices();

  const { updateHBNaik, updateHBReal } = usePriceCalculations(form);

  // Calculate HB Real when USD Price or Exchange Rate changes
  useEffect(() => {
    const unsubscribe = form.watch((value, { name }) => {
      if (name === "usdPrice" || name === "exchangeRate") {
        updateHBReal();
      }
    });
    return () => unsubscribe.unsubscribe();
  }, [form, updateHBReal]);

  // Calculate HB Naik when HB Real or Adjustment Percentage changes
  useEffect(() => {
    const unsubscribe = form.watch((value, { name }) => {
      if (name === "hbReal" || name === "adjustmentPercentage") {
        updateHBNaik();
      }
    });
    return () => unsubscribe.unsubscribe();
  }, [form, updateHBNaik]);

  const onSubmit = async (values: any) => {
    try {
      await updateProductPrices(product.id, values);
      toast({
        title: "Success",
        description: "Product prices have been updated successfully",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update product prices",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="rounded-lg border p-4">
          <h3 className="text-lg font-medium mb-4">Pricing Information</h3>

          <div className="grid gap-6">
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
                        min="0"
                        step="0.01"
                        placeholder="Enter USD price"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseFloat(e.target.value) || 0)
                        }
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
                        min="0"
                        placeholder="Enter exchange rate"
                        {...field}
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

            <div className="bg-muted/50 p-4 rounded-lg">
              <FormLabel>HB Real (Base Price)</FormLabel>
              <div className="text-2xl font-bold mt-1">
                {formatCurrency(form.watch("hbReal"))}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Automatically calculated: USD Price × Exchange Rate
              </p>
            </div>

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
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseFloat(e.target.value) || 0)
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="bg-muted/50 p-4 rounded-lg">
              <FormLabel>HB Naik (Adjusted Price)</FormLabel>
              <div className="text-2xl font-bold mt-1">
                {formatCurrency(form.watch("hbNaik"))}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Automatically calculated: HB Real × (1 + Adjustment/100)
              </p>
            </div>
          </div>
        </div>
      </form>
    </Form>
  );
}
