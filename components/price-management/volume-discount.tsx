'use client';

import { useState, useCallback, useEffect } from 'react';
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
  id: string;  // Add unique identifier
  quantity: number;
  discount: number;
  prices: Record<string, number>;  // Changed: remove price, add prices per category
}

interface VariantDiscount {
  enabled: boolean;
  tiers: DiscountTier[];
}

interface DiscountTableProps {
  readonly variantSku: string;
  readonly tiers: ReadonlyArray<DiscountTier>;
  readonly categories: ReadonlyArray<{ readonly name: string, readonly id: string }>;
  readonly onUpdate: (variantSku: string, index: number, field: string, value: number) => void;
  readonly onRemove: (variantSku: string, index: number) => void;
}

interface DiscountTierRowProps {
  readonly tier: DiscountTier;
  readonly index: number;
  readonly variantSku: string;
  readonly categories: ReadonlyArray<{ readonly name: string, readonly id: string }>;
  readonly onUpdate: (variantSku: string, index: number, field: string, value: number) => void;
  readonly onRemove: (variantSku: string, index: number) => void;
}

// CategoryPriceInputs component that uses category.id - make fields read-only
function CategoryPriceInputs({
  tier,
  variantSku,
  index,
  categories,
  onUpdate
}: {
  readonly tier: DiscountTier;
  readonly variantSku: string;
  readonly index: number;
  readonly categories: ReadonlyArray<{ readonly name: string; readonly id: string }>;
  readonly onUpdate: (variantSku: string, index: number, field: string, value: number) => void;
}) {
  return (
    <>
      {categories.map((category) => {
        const categoryKey = category.id;
        return (
          <td key={category.id} className="p-2">
            <Input
              type="text"
              value={formatCurrency(tier.prices[categoryKey] || 0)}
              readOnly
              disabled
              className="text-right bg-muted cursor-not-allowed"
            />
          </td>
        );
      })}
    </>
  );
}

