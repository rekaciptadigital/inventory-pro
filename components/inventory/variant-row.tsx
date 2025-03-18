import React from 'react';
import { Button } from '@/components/ui/button';
import { TableCell, TableRow } from '@/components/ui/table';
import { Barcode } from 'lucide-react';
import { CopyToClipboard } from '@/components/ui/copy-to-clipboard';
import { getVariantDetails } from '@/lib/utils/variant-helper';
import type { InventoryProduct, InventoryProductVariant } from '@/types/inventory';

interface VariantRowProps {
  readonly variant: InventoryProductVariant;
  readonly product: InventoryProduct;
  readonly onShowBarcode: () => void;
}

export function VariantRow({ variant, product, onShowBarcode }: VariantRowProps) {
  const variantDetails = getVariantDetails(variant, product);
  
  // Get vendor SKU from variant data
  const getVendorSkuFromVariant = () => {
    // Use type assertion to access sku_vendor since it's not in the type definition
    const variantWithVendorSku = variant as InventoryProductVariant & { sku_vendor?: string };
    
    // Check if sku_vendor exists
    if (variantWithVendorSku.sku_vendor) {
      return variantWithVendorSku.sku_vendor;
    }
    
    // Return dash if no vendor SKU found
    return '-';
  };
  
  return (
    <TableRow className="bg-muted/30 hover:bg-muted/50 transition-colors">
      {/* Single cell that spans the entire row width */}
      <TableCell colSpan={8} className="p-0">
        {/* Custom layout for variant information with independent column sizing */}
        <div className="flex items-center py-2 pl-2 pr-4 gap-4">
          {/* Arrow indicator and SKU */}
          <div className="flex items-center w-[180px] pl-4">
            <span className="mr-2">→</span>
            <CopyToClipboard 
              value={variant.sku_product_variant}
              className="font-mono text-sm"
              tooltipText="Copy variant SKU"
            />
          </div>
          
          {/* Product name */}
          <div className="flex-grow min-w-[200px] max-w-[350px]">
            <CopyToClipboard
              value={variant.full_product_name}
              tooltipText="Copy variant name"
            />
          </div>
          
          {/* Vendor SKU */}
          <div className="w-[150px]">
            {getVendorSkuFromVariant()}
          </div>
          
          {/* Variant details */}
          <div className="flex-grow">
            {Object.entries(variantDetails).length > 0 ? (
              <div className="flex flex-wrap gap-x-4">
                {Object.entries(variantDetails).map(([variantName, valueName]) => (
                  <div key={variantName} className="text-sm text-muted-foreground">
                    <span className="font-medium">{variantName}:</span> {valueName}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground italic">No variant details available</div>
            )}
          </div>
          
          {/* Actions */}
          <div className="flex items-center justify-end w-[80px]">
            <Button variant="ghost" size="icon" onClick={onShowBarcode}>
              <Barcode className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </TableCell>
    </TableRow>
  );
}
