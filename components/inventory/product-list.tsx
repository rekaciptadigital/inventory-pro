'use client';

import React, { useState, useMemo } from 'react';
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
import { SortableHeader, type SortDirection } from '@/components/ui/sortable-header';
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
const LOADING_COLUMNS = ['sku', 'name', 'vendor_sku', 'brand', 'type', 'category', 'unit', 'actions'];

export function ProductList({ products, isLoading, onDelete }: ProductListProps) {
  // State untuk manajemen UI
  const router = useRouter();
  const { toast } = useToast();
  
  // State untuk sorting
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  
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
    const numericId = Number(productId);
    if (newExpanded.has(numericId)) {
      newExpanded.delete(numericId);
    } else {
      newExpanded.add(numericId);
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

  // Handler untuk sorting
  const handleSort = (column: string) => {
    // If clicking the same column that's currently sorted
    if (sortColumn === column) {
      // Toggle from asc -> desc -> no sort
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortColumn(null);
        setSortDirection(null);
      } else {
        setSortDirection('asc');
      }
    } else {
      // Different column - set as new sort column with ascending direction
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  // Returns the display value for sorting
  const getDisplayValue = (product: InventoryProduct, column: string): string => {
    switch (column) {
      case 'sku': {
        return product.sku || '';
      }
        
      case 'name': {
        return product.product_name || product.full_product_name || '';
      }
        
      case 'brand': {
        // Use type assertion since we know this property exists at runtime
        const brandValue = (product as any).brand_name || (product as any).brand;
        if (!brandValue) return '';
        if (typeof brandValue === 'object') {
          return brandValue.name || brandValue.brand_name || '';
        }
        return String(brandValue);
      }
        
      case 'type': {
        // Use type assertion for product_type
        const typeValue = (product as any).type_name || 
                          (product as any).product_type_name || 
                          (product as any).product_type;
        if (!typeValue) return '';
        if (typeof typeValue === 'object') {
          return typeValue.name || typeValue.type_name || '';
        }
        return String(typeValue);
      }
        
      case 'category': {
        // Check for known category properties - use type assertion for all
        const categoryValue = (product as any).category_name || (product as any).category;
        if (!categoryValue) return '';
        if (typeof categoryValue === 'object') {
          return categoryValue.name || categoryValue.category_name || '';
        }
        return String(categoryValue);
      }
        
      case 'unit': {
        return product.unit || '';
      }
        
      case 'vendor_sku': {
        return product.vendor_sku || '';
      }
        
      default: {
        return '';
      }
    }
  };

  // Use useRef to avoid unnecessary recalculations
  const sortProductsRef = React.useRef((items: ReadonlyArray<InventoryProduct>) => {
    if (!sortColumn || !sortDirection) return [...items];
    
    return [...items].sort((a, b) => {
      const valueA = getDisplayValue(a, sortColumn);
      const valueB = getDisplayValue(b, sortColumn);
      
      // Compare as numbers if date column
      if (sortColumn === 'date') {
        const numA = valueA ? parseInt(valueA, 10) : 0;
        const numB = valueB ? parseInt(valueB, 10) : 0;
        return sortDirection === 'asc' ? numA - numB : numB - numA;
      }
      
      // Compare as strings for text columns
      if (sortDirection === 'asc') {
        return valueA.localeCompare(valueB);
      } else {
        return valueB.localeCompare(valueA);
      }
    });
  });
  
  // Update the ref when sort parameters change
  React.useEffect(() => {
    sortProductsRef.current = (items: ReadonlyArray<InventoryProduct>) => {
      if (!sortColumn || !sortDirection) return [...items];
      
      return [...items].sort((a, b) => {
        const valueA = getDisplayValue(a, sortColumn);
        const valueB = getDisplayValue(b, sortColumn);
        
        // No special handling needed for vendor_sku, it's a string comparison
        
        // Compare as strings for text columns
        if (sortDirection === 'asc') {
          return valueA.localeCompare(valueB);
        } else {
          return valueB.localeCompare(valueA);
        }
      });
    };
  }, [sortColumn, sortDirection]);
  
  // Use the sort function from ref
  const sortedProducts = useMemo(() => {
    if (!products) return [];
    return sortProductsRef.current(products);
  }, [products, sortColumn, sortDirection]);

  // Helper function to sort variants by their unique code
  const sortVariants = (variants: ReadonlyArray<InventoryProductVariant>) => {
    return [...variants].sort((a, b) => {
      // Sort by sku_product_unique_code if available
      if (a.sku_product_unique_code && b.sku_product_unique_code) {
        // First convert both values to strings to ensure consistent handling
        const strCodeA = String(a.sku_product_unique_code);
        const strCodeB = String(b.sku_product_unique_code);
        
        // Attempt to extract numbers from the strings
        const numA = /^\d+$/.test(strCodeA) ? Number(strCodeA) : NaN;
        const numB = /^\d+$/.test(strCodeB) ? Number(strCodeB) : NaN;
        
        // If both are valid numbers, sort numerically
        if (!isNaN(numA) && !isNaN(numB)) {
          return numA - numB;
        }
        
        // Fall back to string comparison
        return strCodeA.localeCompare(strCodeB);
      }
      
      // Fallback to sorting by full SKU as strings
      return String(a.sku_product_variant).localeCompare(String(b.sku_product_variant));
    });
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
        <TableHeader className="bg-muted/50">
          <TableRow className="hover:bg-transparent border-b border-border">
            <SortableHeader
              column="sku"
              label="SKU"
              sortColumn={sortColumn}
              sortDirection={sortDirection}
              onSort={handleSort}
            />
            <SortableHeader
              column="name"
              label="Product Name"
              sortColumn={sortColumn}
              sortDirection={sortDirection}
              onSort={handleSort}
            />
            <SortableHeader
              column="vendor_sku"
              label="SKU Vendor"
              sortColumn={sortColumn}
              sortDirection={sortDirection}
              onSort={handleSort}
            />
            <SortableHeader
              column="brand"
              label="Brand"
              sortColumn={sortColumn}
              sortDirection={sortDirection}
              onSort={handleSort}
            />
            <SortableHeader
              column="type"
              label="Type"
              sortColumn={sortColumn}
              sortDirection={sortDirection}
              onSort={handleSort}
            />
            <SortableHeader
              column="category"
              label="Category"
              sortColumn={sortColumn}
              sortDirection={sortDirection}
              onSort={handleSort}
            />
            <SortableHeader
              column="unit"
              label="Unit"
              sortColumn={sortColumn}
              sortDirection={sortDirection}
              onSort={handleSort}
            />
            <TableCell className="bg-muted/50 text-muted-foreground text-sm font-bold py-3">Actions</TableCell>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedProducts.map((product) => (
            <React.Fragment key={product.id}>
              <ProductRow
                product={product}
                isExpanded={expandedProducts.has(Number(product.id))}
                isDeleting={isDeleting === product.id}
                onToggleExpand={() => toggleExpand(Number(product.id))}
                onShowBarcode={() => handleShowBarcode(product)}
                onEdit={() => router.push(`/dashboard/inventory/${product.id}/edit`)}
                onDelete={() => handleDelete(Number(product.id))}
              />
              {expandedProducts.has(Number(product.id)) &&
                sortVariants(product.product_by_variant).map((variant) => (
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