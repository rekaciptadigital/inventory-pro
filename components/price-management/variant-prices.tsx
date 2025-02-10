'use client';

import { useState, useEffect, useCallback, Fragment } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { PriceFormFields } from '@/types/form';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { formatCurrency } from '@/lib/utils/format';
import { usePriceCategories } from '@/lib/hooks/use-price-categories';
import type { InventoryProduct } from '@/types/inventory';
import { VolumeDiscount } from './volume-discount';

interface VariantPricesProps {
  readonly form: UseFormReturn<PriceFormFields>;
  readonly product: InventoryProduct;
  readonly defaultPriceCategory: string;
}

export function VariantPrices({ form, product }: Readonly<VariantPricesProps>) {
  const [manualPriceEditing, setManualPriceEditing] = useState(false);
  const { categories } = usePriceCategories();
  const variants = product?.product_by_variant || [];

  // Initialize variant prices
  useEffect(() => {
    if (!variants.length) return;

    const currentPrices = form.getValues('variantPrices') || {};
    if (Object.keys(currentPrices).length === 0) {
      const initialPrices = variants.reduce((acc, variant) => {
        acc[variant.sku_product_variant] = {
          prices: categories.reduce((priceAcc, category) => {
            priceAcc[category.name.toLowerCase()] = 0;
            return priceAcc;
          }, {} as Record<string, number>),
          status: true
        };
        return acc;
      }, {} as Record<string, { prices: Record<string, number>; status: boolean }>);

      form.setValue('variantPrices', initialPrices, { shouldDirty: true });
    }
  }, [variants.length, categories]);

  // Update variant prices when customer prices change
  useEffect(() => {
    if (manualPriceEditing || !variants.length) return;

    const customerPrices = form.getValues('customerPrices');
    const currentPrices = form.getValues('variantPrices') || {};

    const updatedPrices = variants.reduce((acc, variant) => {
      acc[variant.sku_product_variant] = {
        ...currentPrices[variant.sku_product_variant],
        prices: categories.reduce((priceAcc, category) => {
          const categoryKey = category.name.toLowerCase();
          priceAcc[categoryKey] = customerPrices[categoryKey]?.taxInclusivePrice || 0;
          return priceAcc;
        }, {} as Record<string, number>)
      };
      return acc;
    }, {} as Record<string, { prices: Record<string, number>; status: boolean }>);

    form.setValue('variantPrices', updatedPrices, { shouldDirty: true });
  }, [form.watch('customerPrices'), manualPriceEditing]);

  // Update price change handler
  const handlePriceChange = useCallback((sku: string, category: string, value: string) => {
    const numericValue = parseFloat(value) || 0;
    form.setValue(`variantPrices.${sku}.prices.${category}`, numericValue, { shouldDirty: true });
  }, [form]);

  const handleStatusChange = useCallback((sku: string, checked: boolean) => {
    form.setValue(`variantPrices.${sku}.status`, checked, { shouldDirty: true });
  }, [form]);

  if (!variants.length) {
    return null;
  }

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
              onCheckedChange={setManualPriceEditing}
            />
          </div>
        </div>

        <div className="border rounded-lg">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-muted/50">
                  <th className="p-4 text-left whitespace-nowrap">Variant</th>
                  {categories.map((category) => (
                    <th key={category.name} className="p-4 text-right whitespace-nowrap">
                      {category.name} Price
                    </th>
                  ))}
                  <th className="p-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {variants.map((variant) => {
                  const variantPrice = form.watch(`variantPrices.${variant.sku_product_variant}`) || {
                    prices: {},
                    status: true
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
                        {categories.map((category) => {
                          const categoryKey = category.name.toLowerCase();
                          return (
                            <td key={`${variant.sku_product_variant}-${category.name}`} className="p-4">
                              <Input
                                type="text"
                                value={formatCurrency(variantPrice.prices[categoryKey] || 0)}
                                onChange={(e) => handlePriceChange(
                                  variant.sku_product_variant,
                                  categoryKey,
                                  e.target.value.replace(/\D/g, '')
                                )}
                                disabled={!manualPriceEditing}
                                className="text-right"
                              />
                            </td>
                          );
                        })}
                        <td className="p-4 text-center">
                          <Switch
                            checked={variantPrice.status}
                            onCheckedChange={(checked) => handleStatusChange(variant.sku_product_variant, checked)}
                          />
                        </td>
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