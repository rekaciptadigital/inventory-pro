"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { Button } from "@/components/ui/button";
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
import type { Product } from "@/types/inventory";

interface CustomerPricesProps {
  product: Product;
  defaultCategory?: string;
  onSetDefault?: (categoryId: string) => void;
}

export function CustomerPrices({
  product,
  defaultCategory,
  onSetDefault,
}: CustomerPricesProps) {
  const { categories } = usePriceCategories();
  const { taxes } = useTaxes();
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [manualModes, setManualModes] = useState<Record<string, boolean>>({});
  const form = useForm({
    defaultValues: {
      customerPrices: {},
      percentages: {},
    },
  });

  const activeTaxes = taxes.filter((tax) => tax.status === "active");
  const totalTaxPercentage = activeTaxes.reduce(
    (sum, tax) => sum + tax.percentage,
    0
  );

  const hbNaik = product?.hbNaik || 0;

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
              const price = {
                basePrice: 10,
                taxAmount: 20,
                taxInclusivePrice: 20,
              };
              const isManual = manualModes[categoryKey] || false;

              return (
                <div
                  key={category.id}
                  className="space-y-4 p-4 rounded-lg border"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FormLabel>{category.name} Price Settings</FormLabel>
                      {defaultCategory === category.id && (
                        <span className="text-xs text-muted-foreground">
                          (Default)
                        </span>
                      )}
                    </div>
                    {onSetDefault && defaultCategory !== category.id && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className={cn(
                          "opacity-0 transition-opacity",
                          hoveredCategory === category.id && "opacity-100"
                        )}
                        onClick={() => onSetDefault(category.id)}
                      >
                        Set Default
                      </Button>
                    )}
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
                              type="number"
                              value={price.basePrice}
                              className={!isManual ? "bg-muted" : ""}
                              disabled={!isManual}
                              onChange={(e) => {
                                if (isManual) {
                                  const value = parseFloat(e.target.value) || 0;
                                  form.setValue(`customerPrices.${categoryKey}.basePrice`, value);
                                }
                              }}
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
                            Including {totalTaxPercentage}% tax (
                            {formatCurrency(price.taxAmount)})
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
