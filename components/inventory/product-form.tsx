"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";

const formSchema = z.object({
  brand: z.string().min(1, "Brand is required"),
  sku: z.string().min(1, "SKU is required"),
  productName: z.string().min(1, "Product name is required"),
  unit: z.enum(["PC", "PACK", "SET"]),
  hbReal: z.number().min(0, "HB Real must be greater than 0"),
  adjustmentPercentage: z
    .number()
    .min(0, "Adjustment percentage must be greater than or equal to 0"),
  hbNaik: z.number(),
  usdPrice: z.number().min(0, "USD Price must be greater than 0"),
  exchangeRate: z.number().min(0, "Exchange rate must be greater than 0"),
  quantities: z.object({
    min15: z.number(),
    min10: z.number(),
    min5: z.number(),
    single: z.number(),
    retail: z.number(),
  }),
  customerPrices: z.object({
    platinum: z.number(),
    gold: z.number(),
    silver: z.number(),
    bronze: z.number(),
  }),
});

type FormValues = z.infer<typeof formSchema>;

export function ProductForm() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      brand: "",
      sku: "",
      productName: "",
      unit: "PC",
      hbReal: 0,
      adjustmentPercentage: 0,
      hbNaik: 0,
      usdPrice: 0,
      exchangeRate: 0,
      quantities: {
        min15: 0,
        min10: 0,
        min5: 0,
        single: 0,
        retail: 0,
      },
      customerPrices: {
        platinum: 0,
        gold: 0,
        silver: 0,
        bronze: 0,
      },
    },
  });

  const handleNumericChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: {
      onChange: (value: number) => void;
      onBlur: () => void;
    }
  ) => {
    const value = e.target.value;
    const numberValue = value === "" ? 0 : parseFloat(value);
    field.onChange(numberValue);
  };

  // Calculate HB Naik and other prices when base values change
  useEffect(() => {
    const hbReal = form.watch("hbReal");
    const adjustmentPercentage = form.watch("adjustmentPercentage");

    if (hbReal > 0) {
      // Calculate HB Naik
      const hbNaik = Math.round(hbReal * (1 + adjustmentPercentage / 100));
      form.setValue("hbNaik", hbNaik);

      // Calculate quantity-based prices
      const quantities = {
        min15: Math.round(hbNaik * 1.45), // 45% markup
        min10: Math.round(hbNaik * 1.49), // 49% markup
        min5: Math.round(hbNaik * 1.57), // 57% markup
        single: Math.round(hbNaik * 1.65), // 65% markup
        retail: Math.round(hbNaik * 1.81), // 81% markup
      };
      form.setValue("quantities", quantities);

      // Calculate customer category prices
      const platinum = Math.round(hbNaik * 1.45); // 45% markup from HB Naik
      const gold = Math.round(platinum * 1.03); // 3% markup from Platinum
      const silver = Math.round(gold * 1.05); // 5% markup from Gold
      const bronze = Math.round(silver * 1.05); // 5% markup from Silver

      form.setValue("customerPrices", {
        platinum,
        gold,
        silver,
        bronze,
      });
    }
  }, [form.watch("hbReal"), form.watch("adjustmentPercentage")]);

  const onSubmit = async (values: FormValues) => {
    try {
      setIsSubmitting(true);
      toast({
        title: "Success",
        description: "Product has been added successfully",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add product. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Basic Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Basic Information</h3>
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="brand"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Brand</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter brand name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="sku"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>SKU</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter SKU" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="productName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Product Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter product name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="unit"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Unit</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="PC">Piece (PC)</SelectItem>
                    <SelectItem value="PACK">Pack</SelectItem>
                    <SelectItem value="SET">Set</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Pricing Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Pricing Information</h3>
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="hbReal"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>HB Real (Base Price)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Enter base price"
                      value={field.value || ""}
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
              name="adjustmentPercentage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Adjustment Percentage (%)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Enter adjustment percentage"
                      value={field.value || ""}
                      onChange={(e) => handleNumericChange(e, field)}
                      onBlur={field.onBlur}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="bg-muted/50 p-4 rounded-lg">
            <FormLabel>HB Naik (Adjusted Base Price)</FormLabel>
            <div className="text-2xl font-bold mt-1">
              Rp {form.watch("hbNaik").toLocaleString()}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Automatically calculated: HB Real × (1 + ADJ/100)
            </p>
          </div>

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
                      placeholder="Enter USD price"
                      value={field.value || ""}
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
                      value={field.value || ""}
                      onChange={(e) => handleNumericChange(e, field)}
                      onBlur={field.onBlur}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Quantity-based Prices */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Quantity-based Prices</h3>
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="quantities.min15"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Min 15 pcs Price</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      value={field.value.toLocaleString()}
                      className="bg-muted"
                      disabled
                    />
                  </FormControl>
                  <p className="text-sm text-muted-foreground">
                    45% markup from HB Naik
                  </p>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="quantities.min10"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Min 10 pcs Price</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      value={field.value.toLocaleString()}
                      className="bg-muted"
                      disabled
                    />
                  </FormControl>
                  <p className="text-sm text-muted-foreground">
                    49% markup from HB Naik
                  </p>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="quantities.min5"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Min 5 pcs Price</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      value={field.value.toLocaleString()}
                      className="bg-muted"
                      disabled
                    />
                  </FormControl>
                  <p className="text-sm text-muted-foreground">
                    57% markup from HB Naik
                  </p>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="quantities.single"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Single pc Price</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      value={field.value.toLocaleString()}
                      className="bg-muted"
                      disabled
                    />
                  </FormControl>
                  <p className="text-sm text-muted-foreground">
                    65% markup from HB Naik
                  </p>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="quantities.retail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Retail Price</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      value={field.value.toLocaleString()}
                      className="bg-muted"
                      disabled
                    />
                  </FormControl>
                  <p className="text-sm text-muted-foreground">
                    81% markup from HB Naik
                  </p>
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Customer Category Prices */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Customer Category Prices</h3>
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="customerPrices.platinum"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Platinum Price</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      value={field.value.toLocaleString()}
                      className="bg-muted"
                      disabled
                    />
                  </FormControl>
                  <p className="text-sm text-muted-foreground">
                    45% markup from HB Naik
                  </p>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="customerPrices.gold"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gold Price</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      value={field.value.toLocaleString()}
                      className="bg-muted"
                      disabled
                    />
                  </FormControl>
                  <p className="text-sm text-muted-foreground">
                    3% markup from Platinum
                  </p>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="customerPrices.silver"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Silver Price</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      value={field.value.toLocaleString()}
                      className="bg-muted"
                      disabled
                    />
                  </FormControl>
                  <p className="text-sm text-muted-foreground">
                    5% markup from Gold
                  </p>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="customerPrices.bronze"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bronze Price</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      value={field.value.toLocaleString()}
                      className="bg-muted"
                      disabled
                    />
                  </FormControl>
                  <p className="text-sm text-muted-foreground">
                    5% markup from Silver
                  </p>
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline">
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Adding Product..." : "Add Product"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
