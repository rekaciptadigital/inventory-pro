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
import { Edit, ChevronDown, ChevronRight, Barcode, Trash2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { BarcodeModal } from '@/components/ui/barcode-modal';
import { formatDate } from '@/lib/utils/format';
import type { InventoryProduct, InventoryProductVariant } from '@/types/inventory';
import { VariantBarcodeModal } from '@/components/ui/variant-barcode-modal';
import { useToast } from '@/components/ui/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface ProductListProps {
  products: InventoryProduct[];
  isLoading?: boolean;
  onDelete?: (id: number) => Promise<void>;
}

export function ProductList({ products, isLoading, onDelete }: ProductListProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [expandedProducts, setExpandedProducts] = useState<Set<number>>(new Set());
  const [barcodeModalOpen, setBarcodeModalOpen] = useState(false);
  const [variantBarcodeModalOpen, setVariantBarcodeModalOpen] = useState(false);
  const [selectedBarcodes, setSelectedBarcodes] = useState<Array<{ sku: string; name: string }>>([]);
  const [selectedVariantBarcode, setSelectedVariantBarcode] = useState<{ sku: string; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);

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
                      onClick={() => router.push(`/dashboard/inventory/${product.id}/edit`)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Product</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this product? This action cannot be undone.
                          </AlertDialogDescription>
                          <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                            <div><strong>SKU:</strong> {product.sku}</div>
                            <div><strong>Name:</strong> {product.full_product_name}</div>
                          </div>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(product.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            disabled={isDeleting === product.id}
                          >
                            {isDeleting === product.id ? "Deleting..." : "Delete"}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
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
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleShowVariantBarcode(variant)}
                      >
                        <Barcode className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
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