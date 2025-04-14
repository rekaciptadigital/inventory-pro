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
import { roundPriceMarkup } from "@/lib/utils/price-rounding";
import { Badge } from "@/components/ui/badge";
import { PriceComparison } from "@/components/ui/price-comparison";
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
          form.setValue('defaultPriceCategoryId', defaultCategory.name.toLowerCase());
        } else {
          // Set fallback default if none is marked as default
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

  /**
   * Calculate prices for a customer category based on:
   * 1. Base price (HB Naik)
   * 2. Apply markup percentage 
   * 3. Calculate tax amount (fixed 11%)
   * 4. Apply rounding rules to final price
   */
  const calculatePrices = (category: PriceCategory, customPercentage?: number) => {
    const categoryKey = category.name.toLowerCase();
    const markup = customPercentage ?? percentages[categoryKey] ?? category.percentage;
    // Step 1 & 2: Apply markup percentage to base price (HB Naik)
    const basePrice = hbNaik * (1 + (markup / 100));
    // Step 3: Calculate tax
    const taxPercentage = 11;
    const taxAmount = basePrice * (taxPercentage / 100);
    // Raw final price with tax (before rounding)
    const rawTaxInclusivePrice = basePrice + taxAmount;
    // Step 4: Apply rounding rules for final price
    const roundedPrice = roundPriceMarkup(rawTaxInclusivePrice);

    return {
      basePrice: Math.round(basePrice),
      preTaxPrice: Math.round(basePrice),
      taxAmount: Math.round(taxAmount),
      rawTaxInclusivePrice: rawTaxInclusivePrice, // Store original unrounded price
      taxInclusivePrice: roundedPrice, // Store rounded price
      appliedTaxPercentage: taxPercentage,
      taxPercentage: taxPercentage,
      isCustomTaxInclusivePrice: false,
      markup: markup
    };
  };

  // Calculate marketplace prices from the default customer category price
  const calculateMarketplacePrices = (category: PriceCategory, customPercentage?: number) => {
    const defaultCategory = categories.find(c => c.set_default);

    if (!defaultCategory) {
      return { 
        basePrice: 0, 
        preTaxPrice: 0,
        taxAmount: 0, 
        taxInclusivePrice: 0,
        rawTaxInclusivePrice: 0, // Add raw price field
        appliedTaxPercentage: 11,
        taxPercentage: 11,
        isCustomTaxInclusivePrice: false,
        price: 0,
        rawPrice: 0, // Add raw price field
        isCustomPrice: false,
        customPercentage: customPercentage ?? 0
      };
    }
    
    const defaultCategoryKey = defaultCategory.name.toLowerCase();
    // Get the tax-inclusive price from default category (this already includes tax)
    const defaultPrices = form.watch(`customerPrices.${defaultCategoryKey}`) || calculatePrices(defaultCategory);
    
    // Apply marketplace markup to the default category's tax-inclusive price
    const markup = customPercentage ?? marketplacePercentages[category.name.toLowerCase()] ?? category.percentage;
    const rawMarketplacePrice = defaultPrices.taxInclusivePrice * (1 + (parseFloat(markup.toString()) / 100));
    
    // Apply rounding rules to the final marketplace price
    const finalPrice = roundPriceMarkup(rawMarketplacePrice);
    
    return {
      basePrice: finalPrice,
      preTaxPrice: finalPrice,
      taxAmount: 0, // Tax already included from default category
      taxInclusivePrice: finalPrice,
      rawTaxInclusivePrice: rawMarketplacePrice, // Store raw price before rounding
      appliedTaxPercentage: 0, // No additional tax
      taxPercentage: 0,
      isCustomTaxInclusivePrice: false,
      markup: markup,
      price: finalPrice,
      rawPrice: rawMarketplacePrice, // Store raw price before rounding
      isCustomPrice: !!customPercentage,
      customPercentage: markup
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

  // Get default category for reference
  const defaultCategory = categories.find(c => c.set_default);
  const defaultCategoryName = defaultCategory?.name ?? 'Retail';

  return (
    <Form {...form}>
      {/* Customer Category Prices section */}
      <div className="rounded-lg border p-4 space-y-4">
        <div className="flex items-center mb-2">
          <h3 className="text-lg font-medium">Customer Category Prices</h3>
          <Badge variant="outline" className="ml-2">From HB Naik</Badge>
        </div>
        
        {/* Headers */}
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
                } ${category.set_default ? 'border-primary/30' : ''}`}
              >
                {/* Category Name */}
                <div className="col-span-3">
                  <span className="font-medium">{category.name}</span>
                  {category.set_default && (
                    <Badge variant="default" className="ml-2 text-xs">Default</Badge>
                  )}
                </div>
                
                {/* Markup Percentage */}
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
                    {currentPercentage}% from {formatCurrency(hbNaik)}
                  </p>
                </div>
                
                {/* Pre-tax Price */}
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
                
                {/* FIX: Tax-inclusive Price with comparison display */}
                <div className="col-span-2">
                  <FormField
                    control={form.control}
                    name={`customerPrices.${categoryKey}.taxInclusivePrice`}
                    render={() => (
                      <FormControl>
                        {/* Replace Input with div + PriceComparison */}
                        <div className="flex items-center bg-muted rounded-md px-3 py-2 border">
                          <PriceComparison 
                            originalPrice={prices.rawTaxInclusivePrice} 
                            roundedPrice={prices.taxInclusivePrice}
                          />
                        </div>
                      </FormControl>
                    )}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Tax: {formatCurrency(prices.taxAmount)}
                  </p>
                </div>
                
                {/* Custom Toggle */}
                <div className="col-span-2 flex items-center justify-end gap-2">
                  <span className="text-xs text-muted-foreground">
                    {isCustom ? 'Custom' : 'Auto'}
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

      {/* Marketplace Prices section */}
      <div className="rounded-lg border p-4 space-y-4">
        <div className="flex items-center mb-2">
          <h3 className="text-lg font-medium">Marketplace Prices</h3>
          <Badge variant="outline" className="ml-2">From {defaultCategoryName}</Badge>
        </div>
        
        {/* Headers */}
        <div className="grid grid-cols-12 gap-4 px-4 py-2 font-medium text-sm">
          <div className="col-span-3">Marketplace</div>
          <div className="col-span-4">Markup Percentage (%)</div>
          <div className="col-span-3">Final Price</div>
          <div className="col-span-2">Custom Price</div>
        </div>
        
        {/* Marketplace rows */}
        <div className="space-y-2">
          {marketplaceCategories.map((category) => {
            const categoryKey = category.name.toLowerCase();
            const isCustom = manualModes[`mp_${categoryKey}`] || false;
            const defaultCategory = categories.find(c => c.set_default);
            
            // Get marketplace price data with both raw and rounded values
            const marketplacePriceData = form.watch(`marketplacePrices.${categoryKey}`) || {};
            const marketplacePrice = marketplacePriceData.taxInclusivePrice ?? 0;
            const rawMarketplacePrice = marketplacePriceData.rawTaxInclusivePrice ?? marketplacePrice; // Use rounded if raw not available
            
            const currentPercentage = marketplacePercentages[categoryKey] ?? category.percentage;

            // Get default category price for reference
            const defaultCategoryKey = defaultCategory?.name.toLowerCase() ?? 'retail';
            const defaultCategoryPrice = form.watch(`customerPrices.${defaultCategoryKey}.taxInclusivePrice`) || 0;

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
                
                {/* Markup Percentage */}
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
                      {currentPercentage}% from {formatCurrency(defaultCategoryPrice)}
                    </p>
                  </div>
                </div>
                
                {/* Final Price with comparison display */}
                <div className="col-span-3">
                  <div className="flex flex-col">
                    <FormField
                      control={form.control}
                      name={`marketplacePrices.${categoryKey}.taxInclusivePrice`}
                      render={() => (
                        <FormControl>
                          <div className="flex items-center bg-muted rounded-md px-3 py-2 border">
                            <PriceComparison
                              originalPrice={rawMarketplacePrice}
                              roundedPrice={marketplacePrice}
                            />
                          </div>
                        </FormControl>
                      )}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {defaultCategory?.name} + {currentPercentage}%
                    </p>
                  </div>
                </div>
                
                {/* Custom Toggle */}
                <div className="col-span-2 flex items-center justify-end gap-2 pt-2">
                  <span className="text-xs text-muted-foreground">
                    {isCustom ? 'Custom' : 'Auto'}
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
        
        {/* Price flow explanation */}
        <div className="bg-muted/20 p-3 rounded border border-dashed mt-2">
          <p className="text-sm text-muted-foreground">
            <span className="font-medium">Price flow:</span> Marketplace prices are calculated based on the default customer 
            category price ({defaultCategoryName}) with an additional markup percentage applied.
          </p>
        </div>
      </div>
    </Form>
  );
}
