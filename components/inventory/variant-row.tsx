import React from 'react';
import { Button } from '@/components/ui/button';
import { TableCell, TableRow } from '@/components/ui/table';
import { Barcode } from 'lucide-react';
import { formatDate } from '@/lib/utils/format';
import type { InventoryProduct, InventoryProductVariant } from '@/types/inventory';

interface VariantRowProps {
  readonly variant: InventoryProductVariant;
  readonly product: InventoryProduct;
  readonly onShowBarcode: () => void;
}

export function VariantRow({ variant, product, onShowBarcode }: VariantRowProps) {
  return (
    <TableRow className="bg-muted/30 hover:bg-muted/50 transition-colors">
      <TableCell className="pl-10 font-mono text-sm">
        {variant.sku_product_variant}
      </TableCell>
      <TableCell className="pl-10">
        {variant.full_product_name}
      </TableCell>
      <TableCell colSpan={4}>
        {product.variants.map((v) => (
          <div key={v.id} className="text-sm text-muted-foreground">
            {v.variant_name}: {v.values.map((val) => val.variant_value_name).join(', ')}
          </div>
        ))}
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
