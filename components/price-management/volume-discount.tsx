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
  min = "0",
  max,
  className = "",
  readOnly = false,
  disabled = false
}: {
  value: string;
  onChange?: (value: string) => void;
  min?: string;
  max?: string;
  className?: string;
  readOnly?: boolean;
  disabled?: boolean;
}) {
  return (
    <Input
      type="number"
      min={min}
      max={max}
      value={value}
      onChange={e => onChange?.(e.target.value)}
      className={className}
      readOnly={readOnly}
      disabled={disabled}
    />
  );
}

// A single row in the discount table
function DiscountTierRow({
  tier,
  index,
  variantSku,
  categories,
  onUpdate,
  onRemove
}: {
  tier: DiscountTier;
  index: number;
  variantSku: string;
  categories: Array<{ id: string; name: string }>;
  onUpdate: (variantSku: string, index: number, field: string, value: number) => void;
  onRemove: (variantSku: string, index: number) => void;
}) {
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
  
  // Handlers for discount updates
  const handleDiscountChange = (value: string) => setLocalDiscount(value);
  
  const handleDiscountBlur = () => {
    const value = parseFloat(localDiscount) || 0;
    if (value !== tier.discount) {
      onUpdate(variantSku, index, 'discount', value);
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
}: {
  variantSku: string;
  tiers: ReadonlyArray<DiscountTier>;
  categories: ReadonlyArray<{ id: string; name: string }>;
  onUpdate: (variantSku: string, index: number, field: string, value: number) => void;
  onRemove: (variantSku: string, index: number) => void;
}) {
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
}: {
  title: string;
  subtitle?: string;
  enabled?: boolean;
  onToggle?: (checked: boolean) => void;
  onAddTier: () => void;
  tiers: DiscountTier[];
  renderTable: (tiers: DiscountTier[]) => React.ReactNode;
}) {
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

export function VolumeDiscount({ form, product }: Readonly<VolumeDiscountProps>) {
  const { toast } = useToast();
  const variants = product?.product_by_variant || [];
  
  // Get customer price categories from the form
  const customerPrices = form.watch('customerPrices');
  const marketplacePrices = form.watch('marketplacePrices');
  
  // Transform all prices into categories array - include both customer and marketplace prices
  const categories = useMemo(() => {
    const result: Array<{ id: string; name: string }> = [];
    
    // Create a set to track unique categories
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
  }, [customerPrices, marketplacePrices]);

  // Main state
  const [isEnabled, setIsEnabled] = useState(false);
  const [customizePerVariant, setCustomizePerVariant] = useState(false);
  const [globalTiers, setGlobalTiers] = useState<DiscountTier[]>([
    { id: 'tier-1', quantity: 10, discount: 5, prices: {} },
    { id: 'tier-2', quantity: 50, discount: 10, prices: {} },
    { id: 'tier-3', quantity: 100, discount: 15, prices: {} },
  ]);
  const [variantDiscounts, setVariantDiscounts] = useState<Record<string, VariantDiscount>>({});

  // Helper to combine all price sources - with additional type safety
  const getCombinedPrices = useCallback(() => {
    // Create a safe clone - handle null, undefined, and non-objects
    const safeClone = (obj: any) => {
      if (!obj || typeof obj !== 'object') return {};
      try {
        return JSON.parse(JSON.stringify(obj));
      } catch (e) {
        console.error("Error cloning price object:", e);
        return {};
      }
    };
    
    // Combine prices with proper error handling
    const combined = {
      ...safeClone(customerPrices),
      ...safeClone(marketplacePrices)
    };
    
    return combined;
  }, [customerPrices, marketplacePrices]);

  // Update all prices when customer or marketplace prices change
  useEffect(() => {
    const allPrices = getCombinedPrices();
    
    // Only update if we have prices and categories
    if (Object.keys(allPrices).length > 0 && categories.length > 0) {
      // Update global tier prices
      setGlobalTiers(prevTiers => 
        prevTiers.map(tier => ({
          ...tier,
          prices: utils.calculateDiscountedPrices(allPrices, tier.discount)
        }))
      );
      
      // Update variant tier prices
      setVariantDiscounts(prev => {
        const updated = { ...prev };
        Object.keys(updated).forEach(sku => {
          if (updated[sku]?.enabled) {
            updated[sku].tiers = updated[sku].tiers.map(tier => ({
              ...tier,
              prices: utils.calculateDiscountedPrices(allPrices, tier.discount)
            }));
          }
        });
        return updated;
      });
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

  // Add new tier handler
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
    
    // Get combined prices
    const allPrices = getCombinedPrices();
    
    if (customizePerVariant && variantSku && variantSku !== 'global') {
      setVariantDiscounts(prev => {
        const variant = prev[variantSku] || { enabled: true, tiers: [] };
        const defaultQuantity = utils.getDefaultQuantity(variant.tiers);
        
        return {
          ...prev,
          [variantSku]: {
            ...variant,
            tiers: [
              ...(variant.tiers || []),
              utils.createNewTier(allPrices, defaultQuantity)
            ]
          }
        };
      });
    } else {
      // Add global tier with a safe default quantity
      const defaultQuantity = utils.getDefaultQuantity(globalTiers);
      const newTier = utils.createNewTier(allPrices, defaultQuantity);
      
      setGlobalTiers(prev => [...prev, newTier]);
      
      // Sync new tier to all variants if not in custom variant mode
      if (!customizePerVariant) {
        setVariantDiscounts(prev => {
          const updated = { ...prev };
          variants.forEach(variant => {
            const sku = variant.sku_product_variant;
            if (updated[sku]?.enabled) {
              updated[sku] = {
                ...updated[sku],
                tiers: [
                  ...(updated[sku].tiers || []), 
                  { ...newTier, id: `${newTier.id}-${sku}` }
                ]
              };
            }
          });
          return updated;
        });
      }
    }
  }, [customizePerVariant, variants, getCombinedPrices, globalTiers, categories, toast]);

  // Show validation error
  const showError = useCallback((error: string) => {
    toast({
      variant: 'destructive',
      title: 'Invalid Input',
      description: error
    });
  }, [toast]);

  // Update tier data - cleaned version without debug logs
  const updateTier = useCallback((
    variantSku: string,
    index: number,
    field: string,
    value: number
  ) => {
    // Only proceed if we have categories
    if (categories.length === 0) {
      showError("Cannot update tier: No price categories available");
      return;
    }
    
    // Get combined prices
    const allPrices = getCombinedPrices();
    
    // Check for missing price data
    const missingPrices = categories.filter(cat => !allPrices[cat.id]);
    if (missingPrices.length > 0) {
      // Only log in dev environment
      if (process.env.NODE_ENV === 'development') {
        console.warn("Missing price data for categories:", 
          missingPrices.map(c => c.id).join(", "));
      }
    }
    
    if (variantSku === 'global') {
      setGlobalTiers(prev => {
        // Validate input for specific fields
        if (field === 'quantity' || field === 'discount') {
          const error = utils.validateTier(prev, index, field as keyof DiscountTier, value);
          if (error) {
            setTimeout(() => showError(error), 0);
            return prev;
          }
        }
        
        // Create new tiers array to ensure state updates
        const updatedTiers = prev.map((tier, i) => {
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
        
        return updatedTiers;
      });
      
      // Force rerender by setting state again
      setTimeout(() => {
        setGlobalTiers(current => [...current]);
      }, 10);
      
    } else {
      setVariantDiscounts(prev => {
        const variant = prev[variantSku];
        if (!variant) return prev;
        
        // Validate input for specific fields
        if (field === 'quantity' || field === 'discount') {
          const error = utils.validateTier(variant.tiers, index, field as keyof DiscountTier, value);
          if (error) {
            setTimeout(() => showError(error), 0);
            return prev;
          }
        }
        
        // Create new updated variant to ensure state updates
        const updatedVariant = {
          ...variant,
          tiers: variant.tiers.map((tier, i) => {
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
          })
        };
        
        // Create a new object to ensure state updates
        return { ...prev, [variantSku]: updatedVariant };
      });
      
      // Force rerender by setting state again
      setTimeout(() => {
        setVariantDiscounts(current => ({...current}));
      }, 10);
    }
  }, [getCombinedPrices, showError, categories]);

  // Remove tier handler
  const removeTier = useCallback((variantSku: string, index: number) => {
    if (variantSku === 'global') {
      setGlobalTiers(prev => prev.filter((_, i) => i !== index));
    } else {
      setVariantDiscounts(prev => {
        const variant = prev[variantSku];
        if (!variant) return prev;
        
        return {
          ...prev,
          [variantSku]: {
            ...variant,
            tiers: variant.tiers.filter((_, i) => i !== index)
          }
        };
      });
    }
  }, []);

  // Handle variant toggle
  const handleVariantToggle = useCallback((sku: string, checked: boolean) => {
    setVariantDiscounts(prev => ({
      ...prev,
      [sku]: {
        ...prev[sku],
        enabled: checked
      }
    }));
  }, []);

  // Render table with appropriate props - cleaned version without debugging
  const renderTable = useCallback((variantSku: string) => (tiers: DiscountTier[]) => (
    <DiscountTable
      variantSku={variantSku}
      tiers={tiers}
      categories={categories}
      onUpdate={updateTier}
      onRemove={removeTier}
    />
  ), [categories, updateTier, removeTier]);

  // Don't render anything if there are no variants
  if (!variants.length) {
    return null;
  }

  // Show a clearer initial state if we have no price categories
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
              renderTable={renderTable('global')}
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
                    renderTable={renderTable(sku)}
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