// Updated DiscountTierRow to handle input completion properly
function DiscountTierRow({
  tier,
  index,
  variantSku,
  categories,
  onUpdate,
  onRemove
}: Readonly<DiscountTierRowProps>) {
  // Add local state to track input values during typing
  const [localQuantity, setLocalQuantity] = useState(tier.quantity.toString());
  const [localDiscount, setLocalDiscount] = useState(tier.discount.toString());
  
  // Update local state when props change
  useEffect(() => {
    setLocalQuantity(tier.quantity.toString());
    setLocalDiscount(tier.discount.toString());
  }, [tier.quantity, tier.discount]);

  // Only update on blur or Enter key
  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Just update the local value during typing
    setLocalQuantity(e.target.value);
  };
  
  const handleQuantityBlur = () => {
    // Only update parent state when input is complete
    const value = parseInt(localQuantity) || 0;
    if (value !== tier.quantity) {
      onUpdate(variantSku, index, 'quantity', value);
    }
  };
  
  const handleQuantityKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleQuantityBlur();
    }
  };
  
  const handleDiscountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalDiscount(e.target.value);
  };
  
  const handleDiscountBlur = () => {
    const value = parseFloat(localDiscount) || 0;
    if (value !== tier.discount) {
      onUpdate(variantSku, index, 'discount', value);
    }
  };
  
  const handleDiscountKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleDiscountBlur();
    }
  };

  return (
    <tr className="hover:bg-muted/30">
      <td className="p-2">
        <Input
          type="number"
          min="0"
          value={localQuantity}
          onChange={handleQuantityChange}
          onBlur={handleQuantityBlur}
          onKeyDown={handleQuantityKeyDown}
          className="w-[100px]"
        />
      </td>
      <td className="p-2">
        <Input
          type="number"
          min="0"
          max="100"
          value={localDiscount}
          onChange={handleDiscountChange}
          onBlur={handleDiscountBlur}
          onKeyDown={handleDiscountKeyDown}
          className="w-[100px] text-right"
        />
      </td>
      <CategoryPriceInputs
        tier={tier}
        variantSku={variantSku}
        index={index}
        categories={categories}
        onUpdate={onUpdate}
      />
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

// Extract table header component
function DiscountTableHeader({ categories }: { readonly categories: ReadonlyArray<{ readonly name: string, readonly id: string }> }) {
  return (
    <tr className="bg-muted/50">
      <th className="p-2 text-left">QTY</th>
      <th className="p-2 text-right">Discount (%)</th>
      {categories.map((category) => (
        <th key={category.id} className="p-2 text-right whitespace-nowrap">
          {category.name} Price
        </th>
      ))}
      <th className="p-2 w-[100px]"></th>
    </tr>
  );
}

// Update DiscountTable to use the new header component
function DiscountTable({
  variantSku,
  tiers,
  categories,
  onUpdate,
  onRemove
}: Readonly<DiscountTableProps>) {
  return (
    <table className="w-full mt-4">
      <thead>
        <DiscountTableHeader categories={categories} />
      </thead>
      <tbody className="divide-y">
        {tiers.map((tier, index) => (
          <DiscountTierRow
            key={tier.id}
            tier={tier}
            index={index}
            variantSku={variantSku}
            categories={categories}
            onUpdate={onUpdate}
            onRemove={onRemove}
          />
        ))}
      </tbody>
    </table>
  );
}

// Helper function for updating global tiers - Remove direct toast calls during rendering
function updateGlobalTier(
  prev: DiscountTier[],
  index: number,
  field: string,
  value: number,
  validateTier: (tiers: DiscountTier[], index: number, field: keyof DiscountTier, value: number) => string | null
): { newTiers: DiscountTier[], error: string | null } {
  const newTiers = [...prev];
  let error: string | null = null;
  
  if (field.startsWith('prices.')) {
    const categoryKey = field.split('.')[1];
    newTiers[index] = {
      ...newTiers[index],
      prices: {
        ...newTiers[index].prices,
        [categoryKey]: value
      }
    };
  } else {
    error = validateTier(newTiers, index, field as keyof DiscountTier, value);
    if (error) {
      return { newTiers: prev, error };
    }
    newTiers[index] = {
      ...newTiers[index],
      [field]: value
    };
  }
  
  return { newTiers, error: null };
}

// Helper function for updating variant tiers - Remove direct toast calls
function updateVariantTier(
  prev: Record<string, VariantDiscount>,
  variantSku: string,
  index: number,
  field: string,
  value: number,
  validateTier: (tiers: DiscountTier[], index: number, field: keyof DiscountTier, value: number) => string | null
): { newVariants: Record<string, VariantDiscount>, error: string | null } {
  const variant = prev[variantSku];
  if (!variant) return { newVariants: prev, error: null };

  const newTiers = [...variant.tiers];
  let error: string | null = null;
  
  if (field.startsWith('prices.')) {
    const categoryKey = field.split('.')[1];
    newTiers[index] = {
      ...newTiers[index],
      prices: {
        ...newTiers[index].prices,
        [categoryKey]: value
      }
    };
  } else {
    error = validateTier(newTiers, index, field as keyof DiscountTier, value);
    if (error) {
      return { newVariants: prev, error };
    }
    newTiers[index] = {
      ...newTiers[index],
      [field]: value
    };
  }

  return { 
    newVariants: {
      ...prev,
      [variantSku]: {
        ...variant,
        tiers: newTiers
      }
    },
    error: null 
  };
}

// Extract variant card component
function VariantDiscountCard({
  variant,
  variantDiscount,
  onToggle,
  onAddTier,
  renderTable
}: {
  readonly variant: InventoryProduct['product_by_variant'][0];
  readonly variantDiscount: VariantDiscount;
  readonly onToggle: (sku: string, checked: boolean) => void;
  readonly onAddTier: (sku: string) => void;
  readonly renderTable: (sku: string, tiers: DiscountTier[]) => React.ReactNode;
}) {
  return (
    <div className="border rounded-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h4 className="font-medium">{variant.full_product_name}</h4>
          <p className="text-sm text-muted-foreground">
            SKU: {variant.sku_product_variant}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Switch
            checked={variantDiscount.enabled}
            onCheckedChange={(checked) => onToggle(variant.sku_product_variant, checked)}
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => onAddTier(variant.sku_product_variant)}
            disabled={!variantDiscount.enabled}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Quantity
          </Button>
        </div>
      </div>
      {variantDiscount.enabled && renderTable(
        variant.sku_product_variant,
        variantDiscount.tiers
      )}
    </div>
  );
}

