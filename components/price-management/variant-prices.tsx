'use client';

import { useState, useEffect } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { PriceFormFields } from '@/types/form';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils/format';
import type { InventoryProduct } from '@/types/inventory';

interface VariantPricesProps {
  form: UseFormReturn<PriceFormFields>;
  product: InventoryProduct;
  defaultPriceCategory: string;
}

export function VariantPrices({ form, product, defaultPriceCategory }: VariantPricesProps) {
  const [manualPriceEditing, setManualPriceEditing] = useState(false);
  const [variantPrices, setVariantPrices] = useState<Record<string, number>>({});
  const [variantStatus, setVariantStatus] = useState<Record<string, boolean>>({});

  // Get the default price from the selected customer category
  const defaultPrice = form.watch(`customerPrices.${defaultPriceCategory}.taxInclusivePrice`) || 0;

  // Initialize variant prices and status
  useEffect(() => {
    if (product?.product_by_variant) {
      const initialPrices: Record<string, number> = {};
      const initialStatus: Record<string, boolean> = {};

      product.product_by_variant.forEach(variant => {
        initialPrices[variant.sku_product_variant] = defaultPrice;
        initialStatus[variant.sku_product_variant] = true;
      });

      setVariantPrices(initialPrices);
      setVariantStatus(initialStatus);
    }
  }, [product.product_by_variant, defaultPrice]);

  // Update variant prices when default price changes
  useEffect(() => {
    if (!manualPriceEditing) {
      setVariantPrices(prev => {
        const updatedPrices = { ...prev };
        Object.keys(updatedPrices).forEach(sku => {
          updatedPrices[sku] = defaultPrice;
        });
        return updatedPrices;
      });
    }
  }, [defaultPrice, manualPriceEditing]);

  const handlePriceChange = (sku: string, value: string) => {
    const numericValue = parseFloat(value) || 0;
    setVariantPrices(prev => ({
      ...prev,
      [sku]: numericValue
    }));
  };

  const handleStatusChange = (sku: string, checked: boolean) => {
    setVariantStatus(prev => ({
      ...prev,
      [sku]: checked
    }));
  };

  // Only show if product has variants
  if (!product.product_by_variant?.length) {
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
          {product.product_by_variant.map((variant) => (
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
                  value={variantPrices[variant.sku_product_variant] || 0}
                  onChange={(e) => handlePriceChange(variant.sku_product_variant, e.target.value)}
                  disabled={!manualPriceEditing}
                  className="w-[150px] text-right"
                />
              </div>

              <div className="flex justify-center">
                <Switch
                  checked={variantStatus[variant.sku_product_variant] || false}
                  onCheckedChange={(checked) => handleStatusChange(variant.sku_product_variant, checked)}
                />
              </div>
            </div>
          ))}
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