'use client';

import { useState, useEffect, useCallback } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { PriceFormFields } from '@/types/form';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { formatCurrency } from '@/lib/utils/format';
import type { InventoryProduct } from '@/types/inventory';

interface VariantPricesProps {
  readonly form: UseFormReturn<PriceFormFields>;
  readonly product: InventoryProduct;
  readonly defaultPriceCategory: string;
}

export function VariantPrices({ form, product, defaultPriceCategory }: Readonly<VariantPricesProps>) {
  const [manualPriceEditing, setManualPriceEditing] = useState(false);
  const defaultPrice = form.watch(`customerPrices.${defaultPriceCategory}.taxInclusivePrice`) || 0;

  const handlePriceChange = useCallback((sku: string, value: string) => {
    const numericValue = parseFloat(value) || 0;
    form.setValue(`variantPrices.${sku}.price`, numericValue, { shouldDirty: true });
  }, [form]);

  const handleStatusChange = useCallback((sku: string, checked: boolean) => {
    form.setValue(`variantPrices.${sku}.status`, checked, { shouldDirty: true });
  }, [form]);

  // Initialize or update variant prices once
  useEffect(() => {
    if (!product?.product_by_variant?.length || !manualPriceEditing) {
      const variants = product?.product_by_variant || [];
      const updatedPrices = variants.reduce((acc, variant) => {
        acc[variant.sku_product_variant] = {
          price: defaultPrice,
          status: form.getValues(`variantPrices.${variant.sku_product_variant}.status`) ?? true
        };
        return acc;
      }, {} as Record<string, { price: number; status: boolean }>);

      form.setValue('variantPrices', updatedPrices, { shouldDirty: true });
    }
  }, [product?.product_by_variant, defaultPrice, manualPriceEditing, form]);

  // Early return if no product or variants
  if (!product?.product_by_variant?.length) {
    return null;
  }

  const variants = product.product_by_variant;

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
                    value={variantPrice.price}
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