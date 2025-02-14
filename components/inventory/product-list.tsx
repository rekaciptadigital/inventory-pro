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

// Kolom yang ditampilkan saat loading
const LOADING_COLUMNS = ['sku', 'name', 'brand', 'type', 'category', 'unit', 'date', 'actions'];

export function ProductList({ products, isLoading, onDelete }: ProductListProps) {
  // State untuk manajemen UI
  const router = useRouter();
  const { toast } = useToast();
  
  // State untuk manajemen expand/collapse produk
  const [expandedProducts, setExpandedProducts] = useState<Set<number>>(new Set());
  
  // State untuk modal barcode
  const [barcodeModalOpen, setBarcodeModalOpen] = useState(false);
  const [variantBarcodeModalOpen, setVariantBarcodeModalOpen] = useState(false);
  const [selectedBarcodes, setSelectedBarcodes] = useState<Array<{ sku: string; name: string }>>([]);
  const [selectedVariantBarcode, setSelectedVariantBarcode] = useState<{ sku: string; name: string } | null>(null);
  
  // State untuk proses delete
  const [isDeleting, setIsDeleting] = useState<number | null>(null);

  // Handler untuk expand/collapse produk
  const toggleExpand = (productId: number) => {
    const newExpanded = new Set(expandedProducts);
    if (newExpanded.has(productId)) {
      newExpanded.delete(productId);
    } else {
      newExpanded.add(productId);
    }
    setExpandedProducts(newExpanded);
  };

  // Handler untuk menampilkan barcode produk dan variannya
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

  // Handler untuk menampilkan barcode varian
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

  // Handler untuk menghapus produk
  const handleDelete = async (id: number) => {
    if (!onDelete) return;
    
    setIsDeleting(id);
    try {
      await onDelete(id);
    } finally {
      setIsDeleting(null);
    }
  };

  // Render loading state
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

  // Tampilkan loading state jika masih loading
  if (isLoading) {
    return renderLoadingState();
  }

  // Tampilkan pesan jika tidak ada produk
  if (!products?.length) {
    return (
      <div className="border rounded-lg p-8 text-center text-muted-foreground">
        No products found. Click the "Add New Product" button to add your first product.
      </div>
    );
  }

  // Render utama daftar produk
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