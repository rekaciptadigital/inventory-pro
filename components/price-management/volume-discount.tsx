'use client';

import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Plus, Trash2, AlertTriangle, TrendingUp, TrendingDown, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import { formatCurrency } from '@/lib/utils/format'; // Add missing import for formatCurrency
import { roundPriceMarkup } from '@/lib/utils/price-rounding';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'; // Add imports for tooltip components
import type { PriceFormFields } from '@/types/form';
import type { InventoryProduct, InventoryProductVariant } from '@/types/inventory';

interface VolumeDiscountProps {
  readonly form: UseFormReturn<PriceFormFields>;
  readonly product: InventoryProduct;
  // Add props for initial price data
  readonly initialCustomerPrices?: Record<string, any> | null;
  readonly initialMarketplacePrices?: Record<string, any> | null;
  // Add flag to indicate prices are initialized
  readonly pricesInitialized?: boolean;
}

interface DiscountTier {
  id: string;
  quantity: number;
  discount: number;
  prices: Record<string, number>;
  rawPrices?: Record<string, { original: number; rounded: number }>;
}

interface VariantDiscount {
  enabled: boolean;
  tiers: DiscountTier[];
}

// Add new interface for price profitability info
interface PriceProfitabilityInfo {
  isProfit: boolean;
  difference: number;
  differencePercent: number;
}

// Utility functions for validation and calculations
const utils = {
  // Calculate discounted prices based on base prices and discount percentage
  calculateDiscountedPrices: (
    basePrices: Record<string, any>,
    discountPercentage: number
  ): Record<string, { original: number; rounded: number }> => {
    
    const result: Record<string, { original: number; rounded: number }> = {};
    
    // Make sure we process all price categories
    if (basePrices) {
      Object.entries(basePrices).forEach(([category, priceData]) => {
        try {
          // Check if priceData has taxInclusivePrice, otherwise use the direct value
          let originalPrice = 0;
          
          if (typeof priceData === 'object' && priceData !== null) {
            // For customer prices with tax structure
            if (priceData.taxInclusivePrice !== undefined) {
              originalPrice = priceData.taxInclusivePrice;
            } 
            // For marketplace prices with direct value
            else if (priceData.price !== undefined) {
              originalPrice = priceData.price;
            }
            // For any other structure, try to find a numeric value
            else {
              const firstNumericValue = Object.entries(priceData).find(
                ([key, val]) => typeof val === 'number'
              );
              
              if (firstNumericValue) {
                originalPrice = firstNumericValue[1] as number;
              }
            }
          } else {
            // Direct numeric value
            originalPrice = typeof priceData === 'number' ? priceData : 0;
          }
          
          if (originalPrice) {
            // Calculate discounted price and apply rounding rules
            const rawDiscountedPrice = originalPrice * (1 - discountPercentage / 100);
            result[category] = {
              original: rawDiscountedPrice,
              rounded: roundPriceMarkup(rawDiscountedPrice)
            };
          } else {
             result[category] = { original: 0, rounded: 0 }; // Set to 0 if no valid price found
          }
        } catch (e) {
          console.error(`[VolumeDiscount] Error calculating discount for ${category}:`, e);
          result[category] = { original: 0, rounded: 0 }; // Set to 0 on error
        }
      });
    } 
    
    return result;
  },
  
  // Validation for tiers
  validateTier: (
    tiers: DiscountTier[],
    index: number,
    field: keyof DiscountTier,
    value: number
  ): string | null => {
    if (field === 'quantity') {
      // Don't allow negative or zero quantities
      if (value <= 0) {
        return 'Quantity must be greater than zero';
      }
      
      // Check for duplicate quantities
      if (tiers.some((tier, i) => i !== index && tier.quantity === value)) {
        return 'Duplicate quantity tier';
      }
      
      // Check for ascending order with previous tier
      if (index > 0 && value <= tiers[index - 1].quantity) {
        return `Quantity must be greater than ${tiers[index - 1].quantity}`;
      }
      
      // Check for descending order with next tier
      if (index < tiers.length - 1 && value >= tiers[index + 1].quantity) {
        return `Quantity must be less than ${tiers[index + 1].quantity}`;
      }
    } 
    
    if (field === 'discount') {
      if (value < 0 || value > 100) {
        return 'Discount must be between 0 and 100%';
      }
    }
    
    return null;
  },
  
  // Get default quantity for a new tier
  getDefaultQuantity: (tiers: DiscountTier[]): number => {
    if (tiers.length === 0) return 1;
    const highestQuantity = Math.max(...tiers.map(t => t.quantity));
    return highestQuantity + 10;
  },
  
  // Create a new tier with calculated prices
  createNewTier: (
    customerPrices: Record<string, any>,
    quantity: number,
    discount: number = 0
  ): DiscountTier => {
    const prices = utils.calculateDiscountedPrices(customerPrices, discount);
    // Create a flattened version with just rounded prices for backwards compatibility
    const flatPrices: Record<string, number> = {};
    
    Object.entries(prices).forEach(([category, priceData]) => {
      flatPrices[category] = priceData.rounded;
    });
    
    return {
      id: `tier-${Date.now()}`,
      quantity,
      discount,
      prices: flatPrices,
      rawPrices: prices // Store the full object with both original and rounded prices
    };
  }
};

// Add helper function to calculate profit info
function calculateProfitability(price: number, baseCost: number): PriceProfitabilityInfo {
  const difference = price - baseCost;
  const differencePercent = baseCost > 0 ? (difference / baseCost) * 100 : 0;
  
  return {
    isProfit: price >= baseCost,
    difference,
    differencePercent
  };
}

// Base input component to avoid code duplication
function NumericInput({
  value,
  onChange,
  onBlur,
  min = "0",
  max,
  className = "",
  readOnly = false,
  disabled = false
}: Readonly<{
  value: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;  // Add onBlur to the props interface
  min?: string;
  max?: string;
  className?: string;
  readOnly?: boolean;
  disabled?: boolean;
}>) {
  return (
    <Input
      type="number"
      min={min}
      max={max}
      value={value}
      onChange={e => onChange?.(e.target.value)}
      onBlur={onBlur}  // Pass onBlur to the Input component
      className={className}
      readOnly={readOnly}
      disabled={disabled}
    />
  );
}

