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
  quantity: number;
  discount: number;
  prices: Record<string, number>;  // Changed: remove price, add prices per category
}

interface VariantDiscount {
  enabled: boolean;
  tiers: DiscountTier[];
}

export function VolumeDiscount({ form, product }: Readonly<VolumeDiscountProps>) {
  const { toast } = useToast();
  const { categories } = usePriceCategories();
  const variants = product?.product_by_variant || [];
  
  const [isEnabled, setIsEnabled] = useState(false);
  const [customizePerVariant, setCustomizePerVariant] = useState(false);
  const [variantDiscounts, setVariantDiscounts] = useState<Record<string, VariantDiscount>>({});

  // Default tiers for new discount rules
  const defaultTiers: DiscountTier[] = [
    { quantity: 10, discount: 5, prices: {} },
    { quantity: 50, discount: 10, prices: {} },
    { quantity: 100, discount: 15, prices: {} },
  ];

  const addQuantityTier = useCallback((variantSku?: string) => {
    if (customizePerVariant && variantSku) {
      setVariantDiscounts(prev => ({
        ...prev,
        [variantSku]: {
          ...prev[variantSku],
          tiers: [
            ...(prev[variantSku]?.tiers || []),
            { quantity: 0, discount: 0, prices: {} }
          ]
        }
      }));
    } else {
      // Add global tier
      setVariantDiscounts(prev => {
        const newTier = { quantity: 0, discount: 0, prices: {} };
        const updatedDiscounts = { ...prev };
        
        // Apply new tier to all variants
        variants.forEach(variant => {
          const sku = variant.sku_product_variant;
          updatedDiscounts[sku] = {
            ...updatedDiscounts[sku],
            tiers: [...(updatedDiscounts[sku]?.tiers || []), newTier]
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

  const updateTier = useCallback((
    variantSku: string,
    index: number,
    field: string,
    value: number
  ) => {
    setVariantDiscounts(prev => {
      const variant = prev[variantSku];
      if (!variant) return prev;

      const newTiers = [...variant.tiers];
      
      // Handle nested price updates
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
          toast({
            variant: 'destructive',
            title: 'Invalid Input',
            description: error
          });
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
    });
  }, [validateTier, toast]);

  const removeTier = useCallback((variantSku: string, index: number) => {
    setVariantDiscounts(prev => ({
      ...prev,
      [variantSku]: {
        ...prev[variantSku],
        tiers: prev[variantSku].tiers.filter((_, i) => i !== index)
      }
    }));
  }, []);

  const renderDiscountTable = useCallback((variantSku: string, tiers: DiscountTier[] = []) => (
    <table className="w-full mt-4">
      <thead>
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
      </thead>
      <tbody className="divide-y">
        {tiers.map((tier, index) => (
          <tr key={index} className="hover:bg-muted/30">
            <td className="p-2">
              <Input
                type="number"
                min="0"
                value={tier.quantity}
                onChange={(e) => updateTier(variantSku, index, 'quantity', parseInt(e.target.value) || 0)}
                className="w-[100px]"
              />
            </td>
            {categories.map((category) => {
              const categoryKey = category.name.toLowerCase();
              return (
                <td key={category.name} className="p-2">
                  <Input
                    type="text"
                    value={formatCurrency(tier.prices[categoryKey] || 0)}
                    onChange={(e) => updateTier(
                      variantSku,
                      index,
                      `prices.${categoryKey}`,
                      parseFloat(e.target.value.replace(/[^0-9]/g, '')) || 0
                    )}
                    className="text-right"
                  />
                </td>
              );
            })}
            <td className="p-2">
              <Input
                type="number"
                min="0"
                max="100"
                value={tier.discount}
                onChange={(e) => updateTier(variantSku, index, 'discount', parseFloat(e.target.value) || 0)}
                className="w-[100px] text-right"
              />
            </td>
            <td className="p-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeTier(variantSku, index)}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  ), [updateTier, removeTier, categories]);

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
                onCheckedChange={setCustomizePerVariant}
              />
            </div>
          )}
        </div>
      </div>

      {isEnabled && (
        <div className="space-y-6">
          {!customizePerVariant ? (
            // Global discount rules
            <div className="border rounded-lg p-4">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-medium">Global Discount Rules</h4>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addQuantityTier()}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Quantity
                </Button>
              </div>
              {renderDiscountTable('global', defaultTiers)}
            </div>
          ) : (
            // Per-variant discount rules
            <div className="space-y-6">
              {variants.map((variant) => {
                const variantDiscount = variantDiscounts[variant.sku_product_variant] || {
                  enabled: true,
                  tiers: [...defaultTiers]
                };

                return (
                  <div key={variant.sku_product_variant} className="border rounded-lg p-4">
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
                          onCheckedChange={(checked) => setVariantDiscounts(prev => ({
                            ...prev,
                            [variant.sku_product_variant]: {
                              ...prev[variant.sku_product_variant],
                              enabled: checked
                            }
                          }))}
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => addQuantityTier(variant.sku_product_variant)}
                          disabled={!variantDiscount.enabled}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Quantity
                        </Button>
                      </div>
                    </div>
                    {variantDiscount.enabled && renderDiscountTable(
                      variant.sku_product_variant,
                      variantDiscount.tiers
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}