// Extract global discount card component
function GlobalDiscountCard({
  onAddTier,
  renderTable,
  tiers
}: {
  readonly onAddTier: () => void;
  readonly renderTable: (sku: string, tiers: DiscountTier[]) => React.ReactNode;
  readonly tiers: DiscountTier[];
}) {
  return (
    <div className="border rounded-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <h4 className="font-medium">Global Discount Rules</h4>
        <Button
          variant="outline"
          size="sm"
          onClick={onAddTier}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Quantity
        </Button>
      </div>
      {renderTable('global', tiers)}
    </div>
  );
}

// Update utility function to handle complex price structure
function calculateDiscountedPrices(
  basePrices: Record<string, { 
    basePrice: number; 
    taxAmount: number; 
    taxInclusivePrice: number; 
    appliedTaxPercentage: number; 
  }>,
  discountPercentage: number
): Record<string, number> {
  const discountedPrices: Record<string, number> = {};
  
  Object.entries(basePrices).forEach(([category, priceData]) => {
    // Use the tax-inclusive price and apply the discount
    const originalPrice = priceData.taxInclusivePrice;
    discountedPrices[category] = Math.round(originalPrice * (1 - discountPercentage / 100));
  });
  
  return discountedPrices;
}

// Extract variant state management utilities
function updateVariantTiersWithDiscount(
  variantDiscounts: Record<string, VariantDiscount>,
  customerPrices: Record<string, any>,
  sku: string, 
  index: number, 
  value: number,
  validateTier: (tiers: DiscountTier[], index: number, field: keyof DiscountTier, value: number) => string | null,
  onError: (error: string) => void
): Record<string, VariantDiscount> {
  const variant = variantDiscounts[sku];
  if (!variant) return variantDiscounts;
  
  const error = validateTier(variant.tiers, index, 'discount', value);
  if (error) {
    onError(error);
    return variantDiscounts;
  }
  
  const newTiers = [...variant.tiers];
  newTiers[index] = {
    ...newTiers[index],
    discount: value,
    prices: calculateDiscountedPrices(customerPrices, value)
  };
  
  return {
    ...variantDiscounts,
    [sku]: {
      ...variant,
      tiers: newTiers
    }
  };
}

function updateGlobalTiersWithDiscount(
  prevTiers: DiscountTier[], 
  customerPrices: Record<string, any>,
  index: number, 
  value: number,
  validateTier: (tiers: DiscountTier[], index: number, field: keyof DiscountTier, value: number) => string | null,
  onError: (error: string) => void
): DiscountTier[] {
  const error = validateTier(prevTiers, index, 'discount', value);
  if (error) {
    onError(error);
    return prevTiers;
  }
  
  const newTiers = [...prevTiers];
  newTiers[index] = {
    ...newTiers[index],
    discount: value,
    prices: calculateDiscountedPrices(customerPrices, value)
  };
  
  return newTiers;
}

// Update variant discounts when customer prices change
function updateAllVariantDiscountsWithPrices(
  variantDiscounts: Record<string, VariantDiscount>,
  customerPrices: Record<string, any>
): Record<string, VariantDiscount> {
  const newDiscounts = { ...variantDiscounts };
  
  Object.keys(newDiscounts).forEach(sku => {
    const variant = newDiscounts[sku];
    // Use optional chaining instead of explicit null check
    if (variant?.enabled) {
      variant.tiers = variant.tiers.map(tier => ({
        ...tier,
        prices: calculateDiscountedPrices(customerPrices, tier.discount)
      }));
    }
  });
  
  return newDiscounts;
}