// A single row in the discount table - updated for real-time discount changes
function DiscountTierRow({
  tier,
  index,
  variantSku,
  categories, // Log this prop
  onUpdate,
  onRemove,
  baseCost // Add base cost parameter
}: Readonly<{
  tier: DiscountTier;
  index: number;
  variantSku: string;
  categories: Array<{ id: string; name: string }>;
  onUpdate: (variantSku: string, index: number, field: string, value: number) => void;
  onRemove: (variantSku: string, index: number) => void;
  baseCost: number; // HB Naik value from form
}>) {
  const [localQuantity, setLocalQuantity] = useState(tier.quantity.toString());
  const [localDiscount, setLocalDiscount] = useState(tier.discount.toString());
  
  // Update local state when props change
  useEffect(() => {
    setLocalQuantity(tier.quantity.toString());
    setLocalDiscount(tier.discount.toString());
  }, [tier.quantity, tier.discount]);
  
  // Handlers for quantity updates
  const handleQuantityChange = (value: string) => setLocalQuantity(value);
  const handleQuantityBlur = () => {
    const value = parseInt(localQuantity) || 0;
    if (value !== tier.quantity) {
      onUpdate(variantSku, index, 'quantity', value);
    }
  };
  
  // Handlers for discount updates - update in real-time
  const handleDiscountChange = (value: string) => {
    setLocalDiscount(value);
    // Convert to number and update immediately
    const numericValue = parseFloat(value) || 0;
    // Only update if the value is different and valid
    if (numericValue !== tier.discount && numericValue >= 0 && numericValue <= 100) {
      onUpdate(variantSku, index, 'discount', numericValue);
    }
  };
  
  // Still keep blur handler for validation and final confirmation
  const handleDiscountBlur = () => {
    const value = parseFloat(localDiscount) || 0;
    // Ensure value is within valid range
    const clampedValue = Math.min(Math.max(value, 0), 100);
    if (clampedValue !== value) {
      setLocalDiscount(clampedValue.toString());
    }
    if (clampedValue !== tier.discount) {
      onUpdate(variantSku, index, 'discount', clampedValue);
    }
  };
  
  // Add keyboard handler to ensure Enter key updates the value
  const handleDiscountKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.currentTarget.blur(); // Force blur to trigger update
    }
  };

  return (
    <tr className="hover:bg-muted/30">
      <td className="p-2 w-[100px]">
        <NumericInput 
          value={localQuantity}
          onChange={handleQuantityChange}
          className="w-full"
          onBlur={handleQuantityBlur}
        />
      </td>
      <td className="p-2 w-[100px]">
        <Input
          type="number"
          min="0"
          max="100"
          value={localDiscount}
          onChange={(e) => handleDiscountChange(e.target.value)}
          onBlur={handleDiscountBlur}
          onKeyDown={handleDiscountKeyDown}
          className="w-full text-right"
        />
      </td>
      
      {/* Price inputs for each category - now with price comparison and profitability */}
      {categories.map((category) => {
        const priceValue = tier.prices[category.id] || 0;
        // Get the raw price if available
        const rawPriceData = tier.rawPrices?.[category.id];
        const originalPrice = rawPriceData?.original ?? priceValue;
        const roundedPrice = rawPriceData?.rounded ?? priceValue;
        
        // Calculate profitability compared to base cost
        const profitInfo = calculateProfitability(roundedPrice, baseCost);
        
        return (
          <td key={category.id} className="p-2">
            <div className="bg-muted rounded-md px-3 py-2 border text-right">
              <div className="flex items-center justify-end gap-1">
                {/* Add profitability indicator icon */}
                {profitInfo.isProfit ? (
                  <TrendingUp className={`h-3 w-3 ${profitInfo.difference > baseCost * 0.1 ? 'text-green-500' : 'text-amber-500'}`} />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-500" />
                )}
                
                {/* Enhanced price comparison with profitability info */}
                <PriceComparisonWithProfit 
                  originalPrice={originalPrice} 
                  roundedPrice={roundedPrice}
                  baseCost={baseCost}
                  showTooltip={true}
                  tooltipPosition="top"
                />
              </div>
            </div>
          </td>
        );
      })}
      
      <td className="p-2 w-[60px] text-center">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={(e) => {
            e.preventDefault();
            onRemove(variantSku, index);
          }}
        >
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </td>
    </tr>
  );
}

