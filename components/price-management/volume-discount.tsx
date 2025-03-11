'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import { formatCurrency } from '@/lib/utils/format';
import type { PriceFormFields } from '@/types/form';
import type { InventoryProduct } from '@/types/inventory';

interface VolumeDiscountProps {
  readonly form: UseFormReturn<PriceFormFields>;
  readonly product: InventoryProduct;
}

interface DiscountTier {
  id: string;
  quantity: number;
  discount: number;
  prices: Record<string, number>;
}

interface VariantDiscount {
  enabled: boolean;
  tiers: DiscountTier[];
}

// Utility functions for validation and calculations
const utils = {
  // Calculate discounted prices based on base prices and discount percentage
  calculateDiscountedPrices: (
    basePrices: Record<string, any>,
    discountPercentage: number
  ): Record<string, number> => {
    const result: Record<string, number> = {};
    
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
            // Calculate discounted price
            result[category] = Math.round(originalPrice * (1 - discountPercentage / 100));
          }
        } catch (e) {
          console.error(`Error calculating discount for ${category}:`, e);
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
    return {
      id: `tier-${Date.now()}`,
      quantity,
      discount,
      prices: utils.calculateDiscountedPrices(customerPrices, discount),
    };
  }
};

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
  categories,
  onUpdate,
  onRemove
}: Readonly<{
  tier: DiscountTier;
  index: number;
  variantSku: string;
  categories: Array<{ id: string; name: string }>;
  onUpdate: (variantSku: string, index: number, field: string, value: number) => void;
  onRemove: (variantSku: string, index: number) => void;
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
      <td className="p-2">
        <NumericInput 
          value={localQuantity}
          onChange={handleQuantityChange}
          className="w-[100px]"
          onBlur={handleQuantityBlur}
        />
      </td>
      <td className="p-2">
        <Input
          type="number"
          min="0"
          max="100"
          value={localDiscount}
          onChange={(e) => handleDiscountChange(e.target.value)}
          onBlur={handleDiscountBlur}
          onKeyDown={handleDiscountKeyDown}
          className="w-[100px] text-right"
        />
      </td>
      
      {/* Price inputs for each category */}
      {categories.map((category) => (
        <td key={category.id} className="p-2">
          <Input
            type="text"
            value={formatCurrency(tier.prices[category.id] || 0)}
            readOnly
            disabled
            className="text-right bg-muted cursor-not-allowed"
          />
        </td>
      ))}
      
      <td className="p-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onRemove(variantSku, index)}
        >
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </td>
    </tr>
  );
}

// Discount table component
function DiscountTable({
  variantSku,
  tiers,
  categories,
  onUpdate,
  onRemove
}: Readonly<{
  variantSku: string;
  tiers: ReadonlyArray<DiscountTier>;
  categories: ReadonlyArray<{ id: string; name: string }>;
  onUpdate: (variantSku: string, index: number, field: string, value: number) => void;
  onRemove: (variantSku: string, index: number) => void;
}>) {
  return (
    <table className="w-full mt-4">
      <thead>
        <tr className="bg-muted/50">
          <th className="p-2 text-left">QTY</th>
          <th className="p-2 text-right">Discount (%)</th>
          {/* Make sure we're showing all category columns */}
          {categories.map((category) => (
            <th key={category.id} className="p-2 text-right whitespace-nowrap">
              {category.name} Price
            </th>
          ))}
          <th className="p-2 w-[100px]"></th>
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
          />
        ))}
      </tbody>
    </table>
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
            variant="outline"
            size="sm"
            onClick={onAddTier}
            disabled={onToggle && !enabled}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Quantity
          </Button>
        </div>
      </div>
      {(!onToggle || enabled) && renderTable(tiers)}
    </div>
  );
}

// Extract RenderDiscountTable component outside of VolumeDiscount 
function RenderDiscountTable({
  variantSku,
  tiers,
  categories,
  onUpdate,
  onRemove
}: Readonly<{
  variantSku: string;
  tiers: DiscountTier[];
  categories: ReadonlyArray<{ id: string; name: string }>;
  onUpdate: (variantSku: string, index: number, field: string, value: number) => void;
  onRemove: (variantSku: string, index: number) => void;
}>) {
  return (
    <DiscountTable
      variantSku={variantSku}
      tiers={tiers}
      categories={categories}
      onUpdate={onUpdate}
      onRemove={onRemove}
    />
  );
}

