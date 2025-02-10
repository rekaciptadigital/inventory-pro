'use client';

import { useState, useCallback } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import { formatCurrency } from '@/lib/utils/format';
import { usePriceCategories } from '@/lib/hooks/use-price-categories';
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
  readonly categories: ReadonlyArray<{ readonly name: string }>;
  readonly onUpdate: (variantSku: string, index: number, field: string, value: number) => void;
  readonly onRemove: (variantSku: string, index: number) => void;
}

interface DiscountTierRowProps {
  readonly tier: DiscountTier;
  readonly index: number;
  readonly variantSku: string;
  readonly categories: ReadonlyArray<{ readonly name: string }>;
  readonly onUpdate: (variantSku: string, index: number, field: string, value: number) => void;
  readonly onRemove: (variantSku: string, index: number) => void;
}

// Extract category price inputs component
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
  readonly categories: ReadonlyArray<{ readonly name: string }>;
  readonly onUpdate: (variantSku: string, index: number, field: string, value: number) => void;
}) {
  return (
    <>
      {categories.map((category) => {
        const categoryKey = category.name.toLowerCase();
        return (
          <td key={category.name} className="p-2">
            <Input
              type="text"
              value={formatCurrency(tier.prices[categoryKey] || 0)}
              onChange={(e) => onUpdate(
                variantSku,
                index,
                `prices.${categoryKey}`,
                parseFloat(e.target.value.replace(/\D/g, '')) || 0
              )}
              className="text-right"
            />
          </td>
        );
      })}
    </>
  );
}

// Updated DiscountTierRow to use CategoryPriceInputs
function DiscountTierRow({
  tier,
  index,
  variantSku,
  categories,
  onUpdate,
  onRemove
}: Readonly<DiscountTierRowProps>) {
  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate(variantSku, index, 'quantity', parseInt(e.target.value) || 0);
  };

  const handleDiscountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate(variantSku, index, 'discount', parseFloat(e.target.value) || 0);
  };

  return (
    <tr className="hover:bg-muted/30">
      <td className="p-2">
        <Input
          type="number"
          min="0"
          value={tier.quantity}
          onChange={handleQuantityChange}
          className="w-[100px]"
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
        <Input
          type="number"
          min="0"
          max="100"
          value={tier.discount}
          onChange={handleDiscountChange}
          className="w-[100px] text-right"
        />
      </td>
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
function DiscountTableHeader({ categories }: { readonly categories: ReadonlyArray<{ readonly name: string }> }) {
  return (
    <tr className="bg-muted/50">
      <th className="p-2 text-left">QTY</th>
      {categories.map((category) => (
        <th key={category.name} className="p-2 text-right whitespace-nowrap">
          {category.name} Price
        </th>
      ))}
      <th className="p-2 text-right">Discount (%)</th>
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

// Helper function for updating global tiers
function updateGlobalTier(
  prev: DiscountTier[],
  index: number,
  field: string,
  value: number,
  validateTier: (tiers: DiscountTier[], index: number, field: keyof DiscountTier, value: number) => string | null,
  onError: (error: string) => void
): DiscountTier[] {
  const newTiers = [...prev];
  
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
    const error = validateTier(newTiers, index, field as keyof DiscountTier, value);
    if (error) {
      onError(error);
      return prev;
    }
    newTiers[index] = {
      ...newTiers[index],
      [field]: value
    };
  }
  
  return newTiers;
}

// Helper function for updating variant tiers
function updateVariantTier(
  prev: Record<string, VariantDiscount>,
  variantSku: string,
  index: number,
  field: string,
  value: number,
  validateTier: (tiers: DiscountTier[], index: number, field: keyof DiscountTier, value: number) => string | null,
  onError: (error: string) => void
): Record<string, VariantDiscount> {
  const variant = prev[variantSku];
  if (!variant) return prev;

  const newTiers = [...variant.tiers];
  
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
    const error = validateTier(newTiers, index, field as keyof DiscountTier, value);
    if (error) {
      onError(error);
      return prev;
    }
    newTiers[index] = {
      ...newTiers[index],
      [field]: value
    };
  }

  return {
    ...prev,
    [variantSku]: {
      ...variant,
      tiers: newTiers
    }
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

export function VolumeDiscount({ form, product }: Readonly<VolumeDiscountProps>) {
  const { toast } = useToast();
  const { categories } = usePriceCategories();
  const variants = product?.product_by_variant || [];
  
  const [isEnabled, setIsEnabled] = useState(false);
  const [customizePerVariant, setCustomizePerVariant] = useState(false);
  const [variantDiscounts, setVariantDiscounts] = useState<Record<string, VariantDiscount>>({});
  const [globalTiers, setGlobalTiers] = useState<DiscountTier[]>([
    { id: 'tier-1', quantity: 10, discount: 5, prices: {} },
    { id: 'tier-2', quantity: 50, discount: 10, prices: {} },
    { id: 'tier-3', quantity: 100, discount: 15, prices: {} },
  ]);

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
    if (customizePerVariant && variantSku) {
      setVariantDiscounts(prev => ({
        ...prev,
        [variantSku]: {
          ...prev[variantSku],
          tiers: [
            ...(prev[variantSku]?.tiers || []),
            { id: newTierId, quantity: 0, discount: 0, prices: {} }
          ]
        }
      }));
    } else {
      // Add global tier and sync to all variants
      const newTier = { id: newTierId, quantity: 0, discount: 0, prices: {} };
      setGlobalTiers(prev => [...prev, newTier]);
      // Sync new tier to all variants
      setVariantDiscounts(prev => {
        const updatedDiscounts = { ...prev };
        variants.forEach(variant => {
          const sku = variant.sku_product_variant;
          updatedDiscounts[sku] = {
            ...updatedDiscounts[sku],
            tiers: [...(prev[sku]?.tiers || []), { ...newTier, id: `${newTier.id}-${sku}` }]
          };
        });
        return updatedDiscounts;
      });
    }
  }, [customizePerVariant, variants]);

  const validateTier = useCallback((
    tiers: DiscountTier[],
    index: number,
    field: keyof DiscountTier,
    value: number
  ): string | null => {
    if (field === 'quantity') {
      // Check for duplicate quantities
      if (tiers.some((tier, i) => i !== index && tier.quantity === value)) {
        return 'Duplicate quantity tier';
      }
      // Check for ascending order
      if (index > 0 && value <= tiers[index - 1].quantity) {
        return 'Quantity must be greater than previous tier';
      }
    } else if (field === 'discount') {
      if (value < 0 || value > 100) {
        return 'Discount must be between 0 and 100%';
      }
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

  const updateTier = useCallback((
    variantSku: string,
    index: number,
    field: string,
    value: number
  ) => {
    if (variantSku === 'global') {
      setGlobalTiers(prev => updateGlobalTier(prev, index, field, value, validateTier, showError));
    } else {
      setVariantDiscounts(prev => updateVariantTier(prev, variantSku, index, field, value, validateTier, showError));
    }
  }, [validateTier, showError]);

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