// Discount table component - perbaikan layout dan struktur tabel
function DiscountTable({
  variantSku,
  tiers,
  categories,
  onUpdate,
  onRemove,
  baseCost
}: Readonly<{
  variantSku: string;
  tiers: ReadonlyArray<DiscountTier>;
  categories: ReadonlyArray<{ id: string; name: string }>;
  onUpdate: (variantSku: string, index: number, field: string, value: number) => void;
  onRemove: (variantSku: string, index: number) => void;
  baseCost: number;
}>) {
  return (
    <div className="w-full mt-4 overflow-x-auto">
      <table className="w-full min-w-full border-collapse">
        <thead>
          <tr className="bg-muted/50">
            <th className="p-2 text-left w-[100px]">QTY</th>
            <th className="p-2 text-right w-[100px]">Disc (%)</th>
            {/* Make sure we're showing all category columns */}
            {categories.map((category) => (
              <th key={`discount-category-${category.id}`} className="p-2 text-right whitespace-nowrap">
                {category.name}
              </th>
            ))}
            <th className="p-2 w-[60px] text-center">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {tiers.map((tier, index) => (
            <DiscountTierRow
              key={tier.id}
              tier={tier}
              index={index}
              variantSku={variantSku}
              categories={categories as Array<{ id: string; name: string }>}
              onUpdate={onUpdate}
              onRemove={onRemove}
              baseCost={baseCost} // Pass base cost to row component
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Create enhanced PriceComparison component with profit info
function PriceComparisonWithProfit({
  originalPrice,
  roundedPrice,
  baseCost,
  showTooltip = true,
  tooltipPosition = 'top'
}: Readonly<{
  originalPrice: number;
  roundedPrice: number;
  baseCost: number;
  showTooltip?: boolean;
  tooltipPosition?: 'top' | 'bottom' | 'left' | 'right';
}>) {
  // Calculate difference and percentage for rounding
  const difference = roundedPrice - originalPrice;
  const differencePercentage = originalPrice !== 0 
    ? (difference / originalPrice) * 100 
    : 0;
  
  // Calculate profit info
  const profitInfo = calculateProfitability(roundedPrice, baseCost);
  
  // Format percentage with appropriate sign and decimal places
  const formattedPercentage = differencePercentage.toFixed(2);
  const sign = difference >= 0 ? '+' : '';
  
  // Only show comparison if there's a difference
  const hasDifference = Math.abs(difference) > 0.01;
  
  if (!showTooltip) {
    return (
      <div className="flex flex-col">
        <span className={`font-medium ${profitInfo.isProfit ? '' : 'text-red-500'}`}>
          {formatCurrency(roundedPrice)}
        </span>
      </div>
    );
  }
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-1 cursor-default">
            <span className={profitInfo.isProfit ? '' : 'text-red-500'}>{formatCurrency(roundedPrice)}</span>
            <Info className="h-3 w-3 text-muted-foreground" />
          </div>
        </TooltipTrigger>
        <TooltipContent side={tooltipPosition} className="space-y-1 max-w-xs">
          <div className="space-y-1">
            <div className="grid grid-cols-2 gap-2">
              <span className="text-muted-foreground">Original:</span>
              <span>{formatCurrency(originalPrice)}</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <span className="text-muted-foreground">Rounded:</span>
              <span>{formatCurrency(roundedPrice)}</span>
            </div>
            {hasDifference && (
              <div className="grid grid-cols-2 gap-2">
                <span className="text-muted-foreground">Rounding:</span>
                <span className={difference > 0 ? "text-emerald-500" : "text-red-500"}>
                  {sign}{formatCurrency(difference)} ({sign}{formattedPercentage}%)
                </span>
              </div>
            )}

            {/* Add profit comparison */}
            <div className="border-t pt-1 mt-1"></div>
            <div className="grid grid-cols-2 gap-2">
              <span className="text-muted-foreground">Modal (HB Naik):</span>
              <span>{formatCurrency(baseCost)}</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <span className="text-muted-foreground">Selisih dari Modal:</span>
              <span className={profitInfo.isProfit ? "text-emerald-500" : "text-red-500"}>
                {profitInfo.isProfit ? '+' : ''}{formatCurrency(profitInfo.difference)} 
                ({profitInfo.isProfit ? '+' : ''}{profitInfo.differencePercent.toFixed(2)}%)
              </span>
            </div>
            
            {/* Add warning for loss */}
            {!profitInfo.isProfit && (
              <div className="flex items-center gap-1 text-xs text-red-500 mt-1">
                <AlertTriangle className="h-3 w-3" />
                <span>Harga setelah diskon di bawah harga modal!</span>
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Component for discount card (either global or per variant)
function DiscountCard({
  title,
  subtitle,
  enabled = true,
  onToggle,
  onAddTier,
  tiers,
  renderTable
}: Readonly<{
  title: string;
  subtitle?: string;
  enabled?: boolean;
  onToggle?: (checked: boolean) => void;
  onAddTier: () => void;
  tiers: DiscountTier[];
  renderTable: (tiers: DiscountTier[]) => React.ReactNode;
}>) {
  return (
    <div className="border rounded-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h4 className="font-medium">{title}</h4>
          {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-4">
          {onToggle && (
            <Switch
              checked={enabled}
              onCheckedChange={onToggle}
            />
          )}
          <Button
            type="button" // Explicitly set type to button to prevent form submission
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.preventDefault(); // Prevent any default behavior
              onAddTier();
            }}
            disabled={onToggle && !enabled}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Quantity
          </Button>
        </div>
      </div>
      
      {/* Moved the QTY explanation to appear after the table */}
      {(!onToggle || enabled) && (
        <>
          {renderTable(tiers)}
          <p className="text-sm text-muted-foreground mt-2">
            <strong>Note:</strong> QTY values represent the minimum quantity required to apply the corresponding discount.
          </p>
        </>
      )}
    </div>
  );
}

// Extract RenderDiscountTable component outside of VolumeDiscount 
function RenderDiscountTable({
  variantSku,
  tiers,
  categories,
  onUpdate,
  onRemove,
  baseCost
}: Readonly<{
  variantSku: string;
  tiers: DiscountTier[];
  categories: ReadonlyArray<{ id: string; name: string }>;
  onUpdate: (variantSku: string, index: number, field: string, value: number) => void;
  onRemove: (variantSku: string, index: number) => void;
  baseCost: number;
}>) {
  return (
    <DiscountTable
      variantSku={variantSku}
      tiers={tiers}
      categories={categories}
      onUpdate={onUpdate}
      onRemove={onRemove}
      baseCost={baseCost}
    />
  );
}

// Create a factory function outside the component to avoid nested component definitions
function createTableRenderer(
  variantSku: string,
  categories: ReadonlyArray<{ id: string; name: string }>,
  onUpdate: (variantSku: string, index: number, field: string, value: number) => void,
  onRemove: (variantSku: string, index: number) => void,
  baseCost: number
) {
  // Return a function that accepts tiers and renders the table
  return function renderTable(tiers: DiscountTier[]) {
    return (
      <RenderDiscountTable
        variantSku={variantSku}
        tiers={tiers}
        categories={categories}
        onUpdate={onUpdate}
        onRemove={onRemove}
        baseCost={baseCost}
      />
    );
  };
}

// Move helper functions outside to module scope
// Safe clone utility for price objects
function safeClone(obj: any) {
  if (!obj || typeof obj !== 'object') return {};
  try {
    return JSON.parse(JSON.stringify(obj));
  } catch (e) {
    console.error("Error cloning price object:", e);
    return {};
  }
}

// Helper for getting combined prices
function getCombinedPricesHelper(customerPrices: any, marketplacePrices: any) {
  const result = {
    ...safeClone(customerPrices),
    ...safeClone(marketplacePrices)
  };
  
  return result;
}

// Helper for adding a tier to global tiers
function addGlobalTier(
  globalTiers: DiscountTier[],
  allPrices: Record<string, any>,
  customizePerVariant: boolean,
  variants: any[],
  variantDiscounts: Record<string, VariantDiscount>
) {
  const defaultQuantity = utils.getDefaultQuantity(globalTiers);
  const newTier = utils.createNewTier(allPrices, defaultQuantity);
  
  const updatedGlobalTiers = [...globalTiers, newTier];
  
  // Only sync if not in custom variant mode
  let updatedVariantDiscounts = variantDiscounts;
  if (!customizePerVariant) {
    updatedVariantDiscounts = { ...variantDiscounts };
    variants.forEach(variant => {
      const sku = variant.sku_product_variant;
      if (updatedVariantDiscounts[sku]?.enabled) {
        updatedVariantDiscounts[sku] = {
          ...updatedVariantDiscounts[sku],
          tiers: [
            ...(updatedVariantDiscounts[sku].tiers || []), 
            { ...newTier, id: `${newTier.id}-${sku}` }
          ]
        };
      }
    });
  }
  
  return { updatedGlobalTiers, updatedVariantDiscounts };
}

// Helper for adding a tier to variant
function addVariantTier(
  variantSku: string,
  variantDiscounts: Record<string, VariantDiscount>,
  allPrices: Record<string, any>
) {
  const updated = { ...variantDiscounts };
  const variant = updated[variantSku] || { enabled: true, tiers: [] };
  const defaultQuantity = utils.getDefaultQuantity(variant.tiers);
  
  updated[variantSku] = {
    ...variant,
    tiers: [
      ...(variant.tiers || []),
      utils.createNewTier(allPrices, defaultQuantity)
    ]
  };
  
  return updated;
}

// Helper for updating global tier
function updateGlobalTierHelper(
  prevTiers: DiscountTier[],
  index: number,
  field: string,
  value: number,
  allPrices: Record<string, any>,
  validateFunc: (prev: DiscountTier[], index: number, field: keyof DiscountTier, value: number) => string | null
): { updatedTiers: DiscountTier[], error: string | null } {
  // For real-time updates of discount, skip validation to allow smooth typing
  if ((field === 'quantity' || field === 'discount') && field !== 'discount') {
    const error = validateFunc(prevTiers, index, field as keyof DiscountTier, value);
    if (error) {
      return { updatedTiers: prevTiers, error };
    }
  }
  
  // Create new tiers array
  const updatedTiers = prevTiers.map((tier, i) => {
    if (i === index) {
      // Create a new tier object
      const updatedTier = { ...tier, [field]: value };
      
      // If discount is updated, recalculate prices
      if (field === 'discount') {
        const pricesWithBoth = utils.calculateDiscountedPrices(allPrices, value);
        // Extract just the rounded values for the prices field
        const flatPrices: Record<string, number> = {};
        
        Object.entries(pricesWithBoth).forEach(([category, priceData]) => {
          flatPrices[category] = priceData.rounded;
        });
        
        updatedTier.prices = flatPrices;
        updatedTier.rawPrices = pricesWithBoth;
      }
      
      return updatedTier;
    }
    return tier;
  });
  
  return { updatedTiers, error: null };
}

// Helper for updating variant tier
function updateVariantTierHelper(
  prevDiscounts: Record<string, VariantDiscount>,
  variantSku: string,
  index: number,
  field: string,
  value: number,
  allPrices: Record<string, any>,
  validateFunc: (tiers: DiscountTier[], index: number, field: keyof DiscountTier, value: number) => string | null
): { updatedDiscounts: Record<string, VariantDiscount>, error: string | null } {
  const variant = prevDiscounts[variantSku];
  if (!variant) return { updatedDiscounts: prevDiscounts, error: null };
  
  // Validate input for specific fields - but for real-time updates, we skip validation
  // to avoid interrupting the user's typing flow
  if ((field === 'quantity' || field === 'discount') && field !== 'discount') {
    const error = validateFunc(variant.tiers, index, field as keyof DiscountTier, value);
    if (error) {
      return { updatedDiscounts: prevDiscounts, error };
    }
  }
  
  // Create updated variant
  const updatedVariant = {
    ...variant,
    tiers: variant.tiers.map((tier, i) => {
      if (i === index) {
        const updatedTier = { ...tier, [field]: value };
        
        if (field === 'discount') {
          const pricesWithBoth = utils.calculateDiscountedPrices(allPrices, value);
          // Extract just the rounded values for the prices field
          const flatPrices: Record<string, number> = {};
          
          Object.entries(pricesWithBoth).forEach(([category, priceData]) => {
            flatPrices[category] = priceData.rounded;
          });
          
          updatedTier.prices = flatPrices;
          updatedTier.rawPrices = pricesWithBoth;
        }
        
        return updatedTier;
      }
      return tier;
    })
  };
  
  return { 
    updatedDiscounts: { ...prevDiscounts, [variantSku]: updatedVariant },
    error: null 
  };
}

// Move more logic to module-level functions to reduce nesting depth

// Transform prices into categories array using the 'name' property within the data
function createCategoriesFromPrices(
  customerPrices?: Record<string, { name?: string } & Record<string, any>> | null,
  marketplacePrices?: Record<string, { name?: string } & Record<string, any>> | null
): Array<{ id: string; name: string }> {
  const result: Array<{ id: string; name: string }> = [];
  const uniqueCategoryNames = new Set<string>(); // Use name for uniqueness check

  // Helper to check if data is a valid price object with a name
  const isValidPriceDataWithName = (data: any): boolean => {
    const isValid = data && typeof data === 'object' && typeof data.name === 'string' && data.name.trim() !== '';
    return isValid;
  };

  // Helper to determine if a key is a known marketplace
  const isKnownMarketplaceKey = (key: string): boolean => {
    const knownMarketplaces = ['shopee', 'tokopedia', 'tiktok', 'lazada', 'bukalapak'];
    return knownMarketplaces.includes(key.toLowerCase()) || key.toLowerCase().includes('marketplace');
  };

  // Add customer price categories using data.name
  if (customerPrices && typeof customerPrices === 'object') {
    Object.entries(customerPrices).forEach(([key, data]) => { // Iterate through VALUES
      // Check if data is valid and has a name, and if the name hasn't been added yet
      if (isValidPriceDataWithName(data) && data.taxInclusivePrice !== undefined && !uniqueCategoryNames.has(data.name!)) {
        const categoryName = data.name!;
        const categoryId = categoryName.toLowerCase(); // Use lowercase name as the ID
        uniqueCategoryNames.add(categoryName); // Add original name to set for uniqueness
        result.push({
          id: categoryId,
          name: categoryName
        });
      }
    });
  }

  // Add marketplace price categories using data.name
  if (marketplacePrices && typeof marketplacePrices === 'object') {
    // Create a direct check for string-keyed marketplaces first - these often come after first render
    const stringKeysToProcess: string[] = [];
    
    Object.keys(marketplacePrices).forEach(key => {
      // Check if this is a direct marketplace key (like 'shopee', 'tokopedia')
      if (isKnownMarketplaceKey(key) && !uniqueCategoryNames.has(key)) {
        stringKeysToProcess.push(key);
      }
    });
    
    // First process direct marketplace keys (they take precedence)
    stringKeysToProcess.forEach(key => {
      const data = marketplacePrices[key];
      
      if (data && typeof data === 'object') {
        let categoryName: string;
        let hasPriceData = false;
        
        // Get the name either from the data.name property or format the key itself
        if (typeof data.name === 'string' && data.name.trim() !== '') {
          categoryName = data.name;
        } else {
          // Format key to title case for display
          categoryName = key.charAt(0).toUpperCase() + key.slice(1);
        }
        
        // Check if there's any price data that can be used
        hasPriceData = 'price' in data || 
                      'taxInclusivePrice' in data || 
                      Object.values(data).some(v => typeof v === 'number');
        
        if (hasPriceData && !uniqueCategoryNames.has(categoryName)) {
          const categoryId = key.toLowerCase();
          uniqueCategoryNames.add(categoryName);
          result.push({
            id: categoryId,
            name: categoryName
          });
        }
      }
    });
    
    // Then process regular marketplace entries with object structure
    Object.entries(marketplacePrices).forEach(([key, data]) => {
      // Skip direct marketplace keys we already processed
      if (stringKeysToProcess.includes(key)) {
        return;
      }
      
      // Check if data is valid and has a name, and if the name hasn't been added yet
      if (isValidPriceDataWithName(data) && data.price !== undefined && !uniqueCategoryNames.has(data.name!)) {
        const categoryName = data.name!;
        const categoryId = categoryName.toLowerCase(); // Use lowercase name as the ID
        uniqueCategoryNames.add(categoryName); // Add original name to set for uniqueness
        result.push({
          id: categoryId,
          name: categoryName
        });
      } else if (data && typeof data === 'object' && data.name && typeof data.name === 'string') {
        const marketplaceName = data.name.toLowerCase();
        if (isKnownMarketplaceKey(marketplaceName) && !uniqueCategoryNames.has(data.name)) {
          // Check for price-like property
          const hasPriceProperty = 'price' in data || 
                                  'taxInclusivePrice' in data || 
                                  Object.values(data).some(v => typeof v === 'number');
          
          if (hasPriceProperty) {
            const categoryName = data.name;
            const categoryId = marketplaceName;
            uniqueCategoryNames.add(categoryName);
            result.push({
              id: categoryId,
              name: categoryName
            });
          }
        }
      }
    });
  }

  return result;
}

// Update global tier prices
function updateGlobalTierPrices(
  prevTiers: DiscountTier[],
  allPrices: Record<string, any>
): DiscountTier[] {
  return prevTiers.map(tier => {
    const pricesWithBoth = utils.calculateDiscountedPrices(allPrices, tier.discount);
    // Create a flattened version with just rounded prices for backwards compatibility
    const flatPrices: Record<string, number> = {};
    
    Object.entries(pricesWithBoth).forEach(([category, priceData]) => {
      flatPrices[category] = priceData.rounded;
    });
    
    return {
      ...tier,
      prices: flatPrices,
      rawPrices: pricesWithBoth
    };
  });
}

// Update variant tier prices
function updateVariantTierPrices(
  variantDiscounts: Record<string, VariantDiscount>,
  allPrices: Record<string, any>
): Record<string, VariantDiscount> {
  const updated = { ...variantDiscounts };
  
  Object.keys(updated).forEach(sku => {
    if (updated[sku]?.enabled) {
      updated[sku] = {
        ...updated[sku],
        tiers: updated[sku].tiers.map(tier => {
          const pricesWithBoth = utils.calculateDiscountedPrices(allPrices, tier.discount);
          // Create a flattened version with just rounded prices for backwards compatibility
          const flatPrices: Record<string, number> = {};
          
          Object.entries(pricesWithBoth).forEach(([category, priceData]) => {
            flatPrices[category] = priceData.rounded;
          });
          
          return {
            ...tier,
            prices: flatPrices,
            rawPrices: pricesWithBoth
          };
        })
      };
    }
  });
  
  return updated;
}

// Function to toggle variant
function toggleVariantDiscount(
  variantDiscounts: Record<string, VariantDiscount>,
  sku: string,
  enabled: boolean
): Record<string, VariantDiscount> {
  return {
    ...variantDiscounts,
    [sku]: {
      ...variantDiscounts[sku],
      enabled
    }
  };
}

// Function to remove a tier
function removeTierFromArray(tiers: DiscountTier[], index: number): DiscountTier[] {
  return tiers.filter((_, i) => i !== index);
}

// Function to remove a tier from a variant
function removeVariantTier(
  variantDiscounts: Record<string, VariantDiscount>,
  variantSku: string,
  index: number
): Record<string, VariantDiscount> {
  const variant = variantDiscounts[variantSku];
  if (!variant) return variantDiscounts;
  
  return {
    ...variantDiscounts,
    [variantSku]: {
      ...variant,
      tiers: variant.tiers.filter((_, i) => i !== index)
    }
  };
}

// Helper function to create variant-specific tiers from global tiers
function createVariantTiersFromGlobal(globalTiers: DiscountTier[], sku: string): DiscountTier[] {
  return globalTiers.map(tier => ({ 
    ...tier, 
    id: `${tier.id}-${sku}` 
  }));
}

// --- New Component: VariantDiscountCardRenderer ---
// This component renders a single DiscountCard for a variant
function VariantDiscountCardRenderer({
  variant,
  variantDiscounts,
  globalTiers,
  getTableRenderer,
  handleVariantToggle,
  addQuantityTier
}: Readonly<{
  variant: InventoryProductVariant; // Use specific type
  variantDiscounts: Record<string, VariantDiscount>;
  globalTiers: DiscountTier[];
  getTableRenderer: (sku: string) => (tiers: DiscountTier[]) => React.ReactNode;
  handleVariantToggle: (sku: string, checked: boolean) => void;
  addQuantityTier: (sku: string) => void;
}>) {
  const sku = variant.sku_product_variant;
  // Determine the initial state for this variant's discount settings
  const variantDiscount = variantDiscounts[sku] || {
    enabled: true, // Default to enabled if not found
    // Default tiers based on global tiers if not customized yet
    tiers: createVariantTiersFromGlobal(globalTiers, sku)
  };

  // Pre-bind functions to avoid nested callbacks in JSX
  const handleToggle = (checked: boolean) => handleVariantToggle(sku, checked);
  const handleAddTier = () => addQuantityTier(sku);
  const tableRenderer = getTableRenderer(sku);

  return (
    <DiscountCard
      key={sku} // Key is important for list rendering
      title={variant.full_product_name}
      subtitle={`SKU: ${sku}`}
      enabled={variantDiscount.enabled}
      onToggle={handleToggle}
      onAddTier={handleAddTier}
      tiers={variantDiscount.tiers}
      renderTable={tableRenderer}
    />
  );
}
// --- End New Component ---

// --- New Component: VariantDiscountListRenderer ---
// Renders the list of variant discount cards
function VariantDiscountListRenderer({
  variants,
  variantDiscounts,
  globalTiers,
  getTableRenderer,
  handleVariantToggle,
  addQuantityTier
}: Readonly<{
  variants: InventoryProductVariant[];
  variantDiscounts: Record<string, VariantDiscount>;
  globalTiers: DiscountTier[];
  getTableRenderer: (sku: string) => (tiers: DiscountTier[]) => React.ReactNode;
  handleVariantToggle: (sku: string, checked: boolean) => void;
  addQuantityTier: (sku: string) => void;
}>) {
  // Pre-render variant cards to avoid nesting map callback in JSX
  const variantCards = variants.map((variant) => (
    <VariantDiscountCardRenderer
      key={variant.sku_product_variant}
      variant={variant}
      variantDiscounts={variantDiscounts}
      globalTiers={globalTiers}
      getTableRenderer={getTableRenderer}
      handleVariantToggle={handleVariantToggle}
      addQuantityTier={addQuantityTier}
    />
  ));

  return <div className="space-y-6">{variantCards}</div>;
}
// --- End New Component ---

// --- Updated Component: VolumeDiscountContent ---
// Renders the main content when volume discount is enabled
function VolumeDiscountContent({
  customizePerVariant,
  globalTiers,
  variants,
  variantDiscounts,
  getTableRenderer,
  handleVariantToggle,
  addQuantityTier
}: Readonly<{
  customizePerVariant: boolean;
  globalTiers: DiscountTier[];
  variants: InventoryProductVariant[];
  variantDiscounts: Record<string, VariantDiscount>;
  getTableRenderer: (sku: string) => (tiers: DiscountTier[]) => React.ReactNode;
  handleVariantToggle: (sku: string, checked: boolean) => void;
  addQuantityTier: (sku: string) => void; // Simplify type to just string
}>) {
  return (
    <div className="space-y-6">
      {!customizePerVariant ? (
        <DiscountCard
          title="Global Discount Rules"
          onAddTier={() => addQuantityTier('global')} // 'global' is a valid string
          tiers={globalTiers}
          renderTable={getTableRenderer('global')}
        />
      ) : (
        // Use the new list renderer component
        <VariantDiscountListRenderer
          variants={variants}
          variantDiscounts={variantDiscounts}
          globalTiers={globalTiers}
          getTableRenderer={getTableRenderer}
          handleVariantToggle={handleVariantToggle}
          addQuantityTier={addQuantityTier} // No cast needed now
        />
      )}
    </div>
  );
}
// --- End Updated Component ---


// --- New Helper Function: handleAddSpecificVariantTier ---
function handleAddSpecificVariantTier(
  variantSku: string,
  allPrices: Record<string, any>,
  setVariantDiscounts: React.Dispatch<React.SetStateAction<Record<string, VariantDiscount>>>
) {
  try {
    setVariantDiscounts(prev => addVariantTier(variantSku, prev, allPrices));
  } catch (error) {
    console.error("Error adding variant tier:", error);
    // Don't rethrow error - contain it here
  }
}
// --- End New Helper Function ---

// --- New Helper Function: handleAddGlobalOrSyncedTier ---
function handleAddGlobalOrSyncedTier(
  globalTiers: DiscountTier[],
  allPrices: Record<string, any>,
  customizePerVariant: boolean,
  variants: InventoryProductVariant[],
  variantDiscounts: Record<string, VariantDiscount>,
  setGlobalTiers: React.Dispatch<React.SetStateAction<DiscountTier[]>>,
  setVariantDiscounts: React.Dispatch<React.SetStateAction<Record<string, VariantDiscount>>>
) {
  try {
    const { updatedGlobalTiers, updatedVariantDiscounts } = addGlobalTier(
      globalTiers,
      allPrices,
      customizePerVariant,
      variants,
      variantDiscounts
    );
    setGlobalTiers(updatedGlobalTiers);
    setVariantDiscounts(updatedVariantDiscounts);
  } catch (error) {
    console.error("Error adding global tier:", error);
    // Don't rethrow error - contain it here
  }
}
// --- End New Helper Function ---

// Group parameters into a single object to reduce parameter count
interface HandleUpdateTierParams {
  variantSku: string;
  index: number;
  field: string;
  value: number;
  categories: Array<{ id: string; name: string }>;
  getCombinedPrices: () => Record<string, any>;
  globalTiers: DiscountTier[];
  setGlobalTiers: React.Dispatch<React.SetStateAction<DiscountTier[]>>;
  variantDiscounts: Record<string, VariantDiscount>;
  setVariantDiscounts: React.Dispatch<React.SetStateAction<Record<string, VariantDiscount>>>;
  showError: (error: string) => void;
  validateTier: (
    tiers: DiscountTier[],
    index: number,
    field: keyof DiscountTier,
    value: number
  ) => string | null;
}

// Refactored: Accept a single object parameter
function handleUpdateTier({
  variantSku,
  index,
  field,
  value,
  categories,
  getCombinedPrices,
  globalTiers,
  setGlobalTiers,
  variantDiscounts,
  setVariantDiscounts,
  showError,
  validateTier
}: HandleUpdateTierParams) {
  if (categories.length === 0) {
    showError("Cannot update tier: No price categories available");
    return;
  }

  const allPrices = getCombinedPrices();

  if (variantSku === 'global') {
    const { updatedTiers, error } = updateGlobalTierHelper(
      globalTiers, index, field, value, allPrices, validateTier
    );

    if (error) {
      if (field !== 'discount') {
        setTimeout(() => showError(error), 0);
      }
      return;
    }
    setGlobalTiers(updatedTiers);
  } else {
    const { updatedDiscounts, error } = updateVariantTierHelper(
      variantDiscounts, variantSku, index, field, value, allPrices, validateTier
    );

    if (error) {
      if (field !== 'discount') {
        setTimeout(() => showError(error), 0);
      }
      return;
    }
    setVariantDiscounts(updatedDiscounts);
  }
}

// Refactor deeply nested logic in useEffect to a helper function
function updateAllTierPrices({
  getCombinedPrices,
  categories,
  setGlobalTiers,
  setVariantDiscounts,
  isEnabled,
  hbNaik,
  prevHbNaikRef,
  toast
}: {
  getCombinedPrices: () => Record<string, any>;
  categories: Array<{ id: string; name: string }>;
  setGlobalTiers: React.Dispatch<React.SetStateAction<DiscountTier[]>>;
  setVariantDiscounts: React.Dispatch<React.SetStateAction<Record<string, VariantDiscount>>>;
  isEnabled: boolean;
  hbNaik: number;
  prevHbNaikRef: React.MutableRefObject<number>;
  toast: ReturnType<typeof useToast>['toast'];
}) {
  const allPrices = getCombinedPrices();

  if (Object.keys(allPrices).length > 0 && categories.length > 0) {
    const hbNaikChanged = prevHbNaikRef.current !== hbNaik;
    prevHbNaikRef.current = hbNaik;

    setGlobalTiers(prevTiers => updateGlobalTierPrices(prevTiers, allPrices));
    setVariantDiscounts(prev => updateVariantTierPrices(prev, allPrices));

    if (hbNaikChanged && isEnabled) {
      toast({
        title: "Harga Modal Diperbarui",
        description: `Perbandingan harga diskon terhadap modal (HB Naik: ${formatCurrency(hbNaik)}) telah diperbarui.`,
        duration: 3000,
      });
    }
  }
}

// Refactor deeply nested logic in syncVariantTiersWithGlobal to a helper function
function getSyncedVariantDiscounts({
  prevDiscounts,
  variants,
  globalTiers
}: {
  prevDiscounts: Record<string, VariantDiscount>;
  variants: InventoryProductVariant[];
  globalTiers: DiscountTier[];
}): Record<string, VariantDiscount> {
  const updated = { ...prevDiscounts };
  variants.forEach(variant => {
    const sku = variant.sku_product_variant;
    updated[sku] = {
      enabled: true,
      tiers: globalTiers.map(tier => ({
        ...tier,
        id: `${tier.id}-${sku}`
      }))
    };
  });
  return updated;
}

// --- New Component: VolumeDiscountLoading ---
function VolumeDiscountLoading({ hasPriceData }: Readonly<{ hasPriceData: boolean }>) {
  return (
    <div className="rounded-lg border p-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Volume Discount</h3>
          <p className="text-sm text-muted-foreground">
            Configure volume-based discounts for variants
          </p>
        </div>
      </div>
      <div className="mt-4 text-muted-foreground">
        {!hasPriceData
          ? "Waiting for base price data to load..."
          : "Please add customer or marketplace prices before configuring volume discounts."}
      </div>
    </div>
  );
}
// --- End New Component ---

// --- New Component: VolumeDiscountEnabledContent ---
function VolumeDiscountEnabledContent({
  hbNaik,
  customizePerVariant,
  globalTiers,
  variants,
  variantDiscounts,
  getTableRenderer,
  handleVariantToggle,
  addQuantityTier
}: Readonly<{
  hbNaik: number;
  customizePerVariant: boolean;
  globalTiers: DiscountTier[];
  variants: InventoryProductVariant[];
  variantDiscounts: Record<string, VariantDiscount>;
  getTableRenderer: (sku: string) => (tiers: DiscountTier[]) => React.ReactNode;
  handleVariantToggle: (sku: string, checked: boolean) => void;
  addQuantityTier: (sku: string) => void;
}>) {
  return (
    <>
      <div className="bg-muted/20 p-3 rounded border">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          <p className="text-sm">
            <span className="font-medium">Perbandingan harga modal:</span>{' '}
            Harga modal (HB Naik) saat ini adalah{' '}
            <span className="font-semibold">{formatCurrency(hbNaik)}</span>.
            Harga setelah diskon yang di bawah harga modal akan ditandai dengan warna merah.
            {' '}<span className="ml-1 text-xs italic">Tabel akan otomatis diperbarui jika Pricing Information berubah.</span>
          </p>
        </div>
      </div>

      <div className="overflow-x-auto w-full">
        <VolumeDiscountContent
          customizePerVariant={customizePerVariant}
          globalTiers={globalTiers}
          variants={variants}
          variantDiscounts={variantDiscounts}
          getTableRenderer={getTableRenderer}
          handleVariantToggle={handleVariantToggle}
          addQuantityTier={addQuantityTier}
        />
      </div>

      <div className="bg-muted/20 p-3 rounded border border-dashed">
        <p className="text-sm text-muted-foreground">
          <strong>Note:</strong> All discount prices are rounded according to price magnitude rules for easier transactions.
          Hover over prices to see the pre-rounding value and rounding difference.
        </p>
      </div>
    </>
  );
}
// --- End New Component ---


export function VolumeDiscount({
  form,
  product,
  initialCustomerPrices,
  initialMarketplacePrices,
  pricesInitialized = false // Default to false
}: Readonly<VolumeDiscountProps>) {
  const { toast } = useToast();
  const variants = product?.product_by_variant || [];

  // Create ref to store data initialized state
  const dataInitializedRef = useRef(false);
  
  // Try to get data from form directly if props are empty
  const customerPrices = initialCustomerPrices || form.getValues('customerPrices') || {};
  const marketplacePrices = initialMarketplacePrices || form.getValues('marketplacePrices') || {};
  
  // Data loading state - true when either passed props has data or when parent says initialization is complete
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  
  // Add state to track marketplace data
  const [hasMarketplaceData, setHasMarketplaceData] = useState(
    marketplacePrices && Object.keys(marketplacePrices).length > 0
  );

  // Add state to force refresh when marketplace data changes
  const [marketplaceRefreshCounter, setMarketplaceRefreshCounter] = useState(0);
  
  // Reference to store current marketplace keys for comparison
  const marketplaceKeysRef = useRef<string[]>([]);
  
  // Set data loaded flag once we have data
  useEffect(() => {
    if (pricesInitialized || 
        Object.keys(customerPrices).length > 0 || 
        Object.keys(marketplacePrices).length > 0) {
      setIsDataLoaded(true);
      dataInitializedRef.current = true;
    }
    
    // Set marketplace data flag and capture keys for comparison
    const currentKeys = marketplacePrices ? Object.keys(marketplacePrices) : [];
    if (currentKeys.length > 0) {
      setHasMarketplaceData(true);
      marketplaceKeysRef.current = currentKeys;
    }
  }, [customerPrices, marketplacePrices, pricesInitialized]);

  // --- Check if source price data is actually populated ---
  const hasPriceData = useMemo(() => {
    // Handle null/undefined cases for props
    const customerKeys = customerPrices ? Object.keys(customerPrices) : [];
    const marketplaceKeys = marketplacePrices ? Object.keys(marketplacePrices) : [];
    
    // Return true if we have any valid keys or if parent says data is initialized
    return pricesInitialized || 
           isDataLoaded || 
           customerKeys.some(key => !/^\d+$/.test(key)) || 
           marketplaceKeys.some(key => !/^\d+$/.test(key));
  }, [customerPrices, marketplacePrices, pricesInitialized, isDataLoaded]);

  // Transform all prices into categories array using the props
  const categories = useMemo(() => {
    const generatedCategories = createCategoriesFromPrices(customerPrices, marketplacePrices);
    
    return generatedCategories;
  }, [customerPrices, marketplacePrices, marketplaceRefreshCounter]); // Include refreshCounter in deps

  // Add effect to watch for late marketplace data using the watch API
  useEffect(() => {
    // Use form.watch to detect changes to marketplaceprices
    const subscription = form.watch((value, { name, type }) => {
      if (name?.startsWith('marketplacePrices.') || name === 'marketplacePrices') {
        // Check if we now have marketplace data we didn't have before
        const currentMarketplaceData = value?.marketplacePrices || {};
        const marketplaceKeys = Object.keys(currentMarketplaceData);
        
        // Check if there are new keys compared to what we had before
        const hasNewKeys = marketplaceKeys.length > 0 && 
                          (marketplaceKeys.length > marketplaceKeysRef.current.length || 
                           marketplaceKeys.some(key => !marketplaceKeysRef.current.includes(key)));
        
        if (hasNewKeys) {
          // Update our reference of current keys
          marketplaceKeysRef.current = marketplaceKeys;
          
          // Set flag to indicate we have marketplace data
          setHasMarketplaceData(true);
          
          // Force a refresh of categories and price calculations
          setMarketplaceRefreshCounter(prev => prev + 1);
          
          // Force form to react to the marketplace changes
          setTimeout(() => {
            form.trigger("marketplacePrices");
          }, 0);          
        }
      }
    });
    
    // Clean up subscription
    return () => subscription.unsubscribe();
  }, [form, toast]);

  // Main state
  const [isEnabled, setIsEnabled] = useState(form.getValues('isEnableVolumeDiscount') || false); // Initialize from form
  const [customizePerVariant, setCustomizePerVariant] = useState(form.getValues('isEnableVolumeDiscountByProductVariant') || false); // Initialize from form
  const [globalTiers, setGlobalTiers] = useState<DiscountTier[]>([
    { id: 'tier-1', quantity: 10, discount: 5, prices: {} },
    { id: 'tier-2', quantity: 50, discount: 10, prices: {} },
    { id: 'tier-3', quantity: 100, discount: 15, prices: {} },
  ]);
  const [variantDiscounts, setVariantDiscounts] = useState<Record<string, VariantDiscount>>({});

  // Get HB Naik value from form and watch it for changes
  const hbNaik = form.watch('hbNaik') || 0;
  
  // Watch other pricing information fields that might affect calculations
  const usdPrice = form.watch('usdPrice') || 0;
  const exchangeRate = form.watch('exchangeRate') || 0;
  const adjustmentPercentage = form.watch('adjustmentPercentage') || 0;
  
  // Previous hbNaik value to detect changes
  const prevHbNaikRef = useRef(hbNaik);

  // Helper to combine all price sources - uses props
  const getCombinedPrices = useCallback(() => {
    const result = getCombinedPricesHelper(customerPrices, marketplacePrices);
    return result;
  }, [customerPrices, marketplacePrices]); // Depend on props

  // Effect specifically for marketplace data refresh
  useEffect(() => {
    // Only run if we have marketplace data
    if (hasMarketplaceData && marketplaceRefreshCounter > 0) {
      // Force recalculation of prices when marketplace data changes
      const allPrices = getCombinedPrices();
      
      setGlobalTiers(prevTiers => updateGlobalTierPrices(prevTiers, allPrices));
      setVariantDiscounts(prev => updateVariantTierPrices(prev, allPrices));
    }
  }, [hasMarketplaceData, marketplaceRefreshCounter, getCombinedPrices]);

  // Update all prices when customer or marketplace prices (props) change
  // Or when pricing information (hbNaik, etc.) changes
  useEffect(() => {
    updateAllTierPrices({
      getCombinedPrices,
      categories,
      setGlobalTiers,
      setVariantDiscounts,
      isEnabled,
      hbNaik,
      prevHbNaikRef,
      toast
    });
  }, [
    customerPrices, 
    marketplacePrices, 
    categories, 
    isEnabled, 
    getCombinedPrices,
    hbNaik,
    usdPrice,
    exchangeRate,
    adjustmentPercentage,
    toast
  ]);

  // Initialize variant tiers from global tiers
  const syncVariantTiersWithGlobal = useCallback(() => {
    setVariantDiscounts(prev =>
      getSyncedVariantDiscounts({
        prevDiscounts: prev,
        variants,
        globalTiers
      })
    );
  }, [variants, globalTiers]);

  // Handler for customizePerVariant toggle
  const handleCustomizePerVariantChange = useCallback((checked: boolean) => {
    setCustomizePerVariant(checked);
    form.setValue('isEnableVolumeDiscountByProductVariant', checked); // Update form state
    if (checked) {
      syncVariantTiersWithGlobal();
    }
  }, [syncVariantTiersWithGlobal, form]);

  // Handler for main enable toggle
  const handleEnableToggle = useCallback((checked: boolean) => {
      setIsEnabled(checked);
      form.setValue('isEnableVolumeDiscount', checked); // Update form state
  }, [form]);


  // Show error toast - simple function
  const showError = useCallback((error: string) => {
    toast({
      variant: 'destructive',
      title: 'Invalid Input',
      description: error
    });
  }, [toast]);

  // Add new tier handler using the extracted helpers
  const addQuantityTier = useCallback((variantSku: string) => {
    try {
      if (categories.length === 0) {
        toast({
          title: "No price categories available",
          description: "Please add prices before creating discount tiers",
          variant: "destructive"
        });
        return;
      }

      const allPrices = getCombinedPrices();
      const isSpecificVariant = customizePerVariant && variantSku !== 'global';

      if (isSpecificVariant) {
        // Call the specific variant helper
        handleAddSpecificVariantTier(variantSku, allPrices, setVariantDiscounts);
      } else {
        // Call the global/synced helper
        handleAddGlobalOrSyncedTier(
          globalTiers,
          allPrices,
          customizePerVariant,
          variants,
          variantDiscounts,
          setGlobalTiers, // Pass setter
          setVariantDiscounts // Pass setter
        );
      }
    } catch (error) {
      // Catch and log any unexpected errors to prevent form submission
      console.error("Error adding quantity tier:", error);
      toast({
        title: "Error",
        description: "Failed to add quantity tier. Please try again.",
        variant: "destructive"
      });
    }
  }, [
    categories,
    customizePerVariant,
    variants,
    getCombinedPrices,
    globalTiers,
    toast,
    variantDiscounts,
    // No need to include setters in deps as they are stable
  ]);

  // Refactored: Use the new object parameter for handleUpdateTier
  const updateTier = useCallback((
    variantSku: string,
    index: number,
    field: string,
    value: number
  ) => {
    handleUpdateTier({
      variantSku,
      index,
      field,
      value,
      categories,
      getCombinedPrices,
      globalTiers,
      setGlobalTiers,
      variantDiscounts,
      setVariantDiscounts,
      showError,
      validateTier: utils.validateTier
    });
  }, [categories, getCombinedPrices, globalTiers, setGlobalTiers, variantDiscounts, setVariantDiscounts, showError]);

  // Remove tier handler using extracted functions
  const removeTier = useCallback((variantSku: string, index: number) => {
    if (variantSku === 'global') {
      setGlobalTiers(prev => removeTierFromArray(prev, index));
    } else {
      setVariantDiscounts(prev => removeVariantTier(prev, variantSku, index));
    }
  }, []);

  // Handle variant toggle using extracted function
  const handleVariantToggle = useCallback((sku: string, checked: boolean) => {
    setVariantDiscounts(prev => toggleVariantDiscount(prev, sku, checked));
  }, []);

  // Get table renderer - now with a dependency on hbNaik to ensure re-render
  const getTableRenderer = useCallback((variantSku: string) => {
    return createTableRenderer(variantSku, categories, updateTier, removeTier, hbNaik);
  }, [categories, updateTier, removeTier, hbNaik]); // Add hbNaik as dependency

  // Don't render anything if there are no variants
  if (!variants.length) return null;
  
  // To prevent flash of loading message on fast loads, delay the check
  const shouldShowLoadingMessage = !hasPriceData || categories.length === 0;

  // --- Show loading state only when needed ---
  if (shouldShowLoadingMessage) {
    return <VolumeDiscountLoading hasPriceData={hasPriceData} />;
  }

  // Main component rendering
  return (
    <div className="rounded-lg border p-4 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h3 className="text-lg font-medium">Volume Discount</h3>
          <p className="text-sm text-muted-foreground">
            Configure volume-based discounts for variants
          </p>
        </div>
        <div className="flex items-center gap-4 flex-wrap">
          {/* Tukar urutan toggle - Customize per Variant ke sebelah kiri */}
          {isEnabled && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Customize per Variant</span>
              <Switch
                checked={customizePerVariant}
                onCheckedChange={handleCustomizePerVariantChange}
              />
            </div>
          )}
          {/* Enable Volume Discount tetap di sebelah kanan */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Enable Volume Discount</span>
            <Switch
              checked={isEnabled}
              onCheckedChange={handleEnableToggle}
            />
          </div>
        </div>
      </div>

      {/* Use the new VolumeDiscountEnabledContent component */}
      {isEnabled && (
        <VolumeDiscountEnabledContent
          hbNaik={hbNaik}
          customizePerVariant={customizePerVariant}
          globalTiers={globalTiers}
          variants={variants}
          variantDiscounts={variantDiscounts}
          getTableRenderer={getTableRenderer}
          handleVariantToggle={handleVariantToggle}
          addQuantityTier={addQuantityTier}
        />
      )}
    </div>
  );
}