'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { BarcodeModal } from '@/components/ui/barcode-modal';
import { VariantBarcodeModal } from '@/components/ui/variant-barcode-modal';
import { useToast } from '@/components/ui/use-toast';
import { ProductRow } from './product-row';
import { VariantRow } from './variant-row';
import type { InventoryProduct, InventoryProductVariant } from '@/types/inventory';

interface ProductListProps {
  readonly products: ReadonlyArray<InventoryProduct>;
  readonly isLoading?: boolean;
  readonly onDelete?: (id: number) => Promise<void>;
}

// Loading state columns
const LOADING_COLUMNS = ['sku', 'name', 'brand', 'type', 'category', 'unit', 'date', 'actions'];

export function ProductList({ products, isLoading, onDelete }: ProductListProps) {
  const router = useRouter();
  const { toast } = useToast();
  
  // Add back the required state declarations
  const [expandedProducts, setExpandedProducts] = useState<Set<number>>(new Set());
  const [barcodeModalOpen, setBarcodeModalOpen] = useState(false);
  const [variantBarcodeModalOpen, setVariantBarcodeModalOpen] = useState(false);
  const [selectedBarcodes, setSelectedBarcodes] = useState<Array<{ sku: string; name: string }>>([]);
  const [selectedVariantBarcode, setSelectedVariantBarcode] = useState<{ sku: string; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);

  // Add back the required handler functions
  const toggleExpand = (productId: number) => {
    const newExpanded = new Set(expandedProducts);
    if (newExpanded.has(productId)) {
      newExpanded.delete(productId);
    } else {
      newExpanded.add(productId);
    }
    setExpandedProducts(newExpanded);
  };

  const handleShowBarcode = (product: InventoryProduct) => {
    const barcodes = [
      { sku: product.sku, name: product.full_product_name },
      ...(product.product_by_variant || []).map(variant => ({
        sku: variant.sku_product_variant,
        name: variant.full_product_name
      }))
    ];
    setSelectedBarcodes(barcodes);
    setBarcodeModalOpen(true);
  };

  const handleShowVariantBarcode = (variant: InventoryProductVariant) => {
    if (!variant.sku_product_variant || !variant.full_product_name) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Invalid variant data"
      });
      return;
    }
    
    setSelectedVariantBarcode({
      sku: variant.sku_product_variant,
      name: variant.full_product_name
    });
    setVariantBarcodeModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!onDelete) return;
    
    setIsDeleting(id);
    try {
      await onDelete(id);
    } finally {
      setIsDeleting(null);
    }
  };

  const renderLoadingState = () => (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          {/* ...existing header... */}
        </TableHeader>
        <TableBody>
          {Array.from({ length: 5 }).map((_, rowIndex) => (
            <TableRow key={`loading-row-${rowIndex + 1}`}>
              {LOADING_COLUMNS.map((column) => (
                <TableCell key={`loading-cell-${column}`}>
                  <Skeleton className="h-6 w-full" />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );

  if (isLoading) {
    return renderLoadingState();
  }

  if (!products?.length) {
    return (
      <div className="border rounded-lg p-8 text-center text-muted-foreground">
        No products found. Click the "Add New Product" button to add your first product.
      </div>
    );
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          {/* ...existing header... */}
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <React.Fragment key={product.id}>
              <ProductRow
                product={product}
                isExpanded={expandedProducts.has(product.id)}
                isDeleting={isDeleting === product.id}
                onToggleExpand={() => toggleExpand(product.id)}
                onShowBarcode={() => handleShowBarcode(product)}
                onEdit={() => router.push(`/dashboard/inventory/${product.id}/edit`)}
                onDelete={() => handleDelete(product.id)}
              />
              {expandedProducts.has(product.id) &&
                product.product_by_variant.map((variant) => (
                  <VariantRow
                    key={variant.id}
                    variant={variant}
                    product={product}
                    onShowBarcode={() => handleShowVariantBarcode(variant)}
                  />
                ))}
            </React.Fragment>
          ))}
        </TableBody>
      </Table>
      
      <BarcodeModal
        open={barcodeModalOpen}
        onOpenChange={setBarcodeModalOpen}
        skus={selectedBarcodes}
      />
      {selectedVariantBarcode && (
        <VariantBarcodeModal
          open={variantBarcodeModalOpen}
          onOpenChange={setVariantBarcodeModalOpen}
          sku={selectedVariantBarcode.sku}
          name={selectedVariantBarcode.name}
        />
      )}
    </div>
  );
}