export function VolumeDiscount({ form, product }: Readonly<VolumeDiscountProps>) {
  const { toast } = useToast();
  const variants = product?.product_by_variant || [];
  
  // Get customer price categories from the form with deeper watch
  const customerPrices = form.watch('customerPrices');
  
  // Transform customer prices into categories array
  const categories = Object.keys(customerPrices || {}).map(key => ({
    id: key,
    name: key.charAt(0).toUpperCase() + key.slice(1) // Capitalize first letter
  }));

  const [isEnabled, setIsEnabled] = useState(false);
  const [customizePerVariant, setCustomizePerVariant] = useState(false);
  const [variantDiscounts, setVariantDiscounts] = useState<Record<string, VariantDiscount>>({});
  const [globalTiers, setGlobalTiers] = useState<DiscountTier[]>([
    { id: 'tier-1', quantity: 10, discount: 5, prices: {} },
    { id: 'tier-2', quantity: 50, discount: 10, prices: {} },
    { id: 'tier-3', quantity: 100, discount: 15, prices: {} },
  ]);

  // Debug logging to see what's in customerPrices
  useEffect(() => {
    console.log('Customer Prices:', customerPrices);
  }, [customerPrices]);

  // Initialize tier prices based on customer prices and discount percentages
  // This effect runs when customerPrices change
  useEffect(() => {
    if (customerPrices && Object.keys(customerPrices).length > 0) {
      console.log('Updating global tiers with customer prices');
      
      setGlobalTiers(prevTiers => 
        prevTiers.map(tier => ({
          ...tier,
          prices: calculateDiscountedPrices(customerPrices, tier.discount)
        }))
      );
      
      // Also update variant discounts if they exist
      if (Object.keys(variantDiscounts).length > 0) {
        setVariantDiscounts(prev => updateAllVariantDiscountsWithPrices(prev, customerPrices));
      }
    }
  }, [customerPrices]);

  // Also update prices whenever enabled state changes
  useEffect(() => {
    if (isEnabled && customerPrices && Object.keys(customerPrices).length > 0) {
      console.log('Updating prices because volume discount was enabled');
      setGlobalTiers(prevTiers => 
        prevTiers.map(tier => ({
          ...tier,
          prices: calculateDiscountedPrices(customerPrices, tier.discount)
        }))
      );
    }
  }, [isEnabled, customerPrices]);

  // Helper function to create variant tiers from global tiers
  const createVariantTiersFromGlobal = (globalTiers: DiscountTier[], sku: string) => 
    globalTiers.map(tier => ({ ...tier, id: `${tier.id}-${sku}` }));

  // Add handler to sync variant tiers with global tiers
  const syncVariantTiersWithGlobal = useCallback(() => {
    setVariantDiscounts(prev => {
      const updatedDiscounts = { ...prev };
      variants.forEach(variant => {
        const sku = variant.sku_product_variant;
        updatedDiscounts[sku] = {
          enabled: true,
          tiers: createVariantTiersFromGlobal(globalTiers, sku)
        };
      });
      return updatedDiscounts;
    });
  }, [variants, globalTiers]);

  // Update customizePerVariant switch handler
  const handleCustomizePerVariantChange = useCallback((checked: boolean) => {
    setCustomizePerVariant(checked);
    if (checked) {
      // When enabling customize per variant, sync all variants with current global tiers
      syncVariantTiersWithGlobal();
    }
  }, [syncVariantTiersWithGlobal]);

  // Update addQuantityTier to sync with variants in global mode
  const addQuantityTier = useCallback((variantSku?: string) => {
    const newTierId = `tier-${Date.now()}`;
    
    // Create new tier with prices calculated based on customer prices
    const newTierPrices = calculateDiscountedPrices(customerPrices, 0);
    
    // Function to determine a safe default quantity value (higher than the last tier)
    const getDefaultQuantity = (tiers: DiscountTier[]): number => {
      if (tiers.length === 0) return 1;
      // Find the highest quantity and add 10 as a safe increment
      const highestQuantity = Math.max(...tiers.map(t => t.quantity));
      return highestQuantity + 10;
    };
    
    if (customizePerVariant && variantSku) {
      setVariantDiscounts(prev => {
        const variant = prev[variantSku] || { enabled: true, tiers: [] };
        const defaultQuantity = getDefaultQuantity(variant.tiers);
        
        return {
          ...prev,
          [variantSku]: {
            ...variant,
            tiers: [
              ...(variant.tiers || []),
              { 
                id: newTierId, 
                quantity: defaultQuantity, 
                discount: 0, 
                prices: newTierPrices 
              }
            ]
          }
        };
      });
    } else {
      // Add global tier with a safe default quantity
      const defaultQuantity = getDefaultQuantity(globalTiers);
      const newTier = { 
        id: newTierId, 
        quantity: defaultQuantity, 
        discount: 0, 
        prices: newTierPrices 
      };
      
      setGlobalTiers(prev => [...prev, newTier]);
      
      // Sync new tier to all variants
      setVariantDiscounts(prev => {
        const updatedDiscounts = { ...prev };
        variants.forEach(variant => {
          const sku = variant.sku_product_variant;
          updatedDiscounts[sku] = {
            ...updatedDiscounts[sku],
            tiers: [
              ...(prev[sku]?.tiers || []), 
              { ...newTier, id: `${newTier.id}-${sku}` }
            ]
          };
        });
        return updatedDiscounts;
      });
    }
  }, [customizePerVariant, variants, customerPrices, globalTiers]);

  // Extract specific validation logic into separate functions
  function validateQuantity(
    tiers: DiscountTier[],
    index: number,
    value: number
  ): string | null {
    // Don't allow negative or zero quantities
    if (value <= 0) {
      return 'Quantity must be greater than zero';
    }
    
    // Check for duplicate quantities
    if (tiers.some((tier, i) => i !== index && tier.quantity === value)) {
      return 'Duplicate quantity tier';
    }
    
    // Check for ascending order with previous tier
    if (index > 0) {
      const prevTier = tiers[index - 1];
      if (value <= prevTier.quantity) {
        return `Quantity must be greater than ${prevTier.quantity}`;
      }
    }
    
    // Check for descending order with next tier
    if (index < tiers.length - 1) {
      const nextTier = tiers[index + 1];
      if (value >= nextTier.quantity) {
        return `Quantity must be less than ${nextTier.quantity}`;
      }
    }
    
    return null;
  }
  
  function validateDiscount(value: number): string | null {
    if (value < 0 || value > 100) {
      return 'Discount must be between 0 and 100%';
    }
    return null;
  }
  
  // Simplified validation function with reduced complexity
  const validateTier = useCallback((
    tiers: DiscountTier[],
    index: number,
    field: keyof DiscountTier,
    value: number
  ): string | null => {
    if (field === 'quantity') {
      return validateQuantity(tiers, index, value);
    } 
    
    if (field === 'discount') {
      return validateDiscount(value);
    }
    
    return null;
  }, []);

  const showError = useCallback((error: string) => {
    toast({
      variant: 'destructive',
      title: 'Invalid Input',
      description: error
    });
  }, [toast]);

  // Define a more specific type for tier field names
  type TierField = keyof DiscountTier | `prices.${string}`;

  // Simplify update logic by extracting handlers for global and variant tiers
  const handleGlobalTierUpdate = useCallback((
    field: string, // Change from keyof DiscountTier | string to just string
    index: number,
    value: number
  ) => {
    // For price fields
    if (field.startsWith('prices.')) {
      setGlobalTiers(prev => {
        const newTiers = [...prev];
        const categoryKey = field.split('.')[1];
        newTiers[index] = {
          ...newTiers[index],
          prices: {
            ...newTiers[index].prices,
            [categoryKey]: value
          }
        };
        return newTiers;
      });
      return;
    }
    
    // For quantity and discount fields
    setGlobalTiers(prev => {
      // Only pass valid DiscountTier keys to validateTier
      const fieldAsKey = field as keyof DiscountTier;
      const error = validateTier(prev, index, fieldAsKey, value);
      if (error) {
        setTimeout(() => showError(error), 0);
        return prev;
      }
      
      return prev.map((tier, i) => {
        if (i === index) {
          // Update tier with new value
          const updatedTier = { ...tier, [field]: value };
          
          // If discount is updated, also update prices
          if (field === 'discount') {
            updatedTier.prices = calculateDiscountedPrices(customerPrices, value);
          }
          
          return updatedTier;
        }
        return tier;
      });
    });
  }, [validateTier, showError, customerPrices]);
  
  const handleVariantTierUpdate = useCallback((
    variantSku: string,
    field: string, // Change from keyof DiscountTier | string to just string
    index: number,
    value: number
  ) => {
    // For price fields
    if (field.startsWith('prices.')) {
      setVariantDiscounts(prev => {
        const variant = prev[variantSku];
        if (!variant) return prev;
        
        const newTiers = [...variant.tiers];
        const categoryKey = field.split('.')[1];
        newTiers[index] = {
          ...newTiers[index],
          prices: {
            ...newTiers[index].prices,
            [categoryKey]: value
          }
        };
        
        return {
          ...prev,
          [variantSku]: {
            ...variant,
            tiers: newTiers
          }
        };
      });
      return;
    }
    
    // For quantity and discount fields
    setVariantDiscounts(prev => {
      const variant = prev[variantSku];
      if (!variant) return prev;
      
      // Only pass valid DiscountTier keys to validateTier
      const fieldAsKey = field as keyof DiscountTier;
      const error = validateTier(variant.tiers, index, fieldAsKey, value);
      if (error) {
        setTimeout(() => showError(error), 0);
        return prev;
      }
      
      return {
        ...prev,
        [variantSku]: {
          ...variant,
          tiers: variant.tiers.map((tier, i) => {
            if (i === index) {
              const updatedTier = { ...tier, [field]: value };
              
              if (field === 'discount') {
                updatedTier.prices = calculateDiscountedPrices(customerPrices, value);
              }
              
              return updatedTier;
            }
            return tier;
          })
        }
      };
    });
  }, [validateTier, showError, customerPrices]);

  // Simplified updateTier function with reduced complexity
  const updateTier = useCallback((
    variantSku: string,
    index: number,
    field: string,
    value: number
  ) => {
    if (variantSku === 'global') {
      handleGlobalTierUpdate(field, index, value);
    } else {
      handleVariantTierUpdate(variantSku, field, index, value);
    }
  }, [handleGlobalTierUpdate, handleVariantTierUpdate]);

  const removeTier = useCallback((variantSku: string, index: number) => {
    if (variantSku === 'global') {
      setGlobalTiers(prev => prev.filter((_, i) => i !== index));
    } else {
      setVariantDiscounts(prev => ({
        ...prev,
        [variantSku]: {
          ...prev[variantSku],
          tiers: prev[variantSku].tiers.filter((_, i) => i !== index)
        }
      }));
    }
  }, []);

  const renderDiscountTable = useCallback((variantSku: string, tiers: DiscountTier[] = []) => (
    <DiscountTable
      variantSku={variantSku}
      tiers={tiers}
      categories={categories}
      onUpdate={updateTier}
      onRemove={removeTier}
    />
  ), [categories, updateTier, removeTier]);

  const handleVariantToggle = useCallback((sku: string, checked: boolean) => {
    setVariantDiscounts(prev => ({
      ...prev,
      [sku]: {
        ...prev[sku],
        enabled: checked
      }
    }));
  }, []);

  if (!variants.length) {
    return null;
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
            <GlobalDiscountCard
              onAddTier={() => addQuantityTier()}
              renderTable={renderDiscountTable}
              tiers={globalTiers}
            />
          ) : (
            <div className="space-y-6">
              {variants.map((variant) => {
                const variantDiscount = variantDiscounts[variant.sku_product_variant] || {
                  enabled: true,
                  tiers: [...globalTiers]
                };

                return (
                  <VariantDiscountCard
                    key={variant.sku_product_variant}
                    variant={variant}
                    variantDiscount={variantDiscount}
                    onToggle={handleVariantToggle}
                    onAddTier={addQuantityTier}
                    renderTable={renderDiscountTable}
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