// Create a factory function outside the component to avoid nested component definitions
function createTableRenderer(
  variantSku: string,
  categories: ReadonlyArray<{ id: string; name: string }>,
  onUpdate: (variantSku: string, index: number, field: string, value: number) => void,
  onRemove: (variantSku: string, index: number) => void
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
  return {
    ...safeClone(customerPrices),
    ...safeClone(marketplacePrices)
  };
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
        updatedTier.prices = utils.calculateDiscountedPrices(allPrices, value);
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
          updatedTier.prices = utils.calculateDiscountedPrices(allPrices, value);
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

// Transform prices into categories array
function createCategoriesFromPrices(customerPrices: any, marketplacePrices: any): Array<{ id: string; name: string }> {
  const result: Array<{ id: string; name: string }> = [];
  const uniqueCategories = new Set<string>();
  
  // Add customer price categories
  if (customerPrices && typeof customerPrices === 'object') {
    Object.keys(customerPrices).forEach(key => {
      if (!uniqueCategories.has(key)) {
        uniqueCategories.add(key);
        result.push({
          id: key,
          name: key.charAt(0).toUpperCase() + key.slice(1)
        });
      }
    });
  }
  
  // Add marketplace price categories
  if (marketplacePrices && typeof marketplacePrices === 'object') {
    Object.keys(marketplacePrices).forEach(key => {
      if (!uniqueCategories.has(key)) {
        uniqueCategories.add(key);
        result.push({
          id: key,
          name: key.charAt(0).toUpperCase() + key.slice(1)
        });
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
  return prevTiers.map(tier => ({
    ...tier,
    prices: utils.calculateDiscountedPrices(allPrices, tier.discount)
  }));
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
        tiers: updated[sku].tiers.map(tier => ({
          ...tier,
          prices: utils.calculateDiscountedPrices(allPrices, tier.discount)
        }))
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

export function VolumeDiscount({ form, product }: Readonly<VolumeDiscountProps>) {
  const { toast } = useToast();
  const variants = product?.product_by_variant || [];
  
  // Get customer price categories from the form
  const customerPrices = form.watch('customerPrices');
  const marketplacePrices = form.watch('marketplacePrices');
  
  // Transform all prices into categories array using the extracted function
  const categories = useMemo(() => 
    createCategoriesFromPrices(customerPrices, marketplacePrices), 
    [customerPrices, marketplacePrices]
  );

  // Main state
  const [isEnabled, setIsEnabled] = useState(false);
  const [customizePerVariant, setCustomizePerVariant] = useState(false);
  const [globalTiers, setGlobalTiers] = useState<DiscountTier[]>([
    { id: 'tier-1', quantity: 10, discount: 5, prices: {} },
    { id: 'tier-2', quantity: 50, discount: 10, prices: {} },
    { id: 'tier-3', quantity: 100, discount: 15, prices: {} },
  ]);
  const [variantDiscounts, setVariantDiscounts] = useState<Record<string, VariantDiscount>>({});

  // Helper to combine all price sources - simplified with extracted helper function
  const getCombinedPrices = useCallback(() => {
    return getCombinedPricesHelper(customerPrices, marketplacePrices);
  }, [customerPrices, marketplacePrices]);

  // Update all prices when customer or marketplace prices change - simplified with extracted functions
  useEffect(() => {
    const allPrices = getCombinedPrices();
    
    // Only update if we have prices and categories
    if (Object.keys(allPrices).length > 0 && categories.length > 0) {
      // Update global tier prices using extracted function
      setGlobalTiers(prevTiers => updateGlobalTierPrices(prevTiers, allPrices));
      
      // Update variant tier prices using extracted function
      setVariantDiscounts(prev => updateVariantTierPrices(prev, allPrices));
    }
  }, [customerPrices, marketplacePrices, categories, isEnabled, getCombinedPrices]);

  // Initialize variant tiers from global tiers
  const syncVariantTiersWithGlobal = useCallback(() => {
    setVariantDiscounts(prev => {
      const updated = { ...prev };
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
    });
  }, [variants, globalTiers]);

  // Handler for customizePerVariant toggle
  const handleCustomizePerVariantChange = useCallback((checked: boolean) => {
    setCustomizePerVariant(checked);
    if (checked) {
      syncVariantTiersWithGlobal();
    }
  }, [syncVariantTiersWithGlobal]);

  // Show error toast - simple function
  const showError = useCallback((error: string) => {
    toast({
      variant: 'destructive',
      title: 'Invalid Input',
      description: error
    });
  }, [toast]);

  // Add new tier handler using the extracted helpers
  const addQuantityTier = useCallback((variantSku?: string) => {
    // Only proceed if we have categories
    if (categories.length === 0) {
      toast({
        title: "No price categories available",
        description: "Please add prices before creating discount tiers",
        variant: "destructive"
      });
      return;
    }
    
    const allPrices = getCombinedPrices();
    
    if (customizePerVariant && variantSku && variantSku !== 'global') {
      setVariantDiscounts(prev => addVariantTier(variantSku, prev, allPrices));
    } else {
      const result = addGlobalTier(globalTiers, allPrices, customizePerVariant, variants, variantDiscounts);
      setGlobalTiers(result.updatedGlobalTiers);
      
      if (result.updatedVariantDiscounts !== variantDiscounts) {
        setVariantDiscounts(result.updatedVariantDiscounts);
      }
    }
  }, [
    categories,
    customizePerVariant, 
    variants, 
    getCombinedPrices, 
    globalTiers, 
    toast, 
    variantDiscounts
  ]);

  // Update tier data - optimized for real-time updates
  const updateTier = useCallback((
    variantSku: string,
    index: number,
    field: string,
    value: number
  ) => {
    // Skip validation if no categories
    if (categories.length === 0) {
      showError("Cannot update tier: No price categories available");
      return;
    }
    
    const allPrices = getCombinedPrices();
    
    // Check for missing price data, but only log in dev environment
    if (process.env.NODE_ENV === 'development') {
      const missingPrices = categories.filter(cat => !allPrices[cat.id]);
      if (missingPrices.length > 0) {
        console.warn("Missing price data for categories:", missingPrices.map(c => c.id).join(", "));
      }
    }
    
    if (variantSku === 'global') {
      const { updatedTiers, error } = updateGlobalTierHelper(
        globalTiers, index, field, value, allPrices, utils.validateTier
      );
      
      if (error) {
        // For discount updates, we may want to skip error display during typing
        if (field !== 'discount') {
          setTimeout(() => showError(error), 0);
        }
        return;
      }
      
      // Update state immediately without the setTimeout delay for real-time updates
      setGlobalTiers(updatedTiers);
    } else {
      const { updatedDiscounts, error } = updateVariantTierHelper(
        variantDiscounts, variantSku, index, field, value, allPrices, utils.validateTier
      );
      
      if (error) {
        // For discount updates, we may want to skip error display during typing
        if (field !== 'discount') {
          setTimeout(() => showError(error), 0);
        }
        return;
      }
      
      // Update state immediately without the setTimeout delay for real-time updates
      setVariantDiscounts(updatedDiscounts);
    }
  }, [categories, getCombinedPrices, globalTiers, showError, variantDiscounts]);

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

  // Create table renderer
  const getTableRenderer = useCallback((variantSku: string) => {
    return createTableRenderer(variantSku, categories, updateTier, removeTier);
  }, [categories, updateTier, removeTier]);

  // Don't render anything if there are no variants
  if (!variants.length) return null;

  // Show initial state message if no categories
  if (categories.length === 0) {
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
          Please add customer or marketplace prices before configuring volume discounts.
        </div>
      </div>
    );
  }

  // Main component rendering
  return (
    <div className="rounded-lg border p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Volume Discount</h3>
          <p className="text-sm text-muted-foreground">
            Configure volume-based discounts for variants
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Enable Volume Discount</span>
            <Switch
              checked={isEnabled}
              onCheckedChange={setIsEnabled}
            />
          </div>
          {isEnabled && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Customize per Variant</span>
              <Switch
                checked={customizePerVariant}
                onCheckedChange={handleCustomizePerVariantChange}
              />
            </div>
          )}
        </div>
      </div>

      {isEnabled && (
        <div className="space-y-6">
          {!customizePerVariant ? (
            <DiscountCard
              title="Global Discount Rules"
              onAddTier={() => addQuantityTier('global')}
              tiers={globalTiers}
              renderTable={getTableRenderer('global')}
            />
          ) : (
            <div className="space-y-6">
              {variants.map((variant) => {
                const sku = variant.sku_product_variant;
                const variantDiscount = variantDiscounts[sku] || {
                  enabled: true,
                  tiers: globalTiers.map(tier => ({...tier, id: `${tier.id}-${sku}`}))
                };

                return (
                  <DiscountCard
                    key={sku}
                    title={variant.full_product_name}
                    subtitle={`SKU: ${sku}`}
                    enabled={variantDiscount.enabled}
                    onToggle={(checked) => handleVariantToggle(sku, checked)}
                    onAddTier={() => addQuantityTier(sku)}
                    tiers={variantDiscount.tiers}
                    renderTable={getTableRenderer(sku)}
                  />
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}