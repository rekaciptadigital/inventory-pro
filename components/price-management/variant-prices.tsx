'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { PriceFormFields } from '@/types/form';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { formatCurrency } from '@/lib/utils/format';
import type { InventoryProduct, InventoryProductVariant } from '@/types/inventory';

interface VariantPricesProps {
  readonly form: UseFormReturn<PriceFormFields>;
  readonly product: InventoryProduct;
  readonly defaultPriceCategory: string;
}

export function VariantPrices({ form, product, defaultPriceCategory }: Readonly<VariantPricesProps>) {
  const [manualPriceEditing, setManualPriceEditing] = useState(false);
  
  // Memoize key values
  const variants = useMemo(() => product?.product_by_variant || [], [product]);
  const defaultPrice = useMemo(() => 
    form.watch(`customerPrices.${defaultPriceCategory}.taxInclusivePrice`) || 0,
    [form, defaultPriceCategory]
  );

  // Initialize prices once when component mounts or variants change
  useEffect(() => {
    if (!variants.length) return;

    const currentPrices = form.getValues('variantPrices') || {};
    if (Object.keys(currentPrices).length === 0) {
      const initialPrices = variants.reduce((acc, variant) => {
        acc[variant.sku_product_variant] = {
          price: defaultPrice,
          status: true
        };
        return acc;
      }, {} as Record<string, { price: number; status: boolean }>);

      form.setValue('variantPrices', initialPrices, { shouldDirty: true });
    }
  }, [variants.length]); // Only run on mount or when variants change

  // Update prices when default price changes (if not manual mode)
  useEffect(() => {
    if (manualPriceEditing || !variants.length) return;

    const currentPrices = form.getValues('variantPrices') || {};
    const updatedPrices = {
      ...currentPrices,
      ...variants.reduce((acc, variant) => {
        acc[variant.sku_product_variant] = {
          ...currentPrices[variant.sku_product_variant],
          price: defaultPrice,
        };
        return acc;
      }, {} as Record<string, { price: number; status: boolean }>)
    };

    form.setValue('variantPrices', updatedPrices, { shouldDirty: true });
  }, [defaultPrice, manualPriceEditing]);

  const handlePriceChange = useCallback((sku: string, value: string) => {
    const numericValue = parseFloat(value) || 0;
    form.setValue(`variantPrices.${sku}.price`, numericValue, { shouldDirty: true });
  }, [form]);

  const handleStatusChange = useCallback((sku: string, checked: boolean) => {
    form.setValue(`variantPrices.${sku}.status`, checked, { shouldDirty: true });
  }, [form]);

  // Ensure value is always a number for Input
  const getVariantPrice = useCallback((variant: InventoryProductVariant) => {
    const price = form.watch(`variantPrices.${variant.sku_product_variant}.price`);
    return typeof price === 'number' ? price : defaultPrice;
  }, [form, defaultPrice]);

  if (!variants.length) {
    return null;
  }

  return (
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
        <div className="grid grid-cols-[1fr,auto,auto,auto] gap-4 p-4 bg-muted/50">
          <div>Variant</div>
          <div className="text-right">Default Price</div>
          <div className="text-right">Price</div>
          <div className="text-center">Status</div>
        </div>

        <div className="divide-y">
          {variants.map((variant) => {
            const variantPrice = form.watch(`variantPrices.${variant.sku_product_variant}`) || { 
              price: defaultPrice, 
              status: true 
            };
            
            return (
              <div 
                key={variant.sku_product_variant}
                className="grid grid-cols-[1fr,auto,auto,auto] gap-4 p-4 items-center"
              >
                <div>
                  <div className="font-medium">{variant.full_product_name}</div>
                  <div className="text-sm text-muted-foreground">
                    SKU: {variant.sku_product_variant}
                  </div>
                </div>

                <div className="text-right">
                  {formatCurrency(defaultPrice)}
                </div>

                <div>
                  <Input
                    type="number"
                    min="0"
                    value={getVariantPrice(variant)}
                    onChange={(e) => handlePriceChange(variant.sku_product_variant, e.target.value)}
                    disabled={!manualPriceEditing}
                    className="w-[150px] text-right"
                  />
                </div>

                <div className="flex justify-center">
                  <Switch
                    checked={variantPrice.status}
                    onCheckedChange={(checked) => handleStatusChange(variant.sku_product_variant, checked)}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {manualPriceEditing && (
        <p className="text-sm text-muted-foreground">
          Manual price editing is enabled. Prices will not automatically update when the default price changes.
        </p>
      )}
    </div>
  );
}