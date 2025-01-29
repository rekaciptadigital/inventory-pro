'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, ChevronDown, ChevronRight, Barcode } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { BarcodeModal } from '@/components/ui/barcode-modal';
import { formatDate } from '@/lib/utils/format';
import type { InventoryProduct } from '@/types/inventory';

interface ProductListProps {
  products: InventoryProduct[];
  isLoading?: boolean;
}

export function ProductList({ products, isLoading }: ProductListProps) {
  const router = useRouter();
  const [expandedProducts, setExpandedProducts] = useState<Set<number>>(new Set());
  const [barcodeModalOpen, setBarcodeModalOpen] = useState(false);
  const [selectedBarcodes, setSelectedBarcodes] = useState<Array<{ sku: string; name: string }>>([]);

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
      ...product.product_by_variant.map(variant => ({
        sku: variant.sku_product_variant,
        name: variant.full_product_name
      }))
    ];
    setSelectedBarcodes(barcodes);
    setBarcodeModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>SKU</TableHead>
              <TableHead>Product Name</TableHead>
              <TableHead>Brand</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Unit</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, index) => (
              <TableRow key={index}>
                {Array.from({ length: 8 }).map((_, cellIndex) => (
                  <TableCell key={cellIndex}>
                    <Skeleton className="h-6 w-full" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
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
          <TableRow>
            <TableHead>SKU</TableHead>
            <TableHead>Product Name</TableHead>
            <TableHead>Brand</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Unit</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <React.Fragment key={product.id}>
              <TableRow 
                className="group hover:bg-muted/50 transition-colors"
              >
                <TableCell className="font-medium">{product.sku}</TableCell>
                <TableCell>{product.full_product_name}</TableCell>
                <TableCell>{product.brand_name}</TableCell>
                <TableCell>{product.product_type_name}</TableCell>
                <TableCell>
                  {product.categories.map((cat) => (
                    <Badge key={cat.id} variant="secondary" className="mr-1">
                      {cat.product_category_name}
                    </Badge>
                  ))}
                </TableCell>
                <TableCell>{product.unit}</TableCell>
                <TableCell>{formatDate(product.created_at)}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleShowBarcode(product)}
                    >
                      <Barcode className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => router.push(`/dashboard/inventory/${product.id}`)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    {product.product_by_variant.length > 0 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleExpand(product.id)}
                      >
                        {expandedProducts.has(product.id) ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
              {/* Variant Rows */}
              {expandedProducts.has(product.id) && product.product_by_variant.map((variant) => (
                <TableRow 
                  key={variant.id}
                  className="bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <TableCell className="pl-10 font-mono text-sm">
                    {variant.sku_product_variant}
                  </TableCell>
                  <TableCell className="pl-10">
                    {variant.full_product_name}
                  </TableCell>
                  <TableCell colSpan={4}>
                    {product.variants.map((v) => (
                      <div key={v.id} className="text-sm text-muted-foreground">
                        {v.variant_name}:{' '}
                        {v.values
                          .map((val) => val.variant_value_name)
                          .join(', ')}
                      </div>
                    ))}
                  </TableCell>
                  <TableCell>{formatDate(variant.created_at)}</TableCell>
                  <TableCell />
                </TableRow>
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
    </div>
  );
}