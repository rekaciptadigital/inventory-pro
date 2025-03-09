"use client";

import { useState, useEffect } from "react";
import { UseFormReturn } from "react-hook-form";
import { PriceFormFields } from '@/types/form';
import {
  Form,
  FormControl,
  FormField,
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
        
        // Find default category and store it in form state
        const defaultCategory = customerCategories.find(c => c.set_default);
        if (defaultCategory) {
          console.log(`Setting default price category: ${defaultCategory.name.toLowerCase()}`);
          form.setValue('defaultPriceCategoryId', defaultCategory.name.toLowerCase());
        } else {
          // Set fallback default if none is marked as default
          console.log('No default category found, using fallback: retail');
          form.setValue('defaultPriceCategoryId', 'retail');
        }
        
        setCategories(customerCategories);
        setMarketplaceCategories(mpCategories);
      } catch (error) {
        console.error("Error fetching price categories:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, [form]); // Add form to dependencies

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
        {/* Redesigned Customer Category Prices section with grid layout */}
        <div className="rounded-lg border p-4 space-y-4">
          <h3 className="text-lg font-medium">Customer Category Prices</h3>
          
          {/* Headers - Adjusted columns to include Pre-tax Price */}
          <div className="grid grid-cols-12 gap-4 px-4 py-2 font-medium text-sm">
            <div className="col-span-3">Customer Category</div>
            <div className="col-span-3">Markup Percentage (%)</div>
            <div className="col-span-2">Pre-tax Price</div>
            <div className="col-span-2">Tax-inclusive Price</div>
            <div className="col-span-2">Custom Price</div>
          </div>
          
          {/* Customer category rows */}
          <div className="space-y-2">
            {categories.map((category) => {
              const categoryKey = category.name.toLowerCase();
              const isCustom = manualModes[categoryKey] || false;
              const prices = calculatePrices(category);
              const currentPercentage = percentages[categoryKey] ?? category.percentage;

              return (
                <div 
                  key={category.id} 
                  className={`grid grid-cols-12 gap-4 items-center px-4 py-3 rounded-md border ${
                    isCustom ? 'bg-muted/50' : ''
                  }`}
                >
                  {/* Category Name */}
                  <div className="col-span-3">
                    <span className="font-medium">{category.name}</span>
                    {category.set_default && (
                      <span className="ml-2 text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded">Default</span>
                    )}
                  </div>
                  
                  {/* Markup Percentage - Reduced to col-span-3 */}
                  <div className="col-span-3">
                    <FormField
                      control={form.control}
                      name={`percentages.${categoryKey}`}
                      render={() => (
                        <FormControl>
                          <Input
                            type="number"
                            value={currentPercentage}
                            onChange={(e) => handlePercentageChange(category, e.target.value)}
                            disabled={!isCustom}
                            className={!isCustom ? "bg-muted" : ""}
                          />
                        </FormControl>
                      )}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      From HB Naik ({formatCurrency(hbNaik)})
                    </p>
                  </div>
                  
                  {/* Pre-tax Price - New column with description */}
                  <div className="col-span-2">
                    <FormField
                      control={form.control}
                      name={`customerPrices.${categoryKey}.basePrice`}
                      render={() => (
                        <FormControl>
                          <Input
                            type="text"
                            value={formatCurrency(prices.basePrice)}
                            className="bg-muted font-medium"
                            disabled
                          />
                        </FormControl>
                      )}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Before {prices.appliedTaxPercentage}% tax
                    </p>
                  </div>
                  
                  {/* Tax-inclusive Price - Reduced to col-span-2 with tax amount description */}
                  <div className="col-span-2">
                    <FormField
                      control={form.control}
                      name={`customerPrices.${categoryKey}.taxInclusivePrice`}
                      render={() => (
                        <FormControl>
                          <Input
                            type="text"
                            value={formatCurrency(prices.taxInclusivePrice)}
                            className="bg-muted font-medium"
                            disabled
                          />
                        </FormControl>
                      )}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Tax: {formatCurrency(prices.taxAmount)}
                    </p>
                  </div>
                  
                  {/* Custom Toggle - Unchanged */}
                  <div className="col-span-2 flex items-center justify-end gap-2">
                    <span className="text-xs text-muted-foreground">
                      {isCustom ? 'Custom' : 'Manual'}
                    </span>
                    <Switch
                      checked={isCustom}
                      onCheckedChange={(checked) => {
                        setManualModes(prev => ({
                          ...prev,
                          [categoryKey]: checked
                        }));
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Marketplace Prices section with aligned fields */}
        <div className="rounded-lg border p-4 space-y-4">
          <h3 className="text-lg font-medium">Marketplace Prices</h3>
          
          {/* Headers with Custom column moved to the right */}
          <div className="grid grid-cols-12 gap-4 px-4 py-2 font-medium text-sm">
            <div className="col-span-3">Marketplace</div>
            <div className="col-span-4">Markup Percentage (%)</div>
            <div className="col-span-3">Price</div>
            <div className="col-span-2">Custom Price</div>
          </div>
          
          {/* Marketplace rows */}
          <div className="space-y-2">
            {marketplaceCategories.map((category) => {
              const categoryKey = category.name.toLowerCase();
              const isCustom = manualModes[`mp_${categoryKey}`] || false;
              const defaultCategory = categories.find(c => c.set_default);
              const marketplacePrice = form.watch(`marketplacePrices.${categoryKey}.taxInclusivePrice`) || 0;
              const currentPercentage = marketplacePercentages[categoryKey] ?? category.percentage;

              return (
                <div 
                  key={category.id} 
                  className={`grid grid-cols-12 gap-4 items-start px-4 py-3 rounded-md border ${
                    isCustom ? 'bg-muted/50' : ''
                  }`}
                >
                  {/* Marketplace Name */}
                  <div className="col-span-3 pt-2">
                    <span className="font-medium">{category.name}</span>
                  </div>
                  
                  {/* Markup Percentage - Restructured for alignment */}
                  <div className="col-span-4">
                    <div className="flex flex-col">
                      <FormField
                        control={form.control}
                        name={`marketplacePercentages.${categoryKey}`}
                        render={() => (
                          <FormControl>
                            <Input
                              type="number"
                              value={currentPercentage}
                              onChange={(e) => handleMarketplacePercentageChange(category, e.target.value)}
                              disabled={!isCustom}
                              className={!isCustom ? "bg-muted" : ""}
                            />
                          </FormControl>
                        )}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        &nbsp;{/* Placeholder to maintain alignment */}
                      </p>
                    </div>
                  </div>
                  
                  {/* Price */}
                  <div className="col-span-3">
                    <div className="flex flex-col">
                      <FormField
                        control={form.control}
                        name={`marketplacePrices.${categoryKey}.taxInclusivePrice`}
                        render={() => (
                          <FormControl>
                            <Input
                              type="text"
                              value={formatCurrency(marketplacePrice)}
                              className="bg-muted font-medium"
                              disabled
                            />
                          </FormControl>
                        )}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        {currentPercentage}% markup from {defaultCategory?.name}
                      </p>
                    </div>
                  </div>
                  
                  {/* Custom Toggle */}
                  <div className="col-span-2 flex items-center justify-end gap-2 pt-2">
                    <span className="text-xs text-muted-foreground">
                      {isCustom ? 'Custom' : 'Manual'}
                    </span>
                    <Switch
                      checked={isCustom}
                      onCheckedChange={(checked) => {
                        setManualModes(prev => ({
                          ...prev,
                          [`mp_${categoryKey}`]: checked
                        }));
                      }}
                    />
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
