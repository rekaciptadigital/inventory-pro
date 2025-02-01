"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, ChevronDown, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/utils/format";
import type { InventoryProduct } from "@/types/inventory";

const LoadingSkeleton = () => {
  const skeletonRows = ["sk1", "sk2", "sk3", "sk4", "sk5"];
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
            <TableHead>Created At</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {skeletonRows.map((skeletonId) => (
            <TableRow key={skeletonId}>
              {Array.from({ length: 7 }).map((_, i) => (
                <TableCell key={`${skeletonId}-cell-${i}`}>
                  <Skeleton className="h-6 w-full" />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

const ProductVariantRow = ({
  variant,
  product,
}: {
  variant: any;
  product: InventoryProduct;
}) => (
  <TableRow
    key={variant.id}
    className="bg-muted/30 hover:bg-muted/50 transition-colors"
  >
    <TableCell className="pl-10 font-mono text-sm">
      {variant.sku_product_variant}
    </TableCell>
    <TableCell className="pl-10">{variant.full_product_name}</TableCell>
    <TableCell colSpan={4}>
      {product.variants.map((v) => (
        <div key={v.id} className="text-sm text-muted-foreground">
          {v.variant_name}:{" "}
          {v.values.map((val) => val.variant_value_name).join(", ")}
        </div>
      ))}
    </TableCell>
    <TableCell>{formatDate(variant.created_at)}</TableCell>
    <TableCell />
  </TableRow>
);

const ProductRow = ({
  product,
  isExpanded,
  onToggleExpand,
  onEdit,
  onEditOld,
}: {
  product: InventoryProduct;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onEdit: () => void;
  onEditOld: () => void;
}) => (
  <TableRow className="group hover:bg-muted/50 transition-colors">
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
    <TableCell>{formatDate(product.created_at)}</TableCell>
    <TableCell>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={onEdit}>
          <Edit className="h-4 w-4" />
        </Button>
        <Button
          className="px-10"
          variant="ghost"
          size="icon"
          onClick={onEditOld}
        >
          History
        </Button>
        {product.product_by_variant.length > 0 && (
          <Button variant="ghost" size="icon" onClick={onToggleExpand}>
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
        )}
      </div>
    </TableCell>
  </TableRow>
);

interface PriceManagementListProps {
  readonly products: InventoryProduct[];
  readonly isLoading?: boolean;
}

export function PriceManagementList({
  products,
  isLoading,
}: PriceManagementListProps) {
  const router = useRouter();
  const [expandedProducts, setExpandedProducts] = useState<Set<number>>(
    new Set()
  );

  const toggleExpand = (productId: number) => {
    const newExpanded = new Set(expandedProducts);
    if (newExpanded.has(productId)) {
      newExpanded.delete(productId);
    } else {
      newExpanded.add(productId);
    }
    setExpandedProducts(newExpanded);
  };

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (!products?.length) {
    return (
      <div className="border rounded-lg p-8 text-center text-muted-foreground">
        No products found. Add your first product to manage prices.
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
            <TableHead>Created At</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <React.Fragment key={product.id}>
              <ProductRow
                product={product}
                isExpanded={expandedProducts.has(product.id)}
                onToggleExpand={() => toggleExpand(product.id)}
                onEdit={() =>
                  router.push(`/dashboard/price-management/${product.id}/edit`)
                }
                onEditOld={() =>
                  router.push(`/dashboard/price-management/${product.id}`)
                }
              />
              {expandedProducts.has(product.id) &&
                product.product_by_variant.map((variant) => (
                  <ProductVariantRow
                    key={variant.id}
                    variant={variant}
                    product={product}
                  />
                ))}
            </React.Fragment>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
