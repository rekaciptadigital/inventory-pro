'use client';

import { useEffect, useCallback, Fragment } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { PriceFormFields } from '@/types/form';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { formatCurrency } from '@/lib/utils/format';
import type { InventoryProduct } from '@/types/inventory';
import { VolumeDiscount } from './volume-discount';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import {
  setManualPriceEditing,
  initializeVariantPrices,
  updateVariantPrices,
  updateVariantPrice
} from '@/lib/store/slices/variantPricesSlice';

interface VariantPricesProps {
  readonly form: UseFormReturn<PriceFormFields>;
  readonly product: InventoryProduct;
}

export function VariantPrices({ form, product }: Readonly<VariantPricesProps>) {
  const dispatch = useAppDispatch();
  const { manualPriceEditing, prices: variantPrices } = useAppSelector(state => state.variantPrices);
  const variants = product?.product_by_variant || [];
  
  // Get customer price categories from the form
  const customerPrices = form.watch('customerPrices') || {};
  
  // Use customer price categories to ensure consistency
  const customerCategories = Object.keys(customerPrices).map(key => ({
    id: key,
    name: key.charAt(0).toUpperCase() + key.slice(1) // Capitalize first letter
  }));

  // Initialize variant prices with all categories
  useEffect(() => {
    if (!variants.length || !customerCategories.length) return;
    
    dispatch(initializeVariantPrices({
      variants,
      categories: customerCategories,
      customerPrices
    }));
    
  }, [variants, customerCategories.length, dispatch]);

  // Update variant prices when customer prices change
  useEffect(() => {
    if (!variants.length || !customerCategories.length) return;
    
    dispatch(updateVariantPrices({
      variants,
      categories: customerCategories,
      customerPrices
    }));
    
    // Map Redux state to form structure (adding status field)
    const formattedPrices = Object.entries(variantPrices).reduce((acc, [sku, data]) => {
      acc[sku] = {
        prices: data.prices,
        status: true // Add default status as true since we removed it from Redux
      };
      return acc;
    }, {} as Record<string, { prices: Record<string, number>; status: boolean }>);
    
    // Update the form values with the mapped structure
    form.setValue('variantPrices', formattedPrices, { shouldDirty: true });
    
  }, [customerPrices, variants.length, customerCategories.length, dispatch, variantPrices]);

  // Handle manual price changes
  const handlePriceChange = useCallback((sku: string, category: string, value: string) => {
    const numericValue = parseFloat(value.replace(/\D/g, '')) || 0;
    dispatch(updateVariantPrice({ sku, category, price: numericValue }));
    form.setValue(`variantPrices.${sku}.prices.${category}`, numericValue, { shouldDirty: true });
    // Also maintain status in form value
    form.setValue(`variantPrices.${sku}.status`, true, { shouldDirty: true });
  }, [dispatch, form]);

  const handleManualEditingChange = useCallback((checked: boolean) => {
    dispatch(setManualPriceEditing(checked));
  }, [dispatch]);

  return (
    <div className="space-y-8">
      <div className="rounded-lg border p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium">Product Variant Prices</h3>
            <p className="text-sm text-muted-foreground">
              Manage pricing for individual product variants
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Manual Price Editing</span>
            <Switch
              checked={manualPriceEditing}
              onCheckedChange={handleManualEditingChange}
            />
          </div>
        </div>

        <div className="border rounded-lg">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-muted/50">
                  <th className="p-4 text-left whitespace-nowrap">Variant</th>
                  {customerCategories.map((category) => (
                    <th key={category.id} className="p-4 text-right whitespace-nowrap">
                      {category.name} Price
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {variants.map((variant) => {
                  const variantPrice = variantPrices[variant.sku_product_variant] || {
                    prices: {}
                  };

                  return (
                    <Fragment key={variant.sku_product_variant}>
                      <tr className="hover:bg-muted/30">
                        <td className="p-4">
                          <div className="font-medium">{variant.full_product_name}</div>
                          <div className="text-sm text-muted-foreground">
                            SKU: {variant.sku_product_variant}
                          </div>
                        </td>
                        {customerCategories.map((category) => {
                          return (
                            <td key={`${variant.sku_product_variant}-${category.name}`} className="p-4">
                              <Input
                                type="text"
                                value={formatCurrency(variantPrice.prices[category.id] || 0)}
                                onChange={(e) => handlePriceChange(
                                  variant.sku_product_variant,
                                  category.id,
                                  e.target.value
                                )}
                                disabled={!manualPriceEditing}
                                className={`text-right ${!manualPriceEditing ? 'bg-muted' : ''}`}
                              />
                            </td>
                          );
                        })}
                      </tr>
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {manualPriceEditing && (
          <p className="text-sm text-muted-foreground">
            Manual price editing is enabled. Prices will not automatically update when customer category prices change.
          </p>
        )}
      </div>

      <VolumeDiscount form={form} product={product} />
    </div>
  );
}