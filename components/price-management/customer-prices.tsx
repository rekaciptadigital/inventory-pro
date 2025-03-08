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
import { getPriceCategories } from "@/lib/api/price-categories";
import { formatCurrency } from "@/lib/utils/format";
import type { PriceCategory } from "@/lib/api/price-categories";

interface CustomerPricesProps {
  readonly form: UseFormReturn<PriceFormFields>;
}

export function CustomerPrices({ form }: Readonly<CustomerPricesProps>) {
  const [categories, setCategories] = useState<PriceCategory[]>([]);
  const [marketplaceCategories, setMarketplaceCategories] = useState<PriceCategory[]>([]);
  const [manualModes, setManualModes] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(true);
  
  const formValues = form.watch();
  const hbNaik = formValues.hbNaik || 0;
  const percentages = formValues.percentages || {};
  const marketplacePercentages = formValues.marketplacePercentages || {};

  // Fetch price categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await getPriceCategories();
        // Filter customer and marketplace categories
        const customerCategories = response.data
          .find(group => group.type.toLowerCase() === 'customer')
          ?.categories || [];
        const mpCategories = response.data
          .find(group => group.type.toLowerCase() === 'marketplace')
          ?.categories || [];
        
        setCategories(customerCategories);
        setMarketplaceCategories(mpCategories);
      } catch (error) {
        console.error("Error fetching price categories:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const calculatePrices = (category: PriceCategory, customPercentage?: number) => {
    const categoryKey = category.name.toLowerCase();
    const markup = customPercentage ?? percentages[categoryKey] ?? category.percentage;
    const basePrice = hbNaik * (1 + (markup / 100));
    const taxPercentage = 11;
    const taxAmount = basePrice * (taxPercentage / 100);

    return {
      basePrice: Number(basePrice.toFixed(2)),
      taxAmount: Number(taxAmount.toFixed(2)),
      taxInclusivePrice: Number((basePrice + taxAmount).toFixed(2)),
      appliedTaxPercentage: taxPercentage
    };
  };

  // Calculate marketplace prices with custom percentage
  const calculateMarketplacePrices = (category: PriceCategory, customPercentage?: number) => {
    const defaultCategory = categories.find(c => c.set_default);
    if (!defaultCategory) return { basePrice: 0, taxAmount: 0, taxInclusivePrice: 0, appliedTaxPercentage: 11 };
    
    const defaultCategoryKey = defaultCategory.name.toLowerCase();
    const defaultPrices = form.watch(`customerPrices.${defaultCategoryKey}`) || calculatePrices(defaultCategory);
    
    const markup = customPercentage ?? marketplacePercentages[category.name.toLowerCase()] ?? category.percentage;
    const marketplaceBasePrice = defaultPrices.taxInclusivePrice * (1 + (parseFloat(markup.toString()) / 100));
    
    return {
      basePrice: Number(marketplaceBasePrice.toFixed(2)),
      taxAmount: 0, // Already included in the base price from default category
      taxInclusivePrice: Number(marketplaceBasePrice.toFixed(2)),
      appliedTaxPercentage: 0 // Tax already applied
    };
  };

  // Update prices whenever hbNaik or percentages change
  useEffect(() => {
    // Update customer prices
    categories.forEach(category => {
      const categoryKey = category.name.toLowerCase();
      const prices = calculatePrices(category);
      form.setValue(`customerPrices.${categoryKey}`, prices);
    });

    // Update marketplace prices
    marketplaceCategories.forEach(category => {
      const categoryKey = category.name.toLowerCase();
      const prices = calculateMarketplacePrices(category);
      form.setValue(`marketplacePrices.${categoryKey}`, prices);
    });
  }, [hbNaik, percentages, marketplacePercentages, categories, marketplaceCategories, form]);

  const handlePercentageChange = (category: PriceCategory, value: string) => {
    const categoryKey = category.name.toLowerCase();
    const numValue = parseFloat(value);
    
    if (!isNaN(numValue)) {
      form.setValue(`percentages.${categoryKey}`, numValue);
      const prices = calculatePrices(category, numValue);
      form.setValue(`customerPrices.${categoryKey}`, prices);
    }
  };

  const handleMarketplacePercentageChange = (category: PriceCategory, value: string) => {
    const categoryKey = category.name.toLowerCase();
    const numValue = parseFloat(value);
    
    if (!isNaN(numValue)) {
      form.setValue(`marketplacePercentages.${categoryKey}`, numValue);
      const prices = calculateMarketplacePrices(category, numValue);
      form.setValue(`marketplacePrices.${categoryKey}`, prices);
    }
  };

  if (isLoading) {
    return <div>Loading categories...</div>;
  }

  return (
    <Form {...form}>
      <form className="space-y-6">
        {/* Existing Customer Category Prices section */}
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

        {/* Updated Marketplace Prices section */}
        <div className="rounded-lg border p-4 space-y-4">
          <h3 className="text-lg font-medium">Marketplace Prices</h3>
          <div className="flex flex-col gap-4">
            {marketplaceCategories.map((category) => {
              const categoryKey = category.name.toLowerCase();
              const isManual = manualModes[`mp_${categoryKey}`] || false;
              const defaultCategory = categories.find(c => c.set_default);
              const defaultPrice = defaultCategory ? 
                form.watch(`customerPrices.${defaultCategory.name.toLowerCase()}.taxInclusivePrice`) : 0;
              const marketplacePrice = form.watch(`marketplacePrices.${categoryKey}.taxInclusivePrice`) || 0;
              const currentPercentage = marketplacePercentages[categoryKey] ?? category.percentage;

              return (
                <div
                  key={category.id}
                  className="space-y-4 p-4 rounded-lg border"
                >
                  <div className="flex items-center justify-between">
                    <FormLabel>{category.name} Price Settings</FormLabel>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Custom Markup</span>
                      <Switch
                        checked={isManual}
                        onCheckedChange={(checked) => {
                          setManualModes(prev => ({
                            ...prev,
                            [`mp_${categoryKey}`]: checked
                          }));
                        }}
                      />
                    </div>
                  </div>

                  <div className="flex gap-4">
                    {/* Markup Percentage Input */}
                    <div className="flex-1">
                      <FormField
                        control={form.control}
                        name={`marketplacePercentages.${categoryKey}`}
                        render={() => (
                          <FormItem>
                            <FormLabel>Markup Percentage (%)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                value={currentPercentage}
                                onChange={(e) => handleMarketplacePercentageChange(category, e.target.value)}
                                disabled={!isManual}
                                className={!isManual ? "bg-muted" : ""}
                              />
                            </FormControl>
                            <p className="text-sm text-muted-foreground">
                              {isManual ? "Custom markup percentage" : "Default marketplace markup"}
                            </p>
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Price */}
                    <div className="flex-1">
                      <FormField
                        control={form.control}
                        name={`marketplacePrices.${categoryKey}.taxInclusivePrice`}
                        render={() => (
                          <FormItem>
                            <FormLabel>Price</FormLabel>
                            <FormControl>
                              <Input
                                type="text"
                                value={formatCurrency(marketplacePrice)}
                                className="bg-muted"
                                disabled
                              />
                            </FormControl>
                            <p className="text-sm text-muted-foreground">
                              {currentPercentage}% markup from default price ({formatCurrency(defaultPrice)})
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
