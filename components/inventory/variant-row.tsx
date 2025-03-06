import React from 'react';
import { Button } from '@/components/ui/button';
import { TableCell, TableRow } from '@/components/ui/table';
import { Barcode } from 'lucide-react';
import { formatDate } from '@/lib/utils/format';
import { getVariantDetails } from '@/lib/utils/variant-helper';
import type { InventoryProduct, InventoryProductVariant } from '@/types/inventory';

interface VariantRowProps {
  readonly variant: InventoryProductVariant;
  readonly product: InventoryProduct;
  readonly onShowBarcode: () => void;
}

export function VariantRow({ variant, product, onShowBarcode }: VariantRowProps) {
  const variantDetails = getVariantDetails(variant, product);
  
  return (
    <TableRow className="bg-muted/30 hover:bg-muted/50 transition-colors">
      <TableCell className="pl-10 font-mono text-sm">
        {variant.sku_product_variant}
      </TableCell>
      <TableCell className="pl-10">
        {variant.full_product_name}
      </TableCell>
      <TableCell colSpan={4}>
        {Object.entries(variantDetails).length > 0 ? (
          Object.entries(variantDetails).map(([variantName, valueName]) => (
            <div key={variantName} className="text-sm text-muted-foreground">
              {variantName}: {valueName}
            </div>
          ))
        ) : (
          <div className="text-sm text-muted-foreground italic">No variant details available</div>
        )}
      </TableCell>
      <TableCell>{formatDate(variant.created_at)}</TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={onShowBarcode}>
            <Barcode className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}
